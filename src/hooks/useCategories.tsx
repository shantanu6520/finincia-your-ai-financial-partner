import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type TransactionType = Database["public"]["Enums"]["transaction_type"];

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  icon: string | null;
  color: string | null;
  is_default: boolean | null;
  created_at: string;
}

export interface CreateCategoryInput {
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
}

export const useCategories = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ["categories", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user?.id,
  });

  const createCategory = useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("categories")
        .insert({
          user_id: user.id,
          name: input.name,
          type: input.type,
          icon: input.icon,
          color: input.color,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", user?.id] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create category");
      console.error("Category creation error:", error);
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", user?.id] });
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update category");
      console.error("Category update error:", error);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Check if category is being used
      const { count, error: countError } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("category_id", id);

      if (countError) throw countError;

      if (count && count > 0) {
        throw new Error("Cannot delete category that is being used by transactions");
      }

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)
        .eq("is_default", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", user?.id] });
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
      console.error("Category deletion error:", error);
    },
  });

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return {
    categories,
    incomeCategories,
    expenseCategories,
    isLoading,
    error,
    createCategory: createCategory.mutate,
    updateCategory: updateCategory.mutate,
    deleteCategory: deleteCategory.mutate,
    isCreating: createCategory.isPending,
    isUpdating: updateCategory.isPending,
    isDeleting: deleteCategory.isPending,
  };
};
