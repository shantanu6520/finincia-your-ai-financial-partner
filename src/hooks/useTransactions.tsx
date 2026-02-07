import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type TransactionType = Database["public"]["Enums"]["transaction_type"];

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  transaction_date: string;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithDetails extends Transaction {
  wallet?: { name: string; type: string };
  category?: { name: string; icon: string };
}

export interface CreateTransactionInput {
  wallet_id: string;
  category_id?: string;
  amount: number;
  type: TransactionType;
  transaction_date?: string;
  notes?: string;
  tags?: string[];
}

export const useTransactions = (filters?: {
  startDate?: string;
  endDate?: string;
  walletId?: string;
  type?: TransactionType;
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ["transactions", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("transactions")
        .select(`
          *,
          wallet:wallets(name, type),
          category:categories(name, icon)
        `)
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (filters?.startDate) {
        query = query.gte("transaction_date", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("transaction_date", filters.endDate);
      }
      if (filters?.walletId) {
        query = query.eq("wallet_id", filters.walletId);
      }
      if (filters?.type) {
        query = query.eq("type", filters.type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TransactionWithDetails[];
    },
    enabled: !!user?.id,
  });

  const createTransaction = useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Create the transaction
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          wallet_id: input.wallet_id,
          category_id: input.category_id,
          amount: input.amount,
          type: input.type,
          transaction_date: input.transaction_date || new Date().toISOString().split("T")[0],
          notes: input.notes,
          tags: input.tags,
        })
        .select()
        .single();

      if (txError) throw txError;

      // Update wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("id", input.wallet_id)
        .single();

      if (walletError) throw walletError;

      const newBalance = input.type === "income"
        ? Number(wallet.balance) + input.amount
        : Number(wallet.balance) - input.amount;

      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", input.wallet_id);

      if (updateError) throw updateError;

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallets", user?.id] });
      toast.success("Transaction added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add transaction");
      console.error("Transaction creation error:", error);
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallets", user?.id] });
      toast.success("Transaction updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update transaction");
      console.error("Transaction update error:", error);
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Get the transaction to restore wallet balance
      const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("wallet_id, amount, type")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Restore wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("id", transaction.wallet_id)
        .single();

      if (walletError) throw walletError;

      const newBalance = transaction.type === "income"
        ? Number(wallet.balance) - Number(transaction.amount)
        : Number(wallet.balance) + Number(transaction.amount);

      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", transaction.wallet_id);

      if (updateError) throw updateError;

      // Delete the transaction
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallets", user?.id] });
      toast.success("Transaction deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete transaction");
      console.error("Transaction deletion error:", error);
    },
  });

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    transactions,
    isLoading,
    error,
    totalIncome,
    totalExpenses,
    createTransaction: createTransaction.mutate,
    updateTransaction: updateTransaction.mutate,
    deleteTransaction: deleteTransaction.mutate,
    isCreating: createTransaction.isPending,
    isUpdating: updateTransaction.isPending,
    isDeleting: deleteTransaction.isPending,
  };
};
