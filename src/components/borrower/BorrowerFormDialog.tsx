
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { createBorrower, updateBorrower } from '@/lib/database';

interface Borrower {
  id: string;
  title?: string;
  first_name?: string;
  last_name?: string;
  name: string;
  nic_number?: string;
  phone: string;
  address: string;
  total_loans?: number;
  active_loans?: number;
  total_amount?: number;
  pending_payment?: number;
  created_at?: string;
}

interface BorrowerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingBorrower: Borrower | null;
  onDataChange: () => void;
  language: string;
}

const BorrowerFormDialog = ({ isOpen, onClose, editingBorrower, onDataChange, language }: BorrowerFormDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: editingBorrower?.title || '',
    first_name: editingBorrower?.first_name || '',
    last_name: editingBorrower?.last_name || '',
    nic_number: editingBorrower?.nic_number || '',
    phone: editingBorrower?.phone?.startsWith('+94') ? editingBorrower.phone.replace('+94', '0') : editingBorrower?.phone || '',
    address: editingBorrower?.address || ''
  });

  const titleOptions = [
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Mrs.', label: 'Mrs.' },
    { value: 'Miss.', label: 'Miss.' },
    { value: 'Master.', label: 'Master.' }
  ];

  const translations = {
    en: {
      addBorrower: 'Add New Borrower',
      editBorrower: 'Edit Borrower',
      titleField: 'Title',
      firstName: 'First Name',
      lastName: 'Last Name',
      nicNumber: 'NIC Number',
      phone: 'Phone Number',
      address: 'Address',
      save: 'Save',
      cancel: 'Cancel',
      borrowerAdded: 'Borrower added successfully',
      borrowerUpdated: 'Borrower updated successfully',
      fillAllFields: 'Please fill all required fields'
    },
    ta: {
      addBorrower: 'புதிய கடன் வாங்குபவரைச் சேர்க்கவும்',
      editBorrower: 'கடன் வாங்குபவரைத் திருத்தவும்',
      titleField: 'பட்டம்',
      firstName: 'முதல் பெயர்',
      lastName: 'கடைசி பெயர்',
      nicNumber: 'அடையாள அட்டை எண்',
      phone: 'தொலைபேசி எண்',
      address: 'முகவரி',
      save: 'சேமிக்கவும்',
      cancel: 'ரத்து செய்யவும்',
      borrowerAdded: 'கடன் வாங்குபவர் வெற்றிகரமாக சேர்க்கப்பட்டார்',
      borrowerUpdated: 'கடன் வாங்குபவர் வெற்றிகரமாக புதுப்பிக்கப்பட்டார்',
      fillAllFields: 'தயவுசெய்து அனைத்து தேவையான புலங்களையும் நிரப்பவும்'
    }
  };

  const t = translations[language as keyof typeof translations];

  const handleSubmit = async () => {
    if (!formData.title || !formData.first_name || !formData.last_name || !formData.nic_number || !formData.phone || !formData.address) {
      toast({ title: t.fillAllFields, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const fullName = `${formData.title} ${formData.first_name} ${formData.last_name}`;
      const phoneWithCountryCode = formData.phone.startsWith('+94') ? formData.phone : `+94${formData.phone.replace(/^0+/, '')}`;
      
      const borrowerData = {
        title: formData.title,
        first_name: formData.first_name,
        last_name: formData.last_name,
        name: fullName,
        nic_number: formData.nic_number,
        phone: phoneWithCountryCode,
        address: formData.address
      };

      if (editingBorrower) {
        await updateBorrower(editingBorrower.id, borrowerData);
        toast({ title: t.borrowerUpdated });
      } else {
        await createBorrower(borrowerData);
        toast({ title: t.borrowerAdded });
      }
      onDataChange();
      resetForm();
    } catch (error) {
      console.error('Error saving borrower:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save borrower. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', first_name: '', last_name: '', nic_number: '', phone: '', address: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-900 gap-0">
        <DialogHeader className="px-6 pt-2 pb-2 border-b dark:border-gray-800">
          <DialogTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {editingBorrower ? t.editBorrower : t.addBorrower}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-6 space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="pb-1 text-gray-700 dark:text-gray-300">{t.titleField}</Label>
            <Select value={formData.title} onValueChange={(value) => setFormData({ ...formData, title: value })}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Select title" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
                {titleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="first_name" className="pb-1 text-gray-700 dark:text-gray-300">{t.firstName}</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder={t.firstName}
                className="py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="last_name" className="pb-1 text-gray-700 dark:text-gray-300">{t.lastName}</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder={t.lastName}
                className="py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="nic_number" className="pb-1 text-gray-700 dark:text-gray-300">{t.nicNumber}</Label>
            <Input
              id="nic_number"
              value={formData.nic_number}
              onChange={(e) => setFormData({ ...formData, nic_number: e.target.value })}
              placeholder={t.nicNumber}
              className="py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="pb-1 text-gray-700 dark:text-gray-300">{t.phone}</Label>
            <div className="flex">
              <div className="flex items-center px-3 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-md text-gray-600 dark:text-gray-300 text-sm">
                +94
              </div>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="771234567"
                className="py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-l-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address" className="pb-1 text-gray-700 dark:text-gray-300">{t.address}</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={t.address}
              className="py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : t.save}
            </Button>
            <Button
              variant="outline"
              onClick={resetForm}
              className="flex-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              {t.cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BorrowerFormDialog;
