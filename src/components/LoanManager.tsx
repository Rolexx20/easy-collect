import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, DollarSign, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createLoan, updateLoan, deleteLoan, type Loan, type Borrower } from '@/lib/database';
import PaymentCollectionDialog from './PaymentCollectionDialog';

interface LoanManagerProps {
  language: string;
  loans: Loan[];
  borrowers: Borrower[];
  onDataChange: () => void;
}

const LoanManager = ({ language, loans, borrowers, onDataChange }: LoanManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    borrower_id: '',
    principal_amount: '',
    interest_rate: '',
    duration_months: '',
    start_date: ''
  });

  const translations = {
    en: {
      title: 'Loan Management',
      addLoan: 'Add New Loan',
      editLoan: 'Edit Loan',
      borrower: 'Select Borrower',
      amount: 'Loan Amount (₹)',
      interestRate: 'Interest Rate (%)',
      duration: 'Duration (months)',
      startDate: 'Start Date',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      collectPayment: 'Collect Payment',
      status: 'Status',
      paid: 'Paid',
      remaining: 'Remaining',
      nextPayment: 'Next Payment',
      dailyPayment: 'Daily Payment',
      active: 'Active',
      completed: 'Completed',
      overdue: 'Overdue',
      loanAdded: 'Loan added successfully',
      loanUpdated: 'Loan updated successfully',
      loanDeleted: 'Loan deleted successfully',
      paymentCollected: 'Payment collected successfully',
      fillAllFields: 'Please fill all fields',
      noLoans: 'No loans created yet',
      noBorrowers: 'Please add borrowers first',
      loanPeriod: 'Loan Period',
      days: 'days'
    },
    ta: {
      title: 'கடன் மேலாண்மை',
      addLoan: 'புதிய கடன் சேர்க்கவும்',
      editLoan: 'கடனைத் திருத்தவும்',
      borrower: 'கடன் வாங்குபவரைத் தேர்ந்தெடுக்கவும்',
      amount: 'கடன் தொகை (₹)',
      interestRate: 'வட்டி விகிதம் (%)',
      duration: 'காலம் (மாதங்கள்)',
      startDate: 'தொடக்க தேதி',
      save: 'சேமிக்கவும்',
      cancel: 'ரத்து செய்யவும்',
      edit: 'திருத்து',
      delete: 'நீக்கு',
      collectPayment: 'பணம் வசூலிக்கவும்',
      status: 'நிலை',
      paid: 'செலுத்தப்பட்டது',
      remaining: 'மீதமுள்ளது',
      nextPayment: 'அடுத்த பணம்',
      dailyPayment: 'தினசரி பணம்',
      active: 'செயலில்',
      completed: 'முடிந்தது',
      overdue: 'தாமதம்',
      loanAdded: 'கடன் வெற்றிகரமாக சேர்க்கப்பட்டது',
      loanUpdated: 'கடன் வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
      loanDeleted: 'கடன் வெற்றிகரமாக நீக்கப்பட்டது',
      paymentCollected: 'பணம் வெற்றிகரமாக வசூலிக்கப்பட்டது',
      fillAllFields: 'தயவுசெய்து அனைத்து புலங்களையும் நிரப்பவும்',
      noLoans: 'இதுவரை கடன்கள் உருவாக்கப்படவில்லை',
      noBorrowers: 'முதலில் கடன் வாங்குபவர்களைச் சேர்க்கவும்',
      loanPeriod: 'கடன் காலம்',
      days: 'நாட்கள்'
    }
  };

  const t = translations[language as keyof typeof translations];

  const handleSubmit = async () => {
    if (!formData.borrower_id || !formData.principal_amount || !formData.interest_rate || !formData.duration_months || !formData.start_date) {
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
        total_amount: parseFloat(formData.principal_amount) * (1 + parseFloat(formData.interest_rate) / 100),
        amount_paid: 0,
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

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteLoan(id);
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
    }
  };

  const resetForm = () => {
    setFormData({ borrower_id: '', principal_amount: '', interest_rate: '', duration_months: '', start_date: '' });
    setEditingLoan(null);
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default' as const, icon: Clock, color: 'text-blue-600' },
      completed: { variant: 'secondary' as const, icon: CheckCircle, color: 'text-green-600' },
      overdue: { variant: 'destructive' as const, icon: Clock, color: 'text-red-600' }
    };
    
    const config = variants[status as keyof typeof variants];
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className={`w-3 h-3 ${config.color}`} />
        {t[status as keyof typeof t]}
      </Badge>
    );
  };

  const getDailyPayment = (loan: Loan) => {
    const loanDays = loan.duration_months * 30; // Convert months to days
    return loan.total_amount / loanDays;
  };

  if (borrowers.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {t.noBorrowers}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 flex-1">
          {t.title}
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingLoan(null)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              {t.addLoan}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLoan ? t.editLoan : t.addLoan}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t.borrower}</Label>
                <Select value={formData.borrower_id} onValueChange={(value) => setFormData({...formData, borrower_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.borrower} />
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
                <Label htmlFor="amount">{t.amount}</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.principal_amount}
                  onChange={(e) => setFormData({...formData, principal_amount: e.target.value})}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="interestRate">{t.interestRate}</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
                  placeholder="12"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loans.map((loan) => (
            <Card key={loan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{loan.borrowerName}</span>
                  {getStatusBadge(loan.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-500">{t.amount}</div>
                      <div className="font-semibold">₹{loan.total_amount.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-500">{t.interestRate}</div>
                      <div className="font-semibold">{loan.interest_rate}%</div>
                    </div>
                  </div>
                </div>

                {/* Daily Payment Display */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {t.dailyPayment}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                    ₹{getDailyPayment(loan).toFixed(2)}
                  </div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300">
                    {t.loanPeriod}: {loan.duration_months * 30} {t.days}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t.paid}:</span>
                    <span className="font-semibold text-green-600">₹{loan.amount_paid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t.remaining}:</span>
                    <span className="font-semibold text-red-600">₹{(loan.total_amount - loan.amount_paid).toLocaleString()}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{width: `${(loan.amount_paid / loan.total_amount) * 100}%`}}
                    ></div>
                  </div>
                </div>

                {loan.next_payment_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {t.nextPayment}: {new Date(loan.next_payment_date).toLocaleDateString()}
                  </div>
                )}

                <div className="flex gap-2">
                  {loan.status === 'active' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedLoan(loan);
                        setIsPaymentDialogOpen(true);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      {t.collectPayment}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(loan)}
                    disabled={isLoading}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(loan.id)}
                    className="text-red-600 hover:text-red-700"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Collection Dialog */}
      {selectedLoan && (
        <PaymentCollectionDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => {
            setIsPaymentDialogOpen(false);
            setSelectedLoan(null);
          }}
          loan={selectedLoan}
          onPaymentCollect={onDataChange}
          language={language}
        />
      )}
    </div>
  );
};

export default LoanManager;
