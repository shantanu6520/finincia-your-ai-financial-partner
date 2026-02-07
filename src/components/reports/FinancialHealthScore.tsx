import { motion } from "framer-motion";
import { Award, TrendingUp, PiggyBank, Target, Wallet, ArrowRight } from "lucide-react";
import { FinancialHealthScore as HealthScoreType } from "@/hooks/useFinancialReview";

interface FinancialHealthScoreProps {
  score: HealthScoreType;
}

const scoreColors: Record<string, string> = {
  "A+": "text-emerald-500",
  "A": "text-emerald-500",
  "B+": "text-green-500",
  "B": "text-green-500",
  "C+": "text-yellow-500",
  "C": "text-yellow-500",
  "D": "text-orange-500",
  "F": "text-red-500",
};

const ComponentBar = ({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Award }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <span className="font-medium">{value}/100</span>
    </div>
    <div className="h-2 bg-secondary rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${
          value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-green-500" : value >= 40 ? "bg-yellow-500" : "bg-red-500"
        }`}
      />
    </div>
  </div>
);

const FinancialHealthScore = ({ score }: FinancialHealthScoreProps) => {
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (score.overall / 100) * circumference;

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Circular Score */}
        <div className="relative">
          <svg className="w-40 h-40 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-secondary"
            />
            {/* Score circle */}
            <motion.circle
              cx="80"
              cy="80"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              className={
                score.overall >= 80
                  ? "text-emerald-500"
                  : score.overall >= 60
                  ? "text-green-500"
                  : score.overall >= 40
                  ? "text-yellow-500"
                  : "text-red-500"
              }
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                strokeDasharray: circumference,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-3xl font-bold ${scoreColors[score.grade]}`}
            >
              {score.grade}
            </motion.span>
            <span className="text-xl font-semibold text-foreground">{score.overall}</span>
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">out of 100</span>
        </div>

        {/* Score Breakdown */}
        <div className="flex-1 w-full space-y-4">
          <div>
            <h3 className="font-display text-lg font-semibold">Financial Health Score</h3>
            <p className="text-sm text-muted-foreground mt-1">{score.interpretation}</p>
          </div>

          <div className="grid gap-4">
            <ComponentBar label="Savings Rate" value={score.components.savings} icon={PiggyBank} />
            <ComponentBar label="Budget Adherence" value={score.components.budgetAdherence} icon={Wallet} />
            <ComponentBar label="Debt Management" value={score.components.debtManagement} icon={TrendingUp} />
            <ComponentBar label="Goal Progress" value={score.components.goalProgress} icon={Target} />
            <ComponentBar label="Cash Flow" value={score.components.cashFlow} icon={ArrowRight} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthScore;
