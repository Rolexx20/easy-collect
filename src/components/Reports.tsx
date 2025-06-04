
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ReportsProps {
  language: string;
  borrowers: any[];
  loans: any[];
}

const Reports = ({ language, borrowers, loans }: ReportsProps) => {
  const translations = {
    en: {
      title: 'Reports & Analytics',
      exportPDF: 'Export as PDF',
      exportExcel: 'Export as Excel',
      exportCSV: 'Export as CSV',
      borrowerReport: 'Borrower Report',
      loanReport: 'Loan Report',
      paymentReport: 'Payment Report',
      summaryReport: 'Summary Report',
      totalBorrowers: 'Total Borrowers',
      totalLoans: 'Total Loans',
      totalCollected: 'Total Collected',
      pendingAmount: 'Pending Amount',
      exportSuccess: 'Report exported successfully',
      noData: 'No data available for export'
    },
    ta: {
      title: 'அறிக்கைகள் மற்றும் பகுப்பாய்வு',
      exportPDF: 'PDF ஆக ஏற்றுமதி செய்யவும்',
      exportExcel: 'Excel ஆக ஏற்றுமதி செய்யவும்',
      exportCSV: 'CSV ஆக ஏற்றுமதி செய்யவும்',
      borrowerReport: 'கடன் வாங்குபவர் அறிக்கை',
      loanReport: 'கடன் அறிக்கை',
      paymentReport: 'பணம் செலுத்தல் அறிக்கை',
      summaryReport: 'சுருக்க அறிக்கை',
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

  const exportToPDF = (reportType: string) => {
    // Mock PDF export functionality
    toast({ title: `${reportType} ${t.exportSuccess}` });
    console.log(`Exporting ${reportType} to PDF...`);
  };

  const exportToExcel = (reportType: string) => {
    // Mock Excel export functionality
    toast({ title: `${reportType} ${t.exportSuccess}` });
    console.log(`Exporting ${reportType} to Excel...`);
  };

  const exportToCSV = (reportType: string) => {
    // Mock CSV export functionality
    if (reportType === 'Borrowers' && borrowers.length === 0) {
      toast({ title: t.noData, variant: "destructive" });
      return;
    }
    if (reportType === 'Loans' && loans.length === 0) {
      toast({ title: t.noData, variant: "destructive" });
      return;
    }
    
    toast({ title: `${reportType} ${t.exportSuccess}` });
    console.log(`Exporting ${reportType} to CSV...`);
  };

  const reportCards = [
    {
      title: t.borrowerReport,
      description: 'Complete borrower information and loan history',
      icon: FileText,
      data: borrowers
    },
    {
      title: t.loanReport,
      description: 'Detailed loan information and status',
      icon: Calendar,
      data: loans
    },
    {
      title: t.paymentReport,
      description: 'Payment history and collection details',
      icon: DollarSign,
      data: loans.filter(loan => loan.amountPaid > 0)
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200">
        {t.title}
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {borrowers.length}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {t.totalBorrowers}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {loans.length}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                {t.totalLoans}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                ₹{totalCollected.toLocaleString()}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                {t.totalCollected}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                ₹{pendingAmount.toLocaleString()}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                {t.pendingAmount}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {reportCards.map((report, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <report.icon className="w-5 h-5 text-blue-600" />
                {report.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {report.description}
              </p>
              
              <div className="text-center py-2">
                <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {report.data.length} records
                </span>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => exportToPDF(report.title)}
                  className="w-full bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.exportPDF}
                </Button>
                
                <Button
                  onClick={() => exportToExcel(report.title)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.exportExcel}
                </Button>
                
                <Button
                  onClick={() => exportToCSV(report.title)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.exportCSV}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;
