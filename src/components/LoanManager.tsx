
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Calendar, DollarSign, User, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createLoan, updateLoan, deleteLoan } from '@/lib/database';
import PaymentCollectionDialog from './PaymentCollectionDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface Loan {
  id: string;
  borrower_id: string;
  borrowerName?: string;
  principal_amount: number;
  interest_rate: number;
  duration_months: number;
  total_amount: number;
  amount_paid: number;
  start_date: string;
  status: 'active' | 'completed' | 'overdue';
  next_payment_date?: string;
}

interface Borrower {
  id: string;
  name: string;
  phone: string;
  address: string;
}

interface LoanManagerProps {
  language: string;
  loans: Loan[];
  borrowers: Borrower[];
  onDataChange: () => void;
}

const LoanManager = ({ language, loans, borrowers, onDataChange }: LoanManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState<Loan | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    borrower_id: '',
    principal_amount: '',
    interest_rate: '',
    duration_months: '',
    start_date: new Date().toISOString().split('T')[0]
  });

  const translations = {
    en: {
      title: 'Loan Management',
      addLoan: 'Add New Loan',
      editLoan: 'Edit Loan',
      borrower: 'Borrower',
      principalAmount: 'Principal Amount',
      interestRate: 'Interest Rate (%)',
      duration: 'Duration (Months)',
      startDate: 'Start Date',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      collectPayment: 'Collect Payment',
      totalAmount: 'Total Amount',
      amountPaid: 'Amount Paid',
      remainingAmount: 'Remaining Amount',
      status: 'Status',
      nextPayment: 'Next Payment',
      loanAdded: 'Loan added successfully',
      loanUpdated: 'Loan updated successfully',
      loanDeleted: 'Loan deleted successfully',
      fillAllFields: 'Please fill all fields',
      noLoans: 'No loans registered yet',
      selectBorrower: 'Select a borrower',
      confirmDelete: 'Are you sure you want to delete this loan?',
      deleteWarning: 'This action cannot be undone and will also delete all associated payments.',
      active: 'Active',
      completed: 'Completed',
      overdue: 'Overdue'
    },
    ta: {
      title: 'கடன் மேலாண்மை',
      addLoan: 'புதிய கடன் சேர்க்கவும்',
      editLoan: 'கடனைத் திருத்தவும்',
      borrower: 'கடன் வாங்குபவர்',
      principalAmount: 'முதன்மை தொகை',
      interestRate: 'வட்டி விகிதம் (%)',
      duration: 'காலம் (மாதங்கள்)',
      startDate: 'தொடக்க தேதி',
      save: 'சேமிக்கவும்',
      cancel: 'ரத்து செய்யவும்',
      edit: 'திருத்து',
      delete: 'நீக்கு',
      collectPayment: 'பணம் வசூலிக்கவும்',
      totalAmount: 'மொத்த தொகை',
      amountPaid: 'செலுத்திய தொகை',
      remainingAmount: 'மீதமுள்ள தொகை',
      status: 'நிலை',
      nextPayment: 'அடுத்த பணம் செலுத்தல்',
      loanAdded: 'கடன் வெற்றிகரமாக சேர்க்கப்பட்டது',
      loanUpdated: 'கடன் வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
      loanDeleted: 'கடன் வெற்றிகரமாக நீக்கப்பட்டது',
      fillAllFields: 'தயவுசெய்து அனைத்து புலங்களையும் நிரப்பவும்',
      noLoans: 'இதுவரை கடன்கள் பதிவு செய்யப்படவில்லை',
      selectBorrower: 'கடன் வாங்குபவரை தேர்ந்தெடுக்கவும்',
      confirmDelete: 'இந்த கடனை நீக்க விரும்புகிறீர்களா?',
      deleteWarning: 'இந்த செயல் மாற்ற முடியாது மற்றும் அனைத்து தொடர்புடைய பணம் செலுத்தல்களையும் நீக்கும்.',
      active: 'செயலில்',
      completed: 'முடிந்தது',
      overdue: 'தாமதம்'
    }
  };

  const t = translations[language as keyof typeof translations];

  const handleSubmit = async () => {
    if (!formData.borrower_id || !formData.principal_amount || !formData.interest_rate || 
        !formData.duration_months || !formData.start_date) {
      toast({ title: t.fillAllFields, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const loanData = {
        borrower_id: formData.borrower_id,
        principal_amount: parseFloat(formData.principal_amount),
        interest_rate: parseFloat(formData.interest_rate),
        duration_months: parseInt(formData.duration_months),
        start_date: formData.start_date,
        status: 'active' as const
      };

      if (editingLoan) {
        await updateLoan(editingLoan.id, loanData);
        toast({ title: t.loanUpdated });
      } else {
        await createLoan(loanData);
        toast({ title: t.loanAdded });
      }
      onDataChange();
      resetForm();
    } catch (error) {
      console.error('Error saving loan:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save loan. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan);
    setFormData({
      borrower_id: loan.borrower_id,
      principal_amount: loan.principal_amount.toString(),
      interest_rate: loan.interest_rate.toString(),
      duration_months: loan.duration_months.toString(),
      start_date: loan.start_date
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (loan: Loan) => {
    setLoanToDelete(loan);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!loanToDelete) return;
    
    setIsLoading(true);
    try {
      await deleteLoan(loanToDelete.id);
      toast({ title: t.loanDeleted });
      onDataChange();
    } catch (error) {
      console.error('Error deleting loan:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete loan. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
      setDeleteConfirmOpen(false);
      setLoanToDelete(null);
    }
  };

  const handleCollectPayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setPaymentDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      borrower_id: '',
      principal_amount: '',
      interest_rate: '',
      duration_months: '',
      start_date: new Date().toISOString().split('T')[0]
    });
    setEditingLoan(null);
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t.active;
      case 'completed':
        return t.completed;
      case 'overdue':
        return t.overdue;
      default:
        return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 flex-1">
          {t.title}
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingLoan(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              {t.addLoan}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingLoan ? t.editLoan : t.addLoan}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="borrower">{t.borrower}</Label>
                <Select value={formData.borrower_id} onValueChange={(value) => setFormData({...formData, borrower_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectBorrower} />
                  </SelectTrigger>
                  <SelectContent>
                    {borrowers.map((borrower) => (
                      <SelectItem key={borrower.id} value={borrower.id}>
                        {borrower.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="principal">{t.principalAmount}</Label>
                <Input
                  id="principal"
                  type="number"
                  value={formData.principal_amount}
                  onChange={(e) => setFormData({...formData, principal_amount: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="interest">{t.interestRate}</Label>
                <Input
                  id="interest"
                  type="number"
                  step="0.1"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="duration">{t.duration}</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_months}
                  onChange={(e) => setFormData({...formData, duration_months: e.target.value})}
                  placeholder="12"
                />
              </div>
              <div>
                <Label htmlFor="startDate">{t.startDate}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
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

      {loans.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {t.noLoans}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loans.map((loan) => (
            <Card key={loan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="truncate">{loan.borrowerName || 'Unknown'}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                    {getStatusText(loan.status)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t.totalAmount}</div>
                    <div className="text-lg font-bold text-blue-600">₹{loan.total_amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t.amountPaid}</div>
                    <div className="text-lg font-bold text-green-600">₹{loan.amount_paid.toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t.remainingAmount}</div>
                  <div className="text-xl font-bold text-purple-600">
                    ₹{(loan.total_amount - loan.amount_paid).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Start: {loan.start_date}</span>
                </div>

                {loan.next_payment_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    <span>{t.nextPayment}: {loan.next_payment_date}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {loan.status === 'active' && (
                    <Button
                      size="sm"
                      onClick={() => handleCollectPayment(loan)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CreditCard className="w-4 h-4 mr-1" />
                      {t.collectPayment}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(loan)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    {t.edit}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(loan)}
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

      {selectedLoan && (
        <PaymentCollectionDialog
          isOpen={paymentDialogOpen}
          onClose={() => {
            setPaymentDialogOpen(false);
            setSelectedLoan(null);
          }}
          loan={selectedLoan}
          onPaymentCollected={onDataChange}
          language={language}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t.confirmDelete}
        message={t.deleteWarning}
        itemName={loanToDelete ? `${loanToDelete.borrowerName} - ₹${loanToDelete.total_amount.toLocaleString()}` : undefined}
        language={language}
      />
    </div>
  );
};

export default LoanManager;
