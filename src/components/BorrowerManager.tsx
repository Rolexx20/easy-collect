import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Phone, MapPin, User, AlertCircleIcon, CircleAlert } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

  // --- Search filter state ---
  const [search, setSearch] = useState('');
  // --- End search filter state ---

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
      deleteWarning: 'Cannot undo. Settle loans to delete.'
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
      deleteWarning: 'செயல்தவிர்க்க முடியாது. நீக்க வேண்டிய கடன்களைத் தீர்க்கவும்.'
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

  // --- Filter borrowers by search ---
  const filteredBorrowers = borrowers.filter((borrower) => {
    const name = borrower.name || '';
    const phone = borrower.phone || '';
    const address = borrower.address || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      phone.toLowerCase().includes(search.toLowerCase()) ||
      address.toLowerCase().includes(search.toLowerCase())
    );
  });
  // --- End filter borrowers by search ---

  // --- Helper: Check if borrower has pending (active) loans ---
  const hasPendingLoans = (borrower: Borrower) => {
    return (borrower.active_loans ?? 0) > 0;
  };
  // --- End helper ---

  return (
    <div className="p-6 space-y-6 pt-5">
      <div className="flex justify-between items-center">
      <h2 className="text-2xl md:text-3xl font-bold text-left text-gray-800 dark:text-gray-200 flex-1">
        {t.title}
      </h2>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
        <Button
          onClick={() => {
            setEditingBorrower(null);
            setIsDialogOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm md:text-base flex items-center gap-2"
        >
          <Plus className="w-4 h-4 mr-0" />
          <span className="hidden sm:inline">{t.addBorrower}</span>
        </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md w-full p-0 overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-900 gap-0">
        <DialogHeader className="px-6 pt-2 pb-2 border-b dark:border-gray-800">
          <DialogTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          {editingBorrower ? t.editBorrower : t.addBorrower}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-6 space-y-5">
          <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="pb-1 text-gray-700 dark:text-gray-300">{t.name}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t.name}
            className="py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          />
          </div>
          <div className="flex flex-col gap-2">
          <Label htmlFor="phone" className="pb-1 text-gray-700 dark:text-gray-300">{t.phone}</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder={t.phone}
            className="py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          />
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
      </div>

      {/* --- Search filter input --- */}
      <div className="mb-1">
        <Input
          type="text"
          placeholder="Search by borrower, name, or address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full focus-visible:ring-0 focus-visible:border-blue-600 dark:focus-visible:border-blue-600"
        />
      </div>
      {/* --- End search filter input --- */}

      {filteredBorrowers.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {t.noBorrowers}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBorrowers.map((borrower) => (
            <Card
              key={borrower.id}
              className="transition-all border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-xl bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 group"
            >
              <CardHeader className="pb-2 pt-2 border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/60 to-transparent dark:from-blue-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 group-hover:scale-105 transition-transform">
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                    </span>
                    <span className="truncate text-lg font-bold text-gray-800 dark:text-gray-100">{borrower.name}</span>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <span className="border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 flex items-center h-7 w-7 justify-center transition-colors duration-150 hover:border-blue-400 dark:hover:border-blue-400">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(borrower)}
                        className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded h-6 w-6"
                        disabled={isLoading}
                        aria-label={t.edit}
                      >
                        <Edit className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                      </Button>
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 flex items-center h-7 w-7 justify-center transition-colors duration-150 hover:border-red-400 dark:hover:border-red-400">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(borrower)}
                              className={`p-0.5 hover:bg-red-100 dark:hover:bg-red-900 rounded h-6 w-6 ${hasPendingLoans(borrower) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={isLoading || hasPendingLoans(borrower)}
                              aria-label={t.delete}
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {hasPendingLoans(borrower) && (
                          <TooltipContent className='bg-red-700 text-white flex items-center gap-1'>
                            <CircleAlert className="w-4 h-4" />
                            <span className="text-xs">{t.deleteWarning}</span>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-3">
                <div className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span className="truncate">{borrower.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <span className="truncate">{borrower.address}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-2 pt-0">
                  <div className="flex flex-col items-center flex-1 bg-blue-50 dark:bg-blue-950/30 rounded-lg py-2">
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{borrower.total_loans || 0}</div>
                    <div className="text-xs text-gray-500">{t.totalLoans}</div>
                  </div>
                  <div className="flex flex-col items-center flex-1 bg-green-50 dark:bg-green-950/30 rounded-lg py-2">
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">{borrower.active_loans || 0}</div>
                    <div className="text-xs text-gray-500">{t.activeLoans}</div>
                  </div>
                  <div className="flex flex-col items-center flex-1 bg-purple-50 dark:bg-purple-950/30 rounded-lg py-2">
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                      ₹{(borrower.total_amount || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{t.totalAmount}</div>
                  </div>
                </div>
                {/* Remove bottom edit/delete buttons */}
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