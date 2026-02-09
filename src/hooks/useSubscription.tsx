import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Subscription {
  id: string;
  user_id: string;
  razorpay_subscription_id: string | null;
  razorpay_customer_id: string | null;
  plan_type: "monthly" | "annual";
  status: "pending" | "active" | "cancelled" | "expired" | "paused";
  current_period_start: string | null;
  current_period_end: string | null;
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: any) => void | Promise<void>;
  prefill?: {
    email?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: () => void) => void;
    };
  }
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setIsLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data as Subscription | null);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const subscribe = async (planType: "monthly" | "annual") => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      return;
    }

    setIsProcessing(true);

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load Razorpay checkout");
      }

      // Get session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      console.log("Creating subscription for plan:", planType);

      // Create subscription via edge function
      const { data, error } = await supabase.functions.invoke("razorpay-subscription", {
        body: { planType },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      if (!data?.subscription_id || !data?.key_id) {
        console.error("Invalid response from subscription API:", data);
        throw new Error("Invalid subscription response");
      }

      console.log("Subscription created, opening Razorpay checkout:", data);

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: data.key_id,
        subscription_id: data.subscription_id,
        name: data.name,
        description: data.description,
        handler: async (response: any) => {
          try {
            console.log("Payment successful:", response);
            toast.success("Subscription activated successfully!");
            await fetchSubscription();
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: () => {
            console.log("Razorpay modal dismissed");
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setIsProcessing(false);
      });
      
      
      razorpay.open();

    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error(error.message || "Failed to start subscription");
      setIsProcessing(false);
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) {
      toast.error("No subscription to cancel");
      return;
    }

    setIsProcessing(true);

    try {
      // Call the cancellation edge function
      const { data, error } = await supabase.functions.invoke("razorpay-cancel-subscription");

      if (error) {
        console.error("Cancel function error:", error);
        throw new Error(error.message || "Failed to cancel subscription");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Failed to cancel subscription");
      }

      toast.success("Subscription cancelled successfully");
      await fetchSubscription();
    } catch (error: any) {
      console.error("Cancel error:", error);
      toast.error(error.message || "Failed to cancel subscription");
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if subscription is active AND within the valid period
  const isPro = (() => {
    if (subscription?.status !== "active") return false;
    
    // If no period end date, assume active (shouldn't happen normally)
    if (!subscription.current_period_end) return true;
    
    // Check if current date is before the period end date
    const periodEnd = new Date(subscription.current_period_end);
    const now = new Date();
    return now < periodEnd;
  })();

  const isExpiringSoon = subscription?.current_period_end 
    ? new Date(subscription.current_period_end) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && isPro
    : false;
  
  const daysRemaining = subscription?.current_period_end
    ? Math.max(0, Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    subscription,
    isLoading,
    isProcessing,
    isPro,
    isExpiringSoon,
    daysRemaining,
    subscribe,
    cancelSubscription,
    refetch: fetchSubscription,
  };
};
