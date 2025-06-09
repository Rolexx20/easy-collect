
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { History, Undo2, DollarSign, Calendar } from 'lucide-react';
import { getPaymentsByLoanId, type Payment, type Loan } from '@/lib/database';
import ReversePaymentDialog from './ReversePaymentDialog';

interface PaymentHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  onPaymentReversed: () => void;
  language: string;
}

const PaymentHistoryDialog = ({ 
  isOpen, 
  onClose, 
  loan, 
  onPaymentReversed, 
  language 
}: PaymentHistoryDialogProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReverseDialogOpen, setIsReverseDialogOpen] = useState(false);

  const translations = {
    en: {
      title: 'Payment History',
      noPayments: 'No payments found',
      amount: 'Amount',
      date: 'Date',
      method: 'Method',
      reverse: 'Reverse',
      close: 'Close',
      recentPayments: 'Recent Payments'
    },
    ta: {
      title: 'பணம் செலுத்தல் வரலாறு',
      noPayments: 'பணம் செலுத்தல்கள் இல்லை',
      amount: 'தொகை',
      date: 'தேதி',
      method: 'முறை',
      reverse: 'திரும்பப் பெறு',
      close: 'மூடு',
      recentPayments: 'சமீபத்திய பணம் செலுத்தல்கள்'
    }
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    if (isOpen) {
      loadPayments();
    }
  }, [isOpen, loan.id]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const paymentsData = await getPaymentsByLoanId(loan.id);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReverseClick = () => {
    setIsReverseDialogOpen(true);
  };

  const handlePaymentReversed = () => {
    setIsReverseDialogOpen(false);
    loadPayments();
    onPaymentReversed();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
              <History className="w-5 h-5 text-blue-500" />
              {t.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-1">Borrower</div>
              <div className="font-semibold text-gray-800 dark:text-gray-100">{loan.borrowerName}</div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t.recentPayments}</h3>
              
              {isLoading ? (
                <div className="text-center text-gray-500 py-4">Loading...</div>
              ) : payments.length === 0 ? (
                <div className="text-center text-gray-500 py-4">{t.noPayments}</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-600 dark:text-green-400">
                            ₹{payment.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                          <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {payment.payment_method || 'cash'}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleReverseClick}
                        className="ml-2 text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      >
                        <Undo2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button 
              onClick={onClose} 
              className="w-full border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
              variant="outline"
            >
              {t.close}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ReversePaymentDialog
        isOpen={isReverseDialogOpen}
        onClose={() => setIsReverseDialogOpen(false)}
        loan={loan}
        onPaymentReversed={handlePaymentReversed}
        language={language}
      />
    </>
  );
};

export default PaymentHistoryDialog;
