
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createPayment, type Loan } from '@/lib/database';

interface PaymentCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  onPaymentCollect: () => void;
  language: string;
}

const PaymentCollectionDialog = ({ 
  isOpen, 
  onClose, 
  loan, 
  onPaymentCollect, 
  language 
}: PaymentCollectionDialogProps) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    en: {
      title: 'Collect Payment',
      borrower: 'Borrower',
      totalLoan: 'Total Loan Amount',
      paidAmount: 'Amount Paid',
      remainingAmount: 'Remaining Amount',
      dailyPayment: 'Daily Payment Amount',
      paymentAmount: 'Payment Amount',
      collect: 'Collect Payment',
      cancel: 'Cancel',
      loanPeriod: 'Loan Period',
      days: 'days',
      progress: 'Payment Progress',
      paymentSuccess: 'Payment collected successfully'
    },
    ta: {
      title: 'பணம் வசூலிக்கவும்',
      borrower: 'கடன் வாங்குபவர்',
      totalLoan: 'மொத்த கடன் தொகை',
      paidAmount: 'செலுத்தப்பட்ட தொகை',
      remainingAmount: 'மீதமுள்ள தொகை',
      dailyPayment: 'தினசரி பணம்',
      paymentAmount: 'பணம் தொகை',
      collect: 'பணம் வசூலிக்கவும்',
      cancel: 'ரத்து செய்யவும்',
      loanPeriod: 'கடன் காலம்',
      days: 'நாட்கள்',
      progress: 'பணம் செலுத்தல் முன்னேற்றம்',
      paymentSuccess: 'பணம் வெற்றிகரமாக வசூலிக்கப்பட்டது'
    }
  };

  const t = translations[language as keyof typeof translations];

  const remainingAmount = Number(loan.total_amount) - Number(loan.amount_paid);
  const loanDays = loan.duration_months * 30; // Convert months to days
  const dailyPaymentAmount = Number(loan.total_amount) / loanDays;
  const paymentProgress = (Number(loan.amount_paid) / Number(loan.total_amount)) * 100;

  const handleCollectPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > remainingAmount) {
      toast({ 
        title: "Invalid amount", 
        description: `Please enter an amount between ₹1 and ₹${remainingAmount.toLocaleString()}`,
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    try {
      await createPayment({
        loan_id: loan.id,
        amount: amount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash'
      });
      
      toast({ title: t.paymentSuccess });
      
      // Reset form and close dialog first
      setPaymentAmount('');
      onClose();
      
      // Then refresh the data to show updated amounts
      // Add a small delay to ensure the trigger has processed
      setTimeout(() => {
        onPaymentCollect();
      }, 100);
      
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({ 
        title: "Error", 
        description: "Failed to record payment. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            {t.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Borrower Info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">{t.borrower}</div>
            <div className="font-semibold text-lg">{loan.borrowerName}</div>
          </div>

          {/* Loan Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">{t.totalLoan}</div>
              <div className="font-bold text-blue-600 dark:text-blue-400">₹{Number(loan.total_amount).toLocaleString()}</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">{t.paidAmount}</div>
              <div className="font-bold text-green-600 dark:text-green-400">₹{Number(loan.amount_paid).toLocaleString()}</div>
            </div>
          </div>

          {/* Payment Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>{t.progress}</span>
              <span>{paymentProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                style={{width: `${paymentProgress}%`}}
              ></div>
            </div>
          </div>

          {/* Daily Payment & Remaining */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Clock className="w-4 h-4 text-orange-600" />
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t.dailyPayment}</div>
                <div className="font-semibold">₹{dailyPaymentAmount.toFixed(2)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Calendar className="w-4 h-4 text-purple-600" />
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t.loanPeriod}</div>
                <div className="font-semibold">{loanDays} {t.days}</div>
              </div>
            </div>
          </div>

          {/* Remaining Amount */}
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">{t.remainingAmount}</div>
            <div className="font-bold text-red-600 dark:text-red-400 text-xl">₹{remainingAmount.toLocaleString()}</div>
          </div>

          {/* Payment Input */}
          <div>
            <Label htmlFor="paymentAmount">{t.paymentAmount}</Label>
            <Input
              id="paymentAmount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder={`Max: ₹${remainingAmount.toLocaleString()}`}
              max={remainingAmount}
              className="mt-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleCollectPayment}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > remainingAmount || isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Processing..." : t.collect}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              {t.cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentCollectionDialog;
