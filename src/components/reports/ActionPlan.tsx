import { motion } from "framer-motion";
import { Flame, AlertCircle, Lightbulb, ChevronRight } from "lucide-react";
import { ActionItem } from "@/hooks/useFinancialReview";

interface ActionPlanProps {
  actions: ActionItem[];
}

const priorityConfig: Record<string, { icon: typeof Flame; color: string; bg: string; label: string }> = {
  urgent: {
    icon: Flame,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
    label: "Urgent",
  },
  high: {
    icon: AlertCircle,
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/20",
    label: "High Priority",
  },
  "nice-to-have": {
    icon: Lightbulb,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
    label: "Nice to Have",
  },
};

const ActionPlan = ({ actions }: ActionPlanProps) => {
  const urgentActions = actions.filter((a) => a.priority === "urgent");
  const highActions = actions.filter((a) => a.priority === "high");
  const niceToHaveActions = actions.filter((a) => a.priority === "nice-to-have");

  const renderSection = (title: string, items: ActionItem[], priority: string) => {
    if (items.length === 0) return null;

    const config = priorityConfig[priority];
    const Icon = config.icon;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.color}`} />
          <h4 className={`font-medium ${config.color}`}>{title}</h4>
          <span className="text-xs text-muted-foreground">({items.length})</span>
        </div>

        <div className="space-y-2">
          {items.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 border rounded-xl ${config.bg}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-medium">{action.title}</div>
                  <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-muted-foreground">
                      Category: <span className="font-medium">{action.category}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Impact: <span className="font-medium">{action.impact}</span>
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="font-display text-lg font-semibold">Action Plan</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
          {actions.length} actions
        </span>
      </div>

      {actions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>You're doing great! No action items at this time.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {renderSection("Take Action Now", urgentActions, "urgent")}
          {renderSection("Focus Areas", highActions, "high")}
          {renderSection("Consider These", niceToHaveActions, "nice-to-have")}
        </div>
      )}
    </div>
  );
};

export default ActionPlan;
