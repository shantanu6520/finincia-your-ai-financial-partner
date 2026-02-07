import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    type: string;
    icon: string | null;
    color: string | null;
  };
  spent?: number;
}

export const useBudgets = (month?: number, year?: number) => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = month || new Date().getMonth() + 1;
  const currentYear = year || new Date().getFullYear();

  const fetchBudgets = async () => {
    if (!user) return;

    setLoading(true);
    
    // Fetch budgets with category info
    const { data: budgetsData, error: budgetsError } = await supabase
      .from("budgets")
      .select(`
        *,
        category:categories(id, name, type, icon, color)
      `)
      .eq("user_id", user.id)
      .eq("month", currentMonth)
      .eq("year", currentYear);

    if (budgetsError) {
      console.error("Error fetching budgets:", budgetsError);
      setLoading(false);
      return;
    }

    // Fetch transactions to calculate spent amounts
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    const { data: transactionsData, error: transactionsError } = await supabase
      .from("transactions")
      .select("category_id, amount, type")
      .eq("user_id", user.id)
      .eq("type", "expense")
      .gte("transaction_date", startDate.toISOString().split("T")[0])
      .lte("transaction_date", endDate.toISOString().split("T")[0]);

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError);
    }

    // Calculate spent per category
    const spentByCategory: Record<string, number> = {};
    transactionsData?.forEach((tx) => {
      if (tx.category_id) {
        spentByCategory[tx.category_id] = (spentByCategory[tx.category_id] || 0) + Number(tx.amount);
      }
    });

    // Merge spent data into budgets
    const budgetsWithSpent = budgetsData?.map((budget) => ({
      ...budget,
      spent: budget.category_id ? spentByCategory[budget.category_id] || 0 : 0,
    })) || [];

    setBudgets(budgetsWithSpent);
    setLoading(false);
  };

  useEffect(() => {
    fetchBudgets();
  }, [user, currentMonth, currentYear]);

  const createBudget = async (categoryId: string, amount: number) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("budgets")
      .insert({
        user_id: user.id,
        category_id: categoryId,
        amount,
        month: currentMonth,
        year: currentYear,
      })
      .select(`
        *,
        category:categories(id, name, type, icon, color)
      `)
      .single();

    if (error) {
      if (error.code === "23505") {
        toast.error("Budget already exists for this category this month");
      } else {
        toast.error("Failed to create budget");
      }
      return { error };
    }

    setBudgets((prev) => [...prev, { ...data, spent: 0 }]);
    toast.success("Budget created successfully");
    return { data };
  };

  const updateBudget = async (id: string, amount: number) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("budgets")
      .update({ amount })
      .eq("id", id)
      .eq("user_id", user.id)
      .select(`
        *,
        category:categories(id, name, type, icon, color)
      `)
      .single();

    if (error) {
      toast.error("Failed to update budget");
      return { error };
    }

    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...data, spent: b.spent } : b))
    );
    toast.success("Budget updated successfully");
    return { data };
  };

  const deleteBudget = async (id: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to delete budget");
      return { error };
    }

    setBudgets((prev) => prev.filter((b) => b.id !== id));
    toast.success("Budget deleted successfully");
    return { error: null };
  };

  // Calculate totals
  const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const overBudgetCount = budgets.filter((b) => (b.spent || 0) > Number(b.amount)).length;
  const nearLimitCount = budgets.filter((b) => {
    const spent = b.spent || 0;
    const amount = Number(b.amount);
    return spent >= amount * 0.8 && spent <= amount;
  }).length;

  return {
    budgets,
    loading,
    totalBudgeted,
    totalSpent,
    overBudgetCount,
    nearLimitCount,
    createBudget,
    updateBudget,
    deleteBudget,
    refetch: fetchBudgets,
  };
};
