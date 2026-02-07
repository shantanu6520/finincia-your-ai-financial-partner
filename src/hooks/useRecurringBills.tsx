import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface RecurringBill {
  id: string;
  user_id: string;
  name: string;
  provider: string | null;
  amount: number;
  frequency: string;
  category: string | null;
  due_date: number | null;
  last_paid_date: string | null;
  is_negotiated: boolean;
  savings_achieved: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBillInput {
  name: string;
  provider?: string;
  amount: number;
  frequency?: string;
  category?: string;
  due_date?: number;
  notes?: string;
}

export const useRecurringBills = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bills = [], isLoading, error } = useQuery({
    queryKey: ["recurring_bills", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("recurring_bills")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("amount", { ascending: false });

      if (error) throw error;
      return data as RecurringBill[];
    },
    enabled: !!user?.id,
  });

  const createBill = useMutation({
    mutationFn: async (input: CreateBillInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("recurring_bills")
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring_bills", user?.id] });
      toast.success("Bill added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add bill");
      console.error("Bill creation error:", error);
    },
  });

  const updateBill = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RecurringBill> & { id: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("recurring_bills")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring_bills", user?.id] });
      toast.success("Bill updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update bill");
      console.error("Bill update error:", error);
    },
  });

  const deleteBill = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("recurring_bills")
        .update({ is_active: false })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring_bills", user?.id] });
      toast.success("Bill removed successfully");
    },
    onError: (error) => {
      toast.error("Failed to remove bill");
      console.error("Bill deletion error:", error);
    },
  });

  const markAsNegotiated = useMutation({
    mutationFn: async ({ id, savings }: { id: string; savings: number }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("recurring_bills")
        .update({
          is_negotiated: true,
          savings_achieved: savings,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring_bills", user?.id] });
      toast.success("Savings recorded!");
    },
    onError: (error) => {
      toast.error("Failed to record savings");
      console.error("Mark negotiated error:", error);
    },
  });
  // Get monthly equivalent of a bill
  const getMonthlyEquivalent = (bill: RecurringBill): number => {
    const amount = Number(bill.amount);
    switch (bill.frequency) {
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

  // Calculate totals - convert ALL bills to monthly equivalents
  const totalMonthlyBills = bills.reduce((sum, b) => sum + getMonthlyEquivalent(b), 0);

  const totalSavingsAchieved = bills.reduce((sum, b) => sum + Number(b.savings_achieved), 0);

  const negotiatedCount = bills.filter((b) => b.is_negotiated).length;

  // Get annual cost of a bill
  const getAnnualCost = (bill: RecurringBill) => {
    switch (bill.frequency) {
      case "weekly":
        return bill.amount * 52;
      case "monthly":
        return bill.amount * 12;
      case "quarterly":
        return bill.amount * 4;
      case "yearly":
        return bill.amount;
      default:
        return bill.amount * 12;
    }
  };

  const totalAnnualBills = bills.reduce((sum, b) => sum + getAnnualCost(b), 0);

  return {
    bills,
    isLoading,
    error,
    totalMonthlyBills,
    totalAnnualBills,
    totalSavingsAchieved,
    negotiatedCount,
    getAnnualCost,
    createBill: createBill.mutate,
    updateBill: updateBill.mutate,
    deleteBill: deleteBill.mutate,
    markAsNegotiated: markAsNegotiated.mutate,
    isCreating: createBill.isPending,
    isUpdating: updateBill.isPending,
    isDeleting: deleteBill.isPending,
  };
};
