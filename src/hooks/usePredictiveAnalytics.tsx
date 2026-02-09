import { useMemo } from "react";
import { useTransactions } from "./useTransactions";
import { useBudgets } from "./useBudgets";
import { useWallets } from "./useWallets";
import { useRecurringBills } from "./useRecurringBills";
import { format, subDays, addDays, startOfMonth, endOfMonth, getDate, getDay, differenceInDays, parseISO } from "date-fns";

// ============ TYPE DEFINITIONS ============

export interface CashFlowForecast {
  date: string;
  actual?: number;
  predicted: number;
  confidenceLow: number;
  confidenceHigh: number;
  isForecasted: boolean;
}

export interface IncomeSource {
  category: string;
  amount: number;
  frequency: "one-time" | "weekly" | "monthly" | "irregular";
  predictedNextDate?: string;
  trend: "increasing" | "stable" | "decreasing";
  confidence: number;
  velocity: number; // Rate of change
}

export interface ExpenseDestination {
  category: string;
  amount: number;
  percentage: number;
  trend: "increasing" | "stable" | "decreasing";
  isRecurring: boolean;
  velocity: number;
  seasonalityScore: number;
}

export interface CashFlowInsights {
  incomeSources: IncomeSource[];
  expenseDestinations: ExpenseDestination[];
  recurringIncomeTotal: number;
  recurringExpenseTotal: number;
  netRecurringFlow: number;
  incomePatterns: string[];
  expensePatterns: string[];
  predictions: string[];
  dataQualityScore: number;
  seasonalPatterns: SeasonalPattern[];
}

export interface SeasonalPattern {
  type: "weekly" | "monthly" | "end-of-month" | "beginning-of-month";
  description: string;
  impact: "high" | "medium" | "low";
  affectedCategories: string[];
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
  confidence: number;
  velocity: number;
  projectedEndDate?: string;
}

export interface SpendingAnomaly {
  id: string;
  type: "spike" | "unusual_category" | "frequency_change" | "large_transaction" | "pattern_break" | "velocity_change";
  severity: "info" | "warning" | "alert";
  title: string;
  description: string;
  amount?: number;
  categoryName?: string;
  date?: string;
  percentageChange?: number;
  zScore?: number;
  recommendation?: string;
}

export interface TrendData {
  date: string;
  actual?: number;
  forecast?: number;
  category?: string;
  confidenceLow?: number;
  confidenceHigh?: number;
}

// ============ STATISTICAL HELPER FUNCTIONS ============

// Calculate mean
const mean = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};

// Calculate standard deviation
const stdDev = (arr: number[]): number => {
  if (arr.length < 2) return 0;
  const avg = mean(arr);
  const squareDiffs = arr.map((v) => Math.pow(v - avg, 2));
  return Math.sqrt(mean(squareDiffs));
};

// Calculate z-score for anomaly detection
const zScore = (value: number, arr: number[]): number => {
  const avg = mean(arr);
  const sd = stdDev(arr);
  if (sd === 0) return 0;
  return (value - avg) / sd;
};

// Weighted Moving Average - gives more weight to recent data
const weightedMovingAverage = (values: number[], weights?: number[]): number => {
  if (values.length === 0) return 0;
  
  // Default weights: linear increase (more recent = higher weight)
  const w = weights || values.map((_, i) => i + 1);
  const weightSum = w.reduce((a, b) => a + b, 0);
  
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i] * (w[i] || 1);
  }
  return sum / weightSum;
};

// Exponential Moving Average - smooths data with exponential decay
const exponentialMovingAverage = (values: number[], alpha = 0.3): number => {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];
  
  let ema = values[0];
  for (let i = 1; i < values.length; i++) {
    ema = alpha * values[i] + (1 - alpha) * ema;
  }
  return ema;
};

// Calculate velocity (rate of change)
const calculateVelocity = (values: number[]): number => {
  if (values.length < 2) return 0;
  
  // Use linear regression slope
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = mean(values);
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += Math.pow(i - xMean, 2);
  }
  
  return denominator === 0 ? 0 : numerator / denominator;
};

// Detect seasonality score (0-1)
const detectSeasonality = (values: number[], period: number): number => {
  if (values.length < period * 2) return 0;
  
  // Compare correlation between periods
  const chunks: number[][] = [];
  for (let i = 0; i < values.length; i += period) {
    const chunk = values.slice(i, i + period);
    if (chunk.length === period) chunks.push(chunk);
  }
  
  if (chunks.length < 2) return 0;
  
  // Calculate correlation between consecutive periods
  let correlationSum = 0;
  for (let i = 1; i < chunks.length; i++) {
    const prev = chunks[i - 1];
    const curr = chunks[i];
    
    const prevMean = mean(prev);
    const currMean = mean(curr);
    
    let numerator = 0;
    let denomPrev = 0;
    let denomCurr = 0;
    
    for (let j = 0; j < period; j++) {
      numerator += (prev[j] - prevMean) * (curr[j] - currMean);
      denomPrev += Math.pow(prev[j] - prevMean, 2);
      denomCurr += Math.pow(curr[j] - currMean, 2);
    }
    
    const denom = Math.sqrt(denomPrev * denomCurr);
    correlationSum += denom === 0 ? 0 : Math.abs(numerator / denom);
  }
  
  return correlationSum / (chunks.length - 1);
};

