import { useMemo } from "react";
import { useTransactions } from "./useTransactions";
import { useBudgets } from "./useBudgets";
import { useWallets } from "./useWallets";
import { format, subDays, addDays, startOfMonth, endOfMonth, differenceInDays } from "date-fns";

export interface CashFlowForecast {
  date: string;
  actual?: number;
  predicted: number;
  confidenceLow: number;
  confidenceHigh: number;
  isForecasted: boolean;
}

export interface BudgetPrediction {
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  currentSpent: number;
  predictedSpent: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  daysRemaining: number;
  dailyBurnRate: number;
  predictedOverrun: number;
  suggestions: string[];
}

export interface SpendingAnomaly {
  id: string;
  type: "spike" | "unusual_category" | "frequency_change" | "large_transaction";
  severity: "info" | "warning" | "alert";
  title: string;
  description: string;
  amount?: number;
  categoryName?: string;
  date?: string;
  percentageChange?: number;
}

export interface TrendData {
  date: string;
  actual?: number;
  forecast?: number;
  category?: string;
}

export const usePredictiveAnalytics = () => {
  const now = new Date();
  const startDate = format(subDays(now, 90), "yyyy-MM-dd");
  const endDate = format(now, "yyyy-MM-dd");

  const { transactions, isLoading: txLoading } = useTransactions({ startDate, endDate });
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { wallets, totalBalance, isLoading: walletsLoading } = useWallets();

  const isLoading = txLoading || budgetsLoading || walletsLoading;

  // Calculate daily averages from historical data
  const dailyAverages = useMemo(() => {
    if (transactions.length === 0) return { income: 0, expense: 0 };

    const last30Days = transactions.filter(
      (t) => new Date(t.transaction_date) >= subDays(now, 30)
    );

    const totalIncome = last30Days
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = last30Days
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      income: totalIncome / 30,
      expense: totalExpense / 30,
    };
  }, [transactions, now]);

  // Cash Flow Forecasting (30/60/90 days)
  const cashFlowForecast = useMemo((): CashFlowForecast[] => {
    const data: CashFlowForecast[] = [];
    let runningBalance = totalBalance;

    // Historical data (last 14 days)
    for (let i = 13; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      const dayIncome = transactions
        .filter((t) => t.transaction_date === dateStr && t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const dayExpense = transactions
        .filter((t) => t.transaction_date === dateStr && t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const dayBalance = i === 13 
        ? totalBalance - transactions
            .filter((t) => new Date(t.transaction_date) > date)
            .reduce((sum, t) => sum + (t.type === "income" ? Number(t.amount) : -Number(t.amount)), 0)
        : data[data.length - 1]?.actual || totalBalance;

      data.push({
        date: format(date, "dd MMM"),
        actual: dayBalance + dayIncome - dayExpense,
        predicted: dayBalance + dayIncome - dayExpense,
        confidenceLow: (dayBalance + dayIncome - dayExpense) * 0.95,
        confidenceHigh: (dayBalance + dayIncome - dayExpense) * 1.05,
        isForecasted: false,
      });
    }

    // Forecast (next 90 days)
    let forecastBalance = totalBalance;
    const dailyNetChange = dailyAverages.income - dailyAverages.expense;
    const volatility = Math.abs(dailyNetChange) * 0.15; // 15% volatility

    for (let i = 1; i <= 90; i++) {
      const date = addDays(now, i);
      forecastBalance += dailyNetChange;
      
      // Confidence bands widen over time
      const confidenceMultiplier = 1 + (i * 0.005); // 0.5% per day
      
      data.push({
        date: format(date, "dd MMM"),
        predicted: Math.max(0, forecastBalance),
        confidenceLow: Math.max(0, forecastBalance - volatility * i * confidenceMultiplier),
        confidenceHigh: forecastBalance + volatility * i * confidenceMultiplier,
        isForecasted: true,
      });
    }

    return data;
  }, [transactions, totalBalance, dailyAverages, now]);

  // Budget Overrun Predictions
  const budgetPredictions = useMemo((): BudgetPrediction[] => {
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - currentDay;
    const daysPassed = currentDay;

    return budgets.map((budget) => {
      const spent = budget.spent || 0;
      const budgetAmount = Number(budget.amount);
      const dailyBurnRate = daysPassed > 0 ? spent / daysPassed : 0;
      const predictedSpent = spent + dailyBurnRate * daysRemaining;
      const predictedOverrun = Math.max(0, predictedSpent - budgetAmount);
      const spentPercentage = (spent / budgetAmount) * 100;
      const predictedPercentage = (predictedSpent / budgetAmount) * 100;

      let riskLevel: "low" | "medium" | "high" | "critical" = "low";
      if (predictedPercentage >= 120 || spentPercentage >= 100) {
        riskLevel = "critical";
      } else if (predictedPercentage >= 100 || spentPercentage >= 80) {
        riskLevel = "high";
      } else if (predictedPercentage >= 80 || spentPercentage >= 60) {
        riskLevel = "medium";
      }

      const suggestions: string[] = [];
      if (riskLevel === "critical") {
        suggestions.push(`Reduce daily spending to ₹${Math.floor((budgetAmount - spent) / Math.max(1, daysRemaining))} to stay within budget`);
        suggestions.push("Consider reallocating funds from other budget categories");
      } else if (riskLevel === "high") {
        suggestions.push(`Current burn rate will exceed budget by ₹${Math.floor(predictedOverrun)}`);
        suggestions.push("Review recent transactions for potential savings");
      } else if (riskLevel === "medium") {
        suggestions.push("On track but monitor closely");
        suggestions.push(`Safe daily limit: ₹${Math.floor((budgetAmount - spent) / Math.max(1, daysRemaining))}`);
      }

      return {
        categoryId: budget.category_id || "",
        categoryName: budget.category?.name || "Uncategorized",
        budgetAmount,
        currentSpent: spent,
        predictedSpent,
        riskLevel,
        daysRemaining,
        dailyBurnRate,
        predictedOverrun,
        suggestions,
      };
    }).sort((a, b) => {
      const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    });
  }, [budgets, now]);

  // Anomaly Detection
  const anomalies = useMemo((): SpendingAnomaly[] => {
    const detected: SpendingAnomaly[] = [];
    
    // Get spending by category for last 30 days vs previous 30 days
    const last30Days = transactions.filter(
      (t) => new Date(t.transaction_date) >= subDays(now, 30) && t.type === "expense"
    );
    const prev30Days = transactions.filter(
      (t) => new Date(t.transaction_date) >= subDays(now, 60) && 
             new Date(t.transaction_date) < subDays(now, 30) && 
             t.type === "expense"
    );

    // Category spending comparison
    const categorySpending: Record<string, { current: number; previous: number; name: string }> = {};
    
    last30Days.forEach((t) => {
      const catName = t.category?.name || "Other";
      if (!categorySpending[catName]) {
        categorySpending[catName] = { current: 0, previous: 0, name: catName };
      }
      categorySpending[catName].current += Number(t.amount);
    });

    prev30Days.forEach((t) => {
      const catName = t.category?.name || "Other";
      if (!categorySpending[catName]) {
        categorySpending[catName] = { current: 0, previous: 0, name: catName };
      }
      categorySpending[catName].previous += Number(t.amount);
    });

    // Detect category spending spikes
    Object.values(categorySpending).forEach((cat, index) => {
      if (cat.previous > 0) {
        const percentageChange = ((cat.current - cat.previous) / cat.previous) * 100;
        if (percentageChange > 50) {
          detected.push({
            id: `spike-${index}`,
            type: "spike",
            severity: percentageChange > 100 ? "alert" : "warning",
            title: `${cat.name} spending up ${Math.round(percentageChange)}%`,
            description: `Your ${cat.name.toLowerCase()} spending increased from ₹${Math.round(cat.previous)} to ₹${Math.round(cat.current)} compared to last month.`,
            categoryName: cat.name,
            percentageChange: Math.round(percentageChange),
            amount: cat.current,
          });
        }
      } else if (cat.current > 1000) {
        detected.push({
          id: `new-${index}`,
          type: "unusual_category",
          severity: "info",
          title: `New spending in ${cat.name}`,
          description: `You started spending in ${cat.name.toLowerCase()} this month: ₹${Math.round(cat.current)}.`,
          categoryName: cat.name,
          amount: cat.current,
        });
      }
    });

    // Detect large transactions
    const avgTransaction = last30Days.length > 0 
      ? last30Days.reduce((sum, t) => sum + Number(t.amount), 0) / last30Days.length 
      : 0;

    last30Days.forEach((t, index) => {
      if (Number(t.amount) > avgTransaction * 3 && Number(t.amount) > 5000) {
        detected.push({
          id: `large-${index}`,
          type: "large_transaction",
          severity: "info",
          title: "Large transaction detected",
          description: `₹${Math.round(Number(t.amount))} spent on ${t.category?.name || "uncategorized"} - ${Math.round((Number(t.amount) / avgTransaction) * 100)}% higher than your average.`,
          amount: Number(t.amount),
          categoryName: t.category?.name,
          date: t.transaction_date,
        });
      }
    });

    // Check for unusual frequency
    const dailyTxCounts: Record<string, number> = {};
    last30Days.forEach((t) => {
      dailyTxCounts[t.transaction_date] = (dailyTxCounts[t.transaction_date] || 0) + 1;
    });
    
    const avgDailyTx = Object.values(dailyTxCounts).reduce((a, b) => a + b, 0) / 30;
    Object.entries(dailyTxCounts).forEach(([date, count]) => {
      if (count > avgDailyTx * 2.5 && count >= 5) {
        detected.push({
          id: `freq-${date}`,
          type: "frequency_change",
          severity: "warning",
          title: "High transaction day",
          description: `${count} transactions on ${format(new Date(date), "dd MMM")} - unusually high activity.`,
          date,
        });
      }
    });

    return detected.slice(0, 10); // Limit to 10 anomalies
  }, [transactions, now]);

  // Trend data for projections
  const trendData = useMemo((): TrendData[] => {
    const data: TrendData[] = [];
    
    // Historical (last 30 days)
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      const dayExpense = transactions
        .filter((t) => t.transaction_date === dateStr && t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      data.push({
        date: format(date, "dd MMM"),
        actual: dayExpense,
      });
    }

    // Forecast (next 30 days)
    for (let i = 1; i <= 30; i++) {
      const date = addDays(now, i);
      data.push({
        date: format(date, "dd MMM"),
        forecast: dailyAverages.expense * (0.9 + Math.random() * 0.2), // Some variance
      });
    }

    return data;
  }, [transactions, dailyAverages, now]);

  // Summary stats
  const summary = useMemo(() => {
    const criticalBudgets = budgetPredictions.filter((b) => b.riskLevel === "critical").length;
    const highRiskBudgets = budgetPredictions.filter((b) => b.riskLevel === "high").length;
    const alertAnomalies = anomalies.filter((a) => a.severity === "alert").length;
    
    const forecast30Day = cashFlowForecast.find((f, i) => f.isForecasted && i === 14 + 30);
    const forecast60Day = cashFlowForecast.find((f, i) => f.isForecasted && i === 14 + 60);
    const forecast90Day = cashFlowForecast.find((f, i) => f.isForecasted && i === 14 + 90);

    return {
      criticalBudgets,
      highRiskBudgets,
      alertAnomalies,
      totalAnomalies: anomalies.length,
      forecast30Day: forecast30Day?.predicted || totalBalance + dailyAverages.income * 30 - dailyAverages.expense * 30,
      forecast60Day: forecast60Day?.predicted || totalBalance + dailyAverages.income * 60 - dailyAverages.expense * 60,
      forecast90Day: forecast90Day?.predicted || totalBalance + dailyAverages.income * 90 - dailyAverages.expense * 90,
      dailyBurnRate: dailyAverages.expense,
      projectedMonthlySavings: (dailyAverages.income - dailyAverages.expense) * 30,
    };
  }, [budgetPredictions, anomalies, cashFlowForecast, totalBalance, dailyAverages]);

  return {
    isLoading,
    cashFlowForecast,
    budgetPredictions,
    anomalies,
    trendData,
    summary,
    dailyAverages,
  };
};
