
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  language: string;
  borrowers: any[];
  loans: any[];
}

const Dashboard = ({ language, borrowers, loans }: DashboardProps) => {
  const translations = {
    en: {
      title: 'Dashboard Overview',
      totalBorrowers: 'Total Borrowers',
      activeLoans: 'Active Loans',
      totalCollected: 'Total Collected',
      overdueLoans: 'Overdue Loans',
      loanStatusDistribution: 'Loan Status Distribution',
      monthlyCollection: 'Monthly Collection Trend',
      active: 'Active',
      completed: 'Completed',
      overdue: 'Overdue'
    },
    ta: {
      title: 'டாஷ்போர்டு அறிக்கை',
      totalBorrowers: 'மொத்த கடன் வாங்குபவர்கள்',
      activeLoans: 'செயலில் உள்ள கடன்கள்',
      totalCollected: 'மொத்த வசூல்',
      overdueLoans: 'தாமதமான கடன்கள்',
      loanStatusDistribution: 'கடன் நிலை விநியோகம்',
      monthlyCollection: 'மாதாந்திர வசூல் போக்கு',
      active: 'செயலில்',
      completed: 'முடிந்தது',
      overdue: 'தாமதம்'
    }
  };

  const t = translations[language as keyof typeof translations];

  // Calculate statistics
  const totalBorrowers = borrowers.length;
  const activeLoans = loans.filter(loan => loan.status === 'active').length;
  const completedLoans = loans.filter(loan => loan.status === 'completed').length;
  const overdueLoans = loans.filter(loan => loan.status === 'overdue').length;
  const totalCollected = loans.reduce((sum, loan) => sum + (loan.amountPaid || 0), 0);

  // Pie chart data
  const pieData = [
    { name: t.active, value: activeLoans, color: '#3b82f6' },
    { name: t.completed, value: completedLoans, color: '#10b981' },
    { name: t.overdue, value: overdueLoans, color: '#ef4444' },
  ];

  // Bar chart data (mock monthly data)
  const barData = [
    { month: 'Jan', amount: 25000 },
    { month: 'Feb', amount: 30000 },
    { month: 'Mar', amount: 28000 },
    { month: 'Apr', amount: 35000 },
    { month: 'May', amount: 32000 },
    { month: 'Jun', amount: 38000 },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200">
        {t.title}
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {t.totalBorrowers}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalBorrowers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
              {t.activeLoans}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{activeLoans}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">
              {t.totalCollected}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">₹{totalCollected.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 border-red-200 dark:border-red-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">
              {t.overdueLoans}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{overdueLoans}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t.loanStatusDistribution}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t.monthlyCollection}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
