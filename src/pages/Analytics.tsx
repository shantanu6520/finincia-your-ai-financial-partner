import { motion } from "framer-motion";
import { Activity, TrendingUp, AlertTriangle, BarChart3, Sparkles, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CashFlowForecast from "@/components/analytics/CashFlowForecast";
import BudgetPredictions from "@/components/analytics/BudgetPredictions";
import AnomalyDetection from "@/components/analytics/AnomalyDetection";
import TrendProjections from "@/components/analytics/TrendProjections";
import { usePredictiveAnalytics } from "@/hooks/usePredictiveAnalytics";
import { useProfile } from "@/hooks/useProfile";
import { useWallets } from "@/hooks/useWallets";

const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
};

const Analytics = () => {
  const { profile } = useProfile();
  const { totalBalance } = useWallets();
  const {
    isLoading,
    cashFlowForecast,
    cashFlowInsights,
    budgetPredictions,
    anomalies,
    trendData,
    summary,
    dailyAverages,
  } = usePredictiveAnalytics();

  const currencySymbol = currencySymbols[profile?.currency || "INR"] || "₹";

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Predictive Analytics
                </h1>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  PRO
                </Badge>
              </div>
              <p className="text-muted-foreground">
                AI-powered insights into your financial future
              </p>
            </div>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                30-Day Forecast
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-display">
                {currencySymbol}{formatAmount(summary.forecast30Day)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Projected balance
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Savings
              </CardTitle>
              <BarChart3 className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold font-display ${summary.projectedMonthlySavings >= 0 ? "text-primary" : "text-destructive"}`}>
                {summary.projectedMonthlySavings >= 0 ? "+" : ""}{currencySymbol}{formatAmount(Math.abs(summary.projectedMonthlySavings))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Projected this month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Budget Alerts
              </CardTitle>
              <AlertTriangle className={`w-4 h-4 ${summary.criticalBudgets > 0 ? "text-destructive" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-display">
                {summary.criticalBudgets + summary.highRiskBudgets}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.criticalBudgets} critical, {summary.highRiskBudgets} high risk
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Anomalies Detected
              </CardTitle>
              <Activity className={`w-4 h-4 ${summary.alertAnomalies > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-display">
                {summary.totalAnomalies}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.alertAnomalies} require attention
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cash Flow Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CashFlowForecast
            data={cashFlowForecast}
            currentBalance={totalBalance}
            forecast30Day={summary.forecast30Day}
            forecast60Day={summary.forecast60Day}
            forecast90Day={summary.forecast90Day}
            currencySymbol={currencySymbol}
            formatAmount={formatAmount}
            insights={cashFlowInsights}
          />
        </motion.div>

        {/* Budget Predictions & Anomaly Detection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <BudgetPredictions
              predictions={budgetPredictions}
              currencySymbol={currencySymbol}
              formatAmount={formatAmount}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AnomalyDetection
              anomalies={anomalies}
              currencySymbol={currencySymbol}
              formatAmount={formatAmount}
            />
          </motion.div>
        </div>

        {/* Trend Projections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <TrendProjections
            data={trendData}
            currencySymbol={currencySymbol}
            formatAmount={formatAmount}
          />
        </motion.div>

        {/* Daily Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Daily Financial Pulse</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                  <p className="text-sm text-muted-foreground">Average Daily Income</p>
                  <p className="text-xl font-bold text-primary mt-1">
                    {currencySymbol}{formatAmount(dailyAverages.income)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Based on last 30 days</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                  <p className="text-sm text-muted-foreground">Average Daily Expense</p>
                  <p className="text-xl font-bold mt-1">
                    {currencySymbol}{formatAmount(dailyAverages.expense)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Based on last 30 days</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                  <p className="text-sm text-muted-foreground">Net Daily Change</p>
                  <p className={`text-xl font-bold mt-1 ${dailyAverages.income - dailyAverages.expense >= 0 ? "text-primary" : "text-destructive"}`}>
                    {dailyAverages.income - dailyAverages.expense >= 0 ? "+" : ""}{currencySymbol}{formatAmount(dailyAverages.income - dailyAverages.expense)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Average savings/day</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
