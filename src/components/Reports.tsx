import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, DollarSign, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsProps {
  language: string;
  borrowers: any[];
  loans: any[];
}

const Reports = ({ language, borrowers, loans }: ReportsProps) => {
  const [selectedReportType, setSelectedReportType] = useState('collection');
  const [selectedFileType, setSelectedFileType] = useState('pdf');
  const [filterText, setFilterText] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const translations = {
    en: {
      title: 'Reports',
      exportBtn: 'Export',
      collectionReport: 'Collection Report',
      overdueReport: 'Overdue Report',
      borrowerReport: 'Borrower Report',
      date: 'Date',
      borrowerName: 'Borrower Name',
      loanAmount: 'Loan Amount',
      paymentAmount: 'Payment Amount',
      status: 'Status',
      remainingAmount: 'Remaining Amount',
      noPaymentData: 'No payment data available',
      noOverdueLoans: 'No overdue loans found',
      noBorrowerData: 'No borrower data available',
      totalBorrowers: 'Total Borrowers',
      totalLoans: 'Total Loans',
      totalCollected: 'Total Collected',
      pendingAmount: 'Pending Amount',
      exportSuccess: 'Report exported successfully',
      noData: 'No data available for export',
      filterPlaceholder: 'Filter by name or phone...'
    },
    ta: {
      title: 'அறிக்கைகள்',
      exportBtn: 'ஏற்றுமதி',
      collectionReport: 'வசூல் அறிக்கை',
      overdueReport: 'தாமத அறிக்கை',
      borrowerReport: 'கடன் வாங்குபவர் அறிக்கை',
      date: 'தேதி',
      borrowerName: 'கடன் வாங்குபவர் பெயர்',
      loanAmount: 'கடன் தொகை',
      paymentAmount: 'பணம் செலுத்தல் தொகை',
      status: 'நிலை',
      remainingAmount: 'மீதமுள்ள தொகை',
      noPaymentData: 'பணம் செலுத்தல் தரவு இல்லை',
      noOverdueLoans: 'தாமதமான கடன்கள் இல்லை',
      noBorrowerData: 'கடன் வாங்குபவர் தரவு இல்லை',
      totalBorrowers: 'மொத்த கடன் வாங்குபவர்கள்',
      totalLoans: 'மொத்த கடன்கள்',
      totalCollected: 'மொத்த வசூல்',
      pendingAmount: 'நிலுவையில் உள்ள தொகை',
      exportSuccess: 'அறிக்கை வெற்றிகரமாக ஏற்றுமதி செய்யப்பட்டது',
      noData: 'ஏற்றுமதிக்கு தரவு இல்லை',
      filterPlaceholder: 'பெயர் அல்லது தொலைபேசி மூலம் வடிகட்டி...'
    }
  };

  const t = translations[language as keyof typeof translations];

  // Calculate actual totals from real data
  const totalCollected = loans.reduce((sum, loan) => sum + (loan.amount_paid || 0), 0);
  const totalLoanAmount = loans.reduce((sum, loan) => sum + (loan.total_amount || 0), 0);
  const pendingAmount = totalLoanAmount - totalCollected;

  const reportTypes = [
    { id: 'collection', label: t.collectionReport },
    { id: 'overdue', label: t.overdueReport },
    { id: 'borrower', label: t.borrowerReport }
  ];

  const fileTypes = [
    { id: 'pdf', label: 'PDF' },
    { id: 'excel', label: 'Excel' },
    { id: 'csv', label: 'CSV' }
  ];

  // Filter logic for export and table
  const getReportData = () => {
    let data: any[] = [];
    switch (selectedReportType) {
      case 'collection':
        data = loans.filter(loan => loan.amount_paid > 0);
        break;
      case 'overdue':
        data = loans.filter(loan => loan.status === 'overdue');
        break;
      case 'borrower':
        data = borrowers;
        break;
      default:
        data = [];
    }
    // Date range filter for collection/overdue
    if ((selectedReportType === 'collection' || selectedReportType === 'overdue') && (fromDate || toDate)) {
      data = data.filter(item => {
        const date = new Date(item.start_date);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        return (!from || date >= from) && (!to || date <= to);
      });
    }
    // Text filter
    if (filterText.trim()) {
      const lower = filterText.trim().toLowerCase();
      if (selectedReportType === 'borrower') {
        data = data.filter(
          b =>
            (b.name && b.name.toLowerCase().includes(lower)) ||
            (b.phone && b.phone.toLowerCase().includes(lower))
        );
      } else {
        data = data.filter(
          l =>
            (l.borrowerName && l.borrowerName.toLowerCase().includes(lower)) ||
            (l.phone && l.phone.toLowerCase().includes(lower))
        );
      }
    }
    return data;
  };

  const exportToCSV = (data: any[], filename: string) => {
    let csvContent = '';
    if (selectedReportType === 'collection') {
      csvContent = 'Date,Borrower Name,Loan Amount,Payment Amount,Remaining Amount\n';
      data.forEach(loan => {
        csvContent += `${loan.start_date},${loan.borrowerName || 'N/A'},${loan.total_amount},${loan.amount_paid},${loan.total_amount - loan.amount_paid}\n`;
      });
    } else if (selectedReportType === 'overdue') {
      csvContent = 'Date,Borrower Name,Loan Amount,Payment Amount,Status\n';
      data.forEach(loan => {
        csvContent += `${loan.start_date},${loan.borrowerName || 'N/A'},${loan.total_amount},${loan.amount_paid},${loan.status}\n`;
      });
    } else if (selectedReportType === 'borrower') {
      csvContent = 'Created Date,Name,Phone,Address,Total Loans,Total Amount,Total Paid,Remaining Amount\n';
      data.forEach(borrower => {
        csvContent += `${borrower.created_at ? borrower.created_at.split('T')[0] : ''},${borrower.name},${borrower.phone},${borrower.address},${borrower.total_loans || 0},${borrower.total_amount || 0},${borrower.total_paid || 0},${borrower.remaining_amount || 0}\n`;
      });
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (data: any[], filename: string) => {
    let wsData: any[] = [];
    if (selectedReportType === 'collection') {
      wsData = [
        ['Date', 'Borrower Name', 'Loan Amount', 'Payment Amount', 'Remaining Amount'],
        ...data.map(loan => [
          loan.start_date,
          loan.borrowerName || 'N/A',
          loan.total_amount,
          loan.amount_paid,
          loan.total_amount - loan.amount_paid
        ])
      ];
    } else if (selectedReportType === 'overdue') {
      wsData = [
        ['Date', 'Borrower Name', 'Loan Amount', 'Payment Amount', 'Status'],
        ...data.map(loan => [
          loan.start_date,
          loan.borrowerName || 'N/A',
          loan.total_amount,
          loan.amount_paid,
          loan.status
        ])
      ];
    } else if (selectedReportType === 'borrower') {
      wsData = [
        ['Created Date', 'Name', 'Phone', 'Address', 'Total Loans', 'Total Amount', 'Total Paid', 'Remaining Amount'],
        ...data.map(borrower => [
          borrower.created_at ? borrower.created_at.split('T')[0] : '',
          borrower.name,
          borrower.phone,
          borrower.address,
          borrower.total_loans || 0,
          borrower.total_amount || 0,
          borrower.total_paid || 0,
          borrower.remaining_amount || 0
        ])
      ];
    }
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, filename);
  };

  const exportToPDF = (data: any[], filename: string) => {
    const doc = new jsPDF();
    let head: string[] = [];
    let body: any[][] = [];
    let title = '';

    if (selectedReportType === 'collection') {
      head = ['Date', 'Borrower Name', 'Loan Amount', 'Payment Amount', 'Remaining Amount'];
      body = data.map(loan => [
        loan.start_date,
        loan.borrowerName || 'N/A',
        loan.total_amount,
        loan.amount_paid,
        loan.total_amount - loan.amount_paid
      ]);
      title = t.collectionReport;
    } else if (selectedReportType === 'overdue') {
      head = ['Date', 'Borrower Name', 'Loan Amount', 'Payment Amount', 'Status'];
      body = data.map(loan => [
        loan.start_date,
        loan.borrowerName || 'N/A',
        loan.total_amount,
        loan.amount_paid,
        loan.status
      ]);
      title = t.overdueReport;
    } else if (selectedReportType === 'borrower') {
      head = ['Created Date', 'Name', 'Phone', 'Address', 'Total Loans', 'Total Amount', 'Total Paid', 'Remaining Amount'];
      body = data.map(borrower => [
        borrower.created_at ? borrower.created_at.split('T')[0] : '',
        borrower.name,
        borrower.phone,
        borrower.address,
        borrower.total_loans || 0,
        borrower.total_amount || 0,
        borrower.total_paid || 0,
        borrower.remaining_amount || 0
      ]);
      title = t.borrowerReport;
    }

    doc.text(title, 14, 16);
    autoTable(doc, {
      head: [head],
      body: body,
      startY: 22,
      styles: { fontSize: 9 }
    });
    doc.save(filename);
  };

  const handleExport = () => {
    const data = getReportData();
    if (data.length === 0) {
      toast({ title: t.noData, variant: "destructive" });
      return;
    }
    const reportName = reportTypes.find(rt => rt.id === selectedReportType)?.label || 'report';
    const timestamp = new Date().toISOString().split('T')[0];
    let filename = `${reportName}_${timestamp}.${selectedFileType}`;
    if (selectedFileType === 'excel') {
      filename = `${reportName}_${timestamp}.xlsx`;
      exportToExcel(data, filename);
      toast({ title: `${reportName} exported as Excel successfully` });
    } else if (selectedFileType === 'csv') {
      exportToCSV(data, filename);
      toast({ title: `${reportName} exported as CSV successfully` });
    } else if (selectedFileType === 'pdf') {
      exportToPDF(data, filename);
      toast({ title: `${reportName} exported as PDF successfully` });
    }
  };

  const renderTableHeaders = () => {
    switch (selectedReportType) {
      case 'collection':
        return (
          <TableRow>
            <TableHead>{t.date}</TableHead>
            <TableHead>{t.borrowerName}</TableHead>
            <TableHead>{t.loanAmount}</TableHead>
            <TableHead>{t.paymentAmount}</TableHead>
            <TableHead>{t.remainingAmount}</TableHead>
          </TableRow>
        );
      case 'overdue':
        return (
          <TableRow>
            <TableHead>{t.date}</TableHead>
            <TableHead>{t.borrowerName}</TableHead>
            <TableHead>{t.loanAmount}</TableHead>
            <TableHead>{t.paymentAmount}</TableHead>
            <TableHead>{t.status}</TableHead>
          </TableRow>
        );
      case 'borrower':
        return (
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Total Loans</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Total Paid</TableHead>
            <TableHead>{t.remainingAmount}</TableHead>
          </TableRow>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    const data = getReportData();
    if (data.length === 0) {
      const noDataMessage = selectedReportType === 'overdue' ? t.noOverdueLoans :
        selectedReportType === 'borrower' ? t.noBorrowerData : t.noPaymentData;
      return (
        <TableRow>
          <TableCell colSpan={selectedReportType === 'borrower' ? 8 : 5} className="text-center text-gray-500 dark:text-gray-400 py-8">
            {noDataMessage}
          </TableCell>
        </TableRow>
      );
    }
    return data.map((item, index) => {
      switch (selectedReportType) {
        case 'collection':
          return (
            <TableRow key={index}>
              <TableCell>{item.start_date}</TableCell>
              <TableCell>{item.borrowerName || 'N/A'}</TableCell>
              <TableCell>₹{item.total_amount?.toLocaleString()}</TableCell>
              <TableCell>₹{item.amount_paid?.toLocaleString()}</TableCell>
              <TableCell>₹{(item.total_amount - item.amount_paid)?.toLocaleString()}</TableCell>
            </TableRow>
          );
        case 'overdue':
          return (
            <TableRow key={index}>
              <TableCell>{item.start_date}</TableCell>
              <TableCell>{item.borrowerName || 'N/A'}</TableCell>
              <TableCell>₹{item.total_amount?.toLocaleString()}</TableCell>
              <TableCell>₹{item.amount_paid?.toLocaleString()}</TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  {item.status}
                </span>
              </TableCell>
            </TableRow>
          );
        case 'borrower':
          return (
            <TableRow key={index}>
              <TableCell>
                {item.created_at
                  ? new Date(item.created_at).toISOString().split('T')[0]
                  : ''}
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.phone}</TableCell>
              <TableCell>{item.address}</TableCell>
              <TableCell>{item.total_loans || 0}</TableCell>
              <TableCell>₹{(item.total_amount || 0).toLocaleString()}</TableCell>
              <TableCell>₹{(item.total_paid || 0).toLocaleString()}</TableCell>
              <TableCell>₹{(item.remaining_amount || 0).toLocaleString()}</TableCell>
            </TableRow>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t.title}</h1>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {borrowers.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t.totalBorrowers}
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {loans.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t.totalLoans}
                </div>
              </div>
              <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ₹{totalCollected.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t.totalCollected}
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ₹{pendingAmount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t.pendingAmount}
                </div>
              </div>
              <Calendar className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Section Card */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Export Reports (Multiple type)</h2>
            {/* Export Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* File Type Selection */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {fileTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedFileType(type.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedFileType === type.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
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
            {(selectedReportType === 'collection' || selectedReportType === 'overdue') && (
              <>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="From date"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="To date"
                />
              </>
            )}
            <input
              type="text"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              placeholder={t.filterPlaceholder}
              className="w-full md:w-1/3 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          {/* Report Type Selection */}
          <div className="mt-4">
            <div className="flex w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedReportType(type.id)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedReportType === type.id
                    ? 'bg-white text-gray-600 dark:text-white shadow dark:bg-gray-900'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  style={{ minWidth: 0 }}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Data Table */}
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  {renderTableHeaders()}
                </TableHeader>
                <TableBody>
                  {renderTableRows()}
                </TableBody>
              </Table>
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
            `}</style>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;