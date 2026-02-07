import { useState } from "react";
import { motion } from "framer-motion";
import { FileDown, Loader2, Calendar, FileText, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuarterlyReviewData } from "@/hooks/useFinancialReview";
import { toast } from "sonner";

interface PDFReportGeneratorProps {
  reviewData: QuarterlyReviewData;
  currency?: string;
  userName?: string;
}

const PDFReportGenerator = ({ reviewData, currency = "INR", userName }: PDFReportGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState<"monthly" | "quarterly">("quarterly");

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Create a printable HTML content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>FININCIA ${reportType === "quarterly" ? "Quarterly" : "Monthly"} Financial Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; line-height: 1.6; }
            .container { max-width: 800px; margin: 0 auto; padding: 40px; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
            .header p { color: #666; font-size: 14px; }
            .section { margin-bottom: 32px; page-break-inside: avoid; }
            .section-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0; }
            .score-box { text-align: center; padding: 24px; background: #f8f8f8; border-radius: 8px; margin-bottom: 20px; }
            .score-grade { font-size: 48px; font-weight: 700; color: ${reviewData.healthScore.overall >= 70 ? '#10b981' : reviewData.healthScore.overall >= 50 ? '#f59e0b' : '#ef4444'}; }
            .score-number { font-size: 24px; color: #666; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
            .stat-card { background: #f8f8f8; padding: 16px; border-radius: 8px; }
            .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
            .stat-value { font-size: 24px; font-weight: 600; }
            .win-item { padding: 12px; background: #ecfdf5; border-left: 3px solid #10b981; margin-bottom: 8px; }
            .gap-item { padding: 12px; background: #fef3c7; border-left: 3px solid #f59e0b; margin-bottom: 8px; }
            .action-item { padding: 12px; background: #f3f4f6; border-radius: 8px; margin-bottom: 8px; }
            .action-urgent { border-left: 3px solid #ef4444; }
            .action-high { border-left: 3px solid #f59e0b; }
            .action-nice { border-left: 3px solid #3b82f6; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
            @media print { .container { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FININCIA</h1>
              <p>${reportType === "quarterly" ? "Quarterly" : "Monthly"} Financial Review • ${reviewData.quarterLabel}</p>
              ${userName ? `<p>Prepared for: ${userName}</p>` : ''}
              <p>Generated: ${reviewData.generatedAt}</p>
            </div>

            <div class="section">
              <div class="section-title">Financial Health Score</div>
              <div class="score-box">
                <div class="score-grade">${reviewData.healthScore.grade}</div>
                <div class="score-number">${reviewData.healthScore.overall}/100</div>
                <p style="margin-top: 12px; color: #666;">${reviewData.healthScore.interpretation}</p>
              </div>
              <div class="grid">
                <div class="stat-card">
                  <div class="stat-label">Savings Rate</div>
                  <div class="stat-value">${reviewData.healthScore.components.savings}/100</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Budget Adherence</div>
                  <div class="stat-value">${reviewData.healthScore.components.budgetAdherence}/100</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Debt Management</div>
                  <div class="stat-value">${reviewData.healthScore.components.debtManagement}/100</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Goal Progress</div>
                  <div class="stat-value">${reviewData.healthScore.components.goalProgress}/100</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Quarterly Performance</div>
              <div class="grid">
                <div class="stat-card">
                  <div class="stat-label">Income</div>
                  <div class="stat-value">${currency === 'INR' ? '₹' : '$'}${reviewData.quarterComparison.currentQuarter.income.toLocaleString()}</div>
                  <div style="font-size: 12px; color: ${reviewData.quarterComparison.changes.income >= 0 ? '#10b981' : '#ef4444'}">
                    ${reviewData.quarterComparison.changes.income >= 0 ? '↑' : '↓'} ${Math.abs(reviewData.quarterComparison.changes.income).toFixed(1)}% vs last quarter
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Expenses</div>
                  <div class="stat-value">${currency === 'INR' ? '₹' : '$'}${reviewData.quarterComparison.currentQuarter.expenses.toLocaleString()}</div>
                  <div style="font-size: 12px; color: ${reviewData.quarterComparison.changes.expenses <= 0 ? '#10b981' : '#ef4444'}">
                    ${reviewData.quarterComparison.changes.expenses >= 0 ? '↑' : '↓'} ${Math.abs(reviewData.quarterComparison.changes.expenses).toFixed(1)}% vs last quarter
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Savings</div>
                  <div class="stat-value">${currency === 'INR' ? '₹' : '$'}${reviewData.quarterComparison.currentQuarter.savings.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Savings Rate</div>
                  <div class="stat-value">${reviewData.quarterComparison.currentQuarter.savingsRate.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Net Worth & Debt</div>
              <div class="grid">
                <div class="stat-card">
                  <div class="stat-label">Net Worth</div>
                  <div class="stat-value" style="color: ${reviewData.netWorth >= 0 ? '#10b981' : '#ef4444'}">
                    ${reviewData.netWorth < 0 ? '-' : ''}${currency === 'INR' ? '₹' : '$'}${Math.abs(reviewData.netWorth).toLocaleString()}
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Total Debt</div>
                  <div class="stat-value">${currency === 'INR' ? '₹' : '$'}${reviewData.totalDebt.toLocaleString()}</div>
                </div>
              </div>
            </div>

            ${reviewData.wins.length > 0 ? `
            <div class="section">
              <div class="section-title">Financial Wins 🏆</div>
              ${reviewData.wins.map(win => `
                <div class="win-item">
                  <strong>${win.title}</strong>
                  <p style="font-size: 14px; color: #666;">${win.description}</p>
                </div>
              `).join('')}
            </div>
            ` : ''}

            ${reviewData.gaps.length > 0 ? `
            <div class="section">
              <div class="section-title">Areas to Improve ⚠️</div>
              ${reviewData.gaps.map(gap => `
                <div class="gap-item">
                  <strong>${gap.title}</strong> <span style="font-size: 10px; text-transform: uppercase; color: ${gap.severity === 'critical' ? '#ef4444' : '#f59e0b'}">${gap.severity}</span>
                  <p style="font-size: 14px; color: #666;">${gap.description}</p>
                </div>
              `).join('')}
            </div>
            ` : ''}

            <div class="section">
              <div class="section-title">Action Plan</div>
              ${reviewData.actionItems.map(action => `
                <div class="action-item action-${action.priority === 'urgent' ? 'urgent' : action.priority === 'high' ? 'high' : 'nice'}">
                  <strong>${action.title}</strong> <span style="font-size: 10px; text-transform: uppercase; color: #666;">${action.priority.replace('-', ' ')}</span>
                  <p style="font-size: 14px; color: #666;">${action.description}</p>
                </div>
              `).join('')}
            </div>

            <div class="footer">
              <p>This report was generated by FININCIA - Your AI-Powered Financial CFO</p>
              <p>For personalized advice, consult with a certified financial advisor.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Open print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Slight delay to ensure content is loaded
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }

      toast.success("Report generated! Use your browser's print dialog to save as PDF.");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-display text-lg font-semibold">Export Reports</h3>
        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">PRO</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setReportType("monthly")}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            reportType === "monthly"
              ? "border-primary bg-primary/5"
              : "border-border/50 hover:border-border"
          }`}
        >
          <Calendar className="w-5 h-5 mb-2" />
          <div className="font-medium">Monthly Report</div>
          <p className="text-xs text-muted-foreground mt-1">
            Detailed breakdown of this month's finances
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setReportType("quarterly")}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            reportType === "quarterly"
              ? "border-primary bg-primary/5"
              : "border-border/50 hover:border-border"
          }`}
        >
          <FileText className="w-5 h-5 mb-2" />
          <div className="font-medium">Quarterly Review</div>
          <p className="text-xs text-muted-foreground mt-1">
            Comprehensive quarterly financial analysis
          </p>
        </motion.button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={generatePDF}
          disabled={isGenerating}
          className="flex-1"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileDown className="w-4 h-4 mr-2" />
          )}
          Download as PDF
        </Button>

        <Button variant="outline" className="flex-1">
          <Share2 className="w-4 h-4 mr-2" />
          Share Report
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Professional CA-style reports. Perfect for sharing with your spouse or financial advisor.
      </p>
    </div>
  );
};

export default PDFReportGenerator;
