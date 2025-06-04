
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, DollarSign } from 'lucide-react';
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
      title: 'Select Report Type',
      exportBtn: 'Export',
      collectionReport: 'Collection Report',
      overdueReport: 'Overdue Report',
      borrowerReport: 'Borrower Report',
      date: 'Date',
      borrowerName: 'Borrower Name',
      loanAmount: 'Loan Amount',
      paymentAmount: 'Payment Amount',
      noPaymentData: 'No payment data available',
      totalBorrowers: 'Total Borrowers',
      totalLoans: 'Total Loans',
      totalCollected: 'Total Collected',
      pendingAmount: 'Pending Amount',
      exportSuccess: 'Report exported successfully',
      noData: 'No data available for export'
    },
    ta: {
      title: 'அறிக்கை வகையைத் தேர்ந்தெடுக்கவும்',
      exportBtn: 'ஏற்றுமதி',
      collectionReport: 'வசூல் அறிக்கை',
      overdueReport: 'தாமத அறிக்கை',
      borrowerReport: 'கடன் வாங்குபவர் அறிக்கை',
      date: 'தேதி',
      borrowerName: 'கடன் வாங்குபவர் பெயர்',
      loanAmount: 'கடன் தொகை',
      paymentAmount: 'பணம் செலுத்தல் தொகை',
      noPaymentData: 'பணம் செலுத்தல் தரவு இல்லை',
      totalBorrowers: 'மொத்த கடன் வாங்குபவர்கள்',
      totalLoans: 'மொத்த கடன்கள்',
      totalCollected: 'மொத்த வசூல்',
      pendingAmount: 'நிலுவையில் உள்ள தொகை',
      exportSuccess: 'அறிக்கை வெற்றிகரமாக ஏற்றுமதி செய்யப்பட்டது',
      noData: 'ஏற்றுமதிக்கு தரவு இல்லை'
    }
  };

  const t = translations[language as keyof typeof translations];

  const totalCollected = loans.reduce((sum, loan) => sum + (loan.amountPaid || 0), 0);
  const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
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
        return loans.filter(loan => loan.amountPaid > 0);
      case 'overdue':
        return loans.filter(loan => loan.status === 'overdue');
      case 'borrower':
        return borrowers;
      default:
        return [];
    }
  };

  const handleExport = () => {
    const data = getReportData();
    if (data.length === 0) {
      toast({ title: t.noData, variant: "destructive" });
      return;
    }
    
    toast({ title: `${reportTypes.find(rt => rt.id === selectedReportType)?.label} ${t.exportSuccess}` });
    console.log(`Exporting ${selectedReportType} report as ${selectedFileType.toUpperCase()}...`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        
        <div className="flex items-center gap-4">
          {/* File Type Selection */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {fileTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedFileType(type.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedFileType === type.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          
          {/* Export Button */}
          <Button 
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
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
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedReportType === type.id
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-gray-600 bg-gray-800 hover:border-gray-500'
            }`}
          >
            <div className="text-left">
              <div className="font-semibold text-lg">{type.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {borrowers.length}
              </div>
              <div className="text-sm text-gray-400">
                {t.totalBorrowers}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {loans.length}
              </div>
              <div className="text-sm text-gray-400">
                {t.totalLoans}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                ₹{totalCollected.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">
                {t.totalCollected}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                ₹{pendingAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">
                {t.pendingAmount}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-400">{t.date}</TableHead>
                <TableHead className="text-gray-400">{t.borrowerName}</TableHead>
                <TableHead className="text-gray-400">{t.loanAmount}</TableHead>
                <TableHead className="text-gray-400">{t.paymentAmount}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getReportData().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                    {t.noPaymentData}
                  </TableCell>
                </TableRow>
              ) : (
                getReportData().map((item, index) => (
                  <TableRow key={index} className="border-gray-700">
                    <TableCell className="text-gray-300">
                      {selectedReportType === 'borrower' ? '-' : item.startDate}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {selectedReportType === 'borrower' ? item.name : item.borrowerName}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      ₹{selectedReportType === 'borrower' ? item.totalAmount?.toLocaleString() : item.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      ₹{selectedReportType === 'borrower' ? '-' : item.amountPaid?.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
