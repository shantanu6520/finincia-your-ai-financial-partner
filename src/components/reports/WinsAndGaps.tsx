import { motion } from "framer-motion";
import { Trophy, AlertTriangle, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { FinancialWin, FinancialGap } from "@/hooks/useFinancialReview";

interface WinsAndGapsProps {
  wins: FinancialWin[];
  gaps: FinancialGap[];
  currency?: string;
}

const formatCurrency = (amount: number, currency: string = "INR") => {
  const symbols: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
  return `${symbols[currency] || "₹"}${Math.abs(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const severityColors: Record<string, string> = {
  critical: "text-red-500 bg-red-500/10 border-red-500/20",
  moderate: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  minor: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
};

const WinsAndGaps = ({ wins, gaps, currency }: WinsAndGapsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Wins */}
      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Trophy className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="font-display text-lg font-semibold">Financial Wins</h3>
        </div>

        {wins.length === 0 ? (
          <p className="text-muted-foreground text-sm">Keep tracking to identify your wins!</p>
        ) : (
          <div className="space-y-4">
            {wins.map((win, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-emerald-700 dark:text-emerald-400">{win.title}</div>
                  <p className="text-sm text-muted-foreground mt-1">{win.description}</p>
                  {win.amount && (
                    <div className="text-xs text-emerald-600 mt-1 font-medium">
                      {win.amount > 0 ? "+" : ""}{formatCurrency(win.amount, currency)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Gaps */}
      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <h3 className="font-display text-lg font-semibold">Areas to Improve</h3>
        </div>

        {gaps.length === 0 ? (
          <p className="text-muted-foreground text-sm">Great job! No critical gaps identified.</p>
        ) : (
          <div className="space-y-4">
            {gaps.map((gap, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-3 p-3 border rounded-xl ${severityColors[gap.severity]}`}
              >
                {gap.severity === "critical" ? (
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                ) : gap.severity === "moderate" ? (
                  <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                ) : (
                  <Info className="w-5 h-5 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{gap.title}</span>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-current/10">
                      {gap.severity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{gap.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WinsAndGaps;
