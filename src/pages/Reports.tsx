import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, BarChart3, Bell, Loader2, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useFinancialReview } from "@/hooks/useFinancialReview";
import { useProfile } from "@/hooks/useProfile";
import FinancialHealthScore from "@/components/reports/FinancialHealthScore";
import QuarterlyComparison from "@/components/reports/QuarterlyComparison";
import WinsAndGaps from "@/components/reports/WinsAndGaps";
import ActionPlan from "@/components/reports/ActionPlan";
import NetWorthSnapshot from "@/components/reports/NetWorthSnapshot";
import PDFReportGenerator from "@/components/reports/PDFReportGenerator";
import NotificationSettings from "@/components/reports/NotificationSettings";

const Reports = () => {
  const { isLoading, reviewData } = useFinancialReview();
  const { profile, updateProfile, isUpdating } = useProfile();
  const [activeTab, setActiveTab] = useState("review");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Financial Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered quarterly reviews, reports, and notifications
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg">
            <Calendar className="w-4 h-4" />
            <span>{reviewData.quarterLabel}</span>
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">PRO</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="review" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Quarterly Review</span>
              <span className="sm:hidden">Review</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">PDF Reports</span>
              <span className="sm:hidden">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
          </TabsList>

          {/* Quarterly Review Tab */}
          <TabsContent value="review" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FinancialHealthScore score={reviewData.healthScore} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <QuarterlyComparison 
                data={reviewData.quarterComparison} 
                currency={profile?.currency}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <NetWorthSnapshot
                netWorth={reviewData.netWorth}
                totalDebt={reviewData.totalDebt}
                goalsSummary={reviewData.goalsSummary}
                currency={profile?.currency}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <WinsAndGaps 
                wins={reviewData.wins} 
                gaps={reviewData.gaps}
                currency={profile?.currency}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ActionPlan actions={reviewData.actionItems} />
            </motion.div>
          </TabsContent>

          {/* PDF Reports Tab */}
          <TabsContent value="reports" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PDFReportGenerator
                reviewData={reviewData}
                currency={profile?.currency}
                userName={profile?.name || undefined}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border/50 rounded-2xl p-6"
            >
              <h3 className="font-display text-lg font-semibold mb-4">Report History</h3>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Your generated reports will appear here</p>
                <p className="text-sm mt-1">Download a report to get started</p>
              </div>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <NotificationSettings
                profile={profile}
                onSave={updateProfile}
                isUpdating={isUpdating}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
