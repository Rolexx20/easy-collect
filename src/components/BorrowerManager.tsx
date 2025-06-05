
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Phone, MapPin, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createBorrower, updateBorrower, deleteBorrower } from '@/lib/database';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface Borrower {
  id: string;
  name: string;
  phone: string;
  address: string;
  total_loans?: number;
  active_loans?: number;
  total_amount?: number;
}

interface BorrowerManagerProps {
  language: string;
  borrowers: Borrower[];
  onDataChange: () => void;
}

const BorrowerManager = ({ language, borrowers, onDataChange }: BorrowerManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBorrower, setEditingBorrower] = useState<Borrower | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [borrowerToDelete, setBorrowerToDelete] = useState<Borrower | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const translations = {
    en: {
      title: 'Borrower Management',
      addBorrower: 'Add New Borrower',
      editBorrower: 'Edit Borrower',
      name: 'Full Name',
      phone: 'Phone Number',
      address: 'Address',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      totalLoans: 'Total Loans',
      activeLoans: 'Active Loans',
      totalAmount: 'Total Amount',
      borrowerAdded: 'Borrower added successfully',
      borrowerUpdated: 'Borrower updated successfully',
      borrowerDeleted: 'Borrower deleted successfully',
      fillAllFields: 'Please fill all fields',
      noBorrowers: 'No borrowers registered yet',
      confirmDelete: 'Are you sure you want to delete this borrower?',
      deleteWarning: 'This action cannot be undone and will also delete all associated loans.'
    },
    ta: {
      title: 'கடன் வாங்குபவர் மேலாண்மை',
      addBorrower: 'புதிய கடன் வாங்குபவரைச் சேர்க்கவும்',
      editBorrower: 'கடன் வாங்குபவரைத் திருத்தவும்',
      name: 'முழு பெயர்',
      phone: 'தொலைபேசி எண்',
      address: 'முகவரி',
      save: 'சேமிக்கவும்',
      cancel: 'ரத்து செய்யவும்',
      edit: 'திருத்து',
      delete: 'நீக்கு',
      totalLoans: 'மொத்த கடன்கள்',
      activeLoans: 'செயலில் உள்ள கடன்கள்',
      totalAmount: 'மொத்த தொகை',
      borrowerAdded: 'கடன் வாங்குபவர் வெற்றிகரமாக சேர்க்கப்பட்டார்',
      borrowerUpdated: 'கடன் வாங்குபவர் வெற்றிகரமாக புதுப்பிக்கப்பட்டார்',
      borrowerDeleted: 'கடன் வாங்குபவர் வெற்றிகரமாக நீக்கப்பட்டார்',
      fillAllFields: 'தயவுசெய்து அனைத்து புலங்களையும் நிரப்பவும்',
      noBorrowers: 'இதுவரை கடன் வாங்குபவர்கள் பதிவு செய்யப்படவில்லை',
      confirmDelete: 'இந்த கடன் வாங்குபவரை நீக்க விரும்புகிறீர்களா?',
      deleteWarning: 'இந்த செயல் மாற்ற முடியாது மற்றும் அனைத்து தொடர்புடைய கடன்களையும் நீக்கும்.'
    }
  };

  const t = translations[language as keyof typeof translations];

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      toast({ title: t.fillAllFields, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      if (editingBorrower) {
        await updateBorrower(editingBorrower.id, formData);
        toast({ title: t.borrowerUpdated });
      } else {
        await createBorrower(formData);
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

  const handleEdit = (borrower: Borrower) => {
    setEditingBorrower(borrower);
    setFormData({
      name: borrower.name,
      phone: borrower.phone,
      address: borrower.address
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (borrower: Borrower) => {
    setBorrowerToDelete(borrower);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!borrowerToDelete) return;
    
    setIsLoading(true);
    try {
      await deleteBorrower(borrowerToDelete.id);
      toast({ title: t.borrowerDeleted });
      onDataChange();
    } catch (error) {
      console.error('Error deleting borrower:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete borrower. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
      setDeleteConfirmOpen(false);
      setBorrowerToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', address: '' });
    setEditingBorrower(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 flex-1">
          {t.title}
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBorrower(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              {t.addBorrower}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBorrower ? t.editBorrower : t.addBorrower}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={t.name}
                />
              </div>
              <div>
                <Label htmlFor="phone">{t.phone}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder={t.phone}
                />
              </div>
              <div>
                <Label htmlFor="address">{t.address}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder={t.address}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="flex-1" disabled={isLoading}>
                  {isLoading ? "Saving..." : t.save}
                </Button>
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  {t.cancel}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {borrowers.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {t.noBorrowers}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {borrowers.map((borrower) => (
            <Card key={borrower.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  {borrower.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  {borrower.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  {borrower.address}
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{borrower.total_loans || 0}</div>
                    <div className="text-xs text-gray-500">{t.totalLoans}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{borrower.active_loans || 0}</div>
                    <div className="text-xs text-gray-500">{t.activeLoans}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">₹{(borrower.total_amount || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{t.totalAmount}</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(borrower)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    {t.edit}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(borrower)}
                    className="flex-1 text-red-600 hover:text-red-700"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t.delete}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t.confirmDelete}
        message={t.deleteWarning}
        itemName={borrowerToDelete?.name}
        language={language}
      />
    </div>
  );
};

export default BorrowerManager;
