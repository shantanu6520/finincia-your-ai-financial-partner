import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Zap, Activity, Info, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { SpendingAnomaly } from "@/hooks/usePredictiveAnalytics";

interface AnomalyDetectionProps {
  anomalies: SpendingAnomaly[];
  currencySymbol: string;
  formatAmount: (amount: number) => string;
}

const AnomalyDetection = ({ anomalies, currencySymbol, formatAmount }: AnomalyDetectionProps) => {
  const getAnomalyConfig = (anomaly: SpendingAnomaly) => {
    switch (anomaly.type) {
      case "spike":
        return {
          icon: TrendingUp,
          color: anomaly.severity === "alert" ? "text-destructive" : "text-orange-500",
          bgColor: anomaly.severity === "alert" ? "bg-destructive/10" : "bg-orange-500/10",
        };
      case "unusual_category":
        return {
          icon: Activity,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
        };
      case "frequency_change":
        return {
          icon: Zap,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
        };
      case "large_transaction":
        return {
          icon: AlertCircle,
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
        };
      default:
        return {
          icon: Info,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
        };
    }
  };

  const getSeverityBadge = (severity: SpendingAnomaly["severity"]) => {
    switch (severity) {
      case "alert":
        return <Badge variant="destructive">Alert</Badge>;
      case "warning":
        return <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">Warning</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const alertCount = anomalies.filter((a) => a.severity === "alert").length;
  const warningCount = anomalies.filter((a) => a.severity === "warning").length;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Anomaly Detection</CardTitle>
          </div>
          <div className="flex gap-2">
            {alertCount > 0 && (
              <Badge variant="destructive">{alertCount} Alert{alertCount > 1 ? "s" : ""}</Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
                {warningCount} Warning{warningCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Unusual patterns detected in your spending behavior
        </p>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <p className="font-medium text-foreground">All Clear!</p>
            <p className="text-sm text-muted-foreground mt-1">
              No unusual spending patterns detected
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((anomaly, index) => {
              const config = getAnomalyConfig(anomaly);
              const Icon = config.icon;

              return (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl ${config.bgColor} border border-border/30`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">{anomaly.title}</p>
                        {getSeverityBadge(anomaly.severity)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {anomaly.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {anomaly.amount && (
                          <span className="font-medium text-foreground">
                            {currencySymbol}{formatAmount(anomaly.amount)}
                          </span>
                        )}
                        {anomaly.percentageChange && (
                          <span className={config.color}>
                            +{anomaly.percentageChange}% vs last month
                          </span>
                        )}
                        {anomaly.date && (
                          <span>{anomaly.date}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnomalyDetection;
