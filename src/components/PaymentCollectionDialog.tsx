import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Calendar, CreditCard, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createPayment, updateLoanArrears } from "@/lib/database";
import jsPDF from "jspdf";
import { set } from "date-fns";

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
  status: "active" | "completed" | "overdue";
  next_payment_date?: string;
  arrears?: number;
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
  language,
}: PaymentCollectionDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: loan
      ? (loan.total_amount / loan.duration_months / 30).toFixed(2)
      : "",
    notes: "",
    arrears: "0",
  });

  const translations = {
    en: {
      title: "Collect Payment",
      amount: "Payment Amount",
      notes: "Notes (Optional)",
      collect: "Collect Payment",
      cancel: "Cancel",
      totalAmount: "Total Loan Amount",
      paidAmount: "Already Paid",
      remainingAmount: "Remaining Amount",
      paymentProgress: "Payment Progress",
      paymentCollected: "Payment collected successfully",
      amounterror: "The input value must be greater than zero",
      invalidAmount: "Payment amount cannot exceed remaining amount",
      arrears: "Arrears Amount",
      collecting: "Collecting...",
      cash: "Cash",
      bank: "Bank Transfer",
      card: "Card",
      upi: "UPI",
      other: "Other",
    },
    ta: {
      title: "பணம் வசூலிக்கவும்",
      amount: "பணம் செலுத்தும் தொகை",
      notes: "குறிப்புகள் (விருப்பமான)",
      collect: "பணம் வசூலிக்கவும்",
      cancel: "ரத்து செய்யவும்",
      totalAmount: "மொத்த கடன் தொகை",
      paidAmount: "ஏற்கனவே செலுத்தப்பட்டது",
      remainingAmount: "மீதமுள்ள தொகை",
      paymentProgress: "பணம் செலுத்தல் முன்னேற்றம்",
      paymentCollected: "பணம் வெற்றிகரமாக வசூலிக்கப்பட்டது",
      amounterror: "உள்ளீட்டு மதிப்பு பூஜ்ஜியத்தை விட அதிகமாக இருக்க வேண்டும்",
      invalidAmount:
        "பணம் செலுத்தும் தொகை மீதமுள்ள தொகையை விட அதிகமாக இருக்க முடியாது",
      arrears: "நிலுவைத் தொகை",
      collecting: "வசூலிக்கிறது...",
      cash: "பணம்",
      bank: "வங்கி பரிமாற்றம்",
      card: "அட்டை",
      upi: "UPI",
      other: "மற்றவை",
    },
  };

  const t = translations[language as keyof typeof translations];

  // Helper to calculate end date
  const calculateEndDate = (startDate: string, durationMonths: number) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + durationMonths);
    return end.toISOString().split("T")[0];
  };

  // Helper to generate and download PDF receipt
  const generateReceiptPDF = ({
    phone,
    date,
    time,
    customerName,
    loanAmount,
    dailyPayment,
    duration,
    startDate,
    endDate,
    amountPaid,
    remainingAmount,
    paymentAmount,
    closingBalance,
    broughtForward,
  }: {
    phone: string;
    date: string;
    time: string;
    customerName: string;
    loanAmount: number;
    dailyPayment: string;
    duration: number;
    startDate: string;
    endDate: string;
    amountPaid: number;
    remainingAmount: number;
    paymentAmount: number;
    closingBalance: number;
    broughtForward: number;
  }) => {
    const pageWidth = 58; // mm
    const margin = 4; // mm

    // --- Step 1: Measure content height ---
    let y = margin + 4;
    const line = (h = 5) => (y += h);
    y = margin + 4;
    line(0); // Title
    line(6); // Customer
    line(5); // Bill Date
    line(4); // Divider
    line(5); // Loan Amount
    line(5); // Daily Payment
    line(5); // Duration
    line(5); // Start Date
    line(5); // End Date
    line(5); // Total Paid
    line(5); // Total Due
    line(4); // Divider
    line(5); // Paid Today
    line(5); // Brought Forward
    line(5); // Arrears
    line(5); // Closing Balance
    line(6); // Divider
    line(5); // Thank You
    line(5); // Divider

    const contentHeight = y + margin + 2; // Add a little padding

    // --- Step 2: Create final doc with measured height and margin ---
    const doc = new jsPDF({
      unit: "mm",
      format: [pageWidth + margin * 2, contentHeight],
    });

    y = margin + 2;
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    // Adjust margin for the receipt title to match the attached image (centered, with more top margin)
    doc.text("$ INSTALLMENT RECEIPT $", (pageWidth + margin * 2) / 2, y + 2, {
      align: "center",
    });
    doc.setFont(undefined, "normal");
    y += 9;
    doc.setFontSize(8);
    doc.text(`Customer :`, margin + 2, y, { align: "left" });
    doc.text(`${customerName}`, pageWidth + margin - 2, y, { align: "right" });
    y += 5;
    doc.text(`Bill Date :`, margin + 2, y, { align: "left" });
    doc.text(`${date} ${time}`, pageWidth + margin - 2, y, { align: "right" });
    y += 5;
    // Start Date left, End Date right (below Bill Date)
    doc.text(`Loan Period :`, margin + 2, y, { align: "left" });
    doc.text(`${startDate} to ${endDate}`, pageWidth + margin - 2, y, {
      align: "right",
    });
    y += 4;
    // Change dashed line to right-aligned like other lines
    doc.text("-".repeat(pageWidth), (pageWidth + margin * 2) / 2, y, {
      align: "center",
    });
    y += 4;
    doc.text(`Loan Amount :`, margin + 2, y, { align: "left" });
    doc.text(
      `${parseFloat(loanAmount.toString()).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      pageWidth + margin - 2,
      y,
      { align: "right" }
    );
    y += 5;
    // Add Total Interest below Loan Amount
    const totalInterest = loan.total_amount - loan.principal_amount;
    doc.text(`Total Interest :`, margin + 2, y, { align: "left" });
    doc.text(
      `${totalInterest.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      pageWidth + margin - 2,
      y,
      { align: "right" }
    );
    y += 5;
    doc.text(`Daily Payment :`, margin + 2, y, { align: "left" });
    doc.text(
      `${parseFloat(dailyPayment.toString()).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      pageWidth + margin - 2,
      y,
      { align: "right" }
    );
    y += 5;
    doc.text(`Duration :`, margin + 2, y, { align: "left" });
    doc.text(`${duration} days`, pageWidth + margin - 2, y, { align: "right" });
    y += 5;
    doc.text(`Total Paid :`, margin + 2, y, { align: "left" });
    doc.text(`${amountPaid.toLocaleString()}`, pageWidth + margin - 2, y, {
      align: "right",
    });
    y += 5;
    doc.text(`Total Due :`, margin + 2, y, { align: "left" });
    doc.text(`${remainingAmount.toLocaleString()}`, pageWidth + margin - 2, y, {
      align: "right",
    });
    y += 4;
    doc.text("-".repeat(pageWidth), (pageWidth + margin * 2) / 2, y, {
      align: "center",
    });
    y += 4;
    doc.setFont(undefined, "bold");
    doc.text(`Paid Today:`, margin + 2, y, { align: "left" });
    doc.text(`${paymentAmount.toLocaleString()}`, pageWidth + margin - 2, y, {
      align: "right",
    });
    y += 5;
    doc.text(`Brought Forward :`, margin + 2, y, { align: "left" });
    doc.text(`${broughtForward.toLocaleString()}`, pageWidth + margin - 2, y, {
      align: "right",
    });
    doc.setFont(undefined, "normal");
    y += 5;
    const arrearsAmount = loan.arrears || 0;
    doc.text(`Arrears :`, margin + 2, y, { align: "left" });
    doc.text(`${arrearsAmount.toLocaleString()}`, pageWidth + margin - 2, y, { align: "right" });
    y += 5;
    doc.text(`Closing Balance :`, margin + 2, y, { align: "left" });
    doc.text(`${closingBalance.toLocaleString()}`, pageWidth + margin - 2, y, {
      align: "right",
    });
    y += 4;
    doc.text("-".repeat(pageWidth), (pageWidth + margin * 2) / 2, y, {
      align: "center",
    });
    y += 4;
    doc.setFont(undefined, "bold");
    doc.text("* THANK YOU *", (pageWidth + margin * 2) / 2, y, {
      align: "center",
    });
    doc.setFont(undefined, "normal");
    y += 4;
    doc.text("-".repeat(pageWidth), (pageWidth + margin * 2) / 2, y, {
      align: "center",
    });
    doc.save(`Receipt_${customerName}_${date}.pdf`);
  };

  const handleSubmit = async () => {
    if (!formData.amount) {
      toast({ title: t.amounterror, variant: "destructive" });
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
        payment_date: new Date().toISOString().split("T")[0],
        payment_time: new Date().toTimeString().split(" ")[0],
        notes: formData.notes,
        payment_method: "",
      });

      // Update arrears if specified
      const arrearsAmount = parseFloat(formData.arrears) || 0;
      if (arrearsAmount > 0) {
        await updateLoanArrears(loan!.id, arrearsAmount);
      }

      toast({ title: t.paymentCollected });

      // --- PDF Receipt Generation ---
      if (loan) {
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        let timeStr = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        timeStr = timeStr.replace(/(am|pm)/i, (match) => match.toUpperCase());
        const durationDays = loan.duration_months * 30;
        const endDate = calculateEndDate(loan.start_date, loan.duration_months);
        const amountPaid = loan.amount_paid + paymentAmount;
        const closingBalance = loan.total_amount - amountPaid;
        const broughtForward = loan.amount_paid;
        // Find borrower phone if available
        let phone = "";
        if (
          loan.borrower_id &&
          window &&
          (window as any).easyCollectBorrowers
        ) {
          const found = (window as any).easyCollectBorrowers.find(
            (b: any) => b.id === loan.borrower_id
          );
          if (found) phone = found.phone;
        }
        generateReceiptPDF({
          phone: phone || "-",
          date: dateStr,
          time: timeStr,
          customerName: loan.borrowerName || "",
          loanAmount: loan.principal_amount,
          dailyPayment: (loan.total_amount / durationDays).toFixed(2),
          duration: durationDays,
          startDate: loan.start_date,
          endDate,
          amountPaid,
          remainingAmount: loan.total_amount - amountPaid,
          paymentAmount,
          closingBalance,
          broughtForward,
        });
      }
      // --- End PDF Receipt Generation ---

      onPaymentCollect();
      onClose();
      setFormData({ amount: "", notes: "", arrears: "0" });
    } catch (error) {
      console.error("Error collecting payment:", error);
      toast({
        title: "Error",
        description: "Failed to collect payment. Please try again.",
        variant: "destructive",
        duration: 3000,
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
  const simulatedProgress = Math.min(
    100,
    Math.round((simulatedPaid / loan.total_amount) * 100)
  );

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
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t.totalAmount}
              </span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                ₹{loan.total_amount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t.paidAmount}
              </span>
              <span className="font-bold text-green-600 dark:text-green-400">
                ₹{loan.amount_paid.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t.remainingAmount}
              </span>
              <span className="font-bold text-red-600 dark:text-red-400">
                ₹{remainingAmount.toLocaleString()}
              </span>
            </div>

            {loan.arrears && loan.arrears > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Current Arrears
                </span>
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  ₹{loan.arrears.toLocaleString()}
                </span>
              </div>
            )}

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
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Daily Payment Amount
                </span>
                <p className="font-bold text-gray-800 dark:text-gray-200">
                  ₹{(loan.total_amount / loan.duration_months / 30).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Loan Period
                </span>
                <p className="font-bold text-gray-800 dark:text-gray-200">
                  {loan.duration_months * 30} days
                </p>
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
                placeholder={(
                  loan.total_amount /
                  loan.duration_months /
                  30
                ).toFixed(2)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
              {formData.amount === "0" && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {t.amounterror}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="arrears" className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4" />
                {t.arrears}
              </Label>
              <Input
                id="arrears"
                type="number"
                step="1"
                value={formData.arrears}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, arrears: value });
                }}
                placeholder="0"
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
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
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
