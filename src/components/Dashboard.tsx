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

  return (
    <div className="w-full p-6 py-6 space-y-6 pt-5">
      <h2 className="text-3xl font-bold text-left text-gray-800 dark:text-gray-200 justify-center gap-3">
        {t.title}
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50/10 to-blue-200 dark:from-blue-900 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:shadow-lg dark:hover:shadow-blue-900/40 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-white">
              {t.totalBorrowers}
            </CardTitle>
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {totalBorrowers}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-100/20 to-green-200 dark:from-green-900 dark:to-green-800/20 border-green-200 dark:border-green-700 hover:shadow-lg dark:hover:shadow-green-900/40 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-white">
              {t.activeLoans}
            </CardTitle>
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {activeLoans}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-100/20 to-red-200 dark:from-red-900 dark:to-red-800/20 border-red-200 dark:border-red-700 hover:shadow-lg dark:hover:shadow-red-900/40 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-white">
              {t.overdueLoans}
            </CardTitle>
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900 dark:text-red-100">
              {overdueLoans}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-100/20 to-purple-200 dark:from-purple-900 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:shadow-lg dark:hover:shadow-purple-900/40 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-white">
              {t.totalCollected}
            </CardTitle>
            <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              ₹ {totalCollected.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-100/20 to-orange-200 dark:from-orange-500 dark:to-orange-600/20 border-orange-200 dark:border-orange-700 hover:shadow-lg dark:hover:shadow-orange-900/40 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-white">
              {t.pendingAmount}
            </CardTitle>
            <Clock className="h-6 w-6 text-orange-600 dark:text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              ₹ {pendingAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-100/20 to-cyan-200 dark:from-cyan-900 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-700 hover:shadow-lg dark:hover:shadow-cyan-900/40 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-800 dark:text-white">
              {t.overduePayments}
            </CardTitle>
            <AlertTriangle className="h-6 w-6 text-cyan-600 dark:text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">
              ₹ {overduePaymentsAmount.toLocaleString()}
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
                    onMouseOver={(e) => (e.target.style.fill = "#2563eb")}
                    onMouseOut={(e) => (e.target.style.fill = "#3b82f6")}
                  />
                  <Bar
                    dataKey="paid"
                    name="Paid Amount"
                    fill="#10b981"
                    barSize={14}
                    radius={[4, 4, 0, 0]}
                    onMouseOver={(e) => (e.target.style.fill = "#059669")}
                    onMouseOut={(e) => (e.target.style.fill = "#10b981")}
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
              Arrears Borrowers Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loans.filter((loan) => loan.status === "overdue" || (loan.arrears && loan.arrears > 0)).length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No arrears found</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-3">
                {loans
                  .filter((loan) => loan.status === "overdue" || (loan.arrears && loan.arrears > 0))
                  .sort((a, b) => {
                    // Sort by arrears amount (highest first)
                    const arrearsA = a.arrears || 0;
                    const arrearsB = b.arrears || 0;
                    return arrearsB - arrearsA;
                  })
                  .map((loan) => {
                    const arrears = loan.arrears || 0;
                    const dailyPayment = loan.total_amount / (loan.duration_months * 30);
                    
                    return (
                      <div
                        key={loan.id}
                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {loan.borrowerName ? (() => {
                                const parts = loan.borrowerName.trim().split(" ");
                                if (parts.length === 3) {
                                  const first = parts[0];
                                  const second = parts[1].charAt(0).toUpperCase() + ".";
                                  const third = parts[2];
                                  return `${first} ${second} ${third}`;
                                }
                                return loan.borrowerName;
                              })() : "Unknown"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              Amount: ₹{loan.principal_amount.toLocaleString()} | Rate: {loan.interest_rate}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Daily: ₹{dailyPayment.toFixed(0)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-700 dark:text-red-300 flex items-center gap-1">
                            Arrears: ₹{arrears.toLocaleString()}
                          </div>
                          <div className="text-xs text-red-600 dark:text-red-400">
                            Remaining: ₹{(loan.total_amount - loan.amount_paid).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
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

        {/* Pending Loan Details Section */}
        <div className="flex-1 min-w-0">
          <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                {t.pendingAmount} {t.overdueLoans}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {loans.filter(
                (loan) => loan.status === "active" || loan.status === "overdue"
              ).length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending loans</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {loans
                    .filter(
                      (loan) =>
                        loan.status === "active" || loan.status === "overdue"
                    )
                    .sort((a, b) => {
                      // Overdue loans first, then by due date if available
                      if (a.status !== b.status) {
                        return a.status === "overdue" ? -1 : 1;
                      }
                      return 0;
                    })
                    .map((loan) => {
                      // Calculate actual loan end date: created_date + duration (assuming duration is in days)
                      let endDateStr = "No end date";
                      if (loan.created_date && loan.duration) {
                        const created = new Date(loan.created_date);
                        const durationDays = Number(loan.duration);
                        if (!isNaN(created.getTime()) && !isNaN(durationDays)) {
                          const endDate = new Date(created);
                          endDate.setDate(endDate.getDate() + durationDays);
                          endDateStr = `End: ${endDate
                            .toISOString()
                            .slice(0, 10)}`;
                        }
                      } else if (loan.due_date) {
                        endDateStr = `End: ${loan.due_date}`;
                      }
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
                                {loan.borrowerName ? (() => {
                                  const parts = loan.borrowerName.trim().split(" ");
                                  if (parts.length === 3) {
                                    const first = parts[0];
                                    const second = parts[1].charAt(0).toUpperCase() + ".";
                                    const third = parts[2];
                                    return `${first} ${second} ${third}`;
                                  }
                                  return loan.borrowerName;
                                })() : "Unknown"}
                              </div>
                              {endDateStr && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {endDateStr}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-orange-700 dark:text-orange-300 flex items-center gap-1">
                              ₹{" "}
                              {(
                                loan.total_amount - loan.amount_paid
                              ).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
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
