import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Plus, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AIInsightsCard from "@/components/dashboard/AIInsightsCard";
import { useWallets } from "@/hooks/useWallets";
import { useTransactions } from "@/hooks/useTransactions";
import { useRecurringBills } from "@/hooks/useRecurringBills";
import { useProfile } from "@/hooks/useProfile";
import { useBudgets } from "@/hooks/useBudgets";
import { useGoals } from "@/hooks/useGoals";
import { Link } from "react-router-dom";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
};

const Dashboard = () => {
  const { profile } = useProfile();
  const { wallets, totalBalance, isLoading: walletsLoading } = useWallets();
  const { budgets } = useBudgets();
  const { goals } = useGoals();
  const { bills: recurringBills, totalMonthlyBills, isLoading: billsLoading } = useRecurringBills();
  const recurringBillsCount = recurringBills.length;
  
  // Get current month transactions
  const now = new Date();
  const startDate = format(startOfMonth(now), "yyyy-MM-dd");
  const endDate = format(endOfMonth(now), "yyyy-MM-dd");
  
  const { transactions, totalIncome, totalExpenses: transactionExpenses, isLoading: transactionsLoading } = useTransactions({
    startDate,
    endDate,
  });

  // Combine transaction expenses with recurring bills for total expenses
  const totalExpenses = transactionExpenses + totalMonthlyBills;

  const currencySymbol = currencySymbols[profile?.currency || "INR"] || "₹";
  const isLoading = walletsLoading || transactionsLoading || billsLoading;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Number(((savings / totalIncome) * 100).toFixed(1)) : 0;

  // Calculate budget utilization
  const budgetUtilization = budgets.length > 0 
    ? budgets.reduce((sum, b) => {
        const spent = transactions
          .filter(t => t.type === "expense" && t.category_id === b.category_id)
          .reduce((s, t) => s + Number(t.amount), 0);
        return sum + (spent / Number(b.amount)) * 100;
      }, 0) / budgets.length
    : undefined;

  // Calculate goal progress
  const goalProgress = goals.length > 0
    ? goals
        .filter(g => g.status === "active")
        .reduce((sum, g) => sum + (Number(g.current_amount) / Number(g.target_amount)) * 100, 0) / 
        goals.filter(g => g.status === "active").length
    : undefined;

  // Prepare chart data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return format(date, "yyyy-MM-dd");
  });

  const chartData = last7Days.map((date) => {
    const dayTransactions = transactions.filter((t) => t.transaction_date === date);
    const income = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      date: format(new Date(date), "dd MMM"),
      income,
      expenses,
    };
  });

  // Category breakdown - includes both transactions and recurring bills
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    
    // Add transaction expenses
    transactions
      .filter((t) => t.type === "expense" && t.category)
      .forEach((t) => {
        const categoryName = t.category?.name || "Other";
        breakdown[categoryName] = (breakdown[categoryName] || 0) + Number(t.amount);
      });
    
    // Add recurring bills (with monthly equivalent)
    const getMonthlyEquivalent = (amount: number, frequency: string): number => {
      switch (frequency) {
        case "weekly": return amount * 4.33;
        case "quarterly": return amount / 3;
        case "yearly": return amount / 12;
        default: return amount;
      }
    };
    
    recurringBills.forEach((bill) => {
      const categoryName = bill.category || "Bills & Utilities";
      breakdown[categoryName] = (breakdown[categoryName] || 0) + getMonthlyEquivalent(Number(bill.amount), bill.frequency);
    });
    
    return breakdown;
  }, [transactions, recurringBills]);

  const categoryData: { name: string; amount: number }[] = Object.entries(categoryBreakdown)
    .map(([name, amount]) => ({ name, amount: Number(amount) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}
              {profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your financial overview for {format(now, "MMMM yyyy")}
            </p>
          </div>
          <Link to="/transactions">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                <Wallet className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-display">{currencySymbol}{formatAmount(totalBalance)}</p>
                <p className="text-xs text-muted-foreground mt-1">{wallets.length} active wallets</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Income</CardTitle>
                <ArrowUpRight className="w-4 h-4 text-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-display text-foreground">{currencySymbol}{formatAmount(totalIncome)}</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        {recurringBillsCount > 0 && (
                          <RefreshCw className="w-3 h-3 text-primary" />
                        )}
                        <ArrowDownRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <p>Transactions: {currencySymbol}{formatAmount(transactionExpenses)}</p>
                        {recurringBillsCount > 0 && (
                          <p>Recurring Bills: {currencySymbol}{formatAmount(totalMonthlyBills)}</p>
                        )}
                      </div>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-display">{currencySymbol}{formatAmount(totalExpenses)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {recurringBillsCount > 0 
                    ? `Includes ${recurringBillsCount} recurring bill${recurringBillsCount > 1 ? 's' : ''}` 
                    : 'This month'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Savings</CardTitle>
                {savings >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-foreground" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold font-display ${savings >= 0 ? "text-foreground" : "text-muted-foreground"}`}>
                  {currencySymbol}{formatAmount(Math.abs(savings))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{savingsRate}% savings rate</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AIInsightsCard
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              totalBalance={totalBalance}
              savingsRate={savingsRate}
              topCategory={categoryData[0]}
              goalProgress={goalProgress}
              budgetUtilization={budgetUtilization}
            />
          </div>
          
          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="border-border/50 h-full">
                <CardContent className="p-4 flex flex-col justify-center h-full">
                  <p className="text-xs text-muted-foreground">Active Budgets</p>
                  <p className="text-2xl font-bold">{budgets.length}</p>
                  <Link to="/budgets" className="text-xs text-primary hover:underline mt-1">
                    Manage Budgets →
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border/50 h-full">
                <CardContent className="p-4 flex flex-col justify-center h-full">
                  <p className="text-xs text-muted-foreground">Active Goals</p>
                  <p className="text-2xl font-bold">{goals.filter(g => g.status === "active").length}</p>
                  <Link to="/goals" className="text-xs text-primary hover:underline mt-1">
                    View Goals →
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Card className="border-border/50 h-full">
                <CardContent className="p-4 flex flex-col justify-center h-full">
                  <p className="text-xs text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">{transactions.length}</p>
                  <p className="text-xs text-muted-foreground">transactions</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-border/50 h-full">
                <CardContent className="p-4 flex flex-col justify-center h-full">
                  <p className="text-xs text-muted-foreground">AI Coach</p>
                  <p className="text-lg font-semibold">Get Insights</p>
                  <Link to="/ai-coach" className="text-xs text-primary hover:underline mt-1">
                    Start Chat →
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expenses Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Income vs Expenses</CardTitle>
                <p className="text-sm text-muted-foreground">Last 7 days</p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `${currencySymbol}${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${currencySymbol}${formatAmount(value)}`, '']}
                      />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke="hsl(142, 76%, 36%)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#incomeGradient)"
                        name="Income"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="hsl(0, 84%, 60%)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#expenseGradient)"
                        name="Expenses"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Top Expense Categories</CardTitle>
                <p className="text-sm text-muted-foreground">This month</p>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                          width={100}
                        />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => [`${currencySymbol}${formatAmount(value)}`, 'Amount']}
                        />
                        <Bar 
                          dataKey="amount" 
                          fill="hsl(var(--foreground))" 
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No expenses recorded yet
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Wallets & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Your Wallets</CardTitle>
                  <p className="text-sm text-muted-foreground">{wallets.length} accounts</p>
                </div>
                <Link to="/wallets">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {wallets.length > 0 ? (
                  wallets.slice(0, 4).map((wallet) => (
                    <div
                      key={wallet.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{wallet.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{wallet.type.replace("_", " ")}</p>
                        </div>
                      </div>
                      <p className="font-semibold">{currencySymbol}{formatAmount(Number(wallet.balance))}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No wallets yet</p>
                    <Link to="/wallets" className="text-foreground hover:underline text-sm">
                      Add your first wallet
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Transactions</CardTitle>
                  <p className="text-sm text-muted-foreground">Latest activity</p>
                </div>
                <Link to="/transactions">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === "income" ? "bg-foreground/10" : "bg-muted"
                        }`}>
                          {tx.type === "income" ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.category?.name || "Uncategorized"}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(tx.transaction_date), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                      <p className={`font-semibold ${tx.type === "income" ? "text-foreground" : ""}`}>
                        {tx.type === "income" ? "+" : "-"}{currencySymbol}{formatAmount(Number(tx.amount))}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No transactions yet</p>
                    <Link to="/transactions" className="text-foreground hover:underline text-sm">
                      Add your first transaction
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
