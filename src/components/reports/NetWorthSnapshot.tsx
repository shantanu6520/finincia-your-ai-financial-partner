import { motion } from "framer-motion";
import { Wallet, CreditCard, TrendingUp, Target, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

interface NetWorthSnapshotProps {
  netWorth: number;
  totalDebt: number;
  goalsSummary: {
    total: number;
    onTrack: number;
    completed: number;
    atRisk: number;
  };
  currency?: string;
}

const formatCurrency = (amount: number, currency: string = "INR") => {
  const symbols: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
  const absAmount = Math.abs(amount);
  if (absAmount >= 10000000) {
    return `${symbols[currency] || "₹"}${(amount / 10000000).toFixed(2)}Cr`;
  } else if (absAmount >= 100000) {
    return `${symbols[currency] || "₹"}${(amount / 100000).toFixed(2)}L`;
  }
  return `${symbols[currency] || "₹"}${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const NetWorthSnapshot = ({ netWorth, totalDebt, goalsSummary, currency }: NetWorthSnapshotProps) => {
  const totalAssets = netWorth + totalDebt;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Net Worth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border/50 rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold">Net Worth Snapshot</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Net Worth</div>
            <div className={`text-3xl font-bold ${netWorth >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {netWorth < 0 && "-"}{formatCurrency(Math.abs(netWorth), currency)}
            </div>
          </div>

          <div className="h-3 bg-secondary rounded-full overflow-hidden flex">
            {totalAssets > 0 && (
              <>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(Math.max(0, netWorth + totalDebt) / (totalAssets + totalDebt)) * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className="bg-emerald-500 h-full"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalDebt / (totalAssets + totalDebt)) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="bg-red-400 h-full"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div>
                <div className="text-xs text-muted-foreground">Assets</div>
                <div className="font-medium">{formatCurrency(totalAssets, currency)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div>
                <div className="text-xs text-muted-foreground">Debt</div>
                <div className="font-medium">{formatCurrency(totalDebt, currency)}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Goals Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border/50 rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold">Goals Status</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Goals</div>
            <div className="text-3xl font-bold">{goalsSummary.total}</div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
              <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
              <div className="text-lg font-bold text-emerald-500">{goalsSummary.completed}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Completed</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 mx-auto text-blue-500 mb-1" />
              <div className="text-lg font-bold text-blue-500">{goalsSummary.onTrack}</div>
              <div className="text-[10px] text-muted-foreground uppercase">On Track</div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
              <AlertTriangle className="w-5 h-5 mx-auto text-orange-500 mb-1" />
              <div className="text-lg font-bold text-orange-500">{goalsSummary.atRisk}</div>
              <div className="text-[10px] text-muted-foreground uppercase">At Risk</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NetWorthSnapshot;
