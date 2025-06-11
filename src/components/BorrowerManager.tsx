import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { deleteBorrower, getLoans } from '@/lib/database';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import BorrowerFormDialog from './borrower/BorrowerFormDialog';
import BorrowerCard from './borrower/BorrowerCard';
import PaymentHistoryDialog from './PaymentHistoryDialog';

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
  const [search, setSearch] = useState('');
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
  const [selectedBorrowerLoan, setSelectedBorrowerLoan] = useState<any>(null);

  const translations = {
    en: {
      title: 'Borrower Management',
      addBorrower: 'Add New Borrower',
      borrowerDeleted: 'Borrower deleted successfully',
      noBorrowers: 'No borrowers registered yet',
      confirmDelete: 'Are you sure you want to delete this borrower?',
      deleteWarning: 'Cannot undo. Settle loans to delete.',
      searchPlaceholder: 'Search by name, phone, NIC, or address'
    },
    ta: {
      title: 'கடன் வாங்குபவர் மேலாண்மை',
      addBorrower: 'புதிய கடன் வாங்குபவரைச் சேர்க்கவும்',
      borrowerDeleted: 'கடன் வாங்குபவர் வெற்றிகரமாக நீக்கப்பட்டார்',
      noBorrowers: 'இதுவரை கடன் வாங்குபவர்கள் பதிவு செய்யப்படவில்லை',
      confirmDelete: 'இந்த கடன் வாங்குபவரை நீக்க விரும்புகிறீர்களா?',
      deleteWarning: 'செயல்தவிர்க்க முடியாது. நீக்க வேண்டிய கடன்களைத் தீர்க்கவும்.',
      searchPlaceholder: 'பெயர், தொலைபேசி, அடையாள அட்டை அல்லது முகவரி மூலம் தேடுங்கள்'
    }
  };

  const t = translations[language as keyof typeof translations];

  const handleEdit = (borrower: Borrower) => {
    setEditingBorrower(borrower);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (borrower: Borrower) => {
    setBorrowerToDelete(borrower);
    setDeleteConfirmOpen(true);
  };

  const handleViewPaymentHistory = async (borrower: Borrower) => {
    try {
      // Get the borrower's active loan
      const loans = await getLoans();
      const borrowerLoan = loans.find(loan => loan.borrower_id === borrower.id && loan.status === 'active');
      
      if (borrowerLoan) {
        setSelectedBorrowerLoan({
          ...borrowerLoan,
          borrowerName: borrower.name
        });
        setIsPaymentHistoryOpen(true);
      } else {
        toast({ 
          title: "No active loans", 
          description: "This borrower has no active loans to show payment history for.",
          variant: "destructive",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error fetching loan data:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load payment history. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    }
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
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
      setDeleteConfirmOpen(false);
      setBorrowerToDelete(null);
    }
  };

  const filteredBorrowers = borrowers.filter((borrower) => {
    const name = borrower.name || '';
    const phone = borrower.phone || '';
    const address = borrower.address || '';
    const nicNumber = borrower.nic_number || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      phone.toLowerCase().includes(search.toLowerCase()) ||
      address.toLowerCase().includes(search.toLowerCase()) ||
      nicNumber.toLowerCase().includes(search.toLowerCase())
    );
  });

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
              className="bg-gradient-to-r from-blue-600 to-red-800 hover:from-blue-700 hover:to-red-900 text-white dark:text-white px-3 py-2 text-sm md:text-base flex items-center gap-2"
            >
              <Plus className="w-4 h-4 mr-0" />
              <span className="hidden sm:inline">{t.addBorrower}</span>
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <div className="mb-1">
        <Input
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full focus-visible:ring-0 focus-visible:border-blue-600 dark:focus-visible:border-blue-600"
        />
      </div>

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
            <BorrowerCard
              key={borrower.id}
              borrower={borrower}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onViewPaymentHistory={handleViewPaymentHistory}
              isLoading={isLoading}
              language={language}
            />
          ))}
        </div>
      )}

      <BorrowerFormDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingBorrower(null);
        }}
        editingBorrower={editingBorrower}
        onDataChange={onDataChange}
        language={language}
      />

      <DeleteConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t.confirmDelete}
        message={t.deleteWarning}
        itemName={borrowerToDelete?.name}
        language={language}
      />

      {selectedBorrowerLoan && (
        <>
          <PaymentHistoryDialog
            isOpen={isPaymentHistoryOpen}
            onClose={() => {
              setIsPaymentHistoryOpen(false);
              setSelectedBorrowerLoan(null);
            }}
            loan={selectedBorrowerLoan}
            onPaymentReversed={onDataChange}
            language={language}
          />
        </>
      )}
    </div>
  );
};

export default BorrowerManager;
