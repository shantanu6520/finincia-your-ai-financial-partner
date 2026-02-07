import { useMemo } from "react";
import { useTransactions } from "./useTransactions";
import { useRecurringBills } from "./useRecurringBills";
import { useWallets } from "./useWallets";
import { format, startOfMonth, endOfMonth } from "date-fns";

export interface FinancialSummary {
  // Transaction-based
  transactionIncome: number;
  transactionExpenses: number;
  
  // Recurring bills (monthly equivalent)
  monthlyRecurringExpenses: number;
  
  // Combined totals
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  savingsRate: number;
  
  // Balance
  totalBalance: number;
  
  // Recurring bill details
  recurringBillsCount: number;
  annualRecurringExpenses: number;
}

export const useFinancialSummary = (options?: {
  startDate?: string;
  endDate?: string;
  includeRecurring?: boolean;
}) => {
  const now = new Date();
  const defaultStartDate = format(startOfMonth(now), "yyyy-MM-dd");
  const defaultEndDate = format(endOfMonth(now), "yyyy-MM-dd");
  
  const startDate = options?.startDate || defaultStartDate;
  const endDate = options?.endDate || defaultEndDate;
  const includeRecurring = options?.includeRecurring !== false; // Default true
  
  const { 
    transactions, 
    totalIncome: transactionIncome, 
    totalExpenses: transactionExpenses,
    isLoading: txLoading 
  } = useTransactions({ startDate, endDate });
  
  const { 
    bills: recurringBills, 
    totalMonthlyBills: monthlyRecurringExpenses,
    totalAnnualBills: annualRecurringExpenses,
    isLoading: billsLoading 
  } = useRecurringBills();
  
  const { totalBalance, isLoading: walletsLoading } = useWallets();
  
  const isLoading = txLoading || billsLoading || walletsLoading;

  const summary = useMemo((): FinancialSummary => {
    // Calculate total expenses including recurring bills
    const totalExpenses = includeRecurring 
      ? transactionExpenses + monthlyRecurringExpenses 
      : transactionExpenses;
    
    const totalIncome = transactionIncome;
    const totalSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
    
    return {
      transactionIncome,
      transactionExpenses,
      monthlyRecurringExpenses,
      totalIncome,
      totalExpenses,
      totalSavings,
      savingsRate,
      totalBalance,
      recurringBillsCount: recurringBills.length,
      annualRecurringExpenses,
    };
  }, [
    transactionIncome,
    transactionExpenses,
    monthlyRecurringExpenses,
    annualRecurringExpenses,
    totalBalance,
    recurringBills.length,
    includeRecurring,
  ]);

  return {
    ...summary,
    transactions,
    recurringBills,
    isLoading,
  };
};

// Helper function to get monthly equivalent of a bill
export const getMonthlyEquivalent = (amount: number, frequency: string): number => {
  switch (frequency) {
    case "weekly":
      return amount * 4.33; // Average weeks per month
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "yearly":
      return amount / 12;
    default:
      return amount;
  }
};
