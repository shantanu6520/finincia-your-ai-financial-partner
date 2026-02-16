import { useMemo } from "react";
import { useTransactions } from "./useTransactions";
import { useBudgets } from "./useBudgets";
import { useGoals } from "./useGoals";
import { useLoans } from "./useLoans";
import { useWallets } from "./useWallets";
import { useRecurringBills } from "./useRecurringBills";
import { format, subMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, subQuarters } from "date-fns";

export interface FinancialHealthScore {
  overall: number;
  components: {
    savings: number;
    budgetAdherence: number;
    debtManagement: number;
    goalProgress: number;
    cashFlow: number;
  };
  grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";
  interpretation: string;
}

export interface QuarterlyComparison {
  currentQuarter: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
  };
  previousQuarter: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
  };
  changes: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
  };
}

export interface MonthlyComparison {
  currentMonth: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
  };
  previousMonth: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
  };
  changes: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
  };
}

export interface ActionItem {
  priority: "urgent" | "high" | "nice-to-have";
  title: string;
  description: string;
  impact: string;
  category: string;
}

export interface FinancialWin {
  title: string;
  description: string;
  amount?: number;
  category: string;
}

export interface FinancialGap {
  title: string;
  description: string;
  severity: "critical" | "moderate" | "minor";
  category: string;
}

export interface QuarterlyReviewData {
  healthScore: FinancialHealthScore;
  quarterComparison: QuarterlyComparison;
  monthlyComparison: MonthlyComparison;
  wins: FinancialWin[];
  gaps: FinancialGap[];
  actionItems: ActionItem[];
  netWorth: number;
  totalDebt: number;
  goalsSummary: {
    total: number;
    onTrack: number;
    completed: number;
    atRisk: number;
  };
  quarterLabel: string;
  monthLabel: string;
  generatedAt: string;
}

