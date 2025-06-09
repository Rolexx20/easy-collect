
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Undo2, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { reversePayment, getPaymentsByLoanId, type Payment } from '@/lib/database';

interface ReversePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loan: any | null;
  onPaymentReversed: () => void;
  language: string;
}

const ReversePaymentDialog = ({ 
  isOpen, 
  onClose, 
  loan, 
  onPaymentReversed, 
  language 
}: ReversePaymentDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const translations = {
    en: {
      title: 'Reverse Payment',
      warning: 'Warning: This action cannot be undone',
      selectPayment: 'Select Payment to Reverse',
      amount: 'Amount',
      date: 'Date',
      method: 'Payment Method',
      confirmReverse: 'Confirm Reverse',
      cancel: 'Cancel',
      reverseSuccess: 'Payment reversed successfully',
      confirmMessage: 'Are you sure you want to reverse this payment? This will restore the loan balance.',
      reversing: 'Reversing...',
      noPayments: 'No payments found to reverse',
      selectFirst: 'Please select a payment first'
    },
    ta: {
      title: 'பணம் செலுத்தல் திரும்பப் பெறுதல்',
      warning: 'எச்சரிக்கை: இந்த செயலை மாற்ற முடியாது',
      selectPayment: 'திரும்பப் பெற வேண்டிய பணம் செலுத்தலைத் தேர்ந்தெடுக்கவும்',
      amount: 'தொகை',
      date: 'தேதி',
      method: 'பணம் செலுத்தும் முறை',
      confirmReverse: 'திரும்பப் பெறுதலை உறுதிப்படுத்து',
      cancel: 'ரத்து செய்யவும்',
      reverseSuccess: 'பணம் செலுத்தல் வெற்றிகரமாக திரும்பப் பெறப்பட்டது',
      confirmMessage: 'இந்த பணம் செலுத்தலை திரும்பப் பெற விரும்புகிறீர்களா? இது கடன் இருப்பை மீட்டமைக்கும்.',
      reversing: 'திரும்பப் பெறுகிறது...',
      noPayments: 'திரும்பப் பெற வேண்டிய பணம் செலுத்தல்கள் இல்லை',
      selectFirst: 'முதலில் ஒரு பணம் செலுத்தலைத் தேர்ந்தெடுக்கவும்'
    }
  };

  const t = translations[language as keyof typeof translations];

  // Load payments when dialog opens
  useState(() => {
    if (isOpen && loan) {
      loadPayments();
    }
  });

  const loadPayments = async () => {
    if (!loan) return;
    
    try {
      const paymentsData = await getPaymentsByLoanId(loan.id);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const handleReversePayment = async () => {
    if (!selectedPayment) {
      toast({ 
        title: "Error", 
        description: t.selectFirst,
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    try {
      await reversePayment(selectedPayment.id);
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

  if (!loan) return null;

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

          {/* Payment Selection */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.selectPayment}</h3>
            
            {payments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">{t.noPayments}</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {payments.map((payment) => (
                  <div 
                    key={payment.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPayment?.id === payment.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-green-600 dark:text-green-400">
                          ₹{payment.amount.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {payment.payment_method || 'cash'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedPayment && (
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              {t.confirmMessage}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleReversePayment}
              disabled={isLoading || !selectedPayment}
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
