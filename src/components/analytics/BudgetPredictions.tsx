import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import type { BudgetPrediction } from "@/hooks/usePredictiveAnalytics";

interface BudgetPredictionsProps {
  predictions: BudgetPrediction[];
  currencySymbol: string;
  formatAmount: (amount: number) => string;
}

const BudgetPredictions = ({ predictions, currencySymbol, formatAmount }: BudgetPredictionsProps) => {
  const getRiskConfig = (risk: BudgetPrediction["riskLevel"]) => {
    switch (risk) {
      case "critical":
        return {
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/30",
          icon: AlertTriangle,
          label: "Critical",
          badgeVariant: "destructive" as const,
        };
      case "high":
        return {
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
          borderColor: "border-orange-500/30",
          icon: AlertCircle,
          label: "High Risk",
          badgeVariant: "secondary" as const,
        };
      case "medium":
        return {
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
          icon: TrendingUp,
          label: "Monitor",
          badgeVariant: "secondary" as const,
        };
      default:
        return {
          color: "text-primary",
          bgColor: "bg-primary/10",
          borderColor: "border-primary/30",
          icon: CheckCircle,
          label: "On Track",
          badgeVariant: "default" as const,
        };
    }
  };

  if (predictions.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Budget Overrun Prediction</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No budgets set up yet</p>
            <p className="text-sm mt-1">Create budgets to see predictions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalCount = predictions.filter((p) => p.riskLevel === "critical").length;
  const highCount = predictions.filter((p) => p.riskLevel === "high").length;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Budget Overrun Prediction</CardTitle>
          </div>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} Critical</Badge>
            )}
            {highCount > 0 && (
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
                {highCount} High Risk
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          AI-predicted budget status based on your spending velocity
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {predictions.map((prediction, index) => {
          const config = getRiskConfig(prediction.riskLevel);
          const Icon = config.icon;
          const currentPercent = (prediction.currentSpent / prediction.budgetAmount) * 100;
          const predictedPercent = (prediction.predictedSpent / prediction.budgetAmount) * 100;

          return (
            <motion.div
              key={prediction.categoryId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border ${config.borderColor} ${config.bgColor}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold">{prediction.categoryName}</p>
                    <p className="text-sm text-muted-foreground">
                      {prediction.daysRemaining} days remaining
                    </p>
                  </div>
                </div>
                <Badge variant={config.badgeVariant}>{config.label}</Badge>
              </div>

              {/* Progress Bars */}
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Spent</span>
                  <span className="font-medium">
                    {currencySymbol}{formatAmount(prediction.currentSpent)} / {currencySymbol}{formatAmount(prediction.budgetAmount)}
                  </span>
                </div>
                <Progress value={Math.min(currentPercent, 100)} className="h-2" />
                
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Predicted End-of-Month</span>
                  <span className={`font-medium ${predictedPercent > 100 ? config.color : ""}`}>
                    {currencySymbol}{formatAmount(prediction.predictedSpent)} ({Math.round(predictedPercent)}%)
                  </span>
                </div>
                <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`absolute h-full rounded-full ${
                      predictedPercent > 100 ? "bg-destructive" : "bg-primary/50"
                    }`}
                    style={{ width: `${Math.min(predictedPercent, 150)}%`, maxWidth: "100%" }}
                  />
                  {predictedPercent > 100 && (
                    <div
                      className="absolute h-full bg-destructive/30"
                      style={{ left: "100%", width: `${Math.min(predictedPercent - 100, 50)}%` }}
                    />
                  )}
                </div>
              </div>

              {/* Suggestions */}
              {prediction.suggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Lightbulb className="w-4 h-4" />
                    <span>AI Suggestions</span>
                  </div>
                  <ul className="space-y-1">
                    {prediction.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Daily Burn Rate */}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Daily burn rate: {currencySymbol}{formatAmount(prediction.dailyBurnRate)}/day</span>
                {prediction.predictedOverrun > 0 && (
                  <span className={config.color}>
                    Predicted overrun: {currencySymbol}{formatAmount(prediction.predictedOverrun)}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default BudgetPredictions;