// Holt-Winters Triple Exponential Smoothing for forecasting
const holtWintersSmooth = (
  values: number[],
  alpha = 0.3,
  beta = 0.1,
  gamma = 0.1,
  seasonLength = 7
): { level: number; trend: number; seasonal: number[] } => {
  if (values.length < seasonLength * 2) {
    return { level: mean(values), trend: 0, seasonal: Array(seasonLength).fill(1) };
  }
  
  // Initialize
  let level = mean(values.slice(0, seasonLength));
  let trend = (mean(values.slice(seasonLength, seasonLength * 2)) - level) / seasonLength;
  const seasonal: number[] = [];
  
  for (let i = 0; i < seasonLength; i++) {
    seasonal.push(values[i] / level || 1);
  }
  
  // Update
  for (let i = seasonLength; i < values.length; i++) {
    const seasonIndex = i % seasonLength;
    const oldLevel = level;
    
    level = alpha * (values[i] / seasonal[seasonIndex]) + (1 - alpha) * (level + trend);
    trend = beta * (level - oldLevel) + (1 - beta) * trend;
    seasonal[seasonIndex] = gamma * (values[i] / level) + (1 - gamma) * seasonal[seasonIndex];
  }
  
  return { level, trend, seasonal };
};

// ============ MAIN HOOK ============

