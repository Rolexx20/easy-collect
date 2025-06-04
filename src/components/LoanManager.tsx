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
import PaymentCollectionDialog from './PaymentCollectionDialog';

interface Loan {
  id: string;
  borrowerId: string;
  borrowerName: string;
  amount: number;
  interestRate: number;
  duration: number;
  startDate: string;
  status: 'active' | 'completed' | 'overdue';
  amountPaid: number;
  nextPaymentDate: string;
}

interface LoanManagerProps {
  language: string;
  loans: Loan[];
  setLoans: (loans: Loan[]) => void;
  borrowers: any[];
}

const LoanManager = ({ language, loans, setLoans, borrowers }: LoanManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [formData, setFormData] = useState({
    borrowerId: '',
    amount: '',
    interestRate: '',
    duration: '',
    startDate: ''
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

  const handleSubmit = () => {
    if (!formData.borrowerId || !formData.amount || !formData.interestRate || !formData.duration || !formData.startDate) {
      toast({ title: t.fillAllFields, variant: "destructive" });
      return;
    }

    const borrower = borrowers.find(b => b.id === formData.borrowerId);
    const totalAmount = parseFloat(formData.amount) * (1 + parseFloat(formData.interestRate) / 100);

    if (editingLoan) {
      const updatedLoans = loans.map(l => 
        l.id === editingLoan.id 
          ? { 
              ...l, 
              ...formData,
              borrowerName: borrower?.name || '',
              amount: totalAmount,
              interestRate: parseFloat(formData.interestRate),
              duration: parseInt(formData.duration)
            }
          : l
      );
      setLoans(updatedLoans);
      toast({ title: t.loanUpdated });
    } else {
      const newLoan: Loan = {
        id: Date.now().toString(),
        borrowerId: formData.borrowerId,
        borrowerName: borrower?.name || '',
        amount: totalAmount,
        interestRate: parseFloat(formData.interestRate),
        duration: parseInt(formData.duration),
        startDate: formData.startDate,
        status: 'active',
        amountPaid: 0,
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      setLoans([...loans, newLoan]);
      toast({ title: t.loanAdded });
    }

    resetForm();
  };

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan);
    setFormData({
      borrowerId: loan.borrowerId,
      amount: (loan.amount / (1 + loan.interestRate / 100)).toFixed(2),
      interestRate: loan.interestRate.toString(),
      duration: loan.duration.toString(),
      startDate: loan.startDate
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setLoans(loans.filter(l => l.id !== id));
    toast({ title: t.loanDeleted });
  };

  const handlePayment = (loanId: string, amount: number) => {
    const updatedLoans = loans.map(loan => {
      if (loan.id === loanId) {
        const newAmountPaid = loan.amountPaid + amount;
        const newStatus: 'active' | 'completed' | 'overdue' = newAmountPaid >= loan.amount ? 'completed' : 'active';
        return {
          ...loan,
          amountPaid: newAmountPaid,
          status: newStatus,
          nextPaymentDate: newStatus === 'completed' ? '' : 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
      }
      return loan;
    });
    setLoans(updatedLoans);
    toast({ title: t.paymentCollected });
  };

  const resetForm = () => {
    setFormData({ borrowerId: '', amount: '', interestRate: '', duration: '', startDate: '' });
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
    const loanDays = loan.duration * 30; // Convert months to days
    return loan.amount / loanDays;
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
                <Select value={formData.borrowerId} onValueChange={(value) => setFormData({...formData, borrowerId: value})}>
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
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="interestRate">{t.interestRate}</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                  placeholder="12"
                />
              </div>
              <div>
                <Label htmlFor="duration">{t.duration}</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder="12"
                />
              </div>
              <div>
                <Label htmlFor="startDate">{t.startDate}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="flex-1">
                  {t.save}
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
                      <div className="font-semibold">₹{loan.amount.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-500">{t.interestRate}</div>
                      <div className="font-semibold">{loan.interestRate}%</div>
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
                    {t.loanPeriod}: {loan.duration * 30} {t.days}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t.paid}:</span>
                    <span className="font-semibold text-green-600">₹{loan.amountPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t.remaining}:</span>
                    <span className="font-semibold text-red-600">₹{(loan.amount - loan.amountPaid).toLocaleString()}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{width: `${(loan.amountPaid / loan.amount) * 100}%`}}
                    ></div>
                  </div>
                </div>

                {loan.nextPaymentDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {t.nextPayment}: {new Date(loan.nextPaymentDate).toLocaleDateString()}
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
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(loan.id)}
                    className="text-red-600 hover:text-red-700"
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
          onPaymentCollect={handlePayment}
          language={language}
        />
      )}
    </div>
  );
};

export default LoanManager;
