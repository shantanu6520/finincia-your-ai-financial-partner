import { useMemo } from "react";
import { useTransactions } from "./useTransactions";
import { useBudgets } from "./useBudgets";
import { useGoals } from "./useGoals";
import { useLoans } from "./useLoans";
import { useWallets } from "./useWallets";
import { useRecurringBills } from "./useRecurringBills";
import { format, subMonths, startOfQuarter, endOfQuarter, subQuarters } from "date-fns";

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
  generatedAt: string;
}

export const useFinancialReview = () => {
  const now = new Date();
  const currentQuarterStart = startOfQuarter(now);
  const currentQuarterEnd = endOfQuarter(now);
  const previousQuarterStart = startOfQuarter(subQuarters(now, 1));
  const previousQuarterEnd = endOfQuarter(subQuarters(now, 1));

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

  // Calculate quarterly recurring expenses (3 months)
  const quarterlyRecurringExpenses = totalMonthlyBills * 3;

  // Calculate quarterly data (including recurring expenses)
  const quarterlyComparison = useMemo((): QuarterlyComparison => {
    const currentQuarterTx = transactions.filter((t) => {
      const date = new Date(t.transaction_date);
      return date >= currentQuarterStart && date <= currentQuarterEnd;
    });

    const previousQuarterTx = transactions.filter((t) => {
      const date = new Date(t.transaction_date);
      return date >= previousQuarterStart && date <= previousQuarterEnd;
    });

    const calcStats = (txs: typeof transactions, includeRecurring = false) => {
      const income = txs.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
      const transactionExpenses = txs.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
      // Add recurring expenses for current quarter calculations
      const expenses = includeRecurring ? transactionExpenses + quarterlyRecurringExpenses : transactionExpenses;
      const savings = income - expenses;
      const savingsRate = income > 0 ? (savings / income) * 100 : 0;
      return { income, expenses, savings, savingsRate };
    };

    const current = calcStats(currentQuarterTx, true); // Include recurring for current
    const previous = calcStats(previousQuarterTx, false); // Previous doesn't have recurring data

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
  }, [transactions, currentQuarterStart, currentQuarterEnd, previousQuarterStart, previousQuarterEnd, quarterlyRecurringExpenses]);

  // Calculate financial health score
  const healthScore = useMemo((): FinancialHealthScore => {
    const { currentQuarter } = quarterlyComparison;

    // Savings score (0-100): Based on savings rate
    // Ideal: 20%+ = 100, 10-20% = 70-99, 0-10% = 40-69, <0% = 0-39
    let savingsScore = 0;
    if (currentQuarter.savingsRate >= 20) savingsScore = 100;
    else if (currentQuarter.savingsRate >= 10) savingsScore = 70 + (currentQuarter.savingsRate - 10) * 3;
    else if (currentQuarter.savingsRate >= 0) savingsScore = 40 + currentQuarter.savingsRate * 3;
    else savingsScore = Math.max(0, 40 + currentQuarter.savingsRate * 2);

    // Budget adherence score (0-100)
    let budgetScore = 100;
    if (budgets.length > 0) {
      const overBudgetCount = budgets.filter((b) => (b.spent || 0) > Number(b.amount)).length;
      budgetScore = Math.max(0, 100 - (overBudgetCount / budgets.length) * 100);
    }

    // Debt management score (0-100)
    // Based on debt-to-income ratio (monthly income to total debt)
    const monthlyIncome = currentQuarter.income / 3;
    let debtScore = 100;
    if (monthlyIncome > 0 && totalDebt > 0) {
      const debtToIncomeRatio = totalDebt / (monthlyIncome * 12);
      if (debtToIncomeRatio <= 0.3) debtScore = 100;
      else if (debtToIncomeRatio <= 0.5) debtScore = 80;
      else if (debtToIncomeRatio <= 1) debtScore = 60;
      else if (debtToIncomeRatio <= 2) debtScore = 40;
      else debtScore = 20;
    }

    // Goal progress score (0-100)
    let goalScore = 100;
    const activeGoals = goals.filter((g) => g.status === "active");
    if (activeGoals.length > 0) {
      const avgProgress = activeGoals.reduce((sum, g) => {
        const progress = (Number(g.current_amount) / Number(g.target_amount)) * 100;
        return sum + Math.min(100, progress);
      }, 0) / activeGoals.length;
      goalScore = avgProgress;
    }

    // Cash flow score (0-100): Based on positive vs negative months
    let cashFlowScore = currentQuarter.savings >= 0 ? 80 : 40;
    if (quarterlyComparison.changes.savings > 0) cashFlowScore += 20;

    // Overall score (weighted average)
    const overall = Math.round(
      savingsScore * 0.25 +
      budgetScore * 0.2 +
      debtScore * 0.25 +
      goalScore * 0.15 +
      cashFlowScore * 0.15
    );

    // Grade calculation
    let grade: FinancialHealthScore["grade"] = "F";
    let interpretation = "";
    if (overall >= 95) { grade = "A+"; interpretation = "Exceptional financial health. You're managing money like a pro!"; }
    else if (overall >= 85) { grade = "A"; interpretation = "Excellent financial health. Keep up the great work!"; }
    else if (overall >= 80) { grade = "B+"; interpretation = "Very good financial health with room for small improvements."; }
    else if (overall >= 70) { grade = "B"; interpretation = "Good financial health. Focus on savings and debt reduction."; }
    else if (overall >= 65) { grade = "C+"; interpretation = "Above average. Some areas need attention."; }
    else if (overall >= 55) { grade = "C"; interpretation = "Average financial health. Several areas need improvement."; }
    else if (overall >= 45) { grade = "D"; interpretation = "Below average. Immediate action recommended."; }
    else { grade = "F"; interpretation = "Critical attention needed. Focus on expense reduction and income growth."; }

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
  }, [quarterlyComparison, budgets, totalDebt, goals]);

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

  return {
    isLoading,
    reviewData: {
      healthScore,
      quarterComparison: quarterlyComparison,
      wins,
      gaps,
      actionItems,
      netWorth: totalBalance - totalDebt,
      totalDebt,
      goalsSummary,
      quarterLabel,
      generatedAt: format(now, "dd MMM yyyy, HH:mm"),
    } as QuarterlyReviewData,
  };
};
