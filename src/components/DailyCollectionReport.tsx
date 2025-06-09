
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Download, TrendingUp } from 'lucide-react';
import { getPayments, type Payment } from '@/lib/database';

interface DailyCollectionReportProps {
  language: string;
}

const DailyCollectionReport = ({ language }: DailyCollectionReportProps) => {
  const [todayPayments, setTodayPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    en: {
      title: 'Daily Collection Report',
      totalCollected: 'Total Collected Today',
      totalTransactions: 'Total Transactions',
      averagePayment: 'Average Payment',
      noPayments: 'No payments collected today',
      loadReport: 'Load Today\'s Report',
      export: 'Export Report',
      time: 'Time',
      amount: 'Amount',
      method: 'Method'
    },
    ta: {
      title: 'தினசரி வசூல் அறிக்கை',
      totalCollected: 'இன்று மொத்தம் வசூலிக்கப்பட்டது',
      totalTransactions: 'மொத்த பரிவர்த்தனைகள்',
      averagePayment: 'சராசரி பணம்',
      noPayments: 'இன்று பணம் வசூலிக்கப்படவில்லை',
      loadReport: 'இன்றைய அறிக்கையை ஏற்றவும்',
      export: 'அறிக்கையை ஏற்றுமதி செய்யவும்',
      time: 'நேரம்',
      amount: 'தொகை',
      method: 'முறை'
    }
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    loadTodayReport();
  }, []);

  const loadTodayReport = async () => {
    setIsLoading(true);
    try {
      const allPayments = await getPayments();
      const today = new Date().toISOString().split('T')[0];
      const todayOnly = allPayments.filter(payment => 
        payment.payment_date === today
      );
      setTodayPayments(todayOnly);
    } catch (error) {
      console.error('Error loading daily report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCollected = todayPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const totalTransactions = todayPayments.length;
  const averagePayment = totalTransactions > 0 ? totalCollected / totalTransactions : 0;

  const handleExport = () => {
    // Simple CSV export
    const csvContent = [
      ['Time', 'Amount', 'Method', 'Notes'],
      ...todayPayments.map(payment => [
        new Date(payment.payment_date).toLocaleTimeString(),
        payment.amount.toString(),
        payment.payment_method || 'cash',
        payment.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-collection-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            {t.title}
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={loadTodayReport} disabled={isLoading} size="sm" variant="outline">
              {isLoading ? 'Loading...' : t.loadReport}
            </Button>
            {todayPayments.length > 0 && (
              <Button onClick={handleExport} size="sm" variant="outline">
                <Download className="w-4 h-4 mr-1" />
                {t.export}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">{t.totalCollected}</span>
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              ₹{totalCollected.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">{t.totalTransactions}</span>
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {totalTransactions}
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-purple-700 dark:text-purple-300">{t.averagePayment}</span>
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              ₹{averagePayment.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Payments List */}
        {todayPayments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {t.noPayments}
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Today's Payments</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {todayPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        ₹{Number(payment.amount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(payment.payment_date + 'T' + (payment.created_at ? new Date(payment.created_at).toTimeString().split(' ')[0] : '00:00:00')).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {payment.payment_method || 'cash'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyCollectionReport;