export const usePredictiveAnalytics = () => {
  const now = new Date();
  const startDate = format(subDays(now, 90), "yyyy-MM-dd");
  const endDate = format(now, "yyyy-MM-dd");

  const { transactions, isLoading: txLoading } = useTransactions({ startDate, endDate });
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { wallets, totalBalance, isLoading: walletsLoading } = useWallets();
  const { bills: recurringBills, totalMonthlyBills, isLoading: billsLoading } = useRecurringBills();

  const isLoading = txLoading || budgetsLoading || walletsLoading || billsLoading;

  // Helper to get monthly equivalent of recurring bills
  const getMonthlyEquivalent = (amount: number, frequency: string): number => {
    switch (frequency) {
      case "weekly": return amount * 4.33;
      case "quarterly": return amount / 3;
      case "yearly": return amount / 12;
      default: return amount;
    }
  };

  // ============ ENHANCED INCOME ANALYSIS ============
  const incomeAnalysis = useMemo(() => {
    const incomeTransactions = transactions.filter((t) => t.type === "income");
    
    const byCategory: Record<string, { amounts: number[]; dates: string[] }> = {};
    incomeTransactions.forEach((t) => {
      const cat = t.category?.name || "Other Income";
      if (!byCategory[cat]) byCategory[cat] = { amounts: [], dates: [] };
      byCategory[cat].amounts.push(Number(t.amount));
      byCategory[cat].dates.push(t.transaction_date);
    });

    const sources: IncomeSource[] = Object.entries(byCategory).map(([category, data]) => {
      const total = data.amounts.reduce((a, b) => a + b, 0);
      
      // Enhanced frequency detection
      let frequency: "one-time" | "weekly" | "monthly" | "irregular" = "irregular";
      let confidence = 0.5;
      
      if (data.amounts.length === 1) {
        frequency = "one-time";
        confidence = 1;
      } else if (data.amounts.length >= 2) {
        // Check for monthly pattern
        const days = data.dates.map((d) => getDate(new Date(d)));
        const avgDay = mean(days);
        const dayStdDev = stdDev(days);
        
        if (dayStdDev < 3) {
          frequency = "monthly";
          confidence = Math.min(0.95, 0.5 + (0.15 * data.amounts.length));
        } else if (dayStdDev < 7) {
          frequency = "monthly";
          confidence = 0.6;
        }
        
        // Check for weekly pattern
        if (data.amounts.length >= 4) {
          const weekdays = data.dates.map((d) => getDay(new Date(d)));
          const weekdayStdDev = stdDev(weekdays);
          if (weekdayStdDev < 1.5) {
            frequency = "weekly";
            confidence = Math.min(0.9, 0.6 + (0.1 * data.amounts.length));
          }
        }
      }

      // Enhanced trend detection with velocity
      const velocity = calculateVelocity(data.amounts);
      let trend: "increasing" | "stable" | "decreasing" = "stable";
      
      if (data.amounts.length >= 3) {
        const ema = exponentialMovingAverage(data.amounts);
        const wma = weightedMovingAverage(data.amounts);
        const recentAvg = mean(data.amounts.slice(-2));
        
        if (velocity > 0 && recentAvg > ema * 1.05) {
          trend = "increasing";
        } else if (velocity < 0 && recentAvg < ema * 0.95) {
          trend = "decreasing";
        }
      }

      return { 
        category, 
        amount: total, 
        frequency, 
        trend, 
        confidence,
        velocity: velocity / (mean(data.amounts) || 1) * 100 // Percentage velocity
      };
    });

    return sources.sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // ============ ENHANCED EXPENSE ANALYSIS ============
  const expenseAnalysis = useMemo(() => {
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const currentMonthExpenses = transactions.filter((t) => {
      const txDate = new Date(t.transaction_date);
      return t.type === "expense" && txDate >= monthStart && txDate <= monthEnd;
    });
    
    const transactionExpensesTotal = currentMonthExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const monthlyRecurringExpenses = totalMonthlyBills;
    const totalExpenses = transactionExpensesTotal + monthlyRecurringExpenses;
    
    const byCategory: Record<string, { 
      amounts: number[]; 
      dates: string[]; 
      hasRecurring: boolean; 
      recurringAmount: number;
      allAmounts: number[];
    }> = {};
    
    // Current month transactions
    currentMonthExpenses.forEach((t) => {
      const cat = t.category?.name || "Other";
      if (!byCategory[cat]) {
        byCategory[cat] = { amounts: [], dates: [], hasRecurring: false, recurringAmount: 0, allAmounts: [] };
      }
      byCategory[cat].amounts.push(Number(t.amount));
      byCategory[cat].dates.push(t.transaction_date);
    });
    
    // All 90-day transactions for trend analysis
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      const cat = t.category?.name || "Other";
      if (!byCategory[cat]) {
        byCategory[cat] = { amounts: [], dates: [], hasRecurring: false, recurringAmount: 0, allAmounts: [] };
      }
      byCategory[cat].allAmounts.push(Number(t.amount));
    });
    
    // Add recurring bills
    recurringBills.forEach((bill) => {
      const cat = bill.category || "Bills & Utilities";
      if (!byCategory[cat]) {
        byCategory[cat] = { amounts: [], dates: [], hasRecurring: false, recurringAmount: 0, allAmounts: [] };
      }
      byCategory[cat].hasRecurring = true;
      byCategory[cat].recurringAmount += getMonthlyEquivalent(Number(bill.amount), bill.frequency);
    });

    const destinations: ExpenseDestination[] = Object.entries(byCategory).map(([category, data]) => {
      const transactionTotal = data.amounts.reduce((a, b) => a + b, 0);
      const total = transactionTotal + data.recurringAmount;
      const percentage = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
      
      // Enhanced recurring detection
      const avgAmount = data.amounts.length > 0 ? mean(data.amounts) : 0;
      const amountStdDev = stdDev(data.amounts);
      const cv = avgAmount > 0 ? amountStdDev / avgAmount : 0; // Coefficient of variation
      const isRecurring = data.hasRecurring || (data.amounts.length >= 2 && cv < 0.3);

      // Enhanced trend with velocity
      const velocity = calculateVelocity(data.allAmounts);
      let trend: "increasing" | "stable" | "decreasing" = "stable";
      
      if (data.allAmounts.length >= 4) {
        const ema = exponentialMovingAverage(data.allAmounts);
        const recentAvg = mean(data.allAmounts.slice(-3));
        
        if (velocity > 0 && recentAvg > ema * 1.1) {
          trend = "increasing";
        } else if (velocity < 0 && recentAvg < ema * 0.9) {
          trend = "decreasing";
        }
      }
      
      // Seasonality detection (weekly pattern)
      const seasonalityScore = data.allAmounts.length >= 14 
        ? detectSeasonality(data.allAmounts, 7) 
        : 0;

      return { 
        category, 
        amount: total, 
        percentage, 
        trend, 
        isRecurring,
        velocity: velocity / (mean(data.allAmounts) || 1) * 100,
        seasonalityScore
      };
    });

    return destinations.sort((a, b) => b.amount - a.amount);
  }, [transactions, recurringBills, totalMonthlyBills, now]);

  // ============ SEASONAL PATTERN DETECTION ============
  const seasonalPatterns = useMemo((): SeasonalPattern[] => {
    const patterns: SeasonalPattern[] = [];
    const expenses = transactions.filter((t) => t.type === "expense");
    
    if (expenses.length < 30) return patterns;
    
    // Analyze by day of week
    const byDayOfWeek: Record<number, number[]> = {};
    expenses.forEach((t) => {
      const day = getDay(new Date(t.transaction_date));
      if (!byDayOfWeek[day]) byDayOfWeek[day] = [];
      byDayOfWeek[day].push(Number(t.amount));
    });
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayAverages = Object.entries(byDayOfWeek).map(([day, amounts]) => ({
      day: parseInt(day),
      avg: mean(amounts),
      total: amounts.reduce((a, b) => a + b, 0)
    }));
    
    const overallAvg = mean(dayAverages.map((d) => d.avg));
    
    // Find high spending days
    const highDays = dayAverages.filter((d) => d.avg > overallAvg * 1.3);
    if (highDays.length > 0 && highDays.length <= 2) {
      patterns.push({
        type: "weekly",
        description: `Higher spending on ${highDays.map((d) => dayNames[d.day]).join(" and ")}`,
        impact: highDays[0].avg > overallAvg * 1.5 ? "high" : "medium",
        affectedCategories: []
      });
    }
    
    // Analyze end of month vs beginning
    const byDayOfMonth: Record<string, number[]> = { beginning: [], middle: [], end: [] };
    expenses.forEach((t) => {
      const day = getDate(new Date(t.transaction_date));
      if (day <= 7) byDayOfMonth.beginning.push(Number(t.amount));
      else if (day >= 25) byDayOfMonth.end.push(Number(t.amount));
      else byDayOfMonth.middle.push(Number(t.amount));
    });
    
    const beginningAvg = mean(byDayOfMonth.beginning);
    const middleAvg = mean(byDayOfMonth.middle);
    const endAvg = mean(byDayOfMonth.end);
    
    if (endAvg > middleAvg * 1.4) {
      patterns.push({
        type: "end-of-month",
        description: "Spending increases significantly at month-end",
        impact: endAvg > middleAvg * 1.7 ? "high" : "medium",
        affectedCategories: []
      });
    }
    
    if (beginningAvg > middleAvg * 1.4) {
      patterns.push({
        type: "beginning-of-month",
        description: "Spending spikes at the start of each month",
        impact: beginningAvg > middleAvg * 1.7 ? "high" : "medium",
        affectedCategories: []
      });
    }
    
    return patterns;
  }, [transactions]);

  // ============ DATA QUALITY SCORING ============
  const dataQualityScore = useMemo(() => {
    let score = 0;
    const maxScore = 100;
    
    // Transaction count (up to 25 points)
    const txCount = transactions.length;
    score += Math.min(25, txCount * 0.5);
    
    // Category coverage (up to 20 points)
    const categories = new Set(transactions.map((t) => t.category?.name)).size;
    score += Math.min(20, categories * 2.5);
    
    // Date range coverage (up to 20 points)
    if (transactions.length >= 2) {
      const dates = transactions.map((t) => new Date(t.transaction_date).getTime());
      const range = (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24);
      score += Math.min(20, range * 0.25);
    }
    
    // Balance between income and expense (up to 15 points)
    const incomeCount = transactions.filter((t) => t.type === "income").length;
    const expenseCount = transactions.filter((t) => t.type === "expense").length;
    if (incomeCount > 0 && expenseCount > 0) {
      const ratio = Math.min(incomeCount, expenseCount) / Math.max(incomeCount, expenseCount);
      score += ratio * 15;
    }
    
    // Recurring bills setup (up to 10 points)
    score += Math.min(10, recurringBills.length * 2);
    
    // Budgets setup (up to 10 points)
    score += Math.min(10, budgets.length * 2.5);
    
    return Math.round(Math.min(maxScore, score));
  }, [transactions, recurringBills, budgets]);

  // ============ ENHANCED CASH FLOW INSIGHTS ============
  const cashFlowInsights = useMemo((): CashFlowInsights => {
    const recurringIncomeTotal = incomeAnalysis
      .filter((s) => s.frequency === "monthly" || s.frequency === "weekly")
      .reduce((sum, s) => sum + s.amount, 0);
    
    const recurringExpenseTotal = expenseAnalysis
      .filter((d) => d.isRecurring)
      .reduce((sum, d) => sum + d.amount, 0);

    const incomePatterns: string[] = [];
    const expensePatterns: string[] = [];
    const predictions: string[] = [];

    // Smart income insights
    if (incomeAnalysis.length === 0) {
      incomePatterns.push("No income recorded yet. Add your salary or other income sources.");
    } else {
      const monthlyIncome = incomeAnalysis.filter((s) => s.frequency === "monthly");
      if (monthlyIncome.length > 0) {
        const highConfidence = monthlyIncome.filter((s) => s.confidence > 0.7);
        incomePatterns.push(`${highConfidence.length} reliable recurring income source(s) detected`);
        
        const growingIncome = monthlyIncome.filter((s) => s.trend === "increasing" && s.velocity > 5);
        if (growingIncome.length > 0) {
          incomePatterns.push(`📈 ${growingIncome.map((s) => s.category).join(", ")} showing growth (+${Math.round(mean(growingIncome.map((s) => s.velocity)))}% velocity)`);
        }
      }
      
      const irregularIncome = incomeAnalysis.filter((s) => s.frequency === "irregular" || s.frequency === "one-time");
      if (irregularIncome.length > 0) {
        incomePatterns.push(`${irregularIncome.length} irregular/bonus income source(s) - factor in variability`);
      }
    }

    // Smart expense insights
    const topExpenses = expenseAnalysis.slice(0, 3);
    if (topExpenses.length > 0) {
      expensePatterns.push(`Top spending: ${topExpenses.map((e) => `${e.category} (${e.percentage.toFixed(0)}%)`).join(", ")}`);
      
      const acceleratingExpenses = expenseAnalysis.filter((e) => e.trend === "increasing" && e.velocity > 10);
      if (acceleratingExpenses.length > 0) {
        expensePatterns.push(`🚨 Accelerating expenses: ${acceleratingExpenses.map((e) => `${e.category} (+${Math.round(e.velocity)}%)`).join(", ")}`);
      }
      
      const seasonalCategories = expenseAnalysis.filter((e) => e.seasonalityScore > 0.6);
      if (seasonalCategories.length > 0) {
        expensePatterns.push(`📅 Seasonal patterns in: ${seasonalCategories.map((e) => e.category).join(", ")}`);
      }
    }

    // AI-powered predictions
    const netRecurring = recurringIncomeTotal - recurringExpenseTotal;
    if (recurringIncomeTotal > 0 && recurringExpenseTotal > 0) {
      const savingsRate = (netRecurring / recurringIncomeTotal) * 100;
      if (savingsRate > 20) {
        predictions.push(`✅ Strong savings potential: ${savingsRate.toFixed(0)}% of recurring income`);
      } else if (savingsRate > 0) {
        predictions.push(`📊 Modest savings rate: ${savingsRate.toFixed(0)}% - aim for 20%+ for financial security`);
      } else {
        predictions.push(`⚠️ Negative cash flow: Expenses exceed income by ₹${Math.round(Math.abs(netRecurring)).toLocaleString()}/month`);
      }
    }

    // Velocity-based predictions
    const avgExpenseVelocity = mean(expenseAnalysis.filter((e) => !e.isRecurring).map((e) => e.velocity));
    if (avgExpenseVelocity > 15) {
      predictions.push(`📈 Spending velocity high (+${Math.round(avgExpenseVelocity)}%) - expenses may increase 15-20% next month`);
    } else if (avgExpenseVelocity < -10) {
      predictions.push(`📉 Spending momentum slowing - good progress on cost control`);
    }

    // Seasonal predictions
    if (seasonalPatterns.length > 0) {
      const highImpact = seasonalPatterns.filter((p) => p.impact === "high");
      if (highImpact.length > 0) {
        predictions.push(`⏰ ${highImpact[0].description} - budget accordingly`);
      }
    }

    return {
      incomeSources: incomeAnalysis,
      expenseDestinations: expenseAnalysis,
      recurringIncomeTotal,
      recurringExpenseTotal,
      netRecurringFlow: netRecurring,
      incomePatterns,
      expensePatterns,
      predictions,
      dataQualityScore,
      seasonalPatterns,
    };
  }, [incomeAnalysis, expenseAnalysis, dataQualityScore, seasonalPatterns]);

  // ============ ENHANCED DAILY AVERAGES ============
  const dailyAverages = useMemo(() => {
    const last30Days = transactions.filter(
      (t) => new Date(t.transaction_date) >= subDays(now, 30)
    );

    const incomeAmounts = last30Days
      .filter((t) => t.type === "income")
      .map((t) => Number(t.amount));
    
    const expenseAmounts = last30Days
      .filter((t) => t.type === "expense")
      .map((t) => Number(t.amount));

    const totalIncome = incomeAmounts.reduce((a, b) => a + b, 0);
    const totalTransactionExpense = expenseAmounts.reduce((a, b) => a + b, 0);
    const totalExpense = totalTransactionExpense + totalMonthlyBills;

    // Use EMA for more responsive averages
    const dailyIncomeEMA = incomeAmounts.length > 0 
      ? exponentialMovingAverage(incomeAmounts) 
      : totalIncome / 30;
    
    const dailyExpenseEMA = expenseAmounts.length > 0 
      ? exponentialMovingAverage(expenseAmounts) + (totalMonthlyBills / 30)
      : totalExpense / 30;

    return {
      income: totalIncome / 30,
      expense: totalExpense / 30,
      netDaily: (totalIncome - totalExpense) / 30,
      recurringDaily: totalMonthlyBills / 30,
      incomeEMA: dailyIncomeEMA,
      expenseEMA: dailyExpenseEMA,
      incomeVolatility: stdDev(incomeAmounts),
      expenseVolatility: stdDev(expenseAmounts),
    };
  }, [transactions, now, totalMonthlyBills]);

  // ============ ADVANCED CASH FLOW FORECASTING ============
  const cashFlowForecast = useMemo((): CashFlowForecast[] => {
    const data: CashFlowForecast[] = [];
    
    // Collect daily balances for last 30 days for better modeling
    const dailyExpenses: number[] = [];
    const dailyIncomes: number[] = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      const dayIncome = transactions
        .filter((t) => t.transaction_date === dateStr && t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const dayExpense = transactions
        .filter((t) => t.transaction_date === dateStr && t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      dailyIncomes.push(dayIncome);
      dailyExpenses.push(dayExpense);
    }
    
    // Calculate fallback values for sparse data
    const avgDailyExpense = dailyExpenses.reduce((a, b) => a + b, 0) / 30 || totalMonthlyBills / 30 || 0;
    const avgDailyIncome = dailyIncomes.reduce((a, b) => a + b, 0) / 30 || 0;
    const hasEnoughExpenseData = dailyExpenses.filter(e => e > 0).length >= 7;
    const hasEnoughIncomeData = dailyIncomes.filter(i => i > 0).length >= 3;
    
    // Apply Holt-Winters for expense forecasting (with fallback)
    const expenseModel = hasEnoughExpenseData
      ? holtWintersSmooth(dailyExpenses, 0.3, 0.1, 0.1, 7)
      : { level: avgDailyExpense + (totalMonthlyBills / 30), trend: 0, seasonal: Array(7).fill(1) };
    
    const incomeModel = hasEnoughIncomeData
      ? holtWintersSmooth(dailyIncomes, 0.2, 0.05, 0.05, 7)
      : { level: avgDailyIncome, trend: 0, seasonal: Array(7).fill(1) };

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

      const actualBalance = dayBalance + dayIncome - dayExpense;

      data.push({
        date: format(date, "dd MMM"),
        actual: actualBalance,
        predicted: actualBalance,
        confidenceLow: actualBalance * 0.98,
        confidenceHigh: actualBalance * 1.02,
        isForecasted: false,
      });
    }

    // Forecast using Holt-Winters with fallback
    let forecastBalance = totalBalance;
    const baseVolatility = dailyAverages.expenseVolatility || avgDailyExpense * 0.2 || totalBalance * 0.01;
    
    // Calculate base daily net change for fallback
    const baseDailyNetChange = avgDailyIncome - avgDailyExpense - (totalMonthlyBills / 30);

    for (let i = 1; i <= 90; i++) {
      const date = addDays(now, i);
      const dayOfWeek = i % 7;
      
      // Seasonal adjustments
      const expenseSeasonal = expenseModel.seasonal[dayOfWeek] || 1;
      const incomeSeasonal = incomeModel.seasonal[dayOfWeek] || 1;
      
      let predictedExpense = (expenseModel.level + expenseModel.trend * i) * expenseSeasonal;
      let predictedIncome = (incomeModel.level + incomeModel.trend * i) * incomeSeasonal;
      
      // Add recurring bills to expenses
      predictedExpense += totalMonthlyBills / 30;
      
      // Ensure reasonable values
      if (predictedExpense < 0) predictedExpense = avgDailyExpense + (totalMonthlyBills / 30);
      if (predictedIncome < 0) predictedIncome = avgDailyIncome;
      
      // Use simple projection if models produce unreasonable results
      const dailyChange = predictedIncome - predictedExpense;
      if (Math.abs(dailyChange) > totalBalance * 0.1) {
        // Cap extreme daily changes
        forecastBalance += Math.sign(dailyChange) * Math.min(Math.abs(dailyChange), totalBalance * 0.02);
      } else {
        forecastBalance += dailyChange;
      }
      
      // Confidence bands widen over time with diminishing rate
      const confidenceMultiplier = 1 + Math.log10(i + 1) * 0.15;
      const volatilityFactor = baseVolatility * Math.sqrt(i);
      
      data.push({
        date: format(date, "dd MMM"),
        predicted: Math.max(0, forecastBalance),
        confidenceLow: Math.max(0, forecastBalance - volatilityFactor * confidenceMultiplier),
        confidenceHigh: forecastBalance + volatilityFactor * confidenceMultiplier,
        isForecasted: true,
      });
    }

    return data;
  }, [transactions, totalBalance, dailyAverages, now, totalMonthlyBills]);

  // ============ ENHANCED BUDGET PREDICTIONS ============
  const budgetPredictions = useMemo((): BudgetPrediction[] => {
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - currentDay;
    const daysPassed = currentDay;

    return budgets.map((budget) => {
      const spent = budget.spent || 0;
      const budgetAmount = Number(budget.amount);
      
      // Get historical spending for this category
      const categoryTransactions = transactions
        .filter((t) => t.category_id === budget.category_id && t.type === "expense")
        .map((t) => Number(t.amount));
      
      // Calculate velocity and use WMA for prediction
      const velocity = calculateVelocity(categoryTransactions);
      const avgSpend = categoryTransactions.length > 0 
        ? weightedMovingAverage(categoryTransactions) 
        : spent / daysPassed;
      
      // Enhanced daily burn rate using EMA
      const dailyBurnRate = daysPassed > 0 
        ? exponentialMovingAverage([...Array(daysPassed).fill(spent / daysPassed)])
        : avgSpend;
      
      // Adjust prediction based on velocity
      const velocityAdjustment = 1 + (velocity / 100);
      const predictedSpent = spent + dailyBurnRate * daysRemaining * velocityAdjustment;
      const predictedOverrun = Math.max(0, predictedSpent - budgetAmount);
      const spentPercentage = (spent / budgetAmount) * 100;
      const predictedPercentage = (predictedSpent / budgetAmount) * 100;

      // Confidence based on data quality
      const confidence = Math.min(0.95, 0.5 + (categoryTransactions.length * 0.05));

      let riskLevel: "low" | "medium" | "high" | "critical" = "low";
      if (predictedPercentage >= 120 || spentPercentage >= 100) {
        riskLevel = "critical";
      } else if (predictedPercentage >= 100 || spentPercentage >= 80) {
        riskLevel = "high";
      } else if (predictedPercentage >= 80 || spentPercentage >= 60) {
        riskLevel = "medium";
      }

      const suggestions: string[] = [];
      const safeDailyLimit = Math.floor((budgetAmount - spent) / Math.max(1, daysRemaining));
      
      if (riskLevel === "critical") {
        suggestions.push(`🚨 Reduce daily spending to ₹${safeDailyLimit} to avoid overrun`);
        if (velocity > 10) {
          suggestions.push(`📈 Spending accelerating (+${Math.round(velocity)}%) - immediate action needed`);
        }
        suggestions.push("Consider pausing non-essential purchases in this category");
      } else if (riskLevel === "high") {
        suggestions.push(`⚠️ Projected overrun: ₹${Math.floor(predictedOverrun)}`);
        suggestions.push(`Safe daily limit: ₹${safeDailyLimit}`);
        if (velocity > 5) {
          suggestions.push("Spending velocity is increasing - monitor closely");
        }
      } else if (riskLevel === "medium") {
        suggestions.push(`👀 On track but monitoring recommended`);
        suggestions.push(`Daily budget: ₹${safeDailyLimit}`);
      } else {
        suggestions.push(`✅ Well within budget - ₹${safeDailyLimit}/day available`);
      }

      // Calculate when budget will be exhausted
      let projectedEndDate: string | undefined;
      if (dailyBurnRate > 0) {
        const daysToExhaust = (budgetAmount - spent) / dailyBurnRate;
        if (daysToExhaust < daysRemaining) {
          projectedEndDate = format(addDays(now, Math.floor(daysToExhaust)), "dd MMM");
        }
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
        confidence,
        velocity,
        projectedEndDate,
      };
    }).sort((a, b) => {
      const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    });
  }, [budgets, transactions, now]);

  // ============ ADVANCED ANOMALY DETECTION ============
  const anomalies = useMemo((): SpendingAnomaly[] => {
    const detected: SpendingAnomaly[] = [];
    
    const last30Days = transactions.filter(
      (t) => new Date(t.transaction_date) >= subDays(now, 30) && t.type === "expense"
    );
    const prev30Days = transactions.filter(
      (t) => new Date(t.transaction_date) >= subDays(now, 60) && 
             new Date(t.transaction_date) < subDays(now, 30) && 
             t.type === "expense"
    );

    // Category spending with z-score analysis
    const categorySpending: Record<string, { 
      current: number; 
      previous: number; 
      name: string; 
      hasRecurring: boolean;
      amounts: number[];
    }> = {};
    
    last30Days.forEach((t) => {
      const catName = t.category?.name || "Other";
      if (!categorySpending[catName]) {
        categorySpending[catName] = { current: 0, previous: 0, name: catName, hasRecurring: false, amounts: [] };
      }
      categorySpending[catName].current += Number(t.amount);
      categorySpending[catName].amounts.push(Number(t.amount));
    });

    prev30Days.forEach((t) => {
      const catName = t.category?.name || "Other";
      if (!categorySpending[catName]) {
        categorySpending[catName] = { current: 0, previous: 0, name: catName, hasRecurring: false, amounts: [] };
      }
      categorySpending[catName].previous += Number(t.amount);
    });
    
    recurringBills.forEach((bill) => {
      const catName = bill.category || "Bills & Utilities";
      if (!categorySpending[catName]) {
        categorySpending[catName] = { current: 0, previous: 0, name: catName, hasRecurring: false, amounts: [] };
      }
      const monthlyAmount = getMonthlyEquivalent(Number(bill.amount), bill.frequency);
      categorySpending[catName].current += monthlyAmount;
      categorySpending[catName].previous += monthlyAmount;
      categorySpending[catName].hasRecurring = true;
    });

    // Detect anomalies with z-scores
    Object.values(categorySpending).forEach((cat, index) => {
      if (cat.hasRecurring && cat.current === cat.previous) return;
      
      // Z-score based anomaly detection for individual transactions
      if (cat.amounts.length >= 3) {
        const catMean = mean(cat.amounts);
        const catStd = stdDev(cat.amounts);
        
        cat.amounts.forEach((amount, i) => {
          const z = zScore(amount, cat.amounts);
          if (Math.abs(z) > 2.5 && amount > 3000) {
            detected.push({
              id: `zscore-${index}-${i}`,
              type: "pattern_break",
              severity: Math.abs(z) > 3 ? "alert" : "warning",
              title: `Statistical outlier in ${cat.name}`,
              description: `₹${Math.round(amount)} is ${Math.abs(z).toFixed(1)} standard deviations from your average ${cat.name.toLowerCase()} spending.`,
              categoryName: cat.name,
              amount,
              zScore: z,
              recommendation: z > 0 
                ? "Review if this was a one-time expense or indicates a pattern change"
                : "Unusually low spend - check if you missed any transactions",
            });
          }
        });
      }
      
      // Month-over-month comparison
      if (cat.previous > 0) {
        const percentageChange = ((cat.current - cat.previous) / cat.previous) * 100;
        if (percentageChange > 40) {
          detected.push({
            id: `spike-${index}`,
            type: "spike",
            severity: percentageChange > 80 ? "alert" : "warning",
            title: `${cat.name} spending up ${Math.round(percentageChange)}%`,
            description: `From ₹${Math.round(cat.previous)} to ₹${Math.round(cat.current)} vs last month.`,
            categoryName: cat.name,
            percentageChange: Math.round(percentageChange),
            amount: cat.current,
            recommendation: "Review recent transactions to identify the cause of this increase",
          });
        }
      } else if (cat.current > 1000 && !cat.hasRecurring) {
        detected.push({
          id: `new-${index}`,
          type: "unusual_category",
          severity: "info",
          title: `New spending category: ${cat.name}`,
          description: `₹${Math.round(cat.current)} spent in a category with no prior history.`,
          categoryName: cat.name,
          amount: cat.current,
          recommendation: "Consider if this is a one-time expense or will become recurring",
        });
      }
    });

    // Velocity-based anomalies
    expenseAnalysis.forEach((expense, index) => {
      if (expense.velocity > 25 && !expense.isRecurring) {
        detected.push({
          id: `velocity-${index}`,
          type: "velocity_change",
          severity: expense.velocity > 40 ? "alert" : "warning",
          title: `Rapid increase in ${expense.category}`,
          description: `Spending velocity +${Math.round(expense.velocity)}% - this category is accelerating fast.`,
          categoryName: expense.category,
          percentageChange: Math.round(expense.velocity),
          recommendation: "Set a budget for this category to prevent overspending",
        });
      }
    });
    
    // High recurring bills
    recurringBills.forEach((bill, index) => {
      const monthlyAmount = getMonthlyEquivalent(Number(bill.amount), bill.frequency);
      if (monthlyAmount > 2000 && !bill.is_negotiated) {
        detected.push({
          id: `recurring-high-${index}`,
          type: "frequency_change",
          severity: monthlyAmount > 5000 ? "warning" : "info",
          title: `Optimization opportunity: ${bill.name}`,
          description: `₹${Math.round(monthlyAmount)}/month - potential for negotiation or alternative.`,
          categoryName: bill.category || "Bills & Utilities",
          amount: monthlyAmount,
          recommendation: "Use Bill Negotiation Assistant to explore savings options",
        });
      }
    });

    // Large transactions with z-score
    const allAmounts = last30Days.map((t) => Number(t.amount));
    if (allAmounts.length >= 5) {
      last30Days.forEach((t, index) => {
        const z = zScore(Number(t.amount), allAmounts);
        if (z > 2 && Number(t.amount) > 5000) {
          detected.push({
            id: `large-${index}`,
            type: "large_transaction",
            severity: z > 3 ? "alert" : "warning",
            title: "Significant transaction detected",
            description: `₹${Math.round(Number(t.amount))} on ${t.category?.name || "uncategorized"} (z-score: ${z.toFixed(1)})`,
            amount: Number(t.amount),
            categoryName: t.category?.name,
            date: t.transaction_date,
            zScore: z,
            recommendation: "Verify this transaction and update your budget if needed",
          });
        }
      });
    }

    // Sort by severity and limit
    const severityOrder = { alert: 0, warning: 1, info: 2 };
    return detected
      .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
      .slice(0, 12);
  }, [transactions, recurringBills, expenseAnalysis, now]);

  // ============ ENHANCED TREND DATA ============
  const trendData = useMemo((): TrendData[] => {
    const data: TrendData[] = [];
    const dailyExpenses: number[] = [];
    
    // Historical (last 30 days)
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      const dayExpense = transactions
        .filter((t) => t.transaction_date === dateStr && t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      dailyExpenses.push(dayExpense);
      data.push({
        date: format(date, "dd MMM"),
        actual: dayExpense,
      });
    }

    // Calculate average daily expense for fallback
    const avgDailyExpense = dailyExpenses.length > 0 
      ? dailyExpenses.reduce((a, b) => a + b, 0) / dailyExpenses.length 
      : totalMonthlyBills / 30;
    
    // Use fallback if no expenses recorded
    const baseForecastValue = avgDailyExpense > 0 ? avgDailyExpense : (totalMonthlyBills / 30) || 500;

    // Apply Holt-Winters for smarter forecast (with fallback for sparse data)
    const hasEnoughData = dailyExpenses.filter(e => e > 0).length >= 7;
    const model = hasEnoughData 
      ? holtWintersSmooth(dailyExpenses, 0.3, 0.1, 0.1, 7)
      : { level: baseForecastValue, trend: 0, seasonal: Array(7).fill(1) };
    
    const baseVolatility = stdDev(dailyExpenses) || baseForecastValue * 0.2;

    // Add the last actual value as bridge point for smooth transition
    const lastActualValue = data[data.length - 1]?.actual || baseForecastValue;
    
    // Forecast (next 30 days)
    for (let i = 1; i <= 30; i++) {
      const date = addDays(now, i);
      const dayOfWeek = i % 7;
      
      const seasonal = model.seasonal[dayOfWeek] || 1;
      let forecast = (model.level + model.trend * i) * seasonal;
      
      // Ensure forecast is reasonable (not zero or negative when we have data)
      if (forecast <= 0 && baseForecastValue > 0) {
        forecast = baseForecastValue * seasonal;
      }
      
      // Smooth transition from last actual value for first few days
      if (i <= 3) {
        const blendRatio = i / 4;
        forecast = lastActualValue * (1 - blendRatio) + forecast * blendRatio;
      }
      
      // Confidence bands
      const confidenceWidth = baseVolatility * Math.sqrt(i) * 0.5;
      
      data.push({
        date: format(date, "dd MMM"),
        forecast: Math.max(0, forecast),
        confidenceLow: Math.max(0, forecast - confidenceWidth),
        confidenceHigh: forecast + confidenceWidth,
      });
    }

    return data;
  }, [transactions, now, totalMonthlyBills]);

  // ============ ENHANCED SUMMARY STATS ============
  const summary = useMemo(() => {
    const criticalBudgets = budgetPredictions.filter((b) => b.riskLevel === "critical").length;
    const highRiskBudgets = budgetPredictions.filter((b) => b.riskLevel === "high").length;
    const alertAnomalies = anomalies.filter((a) => a.severity === "alert").length;
    
    // Find forecasted values by counting days from the start of forecasted data
    // Historical data is 14 days, so forecasted data starts at index 14
    const forecastedData = cashFlowForecast.filter((f) => f.isForecasted);
    const forecast30Day = forecastedData[29]; // 30th day of forecast (index 29)
    const forecast60Day = forecastedData[59]; // 60th day of forecast (index 59)
    const forecast90Day = forecastedData[89]; // 90th day of forecast (index 89)

    // Calculate confidence in forecasts
    const forecastConfidence = Math.min(95, dataQualityScore);

    return {
      criticalBudgets,
      highRiskBudgets,
      alertAnomalies,
      totalAnomalies: anomalies.length,
      forecast30Day: forecast30Day?.predicted || totalBalance + (dailyAverages.income - dailyAverages.expense) * 30,
      forecast60Day: forecast60Day?.predicted || totalBalance + (dailyAverages.income - dailyAverages.expense) * 60,
      forecast90Day: forecast90Day?.predicted || totalBalance + (dailyAverages.income - dailyAverages.expense) * 90,
      dailyBurnRate: dailyAverages.expense,
      projectedMonthlySavings: (dailyAverages.income - dailyAverages.expense) * 30,
      dataQualityScore,
      forecastConfidence,
      avgExpenseVelocity: mean(expenseAnalysis.map((e) => e.velocity)),
      seasonalPatternsCount: seasonalPatterns.length,
    };
  }, [budgetPredictions, anomalies, cashFlowForecast, totalBalance, dailyAverages, dataQualityScore, expenseAnalysis, seasonalPatterns]);

  return {
    isLoading,
    cashFlowForecast,
    cashFlowInsights,
    budgetPredictions,
    anomalies,
    trendData,
    summary,
    dailyAverages,
  };
};
