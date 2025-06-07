import { useState, useEffect } from 'react';
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

  // Set default payment amount to daily payment when dialog opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen) {
      setPaymentAmount(dailyPaymentAmount.toFixed(2));
    }
  // Only run when dialog opens or dailyPaymentAmount changes
  }, [isOpen, dailyPaymentAmount]);

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
      <DialogContent className="max-w-xs w-full p-5 m-0 rounded-2xl shadow-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-neutral-800 dark:text-neutral-100">
            <DollarSign className="w-5 h-5 text-green-500" />
            {t.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Borrower Info */}
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl px-3 py-2 flex flex-col items-start">
            <div className="text-xs text-neutral-500">{t.borrower}</div>
            <div className="font-semibold text-base text-neutral-800 dark:text-neutral-100">{loan.borrowerName}</div>
          </div>

          {/* Loan Details */}
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <div className="text-xs text-blue-700 dark:text-blue-300">{t.totalLoan}</div>
              <div className="font-bold text-blue-700 dark:text-blue-300 text-base">₹{Number(loan.total_amount).toLocaleString()}</div>
            </div>
            <div className="text-center p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <div className="text-xs text-green-700 dark:text-green-300">{t.paidAmount}</div>
              <div className="font-bold text-green-700 dark:text-green-300 text-base">₹{Number(loan.amount_paid).toLocaleString()}</div>
            </div>
          </div>

          {/* Payment Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1 text-neutral-500">
              <span>{t.progress}</span>
              <span>{paymentProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300" 
                style={{width: `${paymentProgress}%`}}
              ></div>
            </div>
          </div>

          {/* Daily Payment & Remaining */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
              <Clock className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-xs text-neutral-500">{t.dailyPayment}</div>
                <div className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">₹{dailyPaymentAmount.toFixed(2)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800">
              <Calendar className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-xs text-neutral-500">{t.loanPeriod}</div>
                <div className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">{loanDays} {t.days}</div>
              </div>
            </div>
          </div>

          {/* Remaining Amount */}
          <div className="text-center p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <div className="text-xs text-red-700 dark:text-red-300">{t.remainingAmount}</div>
            <div className="font-bold text-red-700 dark:text-red-300 text-lg">₹{remainingAmount.toLocaleString()}</div>
          </div>

          {/* Payment Input */}
          <div>
            <Label htmlFor="paymentAmount" className="text-xs text-neutral-600 dark:text-neutral-300">{t.paymentAmount}</Label>
            <Input
              id="paymentAmount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder={`Max: ₹${remainingAmount.toLocaleString()}`}
              max={remainingAmount}
              className="mt-1 text-sm rounded-lg border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleCollectPayment}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > remainingAmount || isLoading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-sm py-2 text-sm"
            >
              {isLoading ? "Processing..." : t.collect}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 py-2 text-sm font-semibold rounded-lg border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              disabled={isLoading}
            >
              {t.cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentCollectionDialog;
