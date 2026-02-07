import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Target, Lightbulb, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AIInsight {
  id: string;
  type: "warning" | "success" | "tip" | "opportunity";
  title: string;
  description: string;
  action?: { label: string; path: string };
}

interface AIInsightsCardProps {
  totalIncome: number;
  totalExpenses: number;
  totalBalance: number;
  savingsRate: number;
  topCategory?: { name: string; amount: number };
  goalProgress?: number;
  budgetUtilization?: number;
}

const AIInsightsCard = ({
  totalIncome,
  totalExpenses,
  totalBalance,
  savingsRate,
  topCategory,
  goalProgress,
  budgetUtilization,
}: AIInsightsCardProps) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const generatedInsights: AIInsight[] = [];

    // Savings rate analysis
    if (savingsRate < 10 && totalIncome > 0) {
      generatedInsights.push({
        id: "low-savings",
        type: "warning",
        title: "Low Savings Rate Alert",
        description: `Your savings rate is ${savingsRate}%. Aim for at least 20% to build financial security. Consider the 50/30/20 rule.`,
        action: { label: "Talk to AI Coach", path: "/ai-coach" },
      });
    } else if (savingsRate >= 30) {
      generatedInsights.push({
        id: "high-savings",
        type: "success",
        title: "Excellent Savings! 🎉",
        description: `You're saving ${savingsRate}% of your income. You're on track for financial freedom!`,
        action: { label: "Set New Goals", path: "/goals" },
      });
    } else if (savingsRate >= 20) {
      generatedInsights.push({
        id: "good-savings",
        type: "tip",
        title: "Good Savings Momentum",
        description: `${savingsRate}% savings rate is healthy. Push for 30% to accelerate wealth building.`,
      });
    }

    // Expense analysis
    if (totalExpenses > totalIncome && totalIncome > 0) {
      generatedInsights.push({
        id: "overspending",
        type: "warning",
        title: "Spending Exceeds Income",
        description: `You've spent ₹${(totalExpenses - totalIncome).toLocaleString("en-IN")} more than earned. Review expenses immediately.`,
        action: { label: "Analyze Spending", path: "/ai-coach" },
      });
    }

    // Category insights
    if (topCategory && totalExpenses > 0) {
      const categoryPercentage = ((topCategory.amount / totalExpenses) * 100).toFixed(0);
      if (Number(categoryPercentage) > 40) {
        generatedInsights.push({
          id: "category-heavy",
          type: "opportunity",
          title: `${topCategory.name} is ${categoryPercentage}% of Spend`,
          description: `Consider negotiating or finding alternatives to reduce this category.`,
          action: { label: "Optimize Bills", path: "/bill-negotiation" },
        });
      }
    }

    // Budget utilization
    if (budgetUtilization !== undefined && budgetUtilization > 90) {
      generatedInsights.push({
        id: "budget-warning",
        type: "warning",
        title: "Budget Nearly Exhausted",
        description: `You've used ${budgetUtilization.toFixed(0)}% of your budget. Be cautious with remaining spending.`,
        action: { label: "Review Budgets", path: "/budgets" },
      });
    }

    // Goal progress
    if (goalProgress !== undefined && goalProgress < 30) {
      generatedInsights.push({
        id: "goal-behind",
        type: "tip",
        title: "Goals Need Attention",
        description: `Your goals are ${goalProgress.toFixed(0)}% complete. Increase monthly contributions to stay on track.`,
        action: { label: "View Goals", path: "/goals" },
      });
    }

    // Default positive insight
    if (generatedInsights.length === 0) {
      generatedInsights.push({
        id: "welcome",
        type: "tip",
        title: "Your AI CFO is Ready",
        description: "Start tracking transactions and set budgets to unlock personalized AI insights.",
        action: { label: "Get Started", path: "/transactions" },
      });
    }

    setInsights(generatedInsights);
  }, [totalIncome, totalExpenses, savingsRate, topCategory, budgetUtilization, goalProgress]);

  const currentInsight = insights[currentIndex];

  const getIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "success":
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case "tip":
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case "opportunity":
        return <Target className="w-5 h-5 text-purple-500" />;
    }
  };

  const getBgColor = (type: AIInsight["type"]) => {
    switch (type) {
      case "warning":
        return "bg-amber-500/10";
      case "success":
        return "bg-emerald-500/10";
      case "tip":
        return "bg-blue-500/10";
      case "opportunity":
        return "bg-purple-500/10";
    }
  };

  if (!currentInsight) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-border/50 bg-gradient-to-br from-card to-secondary/20 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              AI Insights
            </CardTitle>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
              Smart Analysis
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentInsight.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getBgColor(currentInsight.type)}`}>
                  {getIcon(currentInsight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm">
                    {currentInsight.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {currentInsight.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                {currentInsight.action ? (
                  <Link to={currentInsight.action.path}>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      {currentInsight.action.label}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
                
                {insights.length > 1 && (
                  <div className="flex items-center gap-1">
                    {insights.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          idx === currentIndex ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AIInsightsCard;
