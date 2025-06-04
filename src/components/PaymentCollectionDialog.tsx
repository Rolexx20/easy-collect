
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, Clock } from 'lucide-react';

interface PaymentCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loan: {
    id: string;
    borrowerName: string;
    amount: number;
    amountPaid: number;
    duration: number;
    startDate: string;
    interestRate: number;
  };
  onPaymentCollect: (loanId: string, amount: number) => void;
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
      progress: 'Payment Progress'
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
      progress: 'பணம் செலுத்தல் முன்னேற்றம்'
    }
  };

  const t = translations[language as keyof typeof translations];

  const remainingAmount = loan.amount - loan.amountPaid;
  const loanDays = loan.duration * 30; // Convert months to days
  const dailyPaymentAmount = loan.amount / loanDays;
  const paymentProgress = (loan.amountPaid / loan.amount) * 100;

  const handleCollectPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (amount > 0 && amount <= remainingAmount) {
      onPaymentCollect(loan.id, amount);
      setPaymentAmount('');
      onClose();
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
              <div className="font-bold text-blue-600 dark:text-blue-400">₹{loan.amount.toLocaleString()}</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">{t.paidAmount}</div>
              <div className="font-bold text-green-600 dark:text-green-400">₹{loan.amountPaid.toLocaleString()}</div>
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
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > remainingAmount}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {t.collect}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t.cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentCollectionDialog;
