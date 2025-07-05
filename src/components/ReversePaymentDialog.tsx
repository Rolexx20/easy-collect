import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Undo2, DollarSign, Calendar, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { reversePayment, getPaymentsByLoanId, type Payment, type Loan } from '@/lib/database';

interface ReversePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
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
      paymentDetails: 'Payment Details',
      amount: 'Amount',
      date: 'Date',
      method: 'Payment Method',
      confirmReverse: 'Confirm Reverse',
      cancel: 'Cancel',
      reverseSuccess: 'Payment reversed successfully',
      confirmMessage: 'Are you sure you want to reverse this payment? This will restore the loan balance.',
      reversing: 'Reversing...',
      noPayments: 'No payments found to reverse'
    },
    ta: {
      title: 'பணம் செலுத்தல் திரும்பப் பெறுதல்',
      warning: 'எச்சரிக்கை: இந்த செயலை மாற்ற முடியாது',
      selectPayment: 'திரும்பப் பெற வேண்டிய பணத்தைத் தேர்ந்தெடுக்கவும்',
      paymentDetails: 'பணம் செலுத்தல் விவரங்கள்',
      amount: 'தொகை',
      date: 'தேதி',
      method: 'பணம் செலுத்தும் முறை',
      confirmReverse: 'திரும்பப் பெறுதலை உறுதிப்படுத்து',
      cancel: 'ரத்து செய்யவும்',
      reverseSuccess: 'பணம் செலுத்தல் வெற்றிகரமாக திரும்பப் பெறப்பட்டது',
      confirmMessage: 'இந்த பணம் செலுத்தலை திரும்பப் பெற விரும்புகிறீர்களா? இது கடன் இருப்பை மீட்டமைக்கும்.',
      reversing: 'திரும்பப் பெறுகிறது...',
      noPayments: 'திரும்பப் பெற வேண்டிய பணம் எதுவும் இல்லை'
    }
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    if (isOpen && loan) {
      loadPayments();
    }
  }, [isOpen, loan]);

  const loadPayments = async () => {
    if (!loan) return;
    
    try {
      const paymentsData = await getPaymentsByLoanId(loan.id);
      // Sort payments by date in descending order
      const sortedPayments = paymentsData.sort((a, b) => {
        const dateA = new Date(
          `${a.payment_date}T${a.payment_time || "00:00:00"}`
        );
        const dateB = new Date(
          `${b.payment_date}T${b.payment_time || "00:00:00"}`
        );
        return dateB.getTime() - dateA.getTime();
      });
      setPayments(sortedPayments);
      // Auto-select the most recent payment
      if (sortedPayments.length > 0) {
        setSelectedPayment(sortedPayments[0]);
      } else {
        setSelectedPayment(null);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const handleReversePayment = async () => {
    if (!selectedPayment) return;

    setIsLoading(true);
    try {
      await reversePayment(selectedPayment.id);
      toast({ title: t.reverseSuccess });
      onPaymentReversed(); // Notify parent to refresh loan details
      onClose();
      setSelectedPayment(null);
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
          {payments.length === 0 ? (
            <div className="text-center text-gray-500 py-4">{t.noPayments}</div>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.selectPayment}</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {payments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPayment?.id === payment.id 
                          ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                      }`}
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {payment.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              {new Date(
                                payment.payment_date
                              ).toLocaleDateString()}
                            </span>
                            {payment.payment_time && (
                              <>
                                <Clock className="w-3 h-3 text-gray-500 ml-2" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(`1970-01-01T${payment.payment_time}`)
                                    .toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                      hour12: true,
                                    })
                                    .replace(/am|pm/i, (match) =>
                                      match.toUpperCase()
                                    )}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Payment Details */}
              {selectedPayment && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-3 mt-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.paymentDetails}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t.amount}</span>
                    <span className="font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {selectedPayment.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t.date}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-500 inline" />
                        {new Date(selectedPayment.payment_date).toLocaleDateString()}
                      </span>
                      {selectedPayment.payment_time && (
                        <span className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1 ml-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {new Date(`1970-01-01T${selectedPayment.payment_time}`)
                            .toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: true,
                            })
                            .replace(/am|pm/i, (match) => match.toUpperCase())}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                {t.confirmMessage}
              </p>

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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReversePaymentDialog;
