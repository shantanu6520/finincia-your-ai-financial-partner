import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight, Crown, Sparkles, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const features = [
  "Unlimited AI-powered insights",
  "AI Financial Coach",
  "Loan Strategist",
  "Bill Negotiation Assistant",
  "Predictive Analytics",
  "Cash Flow Forecasting",
  "Weekly & Monthly Reports",
  "Priority Support",
];

const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subscription, isLoading, isProcessing, isPro, subscribe, cancelSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");

  // No redirect - Pro users should be able to view their subscription status

  const handleSubscribe = () => {
    subscribe(selectedPlan);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold">
              {isPro ? "Your Subscription" : "Upgrade to Pro"}
            </h1>
          </div>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {isPro
              ? "Manage your FININCIA Pro subscription"
              : "Unlock the full power of AI-driven financial intelligence"}
          </p>
        </motion.div>

        {/* Current Subscription Status */}
        {subscription && subscription.status !== "pending" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={`border-2 ${isPro ? "border-primary" : "border-border"}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isPro ? "bg-primary/10" : "bg-muted"
                    }`}>
                      {isPro ? (
                        <Sparkles className="w-6 h-6 text-primary" />
                      ) : (
                        <Shield className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          FININCIA Pro {subscription.plan_type === "annual" ? "Annual" : "Monthly"}
                        </h3>
                        <Badge variant={isPro ? "default" : "secondary"}>
                          {subscription.status.toUpperCase()}
                        </Badge>
                      </div>
                      {subscription.status !== 'cancelled' && subscription.current_period_end && (
                        <p className="text-sm text-muted-foreground">
                          {isPro
                            ? `Renews on ${format(new Date(subscription.current_period_end), "MMMM d, yyyy")}`
                            : `Expired on ${format(new Date(subscription.current_period_end), "MMMM d, yyyy")}`}
                        </p>
                      )}
                    </div>
                  </div>
                  {isPro && (
                    <Button
                      variant="outline"
                      onClick={cancelSubscription}
                      disabled={isProcessing}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Pricing Cards */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Monthly Plan */}
            <Card
              className={`relative cursor-pointer transition-all ${
                selectedPlan === "monthly"
                  ? "border-2 border-primary shadow-lg"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedPlan("monthly")}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold">Monthly</h3>
                  {selectedPlan === "monthly" && (
                    <Badge>Selected</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-display font-bold">₹999</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Billed monthly. Cancel anytime.
                </p>
              </CardContent>
            </Card>

            {/* Annual Plan */}
            <Card
              className={`relative cursor-pointer transition-all ${
                selectedPlan === "annual"
                  ? "border-2 border-primary shadow-lg"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedPlan("annual")}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Save ₹3,989
                </Badge>
              </div>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold">Annual</h3>
                  {selectedPlan === "annual" && (
                    <Badge>Selected</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-display font-bold">₹7,999</span>
                  <span className="text-muted-foreground">/year</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  That's just ₹667/month. Best value!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <h3 className="font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Everything in Pro
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscribe Button */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Button
              size="lg"
              className="px-12 group"
              onClick={handleSubscribe}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  Subscribe Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Secure payment powered by Razorpay. Cancel anytime.
            </p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
