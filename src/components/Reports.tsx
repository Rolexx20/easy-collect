
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, DollarSign, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ReportsProps {
  language: string;
  borrowers: any[];
  loans: any[];
}

const Reports = ({ language, borrowers, loans }: ReportsProps) => {
  const [selectedReportType, setSelectedReportType] = useState('collection');
  const [selectedFileType, setSelectedFileType] = useState('pdf');

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
      noData: 'No data available for export'
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
      noData: 'ஏற்றுமதிக்கு தரவு இல்லை'
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

  const getReportData = () => {
    switch (selectedReportType) {
      case 'collection':
        return loans.filter(loan => loan.amount_paid > 0);
      case 'overdue':
        return loans.filter(loan => loan.status === 'overdue');
      case 'borrower':
        return borrowers;
      default:
        return [];
    }
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
      csvContent = 'Name,Phone,Address,Total Loans,Total Amount,Total Paid,Remaining Amount\n';
      data.forEach(borrower => {
        csvContent += `${borrower.name},${borrower.phone},${borrower.address},${borrower.total_loans || 0},${borrower.total_amount || 0},${borrower.total_paid || 0},${borrower.remaining_amount || 0}\n`;
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

  const handleExport = () => {
    const data = getReportData();
    if (data.length === 0) {
      toast({ title: t.noData, variant: "destructive" });
      return;
    }
    
    const reportName = reportTypes.find(rt => rt.id === selectedReportType)?.label || 'report';
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${reportName}_${timestamp}.${selectedFileType}`;
    
    if (selectedFileType === 'csv') {
      exportToCSV(data, filename);
      toast({ title: `${reportName} exported as CSV successfully` });
    } else {
      // For PDF and Excel, show a message since full implementation would require additional libraries
      toast({ 
        title: `Export as ${selectedFileType.toUpperCase()}`, 
        description: `${reportName} data prepared. For full ${selectedFileType.toUpperCase()} export, additional libraries needed.`,
      });
      console.log(`Exporting ${selectedReportType} report as ${selectedFileType.toUpperCase()}...`, data);
    }
  };

  const renderTableHeaders = () => {
    switch (selectedReportType) {
      case 'collection':
        return (
          <TableRow className="border-gray-200 dark:border-gray-700">
            <TableHead className="text-gray-700 dark:text-gray-300">{t.date}</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">{t.borrowerName}</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">{t.loanAmount}</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">{t.paymentAmount}</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">{t.remainingAmount}</TableHead>
          </TableRow>
        );
      case 'overdue':
        return (
          <TableRow className="border-gray-200 dark:border-gray-700">
            <TableHead className="text-gray-700 dark:text-gray-300">{t.date}</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">{t.borrowerName}</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">{t.loanAmount}</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">{t.paymentAmount}</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">{t.status}</TableHead>
          </TableRow>
        );
      case 'borrower':
        return (
          <TableRow className="border-gray-200 dark:border-gray-700">
            <TableHead className="text-gray-700 dark:text-gray-300">Name</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">Phone</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">Total Loans</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">Total Amount</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">Total Paid</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">{t.remainingAmount}</TableHead>
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
          <TableCell colSpan={selectedReportType === 'borrower' ? 6 : 5} className="text-center text-gray-500 dark:text-gray-400 py-8">
            {noDataMessage}
          </TableCell>
        </TableRow>
      );
    }

    return data.map((item, index) => {
      switch (selectedReportType) {
        case 'collection':
          return (
            <TableRow key={index} className="border-gray-200 dark:border-gray-700">
              <TableCell className="text-gray-900 dark:text-gray-100">{item.start_date}</TableCell>
              <TableCell className="text-gray-900 dark:text-gray-100">{item.borrowerName || 'N/A'}</TableCell>
              <TableCell className="text-gray-900 dark:text-gray-100">₹{item.total_amount?.toLocaleString()}</TableCell>
              <TableCell className="text-gray-900 dark:text-gray-100">₹{item.amount_paid?.toLocaleString()}</TableCell>
              <TableCell className="text-gray-900 dark:text-gray-100">₹{(item.total_amount - item.amount_paid)?.toLocaleString()}</TableCell>
            </TableRow>
          );
        case 'overdue':
          return (
            <TableRow key={index} className="border-gray-200 dark:border-gray-700">
              <TableCell className="text-gray-900 dark:text-gray-100">{item.start_date}</TableCell>
              <TableCell className="text-gray-900 dark:text-gray-100">{item.borrowerName || 'N/A'}</TableCell>
              <TableCell className="text-gray-900 dark:text-gray-100">₹{item.total_amount?.toLocaleString()}</TableCell>
              <TableCell className="text-gray-900 dark:text-gray-100">₹{item.amount_paid?.toLocaleString()}</TableCell>
              <TableCell className="text-gray-900 dark:text-gray-100">
                <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  {item.status}
                </span>
              </TableCell>
            </TableRow>
          );
        case 'borrower':
          return (
            <TableRow key={index} className="border-gray-200 dark:border-gray-700">
              <TableCell className="text-gray-900 dark:text-gray-100">{item.name}</TableCell>
              <TableCell className="text-gray-900 dark:text-gray-100">{item.phone}</TableCell>
              <TableCell className="text-gray-900 dark:text-gray-100">{item.total_loans || 0}</TableCell>
              <TableCell className="text-gray-900 dark:text-gray-100">₹{(item.total_amount || 0).toLocaleString()}</TableCell>
              <TableCell className="text-gray-900 dark:text-gray-100">₹{(item.total_paid || 0).toLocaleString()}</TableCell>
              <TableCell className="text-gray-900 dark:text-gray-100">₹{(item.remaining_amount || 0).toLocaleString()}</TableCell>
            </TableRow>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          {/* File Type Selection */}
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1 w-full sm:w-auto">
            {fileTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedFileType(type.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 sm:flex-none ${
                  selectedFileType === type.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          
          {/* Export Button */}
          <Button 
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            {t.exportBtn}
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedReportType(type.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedReportType === type.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <div className="font-semibold text-lg text-gray-900 dark:text-white">{type.label}</div>
          </button>
        ))}
      </div>

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

      {/* Data Table */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {renderTableHeaders()}
              </TableHeader>
              <TableBody>
                {renderTableRows()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