export const useFinancialReview = () => {
  const now = new Date();
  
  // Quarterly date ranges
  const currentQuarterStart = startOfQuarter(now);
  const currentQuarterEnd = endOfQuarter(now);
  const previousQuarterStart = startOfQuarter(subQuarters(now, 1));
  const previousQuarterEnd = endOfQuarter(subQuarters(now, 1));

  // Monthly date ranges
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  // Fetch 6 months of transactions for comparison
  const { transactions, isLoading: txLoading } = useTransactions({
    startDate: format(subMonths(now, 6), "yyyy-MM-dd"),
    endDate: format(now, "yyyy-MM-dd"),
  });

  const { budgets, loading: budgetsLoading } = useBudgets();
  const { goals, loading: goalsLoading } = useGoals();
  const { loans, totalDebt, isLoading: loansLoading } = useLoans();
  const { totalBalance, isLoading: walletsLoading } = useWallets();
  const { totalMonthlyBills, isLoading: billsLoading } = useRecurringBills();

  const isLoading = txLoading || budgetsLoading || goalsLoading || loansLoading || walletsLoading || billsLoading;

  // Helper function to calculate stats for a period
  const calcPeriodStats = (txs: typeof transactions, recurringExpenses: number) => {
    const income = txs.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
    const transactionExpenses = txs.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactionExpenses + recurringExpenses;
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    return { income, expenses, savings, savingsRate };
  };

  // Calculate monthly data
  const monthlyComparison = useMemo((): MonthlyComparison => {
    const currentMonthTx = transactions.filter((t) => {
      const date = new Date(t.transaction_date);
      return date >= currentMonthStart && date <= currentMonthEnd;
    });

    const previousMonthTx = transactions.filter((t) => {
      const date = new Date(t.transaction_date);
      return date >= previousMonthStart && date <= previousMonthEnd;
    });

    const current = calcPeriodStats(currentMonthTx, totalMonthlyBills);
    const previous = calcPeriodStats(previousMonthTx, totalMonthlyBills);

    return {
      currentMonth: current,
      previousMonth: previous,
      changes: {
        income: previous.income > 0 ? ((current.income - previous.income) / previous.income) * 100 : 0,
        expenses: previous.expenses > 0 ? ((current.expenses - previous.expenses) / previous.expenses) * 100 : 0,
        savings: previous.savings !== 0 ? ((current.savings - previous.savings) / Math.abs(previous.savings)) * 100 : 0,
        savingsRate: current.savingsRate - previous.savingsRate,
      },
    };
  }, [transactions, currentMonthStart, currentMonthEnd, previousMonthStart, previousMonthEnd, totalMonthlyBills]);

  // Calculate quarterly data
  const quarterlyComparison = useMemo((): QuarterlyComparison => {
    const currentQuarterTx = transactions.filter((t) => {
      const date = new Date(t.transaction_date);
      return date >= currentQuarterStart && date <= currentQuarterEnd;
    });

    const previousQuarterTx = transactions.filter((t) => {
      const date = new Date(t.transaction_date);
      return date >= previousQuarterStart && date <= previousQuarterEnd;
    });

    // Calculate months elapsed in current quarter for proper recurring expense calculation
    const monthsInCurrentQuarter = Math.min(
      3,
      Math.ceil((Math.min(now.getTime(), currentQuarterEnd.getTime()) - currentQuarterStart.getTime()) / (1000 * 60 * 60 * 24 * 30))
    ) || 1;

    const current = calcPeriodStats(currentQuarterTx, totalMonthlyBills * monthsInCurrentQuarter);
    const previous = calcPeriodStats(previousQuarterTx, totalMonthlyBills * 3); // Full 3 months for previous quarter

    return {
      currentQuarter: current,
      previousQuarter: previous,
      changes: {
        income: previous.income > 0 ? ((current.income - previous.income) / previous.income) * 100 : 0,
        expenses: previous.expenses > 0 ? ((current.expenses - previous.expenses) / previous.expenses) * 100 : 0,
        savings: previous.savings !== 0 ? ((current.savings - previous.savings) / Math.abs(previous.savings)) * 100 : 0,
        savingsRate: current.savingsRate - previous.savingsRate,
      },
    };
  }, [transactions, currentQuarterStart, currentQuarterEnd, previousQuarterStart, previousQuarterEnd, totalMonthlyBills, now]);

  // Calculate financial health score
  const healthScore = useMemo((): FinancialHealthScore => {
    const { currentQuarter } = quarterlyComparison;
    const hasTransactions = currentQuarter.income > 0 || currentQuarter.expenses > 0;

    // Savings score (0-100): Based on savings rate
    // No income data = 0 (can't assess savings without transactions)
    let savingsScore = 0;
    if (!hasTransactions) {
      savingsScore = 0;
    } else if (currentQuarter.savingsRate >= 20) {
      savingsScore = 100;
    } else if (currentQuarter.savingsRate >= 10) {
      savingsScore = 70 + (currentQuarter.savingsRate - 10) * 3;
    } else if (currentQuarter.savingsRate >= 0) {
      savingsScore = 40 + currentQuarter.savingsRate * 3;
    } else {
      savingsScore = Math.max(0, 40 + currentQuarter.savingsRate * 2);
    }

    // Budget adherence score (0-100)
    // No budgets set = 30 (penalize lack of planning)
    let budgetScore = 30;
    if (budgets.length > 0) {
      const totalBudgets = budgets.length;
      const overBudgetCount = budgets.filter((b) => (b.spent || 0) > Number(b.amount)).length;
      const nearLimitCount = budgets.filter((b) => {
        const spent = b.spent || 0;
        const amount = Number(b.amount);
        return spent >= amount * 0.8 && spent <= amount;
      }).length;
      // Deduct for over-budget and slightly for near-limit
      budgetScore = Math.max(0, 100 - (overBudgetCount / totalBudgets) * 60 - (nearLimitCount / totalBudgets) * 15);
    }

    // Debt management score (0-100)
    // No debt and no loans = 100 (genuinely good)
    // Has debt but no income data = 40
    const monthlyIncome = currentQuarter.income / 3;
    let debtScore = 100;
    if (totalDebt > 0) {
      if (monthlyIncome <= 0) {
        debtScore = 40; // Can't properly assess without income
      } else {
        const debtToIncomeRatio = totalDebt / (monthlyIncome * 12);
        if (debtToIncomeRatio <= 0.2) debtScore = 100;
        else if (debtToIncomeRatio <= 0.4) debtScore = 85;
        else if (debtToIncomeRatio <= 0.6) debtScore = 70;
        else if (debtToIncomeRatio <= 1) debtScore = 55;
        else if (debtToIncomeRatio <= 2) debtScore = 35;
        else debtScore = 15;
      }
    }

    // Goal progress score (0-100)
    // No active goals = 30 (penalize lack of goal-setting)
    let goalScore = 30;
    const activeGoals = goals.filter((g) => g.status === "active");
    const completedGoals = goals.filter((g) => g.status === "completed");
    if (activeGoals.length > 0 || completedGoals.length > 0) {
      const allRelevantGoals = [...activeGoals, ...completedGoals];
      const avgProgress = allRelevantGoals.reduce((sum, g) => {
        if (g.status === "completed") return sum + 100;
        const progress = (Number(g.current_amount) / Number(g.target_amount)) * 100;
        // Also factor in time-based expected progress
        const daysToTarget = Math.ceil((new Date(g.target_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const totalDays = Math.ceil((new Date(g.target_date).getTime() - new Date(g.created_at).getTime()) / (1000 * 60 * 60 * 24));
        const timeElapsedRatio = totalDays > 0 ? Math.max(0, 1 - daysToTarget / totalDays) : 1;
        const expectedProgress = timeElapsedRatio * 100;
        // Score based on actual vs expected progress
        const progressRatio = expectedProgress > 0 ? Math.min(1.2, progress / expectedProgress) : (progress > 0 ? 1 : 0);
        return sum + Math.min(100, progressRatio * 100);
      }, 0) / allRelevantGoals.length;
      goalScore = Math.round(avgProgress);
    }

    // Cash flow score (0-100): Based on actual cash flow health
    let cashFlowScore = 0;
    if (!hasTransactions) {
      cashFlowScore = 0;
    } else {
      // Base score on savings ratio
      if (currentQuarter.savings > 0) {
        const savingsRatio = currentQuarter.savings / currentQuarter.income;
        cashFlowScore = Math.min(80, savingsRatio * 200); // 40% savings = 80
      } else {
        // Negative cash flow
        cashFlowScore = Math.max(0, 30 + (currentQuarter.savings / currentQuarter.expenses) * 30);
      }
      // Bonus for improvement over previous quarter
      if (quarterlyComparison.changes.savings > 0) cashFlowScore = Math.min(100, cashFlowScore + 20);
    }

    // Overall score (weighted average)
    const overall = Math.round(
      savingsScore * 0.25 +
      budgetScore * 0.2 +
      debtScore * 0.2 +
      goalScore * 0.15 +
      cashFlowScore * 0.2
    );

    // Grade calculation
    let grade: FinancialHealthScore["grade"] = "F";
    let interpretation = "";
    if (overall >= 90) { grade = "A+"; interpretation = "Exceptional financial health. You're managing money like a pro!"; }
    else if (overall >= 80) { grade = "A"; interpretation = "Excellent financial health. Keep up the great work!"; }
    else if (overall >= 72) { grade = "B+"; interpretation = "Very good financial health with room for small improvements."; }
    else if (overall >= 62) { grade = "B"; interpretation = "Good financial health. Focus on savings and debt reduction."; }
    else if (overall >= 52) { grade = "C+"; interpretation = "Above average. Some areas need attention."; }
    else if (overall >= 42) { grade = "C"; interpretation = "Average financial health. Several areas need improvement."; }
    else if (overall >= 30) { grade = "D"; interpretation = "Below average. Set up budgets and goals to improve your score."; }
    else { grade = "F"; interpretation = "Insufficient data or critical gaps. Start tracking income, expenses, and set budgets."; }

    return {
      overall,
      components: {
        savings: Math.round(savingsScore),
        budgetAdherence: Math.round(budgetScore),
        debtManagement: Math.round(debtScore),
        goalProgress: Math.round(goalScore),
        cashFlow: Math.round(cashFlowScore),
      },
      grade,
      interpretation,
    };
  }, [quarterlyComparison, budgets, totalDebt, goals, now]);

  // Identify wins
  const wins = useMemo((): FinancialWin[] => {
    const winsList: FinancialWin[] = [];

    if (quarterlyComparison.changes.savings > 10) {
      winsList.push({
        title: "Savings Improved!",
        description: `Your savings increased by ${quarterlyComparison.changes.savings.toFixed(0)}% compared to last quarter.`,
        amount: quarterlyComparison.currentQuarter.savings - quarterlyComparison.previousQuarter.savings,
        category: "Savings",
      });
    }

    if (quarterlyComparison.changes.expenses < -5) {
      winsList.push({
        title: "Expenses Under Control",
        description: `You reduced spending by ${Math.abs(quarterlyComparison.changes.expenses).toFixed(0)}% this quarter.`,
        category: "Spending",
      });
    }

    const completedGoals = goals.filter((g) => g.status === "completed");
    if (completedGoals.length > 0) {
      winsList.push({
        title: "Goals Achieved!",
        description: `Congratulations on completing ${completedGoals.length} financial goal(s).`,
        category: "Goals",
      });
    }

    if (quarterlyComparison.currentQuarter.savingsRate >= 20) {
      winsList.push({
        title: "Strong Savings Rate",
        description: `Your ${quarterlyComparison.currentQuarter.savingsRate.toFixed(0)}% savings rate exceeds the recommended 20%.`,
        category: "Savings",
      });
    }

    const onBudgetCategories = budgets.filter((b) => (b.spent || 0) <= Number(b.amount)).length;
    if (budgets.length > 0 && onBudgetCategories / budgets.length >= 0.8) {
      winsList.push({
        title: "Budget Discipline",
        description: `${Math.round((onBudgetCategories / budgets.length) * 100)}% of your budgets are on track.`,
        category: "Budgeting",
      });
    }

    return winsList;
  }, [quarterlyComparison, goals, budgets]);

  // Identify gaps
  const gaps = useMemo((): FinancialGap[] => {
    const gapsList: FinancialGap[] = [];

    if (quarterlyComparison.currentQuarter.savingsRate < 10) {
      gapsList.push({
        title: "Low Savings Rate",
        description: `Your ${quarterlyComparison.currentQuarter.savingsRate.toFixed(0)}% savings rate is below the recommended 10-20%.`,
        severity: quarterlyComparison.currentQuarter.savingsRate < 0 ? "critical" : "moderate",
        category: "Savings",
      });
    }

    if (quarterlyComparison.changes.expenses > 20) {
      gapsList.push({
        title: "Rising Expenses",
        description: `Expenses increased by ${quarterlyComparison.changes.expenses.toFixed(0)}% - review spending categories.`,
        severity: "moderate",
        category: "Spending",
      });
    }

    const overBudgetCategories = budgets.filter((b) => (b.spent || 0) > Number(b.amount));
    if (overBudgetCategories.length > 0) {
      gapsList.push({
        title: "Budget Overruns",
        description: `${overBudgetCategories.length} budget(s) exceeded: ${overBudgetCategories.map((b) => b.category?.name).join(", ")}.`,
        severity: overBudgetCategories.length > 2 ? "critical" : "moderate",
        category: "Budgeting",
      });
    }

    const atRiskGoals = goals.filter((g) => {
      if (g.status !== "active") return false;
      const progress = (Number(g.current_amount) / Number(g.target_amount)) * 100;
      const daysToTarget = Math.ceil((new Date(g.target_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const expectedProgress = Math.max(0, 100 - (daysToTarget / 365) * 100);
      return progress < expectedProgress - 20;
    });

    if (atRiskGoals.length > 0) {
      gapsList.push({
        title: "Goals at Risk",
        description: `${atRiskGoals.length} goal(s) are behind schedule: ${atRiskGoals.map((g) => g.name).join(", ")}.`,
        severity: "moderate",
        category: "Goals",
      });
    }

    if (totalDebt > quarterlyComparison.currentQuarter.income) {
      gapsList.push({
        title: "High Debt Load",
        description: "Total debt exceeds quarterly income. Focus on debt reduction.",
        severity: "critical",
        category: "Debt",
      });
    }

    return gapsList;
  }, [quarterlyComparison, budgets, goals, totalDebt, now]);

  // Generate action items
  const actionItems = useMemo((): ActionItem[] => {
    const actions: ActionItem[] = [];

    // Critical actions from gaps
    gaps.filter((g) => g.severity === "critical").forEach((gap) => {
      actions.push({
        priority: "urgent",
        title: `Address: ${gap.title}`,
        description: gap.description,
        impact: "High impact on financial health score",
        category: gap.category,
      });
    });

    // High priority actions
    if (quarterlyComparison.currentQuarter.savingsRate < 20) {
      actions.push({
        priority: "high",
        title: "Increase Savings Rate",
        description: `Target 20% savings rate. Current: ${quarterlyComparison.currentQuarter.savingsRate.toFixed(0)}%.`,
        impact: "Could improve score by 10-15 points",
        category: "Savings",
      });
    }

    if (loans.length > 1) {
      actions.push({
        priority: "high",
        title: "Review Debt Strategy",
        description: "Consider debt avalanche or snowball method to accelerate payoff.",
        impact: "Potential interest savings and faster debt freedom",
        category: "Debt",
      });
    }

    // Nice to have
    if (goals.filter((g) => g.status === "active").length === 0) {
      actions.push({
        priority: "nice-to-have",
        title: "Set Financial Goals",
        description: "Create specific, measurable financial goals to track progress.",
        impact: "Better focus and motivation",
        category: "Goals",
      });
    }

    if (budgets.length === 0) {
      actions.push({
        priority: "nice-to-have",
        title: "Create Budget Categories",
        description: "Set up monthly budgets to control spending.",
        impact: "Better expense tracking and control",
        category: "Budgeting",
      });
    }

    return actions.slice(0, 7); // Limit to 7 action items
  }, [gaps, quarterlyComparison, loans, goals, budgets]);

  // Goals summary
  const goalsSummary = useMemo(() => {
    const activeGoals = goals.filter((g) => g.status === "active");
    const completedGoals = goals.filter((g) => g.status === "completed");
    const atRiskGoals = activeGoals.filter((g) => {
      const progress = (Number(g.current_amount) / Number(g.target_amount)) * 100;
      const daysToTarget = Math.ceil((new Date(g.target_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const expectedProgress = Math.max(0, 100 - (daysToTarget / 365) * 100);
      return progress < expectedProgress - 20;
    });

    return {
      total: goals.length,
      onTrack: activeGoals.length - atRiskGoals.length,
      completed: completedGoals.length,
      atRisk: atRiskGoals.length,
    };
  }, [goals, now]);

  const quarterLabel = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;
  const monthLabel = format(now, "MMMM yyyy");

  return {
    isLoading,
    reviewData: {
      healthScore,
      quarterComparison: quarterlyComparison,
      monthlyComparison,
      wins,
      gaps,
      actionItems,
      netWorth: totalBalance - totalDebt,
      totalDebt,
      goalsSummary,
      quarterLabel,
      monthLabel,
      generatedAt: format(now, "dd MMM yyyy, HH:mm"),
    } as QuarterlyReviewData,
  };
};
