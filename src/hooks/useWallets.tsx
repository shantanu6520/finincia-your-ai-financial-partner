import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type WalletType = Database["public"]["Enums"]["wallet_type"];

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  type: WalletType;
  balance: number;
  icon: string | null;
  color: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWalletInput {
  name: string;
  type: WalletType;
  balance?: number;
  icon?: string;
  color?: string;
}

export const useWallets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wallets = [], isLoading, error } = useQuery({
    queryKey: ["wallets", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Wallet[];
    },
    enabled: !!user?.id,
  });

  const createWallet = useMutation({
    mutationFn: async (input: CreateWalletInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("wallets")
        .insert({
          user_id: user.id,
          name: input.name,
          type: input.type,
          balance: input.balance || 0,
          icon: input.icon,
          color: input.color,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets", user?.id] });
      toast.success("Wallet created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create wallet");
      console.error("Wallet creation error:", error);
    },
  });

  const updateWallet = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Wallet> & { id: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("wallets")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets", user?.id] });
      toast.success("Wallet updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update wallet");
      console.error("Wallet update error:", error);
    },
  });

  const deleteWallet = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("wallets")
        .update({ is_active: false })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets", user?.id] });
      toast.success("Wallet deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete wallet");
      console.error("Wallet deletion error:", error);
    },
  });

  const totalBalance = wallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0);

  return {
    wallets,
    isLoading,
    error,
    totalBalance,
    createWallet: createWallet.mutate,
    updateWallet: updateWallet.mutate,
    deleteWallet: deleteWallet.mutate,
    isCreating: createWallet.isPending,
    isUpdating: updateWallet.isPending,
    isDeleting: deleteWallet.isPending,
  };
};
