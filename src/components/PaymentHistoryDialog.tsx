import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History, DollarSign, Calendar, CreditCard, Undo2 } from "lucide-react";
import { getPaymentsByLoanId, type Payment, type Loan } from "@/lib/database";
import ReversePaymentDialog from "./ReversePaymentDialog";

interface PaymentHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  onPaymentReversed: () => void;
  language: string;
}

const PaymentHistoryDialog = ({
  isOpen,
  onClose,
  loan,
  onPaymentReversed,
  language,
}: PaymentHistoryDialogProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reverseDialogOpen, setReverseDialogOpen] = useState(false);

  const translations = {
    en: {
      title: "Payment History",
      noPayments: "No payments found",
      amount: "Amount",
      date: "Date",
      method: "Payment Method",
      notes: "Notes",
      reversePayment: "Reverse Payment",
      totalPaid: "Total Paid",
      remaining: "Remaining",
    },
    ta: {
      title: "பணம் செலுத்தல் வரலாறு",
      noPayments: "பணம் செலுத்தல் எதுவும் இல்லை",
      amount: "தொகை",
      date: "தேதி",
      method: "பணம் செலுத்தும் முறை",
      notes: "குறிப்புகள்",
      reversePayment: "பணம் திரும்பப் பெறுதல்",
      totalPaid: "மொத்தம் செலுத்தப்பட்டது",
      remaining: "மீதமுள்ளது",
    },
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    if (isOpen && loan) {
      loadPayments();
    }
  }, [isOpen, loan]);

  const loadPayments = async () => {
    if (!loan) return;

    setIsLoading(true);
    try {
      const paymentsData = await getPaymentsByLoanId(loan.id);
      setPayments(paymentsData);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReversePayment = () => {
    setReverseDialogOpen(true);
  };

  const handlePaymentReversed = () => {
    loadPayments(); // Reload payments
    onPaymentReversed(); // Notify parent to refresh loan details
    setReverseDialogOpen(false);
  };

  if (!loan) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-full p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
              <History className="w-5 h-5 text-blue-500" />
              {t.title} - {loan.borrowerName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Loan Summary */}
            <div className="grid grid-cols-2 gap-4 p-2 pl-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t.totalPaid}
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  ₹{loan.amount_paid.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t.remaining}
                </span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  ₹{(loan.total_amount - loan.amount_paid).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payments List */}
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : payments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {t.noPayments}
              </div>
            ) : (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-green-600 dark:text-green-400">
                        ₹{payment.amount.toLocaleString()}
                      </span>
                      </div>
                      <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {payments.length > 0 && (
              <div className="flex justify-end">
                <Button
                  onClick={handleReversePayment}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg flex items-center gap-2"
                >
                  <Undo2 className="w-4 h-4" />
                  {t.reversePayment}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reverse Payment Dialog */}
      <ReversePaymentDialog
        isOpen={reverseDialogOpen}
        onClose={() => setReverseDialogOpen(false)}
        loan={loan}
        onPaymentReversed={handlePaymentReversed} // Pass the handler to update values
        language={language}
      />
    </>
  );
};

export default PaymentHistoryDialog;
