
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  language: string;
  borrowers: any[];
  loans: any[];
  dashboardStats?: any;
}

const Dashboard = ({ language, borrowers, loans, dashboardStats }: DashboardProps) => {
  const translations = {
    en: {
      title: 'Dashboard Overview',
      totalBorrowers: 'Total Borrowers',
      activeLoans: 'Active Loans',
      totalCollected: 'Total Collected',
      overdueLoans: 'Overdue Loans',
      loanStatusDistribution: 'Loan Status Distribution',
      monthlyCollection: 'Recent Loans Overview',
      active: 'Active',
      completed: 'Completed',
      overdue: 'Overdue',
      totalLoanAmount: 'Total Loan Amount',
      pendingAmount: 'Pending Amount'
    },
    ta: {
      title: 'டாஷ்போர்டு அறிக்கை',
      totalBorrowers: 'மொத்த கடன் வாங்குபவர்கள்',
      activeLoans: 'செயலில் உள்ள கடன்கள்',
      totalCollected: 'மொத்த வசூல்',
      overdueLoans: 'தாமதமான கடன்கள்',
      loanStatusDistribution: 'கடன் நிலை விநியோகம்',
      monthlyCollection: 'சமீபத்திய கடன்கள் கண்ணோட்டம்',
      active: 'செயலில்',
      completed: 'முடிந்தது',
      overdue: 'தாமதம்',
      totalLoanAmount: 'மொத்த கடன் தொகை',
      pendingAmount: 'நிலுவையில் உள்ள தொகை'
    }
  };

  const t = translations[language as keyof typeof translations];

  // Calculate statistics from real data
  const totalBorrowers = borrowers.length;
  const activeLoans = loans.filter(loan => loan.status === 'active').length;
  const completedLoans = loans.filter(loan => loan.status === 'completed').length;
  const overdueLoans = loans.filter(loan => loan.status === 'overdue').length;
  const totalCollected = loans.reduce((sum, loan) => sum + (Number(loan.amount_paid) || 0), 0);
  const totalLoanAmount = loans.reduce((sum, loan) => sum + (Number(loan.total_amount) || 0), 0);
  const pendingAmount = totalLoanAmount - totalCollected;

  // Pie chart data
  const pieData = [
    { name: t.active, value: activeLoans, color: '#3b82f6' },
    { name: t.completed, value: completedLoans, color: '#10b981' },
    { name: t.overdue, value: overdueLoans, color: '#ef4444' },
  ];

  // Bar chart data - recent loans
  const recentLoans = loans.slice(0, 6).map((loan, index) => ({
    name: `Loan ${index + 1}`,
    amount: Number(loan.total_amount) || 0,
    paid: Number(loan.amount_paid) || 0
  }));

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

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-orange-200 dark:border-orange-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">
              {t.totalLoanAmount}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">₹{totalLoanAmount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900 dark:to-cyan-800 border-cyan-200 dark:border-cyan-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-800 dark:text-cyan-200">
              {t.pendingAmount}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">₹{pendingAmount.toLocaleString()}</div>
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
              <BarChart data={recentLoans}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#3b82f6" name="Total Amount" />
                <Bar dataKey="paid" fill="#10b981" name="Paid Amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
