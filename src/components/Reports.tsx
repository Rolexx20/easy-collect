import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, DollarSign, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getPayments } from "@/lib/database";

interface ReportsProps {
  language: string;
  borrowers: any[];
  loans: any[];
}

const Reports = ({ language, borrowers, loans }: ReportsProps) => {
  const [selectedReportType, setSelectedReportType] =
    useState("dailyCollection"); // Default to dailyCollection
  const [selectedFileType, setSelectedFileType] = useState("pdf");
  const [filterText, setFilterText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [payments, setPayments] = useState<any[]>([]);
  const [loanStatusFilter, setLoanStatusFilter] = useState("all"); // For collection report
  const [showTodayOnly, setShowTodayOnly] = useState("all"); // "all" | "today" | "week" | "month"

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const translations = {
    en: {
      title: "Reports",
      exportBtn: "Export",
      collectionReport: "Loan Report",
      overdueReport: "Overdue Loans",
      borrowerReport: "Borrower Details",
      dailyCollectionReport: "Daily Collection",
      date: "Date",
      borrowerName: "Borrower Name",
      loanAmount: "Loan Amount",
      paymentAmount: "Paid Amount",
      status: "Status",

      paymentDate: "Payment Date",
      paymentTime: "Payment Time",
      paymentMethod: "Payment Method",
      notes: "Notes",
      remainingLoanAmount: "Remaining Amount",
      totalLoanAmount: "Loan Amount",
      noPaymentData: "No payment data available",
      noOverdueLoans: "No overdue loans found",
      noBorrowerData: "No borrower data available",
      noDailyCollectionData: "No daily collection data available",
      exportSuccess: "Report exported successfully",
      noData: "No data available for export",
      filterPlaceholder: "Filter by name or phone...",
      createdDate: "Created Date",
    },
    ta: {
      title: "அறிக்கைகள்",
      exportBtn: "ஏற்றுமதி",
      collectionReport: "கடன் அறிக்கை",
      overdueReport: "தாமத அறிக்கை",
      borrowerReport: "கடன் வாங்குபவர் அறிக்கை",
      dailyCollectionReport: "தினசரி வசூல் அறிக்கை",
      date: "தேதி",
      borrowerName: "கடன் வாங்குபவர் பெயர்",
      loanAmount: "கடன் தொகை",
      paymentAmount: "பணம் செலுத்தல் தொகை",
      status: "நிலை",
      remainingAmount: "மீதமுள்ள தொகை",
      paymentDate: "பணம் செலுத்திய தேதி",
      paymentTime: "பணம் செலுத்திய நேரம்",
      paymentMethod: "பணம் செலுத்தும் முறை",
      notes: "குறிப்புகள்",
      remainingLoanAmount: "மீதமுள்ள கடன் தொகை",
      totalLoanAmount: "மொத்த கடன் தொகை",
      noPaymentData: "பணம் செலுத்தல் தரவு இல்லை",
      noOverdueLoans: "தாமதமான கடன்கள் இல்லை",
      noBorrowerData: "கடன் வாங்குபவர் தரவு இல்லை",
      noDailyCollectionData: "தினசரி வசூல் தரவு இல்லை",
      exportSuccess: "அறிக்கை வெற்றிகரமாக ஏற்றுமதி செய்யப்பட்டது",
      noData: "ஏற்றுமதிக்கு தரவு இல்லை",
      filterPlaceholder: "பெயர் அல்லது தொலைபேசி மூலம் வடிகட்டி...",
      createdDate: "உருவாக்கப்பட்ட தேதி",
    },
  };

  const t = translations[language as keyof typeof translations];

  // Calculate actual totals from real data
  const totalCollected = loans.reduce(
    (sum, loan) => sum + (loan.amount_paid || 0),
    0
  );
  const totalLoanAmount = loans.reduce(
    (sum, loan) => sum + (loan.total_amount || 0),
    0
  );
  const pendingAmount = totalLoanAmount - totalCollected;

  // --- Arrears Calculation Helpers ---
  const calculateArrears = (loan: any) => {
    if (!loan.start_date || !loan.duration_months || !loan.total_amount) return 0;
    const today = new Date();
    const startDate = new Date(loan.start_date);
    const daysSinceStart = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dailyPayment = loan.total_amount / (loan.duration_months * 30);
    const expectedPayment = Math.min(
      dailyPayment * daysSinceStart,
      loan.total_amount
    );
    return Math.max(0, Math.round(expectedPayment - (loan.amount_paid || 0)));
  };

  const calculateMissedDays = (loan: any) => {
    if (!loan.duration_months || !loan.total_amount) return 0;
    const dailyPayment = loan.total_amount / (loan.duration_months * 30);
    const arrears = calculateArrears(loan);
    return arrears <= 0 ? 0 : Math.max(1, Math.floor(arrears / dailyPayment));
  };

  const getLastMissedDate = (loan: any) => {
    if (!loan.start_date || !loan.duration_months || !loan.total_amount) return "";
    const dailyPayment = loan.total_amount / (loan.duration_months * 30);
    const missedDays = calculateMissedDays(loan);
    const startDate = new Date(loan.start_date);
    const paidDays = Math.floor((loan.amount_paid || 0) / dailyPayment);
    const lastMissed = new Date(startDate);
    lastMissed.setDate(startDate.getDate() + paidDays + missedDays - 1);
    return isNaN(lastMissed.getTime())
      ? ""
      : lastMissed.toLocaleDateString();
  };

  const reportTypes = [
    { id: "dailyCollection", label: t.dailyCollectionReport },
    { id: "overdue", label: t.overdueReport },
    { id: "collection", label: t.collectionReport },
    { id: "borrower", label: t.borrowerReport },
    { id: "arrears", label: "Arrears & Overdue" }, // <-- Added
    // Removed "reversedPayments" from selection
  ];

  const fileTypes = [
    { id: "pdf", label: "PDF" },
    { id: "csv", label: "CSV" },
  ];

  // Load payments data when daily collection report is selected
  const loadPayments = async () => {
    try {
      const paymentsData = await getPayments();
      // Group payments by loan_id and sort by payment_date ascending
      const paymentsByLoan: { [loanId: string]: any[] } = {};
      paymentsData.forEach((payment) => {
        if (!paymentsByLoan[payment.loan_id])
          paymentsByLoan[payment.loan_id] = [];
        paymentsByLoan[payment.loan_id].push(payment);
      });
      Object.values(paymentsByLoan).forEach((arr) =>
        arr.sort(
          (a, b) =>
            new Date(a.payment_date).getTime() -
            new Date(b.payment_date).getTime()
        )
      );
      // Flatten payments, calculate remainingLoanAmount after each payment
      const paymentsWithLoanDetails: any[] = [];
      Object.entries(paymentsByLoan).forEach(([loanId, paymentsArr]) => {
        const loan = loans.find((l) => l.id === loanId);
        let remaining = loan?.total_amount || 0;
        paymentsArr.forEach((payment, idx) => {
          // For the first payment, remaining = total - payment.amount
          // For others, remaining = previous remaining - payment.amount
          let beforePayment = remaining;
          if (idx === 0) {
            beforePayment = loan?.total_amount || 0;
            remaining = beforePayment - (payment.amount || 0);
          } else {
            beforePayment = remaining;
            remaining = beforePayment - (payment.amount || 0);
          }
          paymentsWithLoanDetails.push({
            ...payment,
            borrowerName: loan?.borrowerName || "N/A",
            totalLoanAmount: loan?.total_amount || 0,
            remainingLoanAmount: beforePayment,
            displayAmount: payment.is_reversed
              ? -Math.abs(payment.amount)
              : payment.amount,
          });
        });
      });
      // Sort all payments by payment_date and payment_time descending (latest first)
      paymentsWithLoanDetails.sort((a, b) => {
        const dateTimeA = new Date(
          `${a.payment_date}T${a.payment_time || "00:00:00"}`
        ).getTime();
        const dateTimeB = new Date(
          `${b.payment_date}T${b.payment_time || "00:00:00"}`
        ).getTime();
        return dateTimeB - dateTimeA; // latest first
      });
      setPayments(paymentsWithLoanDetails);
    } catch (error) {
      console.error("Error loading payments:", error);
      setPayments([]);
    }
  };

  // Load payments when daily collection report is selected
  useEffect(() => {
    if (selectedReportType === "dailyCollection") {
      loadPayments();
    }
  }, [selectedReportType]);

  // Reset page when report type or filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedReportType, filterText, fromDate, toDate]);

  // Filter logic for export and table
  const getReportData = () => {
    let data: any[] = [];
    switch (selectedReportType) {
      case "collection":
        data = loans;
        if (loanStatusFilter !== "all") {
          const filterStatus =
            loanStatusFilter === "closed" ? "completed" : loanStatusFilter;
          if (filterStatus === "overdue") {
            data = data.filter((loan) => {
              const startDate = loan.start_date
                ? new Date(loan.start_date)
                : null;
              const durationMonths = loan.duration_months || loan.duration || 0;
              let endDate = startDate ? new Date(startDate) : null;
              if (endDate && durationMonths) {
                endDate.setMonth(endDate.getMonth() + durationMonths);
              }
              const today = new Date();
              // Don't treat completed loans as overdue
              const status = (loan.status || "").toLowerCase();
              return endDate && endDate < today && status !== "completed";
            });
          } else {
            data = data.filter(
              (loan) => (loan.status || "active").toLowerCase() === filterStatus
            );
          }
        }
        break;
      case "overdue":
        // Overdue: start_date + duration < today OR explicit status is "overdue"
        // but never include loans that are already completed
        data = loans.filter((loan) => {
          const startDate = loan.start_date ? new Date(loan.start_date) : null;
          const durationMonths = loan.duration_months || loan.duration || 0;
          let dueDate = startDate ? new Date(startDate) : null;
          if (dueDate && durationMonths) {
            dueDate.setMonth(dueDate.getMonth() + durationMonths);
          }
          const today = new Date();
          const status = (loan.status || "").toLowerCase();
          return (
            status === "overdue" ||
            ((dueDate && dueDate < today) && status !== "completed")
          );
        });
        break;
      case "borrower":
        data = borrowers;
        break;
      case "dailyCollection":
        data = payments;
        // Date range filter for Today/Week/Month
        if (showTodayOnly === "today") {
          const todayStr = new Date().toISOString().split("T")[0];
          data = data.filter((p) => p.payment_date === todayStr);
        } else if (showTodayOnly === "week") {
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          data = data.filter((p) => {
            const d = new Date(p.payment_date);
            return d >= startOfWeek && d <= endOfWeek;
          });
        } else if (showTodayOnly === "month") {
          const now = new Date();
          const month = now.getMonth();
          const year = now.getFullYear();
          data = data.filter((p) => {
            const d = new Date(p.payment_date);
            return d.getMonth() === month && d.getFullYear() === year;
          });
        }
        break;
      case "arrears":
        data = loans.filter((l) => calculateArrears(l) > 0);
        break;
      // Removed "reversedPayments" cases
      default:
        data = [];
    }

    // Date range filter for collection/overdue/dailyCollection/arrears/reversedPayments
    if (
      (selectedReportType === "collection" ||
        selectedReportType === "overdue" ||
        selectedReportType === "dailyCollection" ||
        selectedReportType === "arrears" ||
        selectedReportType === "reversedPayments") &&
      (fromDate || toDate)
    ) {
      data = data.filter((item) => {
        const date =
          selectedReportType === "dailyCollection" ||
          selectedReportType === "reversedPayments"
            ? new Date(item.payment_date)
            : new Date(item.start_date);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        return (!from || date >= from) && (!to || date <= to);
      });
    }

    // Text filter
    if (filterText.trim()) {
      const lower = filterText.trim().toLowerCase();
      if (selectedReportType === "borrower") {
        data = data.filter(
          (b) =>
            (b.name && b.name.toLowerCase().includes(lower)) ||
            (b.phone && b.phone.toLowerCase().includes(lower))
        );
      } else {
        data = data.filter(
          (l) =>
            (l.borrowerName && l.borrowerName.toLowerCase().includes(lower)) ||
            (l.phone && l.phone.toLowerCase().includes(lower))
        );
      }
    }
    return data;
  };

  // Utility to format time as HH:MM:SS AM/PM (AM/PM in uppercase)
  const formatTime12Hour = (timeStr?: string) => {
    if (!timeStr) return "";
    const [h, m, s] = timeStr.split(":");
    if (h !== undefined && m !== undefined) {
      const date = new Date();
      date.setHours(Number(h), Number(m), Number(s || 0));
      // toLocaleTimeString returns AM/PM in uppercase in most browsers, but force it just in case
      return date
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
        .replace("am", "AM")
        .replace("pm", "PM");
    }
    return timeStr;
  };

  const exportToCSV = (data: any[], filename: string) => {
    let csvContent = "";
    if (selectedReportType === "collection") {
      csvContent =
        "No,Start Date,End Date,Borrower Name,Status,Loan Amount,Remaining Amount,Collected Amount\n";
      data.forEach((loan, index) => {
        const startDate = loan.start_date ? new Date(loan.start_date) : null;
        const durationMonths = loan.duration_months || loan.duration || 0;
        let loanEndDate = startDate ? new Date(startDate) : null;
        if (loanEndDate && durationMonths) {
          loanEndDate.setMonth(loanEndDate.getMonth() + durationMonths);
        }
        const today = new Date();
        const status = (loan.status || "").toLowerCase();
        const isOverdue = loanEndDate && loanEndDate < today && status !== "completed";
        csvContent += `${index + 1},${loan.start_date},${
          loanEndDate ? loanEndDate.toISOString().split("T")[0] : ""
        },${formatReportBorrowerName(loan.borrowerName || "N/A")},${
          isOverdue ? "Overdue" : loan.status || "Active"
        },${loan.total_amount},${loan.total_amount - loan.amount_paid},${
          loan.amount_paid
        }\n`;
      });
    } else if (selectedReportType === "borrower") {
      csvContent =
        "No,Start Date,End Date,Name,Phone,NIC Number,Address,Total Loans,Total Amount\n";
      data.forEach((borrower, index) => {
        const borrowerLoans = loans.filter(
          (l) => l.borrower_id === borrower.id
        );
        const firstLoan = borrowerLoans[0];
        const startDateB = firstLoan?.start_date || "";
        let loanEndDateB = "";
        if (firstLoan) {
          const sd = firstLoan.start_date
            ? new Date(firstLoan.start_date)
            : null;
          const dm = firstLoan.duration_months || firstLoan.duration || 0;
          if (sd && dm) {
            sd.setMonth(sd.getMonth() + dm);
            loanEndDateB = sd.toISOString().split("T")[0];
          }
        }
        csvContent += `${index + 1},${startDateB},${loanEndDateB},${
          borrower.name
        },${borrower.phone},${borrower.nic || borrower.nic_number || ""},${
          borrower.address
        },${borrowerLoans.length},${borrower.total_amount || 0}\n`;
      });
    } else if (selectedReportType === "overdue") {
      csvContent =
        "No,Start Date,End Date,Borrower Name,Loan Amount,Paid Amount,Remaining Amount\n";
      data.forEach((loan, index) => {
        const startDateO = loan.start_date || "";
        let loanEndDateO = "";
        const sdO = loan.start_date ? new Date(loan.start_date) : null;
        const dmO = loan.duration_months || loan.duration || 0;
        if (sdO && dmO) {
          sdO.setMonth(sdO.getMonth() + dmO);
          loanEndDateO = sdO.toISOString().split("T")[0];
        }
        csvContent += `${
          index + 1
        },${startDateO},${loanEndDateO},${formatReportBorrowerName(
          loan.borrowerName || "N/A"
        )},${loan.total_amount},${loan.amount_paid},${
          loan.total_amount - loan.amount_paid
        }\n`;
      });
    } else if (selectedReportType === "dailyCollection") {
      csvContent =
        "No,Payment Date,Payment Time,Borrower Name,Payment Method,Total Loan Amount,Remaining Loan Amount,Payment Amount\n";
      data.forEach((payment, index) => {
        csvContent += `${index + 1},${payment.payment_date},${formatTime12Hour(
          payment.payment_time
        )},${formatReportBorrowerName(payment.borrowerName || "N/A")},${
          payment.payment_method || "cash"
        },${payment.totalLoanAmount || 0},${payment.remainingLoanAmount || 0},${
          payment.displayAmount || payment.amount
        }\n`;
      });
    } else if (selectedReportType === "arrears") {
      csvContent =
        "No,Borrower Name,Loan Amount,Paid Amount,Arrears Amount,Missing Days,Last Missed Date\n";
      data.forEach((loan, index) => {
        csvContent += `${index + 1},${formatReportBorrowerName(loan.borrowerName || "N/A")},${loan.total_amount},${loan.amount_paid},${calculateArrears(loan)},${calculateMissedDays(loan)},${getLastMissedDate(loan)}\n`;
      });
    }
    // Add totals row at the end
    if (data.length > 0) {
      switch (selectedReportType) {
        case "collection": {
          const totalLoan = data.reduce((sum, l) => sum + (l.total_amount || 0), 0);
          const totalPaid = data.reduce((sum, l) => sum + (l.amount_paid || 0), 0);
          const totalRemain = data.reduce((sum, l) => sum + ((l.total_amount || 0) - (l.amount_paid || 0)), 0);
          csvContent += `,,,,,${totalLoan},${totalRemain},${totalPaid}\n`;
          break;
        }
        case "borrower": {
          const totalLoans = data.reduce((sum, b) => sum + (loans.filter(l => l.borrower_id === b.id).length), 0);
          const totalAmount = data.reduce((sum, b) => sum + (b.total_amount || 0), 0);
          csvContent += `,,,,,,,${totalLoans},${totalAmount}\n`;
          break;
        }
        case "overdue": {
          const totalLoan = data.reduce((sum, l) => sum + (l.total_amount || 0), 0);
          const totalPaid = data.reduce((sum, l) => sum + (l.amount_paid || 0), 0);
          const totalRemain = data.reduce((sum, l) => sum + ((l.total_amount || 0) - (l.amount_paid || 0)), 0);
          csvContent += `,,,,${totalLoan},${totalPaid},${totalRemain}\n`;
          break;
        }
        case "dailyCollection": {
          const totalLoan = data.reduce((sum, p) => sum + (p.totalLoanAmount || 0), 0);
          const totalRemain = data.reduce((sum, p) => sum + (p.remainingLoanAmount || 0), 0);
          const totalPaid = data.reduce((sum, p) => sum + (p.displayAmount !== undefined ? p.displayAmount : p.amount || 0), 0);
          csvContent += `,,,,,${totalLoan},${totalRemain},${totalPaid}\n`;
          break;
        }
        case "arrears": {
          const totalLoan = data.reduce((sum, l) => sum + (l.total_amount || 0), 0);
          const totalPaid = data.reduce((sum, l) => sum + (l.amount_paid || 0), 0);
          const totalArrears = data.reduce((sum, l) => sum + calculateArrears(l), 0);
          const totalMissed = data.reduce((sum, l) => sum + calculateMissedDays(l), 0);
          csvContent += `,,${totalLoan},${totalPaid},${totalArrears},${totalMissed},\n`;
          break;
        }
        default:
          break;
      }
    }
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (data: any[], filename: string) => {
    const doc = new jsPDF({
      orientation: "landscape", // Better for wide tables
      unit: "pt",
      format: "a4",
    });
    let head: string[] = [];
    let body: any[][] = [];
    let title = "";

    if (selectedReportType === "collection") {
      head = [
        "No",
        "Start Date",
        "End Date",
        "Borrower Name",
        "Status",
        "Loan Amount",
        "Remaining Amount",
        "Collected Amount",
      ];
      body = data.map((loan, index) => {
        const startDate = loan.start_date ? new Date(loan.start_date) : null;
        const durationMonths = loan.duration_months || loan.duration || 0;
        let loanEndDate = startDate ? new Date(startDate) : null;
        if (loanEndDate && durationMonths) {
          loanEndDate.setMonth(loanEndDate.getMonth() + durationMonths);
        }
        const today = new Date();
        const status = (loan.status || "").toLowerCase();
        const isOverdue = loanEndDate && loanEndDate < today && status !== "completed";
        return [
          index + 1,
          loan.start_date,
          loanEndDate ? loanEndDate.toISOString().split("T")[0] : "",
          formatReportBorrowerName(loan.borrowerName || "N/A"),
          isOverdue ? "Overdue" : loan.status || "Active",
          loan.total_amount,
          loan.total_amount - loan.amount_paid,
          loan.amount_paid,
        ];
      });
      title = t.collectionReport;
    } else if (selectedReportType === "borrower") {
      head = [
        "No",
        "Start Date",
        "End Date",
        "Name",
        "Phone",
        "NIC Number",
        "Address",
        "Total Loans",
        "Total Amount",
      ];
      body = data.map((borrower, index) => {
        const borrowerLoans = loans.filter(
          (l) => l.borrower_id === borrower.id
        );
        const firstLoan = borrowerLoans[0];
        const startDateB = firstLoan?.start_date || "";
        let loanEndDateB = "";
        if (firstLoan) {
          const sd = firstLoan.start_date
            ? new Date(firstLoan.start_date)
            : null;
          const dm = firstLoan.duration_months || firstLoan.duration || 0;
          if (sd && dm) {
            sd.setMonth(sd.getMonth() + dm);
            loanEndDateB = sd.toISOString().split("T")[0];
          }
        }
        return [
          index + 1,
          startDateB,
          loanEndDateB,
          borrower.name,
          borrower.phone,
          borrower.nic || borrower.nic_number || "",
          borrower.address,
          borrowerLoans.length,
          borrower.total_amount || 0,
        ];
      });
      title = t.borrowerReport;
    } else if (selectedReportType === "overdue") {
      head = [
        "No",
        "Start Date",
        "End Date",
        "Borrower Name",
        "Loan Amount",
        "Paid Amount",
        "Remaining Amount",
      ];
      body = data.map((loan, index) => {
        const startDateO = loan.start_date || "";
        let loanEndDateO = "";
        const sdO = loan.start_date ? new Date(loan.start_date) : null;
        const dmO = loan.duration_months || loan.duration || 0;
        if (sdO && dmO) {
          sdO.setMonth(sdO.getMonth() + dmO);
          loanEndDateO = sdO.toISOString().split("T")[0];
        }
        return [
          index + 1,
          startDateO,
          loanEndDateO,
          formatReportBorrowerName(loan.borrowerName || "N/A"),
          loan.total_amount,
          loan.amount_paid,
          loan.total_amount - loan.amount_paid,
        ];
      });
      title = t.overdueReport;
    } else if (selectedReportType === "dailyCollection") {
      head = [
        "No",
        "Payment Date",
        "Payment Time",
        "Borrower Name",
        "Payment Method",
        "Total Loan Amount",
        "Remaining Loan Amount",
        "Payment Amount",
      ]; // Added Payment Time column
      body = data.map((payment, index) => [
        index + 1,
        payment.payment_date,
        formatTime12Hour(payment.payment_time),
        formatReportBorrowerName(payment.borrowerName || "N/A"),
        payment.payment_method || "cash",
        payment.totalLoanAmount || 0,
        payment.remainingLoanAmount || 0,
        payment.displayAmount || payment.amount,
      ]);
      title = t.dailyCollectionReport;
    } else if (selectedReportType === "arrears") {
      head = [
        "No",
        "Borrower Name",
        "Loan Amount",
        "Paid Amount",
        "Arrears Amount",
        "Missing Days",
        "Last Missed Date",
      ];
      body = data.map((loan, index) => [
        index + 1,
        formatReportBorrowerName(loan.borrowerName || "N/A"),
        loan.total_amount,
        loan.amount_paid,
        calculateArrears(loan),
        calculateMissedDays(loan),
        getLastMissedDate(loan),
      ]);
      title = "Arrears Report";
    }

    // Add totals row to body BEFORE calling autoTable
    if (data.length > 0) {
      switch (selectedReportType) {
        case "collection": {
          const totalLoan = data.reduce((sum, l) => sum + (l.total_amount || 0), 0);
          const totalPaid = data.reduce((sum, l) => sum + (l.amount_paid || 0), 0);
          const totalRemain = data.reduce((sum, l) => sum + ((l.total_amount || 0) - (l.amount_paid || 0)), 0);
          // head length = 8 -> keep "Total" aligned in 5th column (Status)
          body.push(["", "", "", "", "Total", totalLoan, totalRemain, totalPaid]);
          break;
        }
        case "borrower": {
          const totalLoans = data.reduce((sum, b) => sum + (loans.filter(l => l.borrower_id === b.id).length), 0);
          const totalAmount = data.reduce((sum, b) => sum + (b.total_amount || 0), 0);
          // head length = 9 -> place totals in last two columns
          body.push(["", "", "", "", "", "", "", totalLoans, totalAmount]);
          break;
        }
        case "overdue": {
          const totalLoan = data.reduce((sum, l) => sum + (l.total_amount || 0), 0);
          const totalPaid = data.reduce((sum, l) => sum + (l.amount_paid || 0), 0);
          const totalRemain = data.reduce((sum, l) => sum + ((l.total_amount || 0) - (l.amount_paid || 0)), 0);
          // head length = 7 -> totals in columns 5,6,7
          body.push(["", "", "", "", totalLoan, totalPaid, totalRemain]);
          break;
        }
        case "dailyCollection": {
          const totalLoan = data.reduce((sum, p) => sum + (p.totalLoanAmount || 0), 0);
          const totalRemain = data.reduce((sum, p) => sum + (p.remainingLoanAmount || 0), 0);
          const totalPaid = data.reduce((sum, p) => sum + (p.displayAmount !== undefined ? p.displayAmount : p.amount || 0), 0);
          // head length = 8 -> place "Total" in 5th column and totals in 6,7,8
          body.push(["", "", "", "", "Total", totalLoan, totalRemain, totalPaid]);
          break;
        }
        case "arrears": {
          const totalLoan = data.reduce((sum, l) => sum + (l.total_amount || 0), 0);
          const totalPaid = data.reduce((sum, l) => sum + (l.amount_paid || 0), 0);
          const totalArrears = data.reduce((sum, l) => sum + calculateArrears(l), 0);
          const totalMissed = data.reduce((sum, l) => sum + calculateMissedDays(l), 0);
          // head length = 7 -> totals in columns 2..6 (we place label in col 2)
          body.push(["", "Total", totalLoan, totalPaid, totalArrears, totalMissed, ""]);
          break;
        }
        default:
          break;
      }
    }

    doc.text(title, 14, 16);
    autoTable(doc, {
      head: [head],
      body: body,
      startY: 22,
      styles: { fontSize: 9 },
      // optional: style last row (totals) slightly bolder — leave to PDF renderer defaults
    });
    doc.save(filename);
  };

  const handleExport = () => {
    const data = getReportData();
    if (data.length === 0) {
      toast({ title: t.noData, variant: "destructive", duration: 3000 }); // Close after 3 seconds
      return;
    }
    const reportName =
      reportTypes.find((rt) => rt.id === selectedReportType)?.label || "report";
    const timestamp = new Date().toISOString().split("T")[0];
    const dateRange = fromDate && toDate ? `${fromDate}_${toDate}` : timestamp;
    const filename = `${reportName}_${dateRange}.${selectedFileType}`;
    if (selectedFileType === "csv") {
      exportToCSV(data, filename);
      toast({
        title: `${reportName} exported as CSV successfully`,
        duration: 3000,
      }); // Close after 3 seconds
    } else if (selectedFileType === "pdf") {
      exportToPDF(data, filename);
      toast({
        title: `${reportName} exported as PDF successfully`,
        duration: 3000,
      }); // Close after 3 seconds
    }
  };

  const renderTableHeaders = () => {
    switch (selectedReportType) {
      case "collection":
        return (
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>{t.borrowerName}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>{t.loanAmount}</TableHead>
            <TableHead>Remaining Amount</TableHead>
            <TableHead>Collected Amount</TableHead>
          </TableRow>
        );
      case "borrower":
        return (
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>NIC Number</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Total Loans</TableHead>
            <TableHead>Total Amount</TableHead>
          </TableRow>
        );
      case "overdue":
        return (
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>{t.borrowerName}</TableHead>
            <TableHead>{t.loanAmount}</TableHead>
            <TableHead>{t.paymentAmount}</TableHead>
            <TableHead>Remaining Amount</TableHead>
          </TableRow>
        );
      case "dailyCollection":
        return (
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>{t.paymentDate}</TableHead>
            <TableHead>{t.paymentTime}</TableHead>
            <TableHead>{t.borrowerName}</TableHead>
            <TableHead>{t.paymentMethod}</TableHead>
            <TableHead>{t.totalLoanAmount}</TableHead>
            <TableHead>{t.remainingLoanAmount}</TableHead>
            <TableHead>{t.paymentAmount}</TableHead>
          </TableRow>
        );
      case "arrears":
        return (
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>{t.borrowerName}</TableHead>
            <TableHead>{t.loanAmount}</TableHead>
            <TableHead>{t.paymentAmount}</TableHead>
            <TableHead>Arrears Amount</TableHead>
            <TableHead>Missed Days</TableHead>
            <TableHead>Last Missed Date</TableHead>
          </TableRow>
        );
      default:
        return null;
    }
  };

  // Utility function to format borrower name for reports (except borrower details)
  const formatReportBorrowerName = (name: string) => {
    if (!name) return "N/A";
    const parts = name.trim().split(" ");
    if (parts.length === 3) {
      const first = parts[0];
      const second = parts[1].charAt(0).toUpperCase() + ".";
      const third = parts[2];
      return `${first} ${second} ${third}`;
    }
    return name;
  };

  // Utility for full name in borrower report
  const getBorrowerFullName = (borrower: any) => {
    return [borrower.title, borrower.first_name, borrower.last_name]
      .filter(Boolean)
      .join(" ");
  };

  const renderTableRows = () => {
    const data = getReportData();
    if (data.length === 0) {
      const noDataMessage =
        selectedReportType === "overdue"
          ? t.noOverdueLoans
          : selectedReportType === "borrower"
          ? t.noBorrowerData
          : selectedReportType === "dailyCollection"
          ? t.noDailyCollectionData
          : selectedReportType === "arrears"
          ? "No arrears found"
          : t.noPaymentData;
      return (
        <TableRow>
          <TableCell
            colSpan={
              selectedReportType === "arrears"
                ? 7
                : selectedReportType === "borrower"
                ? 8 // updated for new columns
                : selectedReportType === "collection"
                ? 8 // updated for new column
                : selectedReportType === "dailyCollection"
                ? 7
                : 6
            }
            className="text-center text-gray-500 dark:text-gray-400 py-8"
          >
            {noDataMessage}
          </TableCell>
        </TableRow>
      );
    }
    const startIdx = (page - 1) * rowsPerPage;
    const paginatedData = data.slice(startIdx, startIdx + rowsPerPage);

    // --- Totals Calculation ---
    let totalsRow: JSX.Element | null = null;
    if (data.length > 0) {
      switch (selectedReportType) {
        case "collection": {
          const totalLoan = data.reduce((sum, l) => sum + (l.total_amount || 0), 0);
          const totalPaid = data.reduce((sum, l) => sum + (l.amount_paid || 0), 0);
          const totalRemain = data.reduce((sum, l) => sum + ((l.total_amount || 0) - (l.amount_paid || 0)), 0);
          totalsRow = (
            <TableRow className="bg-yellow-100 dark:bg-yellow-900/40">
              <TableCell colSpan={5} className="font-bold text-right">Total</TableCell>
              <TableCell className="font-bold text-purple-700 dark:text-purple-400">₹ {totalLoan.toLocaleString()}</TableCell>
              <TableCell className="font-bold text-red-600 dark:text-red-400">₹ {totalRemain.toLocaleString()}</TableCell>
              <TableCell className="font-bold text-green-700 dark:text-green-400">₹ {totalPaid.toLocaleString()}</TableCell>
            </TableRow>
          );
          break;
        }
        case "borrower": {
          const totalLoans = data.reduce((sum, b) => sum + (loans.filter(l => l.borrower_id === b.id).length), 0);
          const totalAmount = data.reduce((sum, b) => sum + (b.total_amount || 0), 0);
          totalsRow = (
            <TableRow className="bg-yellow-100 dark:bg-yellow-900/40">
              <TableCell colSpan={7} className="font-bold text-right">Total</TableCell>
              <TableCell className="font-bold">{totalLoans}</TableCell>
              <TableCell className="font-bold text-purple-700 dark:text-purple-400">₹ {totalAmount.toLocaleString()}</TableCell>
            </TableRow>
          );
          break;
        }
        case "overdue": {
          const totalLoan = data.reduce((sum, l) => sum + (l.total_amount || 0), 0);
          const totalPaid = data.reduce((sum, l) => sum + (l.amount_paid || 0), 0);
          const totalRemain = data.reduce((sum, l) => sum + ((l.total_amount || 0) - (l.amount_paid || 0)), 0);
          totalsRow = (
            <TableRow className="bg-yellow-100 dark:bg-yellow-900/40">
              <TableCell colSpan={4} className="font-bold text-right">Total</TableCell>
              <TableCell className="font-bold text-purple-700 dark:text-purple-400">₹ {totalLoan.toLocaleString()}</TableCell>
              <TableCell className="font-bold text-green-700 dark:text-green-400">₹ {totalPaid.toLocaleString()}</TableCell>
              <TableCell className="font-bold text-red-600 dark:text-red-400">₹ {totalRemain.toLocaleString()}</TableCell>
            </TableRow>
          );
          break;
        }
        case "dailyCollection": {
          const totalLoan = data.reduce((sum, p) => sum + (p.totalLoanAmount || 0), 0);
          const totalRemain = data.reduce((sum, p) => sum + (p.remainingLoanAmount || 0), 0);
          const totalPaid = data.reduce((sum, p) => sum + (p.displayAmount !== undefined ? p.displayAmount : p.amount || 0), 0);
          totalsRow = (
            <TableRow className="bg-yellow-100 dark:bg-yellow-900/40">
              <TableCell colSpan={5} className="font-bold text-right">Total</TableCell>
              <TableCell className="font-bold text-purple-700 dark:text-purple-400">₹ {totalLoan.toLocaleString()}</TableCell>
              <TableCell className="font-bold text-red-600 dark:text-red-400">₹ {totalRemain.toLocaleString()}</TableCell>
              <TableCell className="font-bold text-green-700 dark:text-green-400">₹ {totalPaid.toLocaleString()}</TableCell>
            </TableRow>
          );
          break;
        }
        case "arrears": {
          const totalLoan = data.reduce((sum, l) => sum + (l.total_amount || 0), 0);
          const totalPaid = data.reduce((sum, l) => sum + (l.amount_paid || 0), 0);
          const totalArrears = data.reduce((sum, l) => sum + calculateArrears(l), 0);
          const totalMissed = data.reduce((sum, l) => sum + calculateMissedDays(l), 0);
          totalsRow = (
            <TableRow className="bg-yellow-100 dark:bg-yellow-900/40">
              <TableCell colSpan={2} className="font-bold text-right">Total</TableCell>
              <TableCell className="font-bold text-green-700 dark:text-green-400">₹ {totalLoan.toLocaleString()}</TableCell>
              <TableCell className="font-bold text-orange-600 dark:text-orange-400">₹ {totalPaid.toLocaleString()}</TableCell>
              <TableCell className="font-bold text-red-600 dark:text-red-400">₹ {totalArrears.toLocaleString()}</TableCell>
              <TableCell className="font-bold text-purple-700 dark:text-purple-400">{totalMissed} days</TableCell>
              <TableCell />
            </TableRow>
          );
          break;
        }
        default:
          totalsRow = null;
      }
    }

    // --- Render paginated rows ---
    const rows = paginatedData.map((item, index) => {
      const rowNumber = startIdx + index + 1;
      switch (selectedReportType) {
        case "collection":
          const startDate = item.start_date ? new Date(item.start_date) : null;
          const durationMonths = item.duration_months || item.duration || 0;
          let loanEndDate = startDate ? new Date(startDate) : null;
          if (loanEndDate && durationMonths) {
            loanEndDate.setMonth(loanEndDate.getMonth() + durationMonths);
          }
          const today = new Date();
          const status = (item.status || "").toLowerCase();
          const isOverdue = loanEndDate && loanEndDate < today && status !== "completed";
          return (
            <TableRow key={index}>
              <TableCell>{rowNumber}</TableCell>
              <TableCell>{item.start_date}</TableCell>
              <TableCell>
                {loanEndDate ? loanEndDate.toISOString().split("T")[0] : ""}
              </TableCell>
              <TableCell>
                {formatReportBorrowerName(item.borrowerName || "N/A")}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 font-bold rounded-full text-xs ${
                    isOverdue
                      ? "bg-destructive/20 text-destructive border border-destructive/30"
                      : (item.status || "active") === "active"
                      ? "bg-success/20 text-success border border-success/30"
                      : (item.status || "active") === "completed"
                      ? "bg-info/20 text-info border border-info/30"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {isOverdue
                    ? "Overdue"
                    : item.status === "completed"
                    ? "Completed"
                    : item.status || "Active"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-purple-700 dark:text-purple-500 font-bold">
                  ₹ {item.total_amount?.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-red-600 dark:text-red-500 font-bold">
                  ₹ {(item.total_amount - item.amount_paid)?.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-green-700 dark:text-green-500 font-bold">
                  ₹ {item.amount_paid?.toLocaleString()}
                </span>
              </TableCell>
            </TableRow>
          );
        case "borrower":
          // Show first loan's start/end date, total loans, total amount
          const borrowerLoans = loans.filter((l) => l.borrower_id === item.id);
          const firstLoan = borrowerLoans[0];
          const startDateB = firstLoan?.start_date || "";
          let loanEndDateB = "";
          if (firstLoan) {
            const sd = firstLoan.start_date
              ? new Date(firstLoan.start_date)
              : null;
            const dm = firstLoan.duration_months || firstLoan.duration || 0;
            if (sd && dm) {
              sd.setMonth(sd.getMonth() + dm);
              loanEndDateB = sd.toISOString().split("T")[0];
            }
          }
          return (
            <TableRow key={index}>
              <TableCell>{rowNumber}</TableCell>
              <TableCell>{startDateB}</TableCell>
              <TableCell>{loanEndDateB}</TableCell>
              <TableCell>{getBorrowerFullName(item)}</TableCell>
              <TableCell>{item.phone}</TableCell>
              <TableCell>{item.nic || item.nic_number || ""}</TableCell>
              <TableCell>{item.address}</TableCell>
              <TableCell>
                <span className="font-bold">{borrowerLoans.length}</span>
              </TableCell>
              <TableCell>
                <span className="text-purple-700 dark:text-purple-500 font-bold">
                  ₹ {(item.total_amount || 0).toLocaleString()}
                </span>
              </TableCell>
            </TableRow>
          );
        case "overdue":
          // Show start/end date, borrower name, loan amount, paid amount, remaining amount
          const startDateO = item.start_date || "";
          let loanEndDateO = "";
          const sdO = item.start_date ? new Date(item.start_date) : null;
          const dmO = item.duration_months || item.duration || 0;
          if (sdO && dmO) {
            sdO.setMonth(sdO.getMonth() + dmO);
            loanEndDateO = sdO.toISOString().split("T")[0];
          }
          return (
            <TableRow key={index}>
              <TableCell>{rowNumber}</TableCell>
              <TableCell>{startDateO}</TableCell>
              <TableCell>{loanEndDateO}</TableCell>
              <TableCell>
                {formatReportBorrowerName(item.borrowerName || "N/A")}
              </TableCell>
              <TableCell>
                <span className="text-purple-700 dark:text-purple-500 font-bold">
                  ₹ {item.total_amount?.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-green-700 dark:text-green-500 font-bold">
                  ₹ {item.amount_paid?.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-red-600 dark:text-red-500 font-bold">
                  ₹ {(item.total_amount - item.amount_paid)?.toLocaleString()}
                </span>
              </TableCell>
            </TableRow>
          );
        case "dailyCollection":
          return (
            <TableRow key={index}>
              <TableCell>{rowNumber}</TableCell>
              <TableCell>{item.payment_date}</TableCell>
              <TableCell>
                {formatTime12Hour(item.payment_time) || "-"}
              </TableCell>
              <TableCell>
                {formatReportBorrowerName(item.borrowerName || "N/A")}
              </TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {item.payment_method || "cash"}
                </span>
              </TableCell>
              <TableCell className="text-purple-700 dark:text-purple-500 font-bold">
                ₹ {(item.totalLoanAmount || 0).toLocaleString()}
              </TableCell>
              <TableCell>
                <span className="text-red-600 dark:text-red-500 font-semibold">
                  ₹ {(item.remainingLoanAmount || 0).toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`font-bold ${
                    (item.displayAmount || item.amount) < 0
                      ? "text-red-700 dark:text-red-500"
                      : "text-green-700 dark:text-green-500"
                  }`}
                >
                  ₹ {(item.displayAmount || item.amount)?.toLocaleString()}
                </span>
              </TableCell>
            </TableRow>
          );
        case "arrears":
          return (
            <TableRow key={index}>
              <TableCell>{rowNumber}</TableCell>
              <TableCell>{formatReportBorrowerName(item.borrowerName || "N/A")}</TableCell>
              <TableCell className="text-green-700 dark:text-green-500 font-bold">₹ {item.total_amount?.toLocaleString()}</TableCell>
              <TableCell className="text-orange-600 dark:text-orange-400 font-bold">₹ {item.amount_paid?.toLocaleString()}</TableCell>
              <TableCell className="text-red-600 dark:text-red-500 font-bold">₹ {calculateArrears(item)?.toLocaleString()}</TableCell>
              <TableCell className="text-purple-700 dark:text-purple-500 font-bold">{calculateMissedDays(item)} days</TableCell>
              <TableCell className="text-blue-700 dark:text-blue-500 font-bold">{getLastMissedDate(item)}</TableCell>
            </TableRow>
          );
        default:
          return null;
      }
    });

    // Only show totals row on last page
    const isLastPage = page === Math.ceil(data.length / rowsPerPage);
    return (
      <>
        {rows}
        {isLastPage && totalsRow}
      </>
    );
  };

  // Pagination controls
  const renderPagination = () => {
    const data = getReportData();
    const totalPages = Math.ceil(data.length / rowsPerPage);
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      // Show first, last, current, and neighbors; use ... for gaps
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        pageNumbers.push(i);
      } else if (
        (i === page - 2 && page - 2 > 1) ||
        (i === page + 2 && page + 2 < totalPages)
      ) {
        pageNumbers.push("...");
      }
    }
    // Remove duplicate ellipsis
    const filteredPages = pageNumbers.filter(
      (v, i, arr) => v !== "..." || arr[i - 1] !== "..."
    );

    return (
      <div className="flex justify-end items-center gap-2 mt-4 select-none">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`h-9 w-9 flex items-center justify-center rounded-full border transition-colors ${
            page === 1
              ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-700"
          }`}
          aria-label="Previous page"
        >
          <span className="font-bold">&lt;</span>
        </button>
        {filteredPages.map((p, idx) =>
          p === "..." ? (
            <span key={idx} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(Number(p))}
              className={`h-9 w-9 flex items-center justify-center rounded-full border transition-colors ${
                page === p
                  ? "bg-blue-600 text-white border-blue-600 shadow"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
              }`}
              aria-current={page === p ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className={`h-9 w-9 flex items-center justify-center rounded-full border transition-colors ${
            page === totalPages
              ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-700"
          }`}
          aria-label="Next page"
        >
          <span className="font-bold">&gt;</span>
        </button>
      </div>
    );
  };

  // Load payments when report type changes to dailyCollection
  const handleReportTypeChange = (reportType: string) => {
    setSelectedReportType(reportType);
    if (reportType === "dailyCollection") {
      loadPayments();
    }
  };

  const handleFromDateChange = (date: string) => {
    if (toDate && new Date(date) > new Date(toDate)) {
      toast({
        title: "From date cannot be greater than To date",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    setFromDate(date);
  };

  const handleToDateChange = (date: string) => {
    if (fromDate && new Date(date) < new Date(fromDate)) {
      toast({
        title: "To date cannot be less than From date",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    setToDate(date);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {t.title}
      </h1>
      {/* Export Section Card */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Export Reports
            </h2>
            {/* Export Button */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-4">
              {/* File Type Selection */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {fileTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedFileType(type.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedFileType === type.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleExport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                <Download className="w-4 h-4 mr-2" />
                {t.exportBtn}
              </Button>
            </div>
          </div>
          {/* Filter input */}
          <div className="mt-4 flex flex-col md:flex-row gap-2">
            {(selectedReportType === "collection" ||
              selectedReportType === "overdue" ||
              selectedReportType === "dailyCollection") && (
              <>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => handleFromDateChange(e.target.value)}
                  className="px-5 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="From date"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => handleToDateChange(e.target.value)}
                  className="px-5 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="To date"
                />
              </>
            )}
            {/* Loan Status Filter for Collection Report */}
            {selectedReportType === "collection" && (
              <>
                {/* Desktop: Button group */}
                <div className="hidden sm:flex gap-2 items-center">
                  {[
                    { value: "all", label: "All" },
                    { value: "active", label: "Active" },
                    { value: "closed", label: "Completed" },
                    { value: "overdue", label: "Overdue" },
                  ].map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setLoanStatusFilter(status.value)}
                      className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
                        loanStatusFilter === status.value
                          ? "bg-blue-600 text-white border-gray-600"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 border-gray-400 hover:bg-green-50 dark:hover:bg-blue-900"
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
                {/* Mobile: Dropdown */}
                <div className="sm:hidden w-full">
                  <select
                    value={loanStatusFilter}
                    onChange={(e) => setLoanStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    {[
                      { value: "all", label: "All" },
                      { value: "active", label: "Active" },
                      { value: "closed", label: "Completed" },
                      { value: "overdue", label: "Overdue" },
                    ].map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {/* Today/Week/Month Tag Filters for Daily Collection */}
            {selectedReportType === "dailyCollection" && (
              <div className="flex gap-2 items-center">
                {/* Add "Show All" button before other filters */}
                <button
                  type="button"
                  onClick={() => setShowTodayOnly("all")}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors
                    ${
                      showTodayOnly === "all"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900"
                    }
                  `}
                  style={{ minWidth: 80 }}
                >
                  All
                </button>
                {[
                  { label: "Today", value: "today" },
                  { label: "Week", value: "week" },
                  { label: "Month", value: "month" },
                ].map((range) => (
                  <button
                    key={range.value}
                    type="button"
                    onClick={() => setShowTodayOnly(range.value)}
                    className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors
                      ${
                        showTodayOnly === range.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900"
                      }
                    `}
                    style={{ minWidth: 80 }}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder={t.filterPlaceholder}
              className="w-full md:w-3/3 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          {/* Report Type Selection */}
          <div className="mt-4">
            {/* Responsive report type selection */}
            <div className="hidden md:flex w-full bg-gray-200/70 dark:bg-gray-700/70 rounded-lg p-1 gap-2">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleReportTypeChange(type.id)}
                  className={
                    "flex-1 flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 border-b-2 " +
                    (selectedReportType === type.id
                      ? "border-black bg-white/80 dark:bg-gray-800 text-black dark:text-white shadow-none dark:border-gray-200"
                      : "border-transparent text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-600")
                  }
                  style={{
                    borderBottomWidth: "2px",
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <div className="md:hidden">
              <select
                value={selectedReportType}
                onChange={(e) => handleReportTypeChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                style={{ width: "90%" }}
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Data Table */}
            <div className="mt-4 overflow-x-auto">
              <Table className="w-full min-w-[600px] md:min-w-[800px] lg:min-w-[1024px]">
                <TableHeader>{renderTableHeaders()}</TableHeader>
                <TableBody>{renderTableRows()}</TableBody>
              </Table>
              {renderPagination()}
            </div>
            <style>{`
              .ec-table-header-row {
              border-bottom: 2px solid #222 !important;
              }
              .ec-table-header-cell {
              color: #111 !important;
              font-weight: 700 !important;
              background: transparent !important;
              }
              @media (prefers-color-scheme: dark) {
              .ec-table-header-row {
              border-bottom: 2px solid #444 !important;
              }
              .ec-table-header-cell {
              color: #fff !important;
              }
              }
              /* Add row border for dark mode */
              .dark tr, .dark .ec-table-header-row, .dark .ec-table-row {
              border-bottom: 1px solid #444 !important;
              }
              tr, .ec-table-row {
              border-bottom: 1px solid #e5e7eb !important;
              }
            `}</style>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
