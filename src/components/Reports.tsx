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
import * as XLSX from "xlsx";
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
      remainingAmount: "Remaining Amount",
      paymentDate: "Payment Date",
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

  const reportTypes = [
    { id: "dailyCollection", label: t.dailyCollectionReport },
    { id: "overdue", label: t.overdueReport },
    { id: "collection", label: t.collectionReport },
    { id: "borrower", label: t.borrowerReport },
  ];

  const fileTypes = [
    { id: "pdf", label: "PDF" },
    { id: "csv", label: "CSV" },
  ];

  // Load payments data when daily collection report is selected
  const loadPayments = async () => {
    try {
      const paymentsData = await getPayments();
      // Add borrower names and loan details to payments by matching loan_id
      const paymentsWithLoanDetails = paymentsData.map((payment) => {
        const loan = loans.find((l) => l.id === payment.loan_id);
        return {
          ...payment,
          borrowerName: loan?.borrowerName || "N/A",
          totalLoanAmount: loan?.total_amount || 0,
          remainingLoanAmount: loan ? loan.total_amount - loan.amount_paid : 0,
        };
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
        data = loans.filter((loan) => loan.amount_paid > 0);
        break;
      case "overdue":
        data = loans.filter((loan) => loan.status === "overdue");
        break;
      case "borrower":
        data = borrowers;
        break;
      case "dailyCollection":
        data = payments;
        break;
      default:
        data = [];
    }

    // Date range filter for collection/overdue/dailyCollection
    if (
      (selectedReportType === "collection" ||
        selectedReportType === "overdue" ||
        selectedReportType === "dailyCollection") &&
      (fromDate || toDate)
    ) {
      data = data.filter((item) => {
        const date =
          selectedReportType === "dailyCollection"
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

  const exportToCSV = (data: any[], filename: string) => {
    let csvContent = "";
    if (selectedReportType === "collection") {
      csvContent =
        "No,Date,Borrower Name,Status,Loan Amount,Remaining Amount,Collected Amount\n"; // Updated column order
      data.forEach((loan, index) => {
        csvContent += `${index + 1},${loan.start_date},${
          loan.borrowerName || "N/A"
        },${loan.status || "Active"},${loan.total_amount},${
          loan.total_amount - loan.amount_paid
        },${loan.amount_paid}\n`;
      });
    } else if (selectedReportType === "borrower") {
      csvContent = "No,Name,Phone,Address,Total Amount\n"; // Match table column order
      data.forEach((borrower, index) => {
        csvContent += `${index + 1},${borrower.name},${borrower.phone},${
          borrower.address
        },${borrower.total_amount || 0}\n`;
      });
    } else if (selectedReportType === "overdue") {
      csvContent = "No,Date,Borrower Name,Loan Amount,Payment Amount,Status\n"; // Match table column order
      data.forEach((loan, index) => {
        csvContent += `${index + 1},${loan.start_date},${
          loan.borrowerName || "N/A"
        },${loan.total_amount},${loan.amount_paid},${loan.status}\n`;
      });
    } else if (selectedReportType === "dailyCollection") {
      csvContent =
        "No,Payment Date,Borrower Name,Payment Method,Total Loan Amount,Remaining Loan Amount,Payment Amount\n"; // Match table column order
      data.forEach((payment, index) => {
        csvContent += `${index + 1},${payment.payment_date},${
          payment.borrowerName || "N/A"
        },${payment.payment_method || "cash"},${payment.totalLoanAmount || 0},${
          payment.remainingLoanAmount || 0
        },${payment.amount}\n`;
      });
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
        "Date",
        "Borrower Name",
        "Status",
        "Loan Amount",
        "Remaining Amount",
        "Collected Amount",
      ]; // Updated column order
      body = data.map((loan, index) => [
        index + 1,
        loan.start_date,
        loan.borrowerName || "N/A",
        loan.status || "Active",
        loan.total_amount,
        loan.total_amount - loan.amount_paid,
        loan.amount_paid,
      ]);
      title = t.collectionReport;
    } else if (selectedReportType === "borrower") {
      head = ["No", "Name", "Phone", "Address", "Total Amount"]; // Match table column order
      body = data.map((borrower, index) => [
        index + 1,
        borrower.name,
        borrower.phone,
        borrower.address,
        borrower.total_amount || 0,
      ]);
      title = t.borrowerReport;
    } else if (selectedReportType === "overdue") {
      head = [
        "No",
        "Date",
        "Borrower Name",
        "Loan Amount",
        "Payment Amount",
        "Status",
      ]; // Match table column order
      body = data.map((loan, index) => [
        index + 1,
        loan.start_date,
        loan.borrowerName || "N/A",
        loan.total_amount,
        loan.amount_paid,
        loan.status,
      ]);
      title = t.overdueReport;
    } else if (selectedReportType === "dailyCollection") {
      head = [
        "No",
        "Payment Date",
        "Borrower Name",
        "Payment Method",
        "Total Loan Amount",
        "Remaining Loan Amount",
        "Payment Amount",
      ]; // Match table column order
      body = data.map((payment, index) => [
        index + 1,
        payment.payment_date,
        payment.borrowerName || "N/A",
        payment.payment_method || "cash",
        payment.totalLoanAmount || 0,
        payment.remainingLoanAmount || 0,
        payment.amount,
      ]);
      title = t.dailyCollectionReport;
    }

    doc.text(title, 14, 16);
    autoTable(doc, {
      head: [head],
      body: body,
      startY: 22,
      styles: { fontSize: 9 },
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
            <TableHead>#</TableHead> {/* Add numbering column */}
            <TableHead>{t.date}</TableHead>
            <TableHead>{t.borrowerName}</TableHead>
            <TableHead>Status</TableHead> {/* Ensure status column matches export */}
            <TableHead>{t.loanAmount}</TableHead>
            <TableHead>Remaining Amount</TableHead>
            <TableHead>Collected Amount</TableHead>
          </TableRow>
        );
      case "borrower":
        return (
          <TableRow>
            <TableHead>#</TableHead> {/* Add numbering column */}
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Total Amount</TableHead> {/* Updated columns */}
          </TableRow>
        );
      case "overdue":
        return (
          <TableRow>
            <TableHead>#</TableHead> {/* Add numbering column */}
            <TableHead>{t.date}</TableHead>
            <TableHead>{t.borrowerName}</TableHead>
            <TableHead>{t.loanAmount}</TableHead>
            <TableHead>{t.paymentAmount}</TableHead>
            <TableHead>{t.status}</TableHead>
          </TableRow>
        );
      case "dailyCollection":
        return (
          <TableRow>
            <TableHead>#</TableHead> {/* Add numbering column */}
            <TableHead>{t.paymentDate}</TableHead>
            <TableHead>{t.borrowerName}</TableHead>
            <TableHead>{t.paymentMethod}</TableHead>
            <TableHead>{t.totalLoanAmount}</TableHead>
            <TableHead>{t.remainingLoanAmount}</TableHead>
            <TableHead>{t.paymentAmount}</TableHead>
          </TableRow>
        );
      default:
        return null;
    }
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
          : t.noPaymentData;
      return (
        <TableRow>
          <TableCell
            colSpan={
              selectedReportType === "borrower"
                ? 5
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

    return paginatedData.map((item, index) => {
      const rowNumber = startIdx + index + 1; // Calculate row number
      switch (selectedReportType) {
        case "collection":
          return (
            <TableRow key={index}>
              <TableCell>{rowNumber}</TableCell> {/* Add numbering */}
              <TableCell>{item.start_date}</TableCell>
              <TableCell>{item.borrowerName || "N/A"}</TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {item.status || "Active"}
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
          return (
            <TableRow key={index}>
              <TableCell>{rowNumber}</TableCell> {/* Add numbering */}
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.phone}</TableCell>
              <TableCell>{item.address}</TableCell>
              <TableCell>
                <span className="text-purple-700 dark:text-purple-500 font-bold">
                  ₹ {(item.total_amount || 0).toLocaleString()}
                </span>
              </TableCell>
            </TableRow>
          );
        case "overdue":
          return (
            <TableRow key={index}>
              <TableCell>{rowNumber}</TableCell> {/* Add numbering */}
              <TableCell>{item.start_date}</TableCell>
              <TableCell>{item.borrowerName || "N/A"}</TableCell>
              <TableCell>₹ {item.total_amount?.toLocaleString()}</TableCell>
              <TableCell>₹ {item.amount_paid?.toLocaleString()}</TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  {item.status}
                </span>
              </TableCell>
            </TableRow>
          );
        case "dailyCollection":
          return (
            <TableRow key={index}>
              <TableCell>{rowNumber}</TableCell> {/* Add numbering */}
              <TableCell>{item.payment_date}</TableCell>
              <TableCell>{item.borrowerName || "N/A"}</TableCell>
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
                <span className="text-green-700 dark:text-green-500 font-bold">
                  ₹ {item.amount?.toLocaleString()}
                </span>
              </TableCell>
            </TableRow>
          );
        default:
          return null;
      }
    });
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