
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Calendar, DollarSign, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createPayment, type Loan } from '@/lib/database';
import { bluetoothPrinter, type ReceiptData } from '@/utils/bluetoothPrinter';

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
  const [isPrinting, setIsPrinting] = useState(false);

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
      paymentSuccess: 'Payment collected successfully',
      printSuccess: 'Receipt printed successfully',
      printFailed: 'Failed to print receipt'
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
      paymentSuccess: 'பணம் வெற்றிகரமாக வசூலிக்கப்பட்டது',
      printSuccess: 'ரசீது வெற்றிகரமாக அச்சிடப்பட்டது',
      printFailed: 'ரசீது அச்சிட முடியவில்லை'
    }
  };

  const t = translations[language as keyof typeof translations];

  const remainingAmount = Number(loan.total_amount) - Number(loan.amount_paid);
  const loanDays = loan.duration_months * 30; // Convert months to days
  const dailyPaymentAmount = Number(loan.total_amount) / loanDays;
  const paymentProgress = (Number(loan.amount_paid) / Number(loan.total_amount)) * 100;

  // Set default payment amount to daily payment when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPaymentAmount(dailyPaymentAmount.toFixed(2));
    }
  }, [isOpen, dailyPaymentAmount]);

  const handlePrintReceipt = async (paymentData: { amount: number; newTotalPaid: number }) => {
    setIsPrinting(true);
    try {
      const receiptData: ReceiptData = {
        loanNumber: loan.id.slice(-5).toUpperCase(),
        customerName: loan.borrowerName || 'Unknown',
        loanAmount: Number(loan.total_amount),
        paymentAmount: paymentData.amount,
        totalPaid: paymentData.newTotalPaid,
        totalDue: Number(loan.total_amount) - paymentData.newTotalPaid,
        closingBalance: Number(loan.total_amount) - paymentData.newTotalPaid,
        date: loan.start_date,
        route: 'BATTICALOA 01'
      };

      const printed = await bluetoothPrinter.printReceipt(receiptData);
      if (printed) {
        toast({ title: t.printSuccess });
      } else {
        toast({ 
          title: t.printFailed,
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Print error:', error);
      toast({ 
        title: t.printFailed,
        variant: "destructive" 
      });
    } finally {
      setIsPrinting(false);
    }
  };

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
      
      // Calculate new total paid amount
      const newTotalPaid = Number(loan.amount_paid) + amount;
      
      // Try to print receipt automatically
      try {
        await handlePrintReceipt({ amount, newTotalPaid });
      } catch (printError) {
        console.log('Auto-print failed, continuing without printing:', printError);
      }
      
      // Reset form and close dialog first
      setPaymentAmount('');
      onClose();
      
      // Then refresh the data to show updated amounts
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
      <DialogContent className="max-w-xs w-full p-5 m-0 rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-100">
            <DollarSign className="w-5 h-5 text-green-500" />
            {t.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Borrower Info */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 flex flex-col items-start">
            <div className="text-xs text-gray-500">{t.borrower}</div>
            <div className="font-semibold text-base text-gray-800 dark:text-gray-100">{loan.borrowerName}</div>
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
            <div className="flex justify-between text-xs mb-1 text-gray-500">
              <span>{t.progress}</span>
              <span>{paymentProgress.toFixed(1)}%</span>
            </div>
            <Progress value={paymentProgress} className="h-2" />
          </div>

          {/* Daily Payment & Remaining */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
              <Clock className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-xs text-gray-500">{t.dailyPayment}</div>
                <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">₹{dailyPaymentAmount.toFixed(2)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
              <Calendar className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-xs text-gray-500">{t.loanPeriod}</div>
                <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">{loanDays} {t.days}</div>
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
            <Label htmlFor="paymentAmount" className="text-xs text-gray-600 dark:text-gray-300">{t.paymentAmount}</Label>
            <Input
              id="paymentAmount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder={`Max: ₹${remainingAmount.toLocaleString()}`}
              max={remainingAmount}
              className="mt-1 text-sm rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-1 focus:ring-green-400"
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
              className="flex-1 py-2 text-sm font-semibold rounded-lg border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
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
