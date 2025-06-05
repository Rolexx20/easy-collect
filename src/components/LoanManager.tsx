import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit, Trash2, Calendar, DollarSign, User, CreditCard, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
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
    duration_days: '', // Changed from duration_months to duration_days for UI
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
      duration: 'Duration (Days)', // Changed to days
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
      overdue: 'Overdue',
      paymentProgress: 'Payment Progress',
      daysRemaining: 'Days Remaining',
      dailyPayment: 'Daily Payment Amount'
    },
    ta: {
      title: 'கடன் மேலாண்மை',
      addLoan: 'புதிய கடன் சேர்க்கவும்',
      editLoan: 'கடனைத் திருத்தவும்',
      borrower: 'கடன் வாங்குபவர்',
      principalAmount: 'முதன்மை தொகை',
      interestRate: 'வட்டி விகிதம் (%)',
      duration: 'காலம் (நாட்கள்)', // Changed to days
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
      overdue: 'தாமதம்',
      paymentProgress: 'பணம் செலுத்தல் முன்னேற்றம்',
      daysRemaining: 'மீதமுள்ள நாட்கள்',
      dailyPayment: 'தினசரி பணம் செலுத்தும் தொகை'
    }
  };

  const t = translations[language as keyof typeof translations];

  const handleSubmit = async () => {
    if (!formData.borrower_id || !formData.principal_amount || !formData.interest_rate || 
        !formData.duration_days || !formData.start_date) {
      toast({ title: t.fillAllFields, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const principalAmount = parseFloat(formData.principal_amount);
      const interestRate = parseFloat(formData.interest_rate);
      const totalAmount = principalAmount + (principalAmount * interestRate / 100);
      const durationInDays = parseInt(formData.duration_days);
      
      // Store duration_days directly as a custom field, but keep duration_months for compatibility
      const durationInMonths = Math.max(1, Math.ceil(durationInDays / 30));

      const loanData = {
        borrower_id: formData.borrower_id,
        principal_amount: principalAmount,
        interest_rate: interestRate,
        duration_months: durationInMonths,
        total_amount: totalAmount,
        start_date: formData.start_date,
        status: 'active' as const,
        // We'll store the actual days in a custom field if needed
        duration_days: durationInDays
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
    // Try to get the original days, or estimate from months
    const estimatedDays = (loan as any).duration_days || (loan.duration_months * 30);
    setFormData({
      borrower_id: loan.borrower_id,
      principal_amount: loan.principal_amount.toString(),
      interest_rate: loan.interest_rate.toString(),
      duration_days: estimatedDays.toString(),
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
      duration_days: '', // Reset to duration_days
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="w-4 h-4" />;
      case 'completed':
        return <DollarSign className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const calculateProgress = (amountPaid: number, totalAmount: number) => {
    return Math.round((amountPaid / totalAmount) * 100);
  };

  const calculateDaysRemaining = (startDate: string, durationMonths: number, loan: any) => {
    const start = new Date(startDate);
    // Use actual days if available, otherwise estimate from months
    const actualDays = (loan as any).duration_days || (durationMonths * 30);
    const end = new Date(start);
    end.setDate(end.getDate() + actualDays);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateDailyPayment = (totalAmount: number, durationMonths: number, loan: any) => {
    // Use actual days if available, otherwise estimate from months
    const actualDays = (loan as any).duration_days || (durationMonths * 30);
    return totalAmount / actualDays;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 flex-1">
          <DollarSign className="inline-block w-8 h-8 mr-3 text-blue-600" />
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
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                {editingLoan ? t.editLoan : t.addLoan}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="borrower" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t.borrower}
                </Label>
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
                <Label htmlFor="principal" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {t.principalAmount}
                </Label>
                <Input
                  id="principal"
                  type="number"
                  value={formData.principal_amount}
                  onChange={(e) => setFormData({...formData, principal_amount: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="interest" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t.interestRate}
                </Label>
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
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t.duration}
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({...formData, duration_days: e.target.value})}
                  placeholder="7"
                />
              </div>
              <div>
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t.startDate}
                </Label>
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
          {loans.map((loan) => {
            const progress = calculateProgress(loan.amount_paid, loan.total_amount);
            const daysRemaining = calculateDaysRemaining(loan.start_date, loan.duration_months, loan);
            const dailyPayment = calculateDailyPayment(loan.total_amount, loan.duration_months, loan);
            
            return (
              <Card key={loan.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <span className="truncate">{loan.borrowerName || 'Unknown'}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(loan.status)}`}>
                      {getStatusIcon(loan.status)}
                      {getStatusText(loan.status)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {t.paymentProgress}
                      </span>
                      <span className="text-sm font-bold text-blue-600">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {t.totalAmount}
                      </div>
                      <div className="text-lg font-bold text-blue-700 dark:text-blue-300">₹{loan.total_amount.toLocaleString()}</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {t.amountPaid}
                      </div>
                      <div className="text-lg font-bold text-green-700 dark:text-green-300">₹{loan.amount_paid.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Daily Payment Amount */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {t.dailyPayment}
                    </div>
                    <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                      ₹{dailyPayment.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {t.remainingAmount}
                    </div>
                    <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                      ₹{(loan.total_amount - loan.amount_paid).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Start: {loan.start_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <Clock className="w-4 h-4" />
                      <span>{daysRemaining} {t.daysRemaining}</span>
                    </div>
                  </div>

                  {loan.next_payment_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
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
            );
          })}
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
          onPaymentCollect={onDataChange}
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
