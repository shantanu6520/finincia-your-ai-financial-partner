import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Loan {
  id: string;
  user_id: string;
  name: string;
  principal_amount: number;
  current_balance: number;
  interest_rate: number;
  emi_amount: number;
  tenure_months: number;
  start_date: string;
  loan_type: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLoanInput {
  name: string;
  principal_amount: number;
  current_balance: number;
  interest_rate: number;
  emi_amount: number;
  tenure_months: number;
  start_date?: string;
  loan_type?: string;
  notes?: string;
}

export const useLoans = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: loans = [], isLoading, error } = useQuery({
    queryKey: ["loans", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Loan[];
    },
    enabled: !!user?.id,
  });

  const createLoan = useMutation({
    mutationFn: async (input: CreateLoanInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("loans")
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
      queryClient.invalidateQueries({ queryKey: ["loans", user?.id] });
      toast.success("Loan added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add loan");
      console.error("Loan creation error:", error);
    },
  });

  const updateLoan = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Loan> & { id: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("loans")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans", user?.id] });
      toast.success("Loan updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update loan");
      console.error("Loan update error:", error);
    },
  });

  const deleteLoan = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("loans")
        .update({ is_active: false })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans", user?.id] });
      toast.success("Loan removed successfully");
    },
    onError: (error) => {
      toast.error("Failed to remove loan");
      console.error("Loan deletion error:", error);
    },
  });

  // Calculate totals
  const totalDebt = loans.reduce((sum, l) => sum + Number(l.current_balance), 0);
  const totalEMI = loans.reduce((sum, l) => sum + Number(l.emi_amount), 0);
  const avgInterestRate = loans.length > 0
    ? loans.reduce((sum, l) => sum + Number(l.interest_rate), 0) / loans.length
    : 0;

  // Calculate months to debt-free (simplified)
  const getMonthsToDebtFree = (loan: Loan) => {
    if (loan.emi_amount <= 0) return Infinity;
    return Math.ceil(loan.current_balance / loan.emi_amount);
  };

  // Calculate total interest payable (simplified)
  const getTotalInterest = (loan: Loan) => {
    const months = getMonthsToDebtFree(loan);
    const totalPayment = months * loan.emi_amount;
    return totalPayment - loan.current_balance;
  };

  return {
    loans,
    isLoading,
    error,
    totalDebt,
    totalEMI,
    avgInterestRate,
    getMonthsToDebtFree,
    getTotalInterest,
    createLoan: createLoan.mutate,
    updateLoan: updateLoan.mutate,
    deleteLoan: deleteLoan.mutate,
    isCreating: createLoan.isPending,
    isUpdating: updateLoan.isPending,
    isDeleting: deleteLoan.isPending,
  };
};
