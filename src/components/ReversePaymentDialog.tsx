
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Undo2, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { reversePayment, type Payment } from '@/lib/database';

interface ReversePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onPaymentReversed: () => void;
  language: string;
}

const ReversePaymentDialog = ({ 
  isOpen, 
  onClose, 
  payment, 
  onPaymentReversed, 
  language 
}: ReversePaymentDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    en: {
      title: 'Reverse Payment',
      warning: 'Warning: This action cannot be undone',
      paymentDetails: 'Payment Details',
      amount: 'Amount',
      date: 'Date',
      method: 'Payment Method',
      confirmReverse: 'Confirm Reverse',
      cancel: 'Cancel',
      reverseSuccess: 'Payment reversed successfully',
      confirmMessage: 'Are you sure you want to reverse this payment? This will restore the loan balance.',
      reversing: 'Reversing...'
    },
    ta: {
      title: 'பணம் செலுத்தல் திரும்பப் பெறுதல்',
      warning: 'எச்சரிக்கை: இந்த செயலை மாற்ற முடியாது',
      paymentDetails: 'பணம் செலுத்தல் விவரங்கள்',
      amount: 'தொகை',
      date: 'தேதி',
      method: 'பணம் செலுத்தும் முறை',
      confirmReverse: 'திரும்பப் பெறுதலை உறுதிப்படுத்து',
      cancel: 'ரத்து செய்யவும்',
      reverseSuccess: 'பணம் செலுத்தல் வெற்றிகரமாக திரும்பப் பெறப்பட்டது',
      confirmMessage: 'இந்த பணம் செலுத்தலை திரும்பப் பெற விரும்புகிறீர்களா? இது கடன் இருப்பை மீட்டமைக்கும்.',
      reversing: 'திரும்பப் பெறுகிறது...'
    }
  };

  const t = translations[language as keyof typeof translations];

  const handleReversePayment = async () => {
    if (!payment) return;

    setIsLoading(true);
    try {
      await reversePayment(payment.id);
      toast({ title: t.reverseSuccess });
      onClose();
      onPaymentReversed();
    } catch (error) {
      console.error('Error reversing payment:', error);
      toast({ 
        title: "Error", 
        description: "Failed to reverse payment. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
            <Undo2 className="w-5 h-5 text-orange-500" />
            {t.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Warning */}
          <div className="flex items-center gap-2 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">
              {t.warning}
            </span>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.paymentDetails}</h3>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.amount}</span>
              <span className="font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                ₹{payment.amount.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.date}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {new Date(payment.payment_date).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.method}</span>
              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {payment.payment_method || 'cash'}
              </span>
            </div>
          </div>

          {/* Confirmation Message */}
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            {t.confirmMessage}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleReversePayment}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg"
            >
              {isLoading ? t.reversing : t.confirmReverse}
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

export default ReversePaymentDialog;
