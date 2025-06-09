import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Calendar, CreditCard, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createPayment } from '@/lib/database';

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

interface PaymentCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: loan ? (loan.total_amount / loan.duration_months / 30).toFixed(2) : '',
    notes: ''
  });

  const translations = {
    en: {
      title: 'Collect Payment',
      amount: 'Payment Amount',
      notes: 'Notes (Optional)',
      collect: 'Collect Payment',
      cancel: 'Cancel',
      totalAmount: 'Total Loan Amount',
      paidAmount: 'Already Paid',
      remainingAmount: 'Remaining Amount',
      paymentProgress: 'Payment Progress',
      paymentCollected: 'Payment collected successfully',
      enterAmount: 'Please enter payment amount',
      invalidAmount: 'Payment amount cannot exceed remaining amount',
      collecting: 'Collecting...',
      cash: 'Cash',
      bank: 'Bank Transfer',
      card: 'Card',
      upi: 'UPI',
      other: 'Other'
    },
    ta: {
      title: 'பணம் வசூலிக்கவும்',
      amount: 'பணம் செலுத்தும் தொகை',
      notes: 'குறிப்புகள் (விருப்பமான)',
      collect: 'பணம் வசூலிக்கவும்',
      cancel: 'ரத்து செய்யவும்',
      totalAmount: 'மொத்த கடன் தொகை',
      paidAmount: 'ஏற்கனவே செலுத்தப்பட்டது',
      remainingAmount: 'மீதமுள்ள தொகை',
      paymentProgress: 'பணம் செலுத்தல் முன்னேற்றம்',
      paymentCollected: 'பணம் வெற்றிகரமாக வசூலிக்கப்பட்டது',
      enterAmount: 'தயவுசெய்து பணம் செலுத்தும் தொகையை உள்ளிடவும்',
      invalidAmount: 'பணம் செலுத்தும் தொகை மீதமுள்ள தொகையை விட அதிகமாக இருக்க முடியாது',
      collecting: 'வசூலிக்கிறது...',
      cash: 'பணம்',
      bank: 'வங்கி பரிமாற்றம்',
      card: 'அட்டை',
      upi: 'UPI',
      other: 'மற்றவை'
    }
  };

  const t = translations[language as keyof typeof translations];

  const handleSubmit = async () => {
    if (!formData.amount) {
      toast({ title: t.enterAmount, variant: "destructive" });
      return;
    }

    const paymentAmount = parseFloat(formData.amount);
    const remainingAmount = loan ? loan.total_amount - loan.amount_paid : 0;

    if (paymentAmount > remainingAmount) {
      toast({ title: t.invalidAmount, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await createPayment({
        loan_id: loan!.id,
        amount: paymentAmount,
        payment_date: new Date().toISOString().split('T')[0],
        notes: formData.notes,
        payment_method: ''
      });
      
      toast({ title: t.paymentCollected });
      onPaymentCollect();
      onClose();
      setFormData({ amount: '', notes: '' });
    } catch (error) {
      console.error('Error collecting payment:', error);
      toast({ 
        title: "Error", 
        description: "Failed to collect payment. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!loan) return null;

  const remainingAmount = loan.total_amount - loan.amount_paid;
  const progress = Math.round((loan.amount_paid / loan.total_amount) * 100);
  
  // Calculate what the progress would be after this payment
  const simulatedPaid = loan.amount_paid + (parseFloat(formData.amount) || 0);
  const simulatedProgress = Math.min(100, Math.round((simulatedPaid / loan.total_amount) * 100));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            <DollarSign className="w-5 h-5 text-green-500" />
            {t.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Loan Summary */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {loan.borrowerName}
            </h3>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.totalAmount}</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                ₹{loan.total_amount.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.paidAmount}</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                ₹{loan.amount_paid.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.remainingAmount}</span>
              <span className="font-bold text-red-600 dark:text-red-400">
                ₹{remainingAmount.toLocaleString()}
              </span>
            </div>
            
            {/* Current Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{t.paymentProgress}</span>
                <span>{simulatedProgress}%</span>
              </div>
              <Progress value={simulatedProgress} className="h-2" />
            </div>

            {/* Additional Loan Details */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Daily Payment Amount</span>
                <p className="font-bold text-gray-800 dark:text-gray-200">₹{(loan.total_amount / loan.duration_months / 30).toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Loan Period</span>
                <p className="font-bold text-gray-800 dark:text-gray-200">{loan.duration_months * 30} days</p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount" className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4" />
              {t.amount}
              </Label>
              <Input
              id="amount"
              type="number"
              step="1"
              value={formData.amount}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, amount: value });
              }}
              placeholder={(loan.total_amount / loan.duration_months / 30).toFixed(2)}
              className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                {t.notes}
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder=""
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 min-h-[60px]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !formData.amount}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg"
            >
              {isLoading ? t.collecting : t.collect}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
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
