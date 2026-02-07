import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type GoalStatus = "active" | "completed" | "paused" | "cancelled";

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: GoalStatus;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalInput {
  name: string;
  description?: string;
  target_amount: number;
  target_date: string;
  icon?: string;
  color?: string;
}

export const useGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching goals:", error);
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const createGoal = async (input: CreateGoalInput) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        name: input.name,
        description: input.description || null,
        target_amount: input.target_amount,
        target_date: input.target_date,
        icon: input.icon || "target",
        color: input.color || "#10B981",
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create goal");
      return { error };
    }

    setGoals((prev) => [data, ...prev]);
    toast.success("Goal created successfully");
    return { data };
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { data, error } = await supabase
      .from("goals")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      toast.error("Failed to update goal");
      return { error };
    }

    setGoals((prev) => prev.map((g) => (g.id === id ? data : g)));
    toast.success("Goal updated successfully");
    return { data };
  };

  const addContribution = async (id: string, amount: number) => {
    if (!user) return { error: new Error("Not authenticated") };

    const goal = goals.find((g) => g.id === id);
    if (!goal) return { error: new Error("Goal not found") };

    const newAmount = Number(goal.current_amount) + amount;
    const isComplete = newAmount >= Number(goal.target_amount);

    const { data, error } = await supabase
      .from("goals")
      .update({
        current_amount: newAmount,
        status: isComplete ? "completed" : "active",
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      toast.error("Failed to add contribution");
      return { error };
    }

    setGoals((prev) => prev.map((g) => (g.id === id ? data : g)));
    
    if (isComplete) {
      toast.success("🎉 Congratulations! Goal completed!");
    } else {
      toast.success("Contribution added successfully");
    }
    
    return { data };
  };

  const deleteGoal = async (id: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to delete goal");
      return { error };
    }

    setGoals((prev) => prev.filter((g) => g.id !== id));
    toast.success("Goal deleted successfully");
    return { error: null };
  };

  // Calculate stats
  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const totalTargetAmount = activeGoals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const totalSavedAmount = activeGoals.reduce((sum, g) => sum + Number(g.current_amount), 0);

  // Helper function to calculate progress
  const getProgress = (goal: Goal) => {
    return Math.min(100, (Number(goal.current_amount) / Number(goal.target_amount)) * 100);
  };

  // Helper function to calculate months remaining
  const getMonthsRemaining = (goal: Goal) => {
    const today = new Date();
    const targetDate = new Date(goal.target_date);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.ceil(diffDays / 30));
  };

  // Helper function to calculate monthly contribution needed
  const getMonthlyContribution = (goal: Goal) => {
    const remaining = Number(goal.target_amount) - Number(goal.current_amount);
    const months = getMonthsRemaining(goal);
    return months > 0 ? remaining / months : remaining;
  };

  // Helper function to get goal status label
  const getStatusLabel = (goal: Goal) => {
    const progress = getProgress(goal);
    const monthsRemaining = getMonthsRemaining(goal);
    const monthlyNeeded = getMonthlyContribution(goal);
    
    if (goal.status === "completed") return { label: "COMPLETED", color: "text-green-500" };
    if (goal.status === "paused") return { label: "PAUSED", color: "text-yellow-500" };
    if (goal.status === "cancelled") return { label: "CANCELLED", color: "text-red-500" };
    
    // Check if on track (simplified logic)
    if (monthsRemaining === 0 && progress < 100) {
      return { label: "BEHIND", color: "text-red-500" };
    }
    
    if (progress >= 75) return { label: "AHEAD", color: "text-green-500" };
    if (progress >= 50) return { label: "ON TRACK", color: "text-blue-500" };
    return { label: "BEHIND", color: "text-orange-500" };
  };

  return {
    goals,
    loading,
    activeGoals,
    completedGoals,
    totalTargetAmount,
    totalSavedAmount,
    createGoal,
    updateGoal,
    addContribution,
    deleteGoal,
    getProgress,
    getMonthsRemaining,
    getMonthlyContribution,
    getStatusLabel,
    refetch: fetchGoals,
  };
};
