import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  Calendar,
  CreditCard,
  Clock,
  User,
  CircleAlert,
} from "lucide-react";
import { getPayments } from "@/lib/database";
import { useQuery } from "@tanstack/react-query";

interface DashboardProps {
  language: string;
  borrowers: any[];
  loans: any[];
  dashboardStats?: any;
}

interface Payment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
}

const Dashboard = ({
  language,
  borrowers,
  loans,
  dashboardStats,
}: DashboardProps) => {
  // Fetch recent payments - fix the queryFn to use proper signature
  const { data: payments = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: () => getPayments(),
  });

  const translations = {
    en: {
      title: "Dashboard Overview",
      totalBorrowers: "Total Borrowers",
      activeLoans: "Active Loans",
      totalCollected: "Total Collected",
      overdueLoans: "Overdue Loans",
      loanStatusDistribution: "Loan Status Distribution",
      monthlyCollection: "Recent Loans Overview",
      recentPayments: "Recent Payments",
      pendingAmount: "Pending Amount",
      overduePayments: "Overdue Payments",
      active: "Active",
      completed: "Completed",
      overdue: "Overdue",
      totalLoanAmount: "Total Loan Amount",
      paymentAmount: "Payment Amount",
      borrowerName: "Borrower",
      paymentDate: "Date",
      noRecentPayments: "No recent payments",
      viewAll: "View All",
      thisWeek: "This Week",
      averagePayment: "Average Payment",
    },
    ta: {
      title: "டாஷ்போர்டு அறிக்கை",
      totalBorrowers: "மொத்த கடன் வாங்குபவர்கள்",
      activeLoans: "செயலில் உள்ள கடன்கள்",
      totalCollected: "மொத்த வசூல்",
      overdueLoans: "தாமதமான கடன்கள்",
      loanStatusDistribution: "கடன் நிலை விநியோகம்",
      monthlyCollection: "சமீபத்திய கடன்கள் கண்ணோட்டம்",
      recentPayments: "சமீபத்திய பணம் செலுத்தல்கள்",
      pendingAmount: "நிலுவையில் உள்ள தொகை",
      overduePayments: "தாமதமான பணம் செலுத்தல்கள்",
      active: "செயலில்",
      completed: "முடிந்தது",
      overdue: "தாமதம்",
      totalLoanAmount: "மொத்த கடன் தொகை",
      paymentAmount: "பணம் செலுத்தும் தொகை",
      borrowerName: "கடன் வாங்குபவர்",
      paymentDate: "தேதி",
      noRecentPayments: "சமீபத்திய பணம் செலுத்தல்கள் இல்லை",
      viewAll: "அனைத்தையும் பார்க்கவும்",
      thisWeek: "இந்த வாரம்",
      averagePayment: "சராசரி பணம் செலுத்தல்",
    },
  };

  const t = translations[language as keyof typeof translations];

  const totalBorrowers = borrowers.length;
  const activeLoans = loans.filter((loan) => loan.status === "active").length;
  const completedLoans = loans.filter(
    (loan) => loan.status === "completed"
  ).length;
    const completedLoansTotalValue = loans.filter(
    (loan) => loan.status === "completed"
  ).reduce((sum, loan) => sum + (Number(loan.total_amount) || 0), 0);

  const overdueLoans = loans.filter((loan) => loan.status === "overdue").length;
  const totalCollected = loans.reduce(
    (sum, loan) => sum + (Number(loan.amount_paid) || 0),
    0
  );
  const totalLoanAmount = loans.reduce(
    (sum, loan) => sum + (Number(loan.total_amount) || 0),
    0
  );
  const pendingAmount = totalLoanAmount - totalCollected;

  const overduePaymentsAmount = loans
    .filter((loan) => loan.status === "overdue")
    .reduce((sum, loan) => sum + (loan.total_amount - loan.amount_paid), 0);

  const recentPayments = payments
    .sort(
      (a, b) =>
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    )
    .slice(0, 10);

  const getBorrowerNameForPayment = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    const name = loan?.borrowerName || "Unknown";

    // Format name with initials
    const parts = name.trim().split(" ");
    if (parts.length === 3) {
      const first = parts[0];
      const second = parts[1].charAt(0).toUpperCase() + ".";
      const third = parts[2];
      return `${first} ${second} ${third}`;
    }
    return name;
  };

  // Add arrears calculation helpers
  const calculateArrears = (loan: any) => {
    const today = new Date();
    const startDate = new Date(loan.start_date);
    const daysSinceStart = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dailyPayment = loan.total_amount / (loan.duration_months * 30);
    const expectedPaymentByNow = Math.min(
      dailyPayment * daysSinceStart,
      loan.total_amount
    );
    const arrears = Math.max(0, expectedPaymentByNow - loan.amount_paid);
    return Math.round(arrears);
  };

  const calculateMissedDays = (loan: any) => {
    const dailyPayment = loan.total_amount / (loan.duration_months * 30);
    const arrears = calculateArrears(loan);
    if (arrears <= 0) return 0;

    const missed = arrears / dailyPayment;

    // If missed is less than 1 but arrears > 0, return 1
    return missed < 1 ? 1 : Math.floor(missed);
  };

  const getLastMissedDate = (loan: any) => {
    const dailyPayment = loan.total_amount / (loan.duration_months * 30);
    const missedDays = calculateMissedDays(loan);
    const startDate = new Date(loan.start_date);
    // Last missed date is start date + (paid days + missedDays - 1)
    const paidDays = Math.floor(loan.amount_paid / dailyPayment);
    const lastMissedDayIndex = paidDays + missedDays - 1;
    const lastMissedDate = new Date(startDate);
    lastMissedDate.setDate(startDate.getDate() + lastMissedDayIndex);
    return lastMissedDate.toLocaleDateString(undefined, {
      year: "2-digit",
      month: "short",
      day: "2-digit",
    });
  };

  const formatBorrowerName = (loan: any) => {
    if (loan.borrowerName) {
      const parts = loan.borrowerName.trim().split(" ");
      if (parts.length === 3) {
        const first = parts[0];
        const second = parts[1].charAt(0).toUpperCase() + ".";
        const third = parts[2];
        return `${first} ${second} ${third}`;
      }
      return loan.borrowerName;
    }
    return "Unknown";
  };

  // Arrears and Overdue stats
  const arrearsLoans = loans.filter((loan) => calculateArrears(loan) > 0);
  const arrearsLoansCount = arrearsLoans.length;
  const arrearsLoansTotalValue = arrearsLoans.reduce(
    (sum, loan) => sum + calculateArrears(loan),
    0
  );

  const overdueLoansList = loans.filter((loan) => {
    const startDate = new Date(loan.start_date);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + loan.duration_months);
    const today = new Date();
    return today > endDate && loan.amount_paid < loan.total_amount;
  });
  const overdueLoansCount = overdueLoansList.length;
  const overdueLoansTotalValue = overdueLoansList.reduce(
    (sum, loan) => sum + (loan.total_amount - loan.amount_paid),
    0
  );

  return (
    <div className="w-full p-6 py-6 space-y-6 pt-5">
      <h2 className="text-3xl font-bold text-left text-gray-800 dark:text-gray-200 justify-center gap-3">
        {t.title}
      </h2>

      {/* Combined Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Combined Loan Counts Card */}
        <Card className="bg-gradient-to-br from-blue-50/10 to-blue-200 dark:from-blue-900 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:shadow-lg dark:hover:shadow-blue-900/40 transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-extrabold text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              Loan Counts Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-left">
                <span className="text-sm font-bold text-blue-900 dark:text-blue-400">
                  Loans
                </span>
                <span className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                  {loans.length}
                </span>
              </div>
              <div className="flex flex-col items-left">
                <span className="text-sm font-bold text-orange-700 dark:text-orange-400">
                  Borrowers
                </span>
                <span className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                  {totalBorrowers}
                </span>
              </div>
              <div className="flex flex-col items-left">
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  Arrears
                </span>
                <span className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {arrearsLoansCount}
                </span>
              </div>
              <div className="flex flex-col items-left">
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  Active
                </span>
                <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {activeLoans}
                </span>
              </div>

              <div className="flex flex-col items-left">
                <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                  Overdue
                </span>
                <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                  {overdueLoansCount}
                </span>
              </div>
              <div className="flex flex-col items-left">
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  Completed
                </span>
                <span className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  {completedLoans}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Combined Loan Values Card */}
        <Card className="bg-gradient-to-br from-purple-50/10 to-purple-200 dark:from-purple-900 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:shadow-lg dark:hover:shadow-purple-900/40 transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-extrabold text-purple-800 dark:text-purple-200 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-200" />
              Loan Values Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-left">
                <span className="text-sm font-bold text-purple-800 dark:text-purple-400">
                  Total Value
                </span>
                <span className="text-lg font-bold text-purple-900 dark:text-purple-400">
                  ₹ {totalLoanAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col items-left">
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  Collected
                </span>
                <span className="text-lg font-bold text-green-700 dark:text-green-400">
                  ₹ {totalCollected.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col items-left">
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  Pending
                </span>
                <span className="text-lg font-bold text-orange-700 dark:text-orange-400">
                  ₹ {pendingAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col items-left">
                <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
                  Arrears
                </span>
                <span className="text-lg font-bold text-pink-700 dark:text-pink-400">
                  ₹ {arrearsLoansTotalValue.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col items-left">
                <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                  Overdue
                </span>
                <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                  ₹ {overdueLoansTotalValue.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col items-left">
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  Completed
                </span>
                <span className="text-lg font-bold text-cyan-700 dark:text-cyan-400">
                  ₹ {completedLoansTotalValue.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards Show */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Amount vs Paid Scatter Plot */}
        <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Loan Amount vs Paid
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-2">
            <div className="flex-1 w-full h-[260px] min-h-[220px] overflow-x-auto">
              <ResponsiveContainer
                width={Math.max(600, loans.slice(0, 10).length * 120)}
                height="100%"
              >
                <BarChart
                  data={loans.slice(0, 10).map((loan) => ({
                    name: loan.borrowerName || "Unknown",
                    amount: Number(loan.total_amount) || 0,
                    paid: Number(loan.amount_paid) || 0,
                  }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  barCategoryGap={18}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={
                      typeof window !== "undefined" &&
                      document.documentElement.classList.contains("dark")
                        ? "#374151"
                        : "#e5e7eb"
                    }
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 12,
                      fill:
                        typeof window !== "undefined" &&
                        document.documentElement.classList.contains("dark")
                          ? "#d1d5db"
                          : "#374151",
                    }}
                    interval={0}
                    height={36}
                  />
                  <YAxis
                    tickFormatter={(v) => `₹ ${v.toLocaleString()}`}
                    width={70}
                    tick={{
                      fontSize: 12,
                      fill:
                        typeof window !== "undefined" &&
                        document.documentElement.classList.contains("dark")
                          ? "#d1d5db"
                          : "#374151",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        typeof window !== "undefined" &&
                        document.documentElement.classList.contains("dark")
                          ? "#1f2937"
                          : "#ffffff",
                      color:
                        typeof window !== "undefined" &&
                        document.documentElement.classList.contains("dark")
                          ? "#f3f4f6"
                          : "#111827",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                    formatter={(value: number) => [
                      `₹${Number(value).toLocaleString()}`,
                    ]}
                  />
                  <Bar
                    dataKey="amount"
                    name="Total Amount"
                    fill="#3b82f6"
                    barSize={22}
                    radius={[4, 4, 0, 0]}
                    onMouseOver={(e) =>
                      e.target && (e.target.style.fill = "#2563eb")
                    }
                    onMouseOut={(e) =>
                      e.target && (e.target.style.fill = "#3b82f6")
                    }
                  />
                  <Bar
                    dataKey="paid"
                    name="Paid Amount"
                    fill="#10b981"
                    barSize={14}
                    radius={[4, 4, 0, 0]}
                    onMouseOver={(e) =>
                      e.target && (e.target.style.fill = "#059669")
                    }
                    onMouseOut={(e) =>
                      e.target && (e.target.style.fill = "#10b981")
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend below the graph */}
            <div className="flex gap-5 mt-2 justify-center pb-2">
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded bg-green-400" />
                <span className="text-xs text-gray-700 dark:text-white">
                  Paid
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded bg-blue-500" />
                <span className="text-xs text-gray-700 dark:text-gray-200">
                  Total
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              {t.recentPayments}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {recentPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t.noRecentPayments}</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-3">
                {recentPayments.map((payment) => {
                  const loan = loans.find((l) => l.id === payment.loan_id);
                  const remainingAmount = loan
                    ? loan.total_amount - loan.amount_paid
                    : 0;
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {getBorrowerNameForPayment(payment.loan_id)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {payment.payment_date}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 dark:text-green-500 flex items-center gap-1">
                          ₹ {payment.amount.toLocaleString()}
                        </div>
                        {remainingAmount > 0 && (
                          <div className="text-xs font-bold text-red-600 dark:text-red-500">
                            ₹ {remainingAmount.toLocaleString()}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {payment.payment_method}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Arrears Borrowers Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-left flex items-left justify-left gap-2">
              <CircleAlert className="w-5 h-5 text-red-600" />
              Arrears Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Use dynamic arrears calculation */}
            {loans.filter((loan) => calculateArrears(loan) > 0).length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No arrears found</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-3">
                {loans
                  .filter((loan) => calculateArrears(loan) > 0)
                  .sort((a, b) => calculateArrears(b) - calculateArrears(a))
                  .map((loan) => {
                    const arrears = calculateArrears(loan);
                    const missedDays = calculateMissedDays(loan);
                    const lastMissedDate = getLastMissedDate(loan);

                    return (
                      <div
                        key={loan.id}
                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/50 transition-colors"
                      >
                        {/* Left section: Borrower name and last missed date */}
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex flex-col">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {formatBorrowerName(loan)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Last Missed: {lastMissedDate}
                            </div>
                          </div>
                        </div>

                        {/* Right section: Arrears amount and missed days */}
                        <div className="flex flex-col items-end text-right">
                          <div className="font-bold text-red-700 dark:text-red-500 flex items-center gap-1">
                            ₹ {arrears.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Missing: {missedDays} days
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Loan Details Section - After Duration Loans */}
        <div className="flex-1 min-w-0">
          <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Overdue Loans
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {loans.filter((loan) => {
                // Calculate end date based on start date + duration_months
                const startDate = new Date(loan.start_date);
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + loan.duration_months);
                const today = new Date();

                // Show loans that are past duration and not fully settled
                return today > endDate && loan.amount_paid < loan.total_amount;
              }).length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No overdue loans after duration</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {loans
                    .filter((loan) => {
                      // Calculate end date based on start date + duration_months
                      const startDate = new Date(loan.start_date);
                      const endDate = new Date(startDate);
                      endDate.setMonth(
                        endDate.getMonth() + loan.duration_months
                      );
                      const today = new Date();

                      // Show loans that are past duration and not fully settled
                      return (
                        today > endDate && loan.amount_paid < loan.total_amount
                      );
                    })
                    .sort((a, b) => {
                      // Sort by pending amount (highest first)
                      const pendingA = a.total_amount - a.amount_paid;
                      const pendingB = b.total_amount - b.amount_paid;
                      return pendingB - pendingA;
                    })
                    .map((loan) => {
                      // Calculate end date
                      const startDate = new Date(loan.start_date);
                      const endDate = new Date(startDate);
                      endDate.setMonth(
                        endDate.getMonth() + loan.duration_months
                      );
                      const endDateStr = endDate.toISOString().slice(0, 10);
                      const pendingAmount =
                        loan.total_amount - loan.amount_paid;

                      return (
                        <div
                          key={loan.id}
                          className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {loan.borrowerName
                                  ? (() => {
                                      const parts = loan.borrowerName
                                        .trim()
                                        .split(" ");
                                      if (parts.length === 3) {
                                        const first = parts[0];
                                        const second =
                                          parts[1].charAt(0).toUpperCase() +
                                          ".";
                                        const third = parts[2];
                                        return `${first} ${second} ${third}`;
                                      }
                                      return loan.borrowerName;
                                    })()
                                  : "Unknown"}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                Loan: {loan.total_amount.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                Start: {loan.start_date} | End: {endDateStr}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-orange-700 dark:text-orange-400">
                              Overdue: ₹ {pendingAmount.toLocaleString()}
                            </div>
                            <div className="text-xs font-bold text-green-600 dark:text-green-600">
                              Paid: ₹ {loan.amount_paid.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">
                              {loan.status}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
