import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { QuarterlyComparison as QuarterlyComparisonType } from "@/hooks/useFinancialReview";

interface QuarterlyComparisonProps {
  data: QuarterlyComparisonType;
  currency?: string;
}

const formatCurrency = (amount: number, currency: string = "INR") => {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return `${symbols[currency] || "₹"}${Math.abs(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const ChangeIndicator = ({ value, isPositiveGood = true }: { value: number; isPositiveGood?: boolean }) => {
  const isPositive = value > 0;
  const isGood = isPositiveGood ? isPositive : !isPositive;

  if (Math.abs(value) < 0.5) {
    return (
      <span className="flex items-center gap-1 text-muted-foreground text-sm">
        <Minus className="w-3 h-3" />
        <span>No change</span>
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-1 text-sm ${isGood ? "text-emerald-500" : "text-red-500"}`}>
      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      <span>{Math.abs(value).toFixed(1)}%</span>
    </span>
  );
};

const QuarterlyComparison = ({ data, currency = "INR" }: QuarterlyComparisonProps) => {
  const metrics = [
    {
      label: "Income",
      current: data.currentQuarter.income,
      previous: data.previousQuarter.income,
      change: data.changes.income,
      isPositiveGood: true,
    },
    {
      label: "Expenses",
      current: data.currentQuarter.expenses,
      previous: data.previousQuarter.expenses,
      change: data.changes.expenses,
      isPositiveGood: false,
    },
    {
      label: "Savings",
      current: data.currentQuarter.savings,
      previous: data.previousQuarter.savings,
      change: data.changes.savings,
      isPositiveGood: true,
    },
    {
      label: "Savings Rate",
      current: data.currentQuarter.savingsRate,
      previous: data.previousQuarter.savingsRate,
      change: data.changes.savingsRate,
      isPositiveGood: true,
      isPercentage: true,
    },
  ];

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <h3 className="font-display text-lg font-semibold mb-6">Quarter-over-Quarter Comparison</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-3"
          >
            <div className="text-sm text-muted-foreground">{metric.label}</div>
            
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold">
                  {metric.isPercentage
                    ? `${metric.current.toFixed(1)}%`
                    : formatCurrency(metric.current, currency)}
                </span>
                <ChangeIndicator value={metric.change} isPositiveGood={metric.isPositiveGood} />
              </div>
              <div className="text-xs text-muted-foreground">
                Last quarter:{" "}
                {metric.isPercentage
                  ? `${metric.previous.toFixed(1)}%`
                  : formatCurrency(metric.previous, currency)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuarterlyComparison;
