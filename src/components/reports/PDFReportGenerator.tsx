import { useState } from "react";
import { motion } from "framer-motion";
import { FileDown, Loader2, Calendar, FileText } from "lucide-react";
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

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  const generatePDFContent = () => {
    // Choose data based on report type
    const isMonthly = reportType === "monthly";
    const periodData = isMonthly 
      ? {
          current: reviewData.monthlyComparison.currentMonth,
          changes: reviewData.monthlyComparison.changes,
          label: reviewData.monthLabel,
        }
      : {
          current: reviewData.quarterComparison.currentQuarter,
          changes: reviewData.quarterComparison.changes,
          label: reviewData.quarterLabel,
        };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>FININCIA ${isMonthly ? "Monthly" : "Quarterly"} Financial Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; line-height: 1.6; background: #fff; }
          .container { max-width: 800px; margin: 0 auto; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #000; padding-bottom: 24px; }
          .logo-container { margin-bottom: 16px; }
          .logo-text { font-size: 36px; font-weight: 800; letter-spacing: 2px; color: #000; font-family: 'Playfair Display', Georgia, serif; }
          .logo-tagline { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 4px; margin-top: 4px; }
          .header-meta { margin-top: 16px; }
          .header-meta p { color: #666; font-size: 14px; margin: 4px 0; }
          .section { margin-bottom: 32px; page-break-inside: avoid; }
          .section-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0; }
          .score-box { text-align: center; padding: 32px; background: linear-gradient(135deg, #f8f8f8 0%, #fff 100%); border-radius: 12px; margin-bottom: 20px; border: 1px solid #e0e0e0; }
          .score-grade { font-size: 56px; font-weight: 700; color: ${reviewData.healthScore.overall >= 70 ? '#10b981' : reviewData.healthScore.overall >= 50 ? '#f59e0b' : '#ef4444'}; }
          .score-number { font-size: 28px; color: #333; margin-top: 8px; font-weight: 600; }
          .score-max { font-size: 18px; color: #666; font-weight: 400; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .stat-card { background: #f8f8f8; padding: 20px; border-radius: 12px; border: 1px solid #e8e8e8; }
          .stat-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
          .stat-value { font-size: 28px; font-weight: 700; margin-top: 4px; color: #1a1a1a; }
          .stat-max { font-size: 16px; color: #666; font-weight: 500; }
          .stat-change { font-size: 12px; margin-top: 4px; }
          .win-item { padding: 16px; background: #ecfdf5; border-left: 4px solid #10b981; margin-bottom: 12px; border-radius: 0 8px 8px 0; }
          .gap-item { padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; margin-bottom: 12px; border-radius: 0 8px 8px 0; }
          .action-item { padding: 16px; background: #f3f4f6; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #3b82f6; }
          .action-urgent { border-left-color: #ef4444; background: #fef2f2; }
          .action-high { border-left-color: #f59e0b; background: #fffbeb; }
          .action-nice { border-left-color: #3b82f6; background: #eff6ff; }
          .priority-badge { font-size: 9px; text-transform: uppercase; font-weight: 600; padding: 2px 8px; border-radius: 4px; margin-left: 8px; }
          .priority-urgent { background: #fee2e2; color: #dc2626; }
          .priority-high { background: #fef3c7; color: #d97706; }
          .priority-nice { background: #dbeafe; color: #2563eb; }
          .footer { text-align: center; margin-top: 48px; padding-top: 24px; border-top: 2px solid #000; }
          .footer-logo { font-size: 18px; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; }
          .footer p { font-size: 11px; color: #666; margin: 4px 0; }
          .footer-disclaimer { font-size: 10px; color: #999; margin-top: 12px; font-style: italic; }
          @media print { 
            .container { padding: 20px; } 
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-container">
              <div class="logo-text">FININCIA</div>
              <div class="logo-tagline">Your AI-Powered Financial CFO</div>
            </div>
            <div class="header-meta">
              <p style="font-size: 16px; font-weight: 600; color: #333;">${isMonthly ? "Monthly" : "Quarterly"} Financial Review</p>
              <p>${periodData.label}</p>
              ${userName ? `<p>Prepared for: <strong>${userName}</strong></p>` : ''}
              <p>Generated: ${reviewData.generatedAt}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📊 Financial Health Score</div>
            <div class="score-box">
              <div class="score-grade">${reviewData.healthScore.grade}</div>
              <div class="score-number">${reviewData.healthScore.overall} <span class="score-max">out of 100</span></div>
              <p style="margin-top: 16px; color: #666; font-size: 14px;">${reviewData.healthScore.interpretation}</p>
            </div>
            <div class="grid">
              <div class="stat-card">
                <div class="stat-label">Savings Rate</div>
                <div class="stat-value">${reviewData.healthScore.components.savings} <span class="stat-max">/ 100</span></div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Budget Adherence</div>
                <div class="stat-value">${reviewData.healthScore.components.budgetAdherence} <span class="stat-max">/ 100</span></div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Debt Management</div>
                <div class="stat-value">${reviewData.healthScore.components.debtManagement} <span class="stat-max">/ 100</span></div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Goal Progress</div>
                <div class="stat-value">${reviewData.healthScore.components.goalProgress} <span class="stat-max">/ 100</span></div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📈 ${isMonthly ? "Monthly" : "Quarterly"} Performance</div>
            <div class="grid">
              <div class="stat-card">
                <div class="stat-label">Total Income</div>
                <div class="stat-value">${currencySymbol}${periodData.current.income.toLocaleString()}</div>
                <div class="stat-change" style="color: ${periodData.changes.income >= 0 ? '#10b981' : '#ef4444'}">
                  ${periodData.changes.income >= 0 ? '↑' : '↓'} ${Math.abs(periodData.changes.income).toFixed(1)}% vs last ${isMonthly ? 'month' : 'quarter'}
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Expenses</div>
                <div class="stat-value">${currencySymbol}${periodData.current.expenses.toLocaleString()}</div>
                <div class="stat-change" style="color: ${periodData.changes.expenses <= 0 ? '#10b981' : '#ef4444'}">
                  ${periodData.changes.expenses >= 0 ? '↑' : '↓'} ${Math.abs(periodData.changes.expenses).toFixed(1)}% vs last ${isMonthly ? 'month' : 'quarter'}
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Net Savings</div>
                <div class="stat-value" style="color: ${periodData.current.savings >= 0 ? '#10b981' : '#ef4444'}">${currencySymbol}${periodData.current.savings.toLocaleString()}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Savings Rate</div>
                <div class="stat-value">${periodData.current.savingsRate.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">💰 Net Worth & Debt Overview</div>
            <div class="grid">
              <div class="stat-card">
                <div class="stat-label">Net Worth</div>
                <div class="stat-value" style="color: ${reviewData.netWorth >= 0 ? '#10b981' : '#ef4444'}">
                  ${reviewData.netWorth < 0 ? '-' : ''}${currencySymbol}${Math.abs(reviewData.netWorth).toLocaleString()}
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Outstanding Debt</div>
                <div class="stat-value" style="color: ${reviewData.totalDebt > 0 ? '#ef4444' : '#10b981'}">${currencySymbol}${reviewData.totalDebt.toLocaleString()}</div>
              </div>
            </div>
          </div>

          ${reviewData.wins.length > 0 ? `
          <div class="section">
            <div class="section-title">🏆 Financial Wins This Quarter</div>
            ${reviewData.wins.map(win => `
              <div class="win-item">
                <strong style="color: #059669;">${win.title}</strong>
                <p style="font-size: 14px; color: #666; margin-top: 4px;">${win.description}</p>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${reviewData.gaps.length > 0 ? `
          <div class="section">
            <div class="section-title">⚠️ Areas Requiring Attention</div>
            ${reviewData.gaps.map(gap => `
              <div class="gap-item">
                <strong style="color: #d97706;">${gap.title}</strong>
                <span style="font-size: 10px; text-transform: uppercase; margin-left: 8px; color: ${gap.severity === 'critical' ? '#dc2626' : '#d97706'}; font-weight: 600;">${gap.severity}</span>
                <p style="font-size: 14px; color: #666; margin-top: 4px;">${gap.description}</p>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">📋 Recommended Action Plan</div>
            ${reviewData.actionItems.map(action => `
              <div class="action-item action-${action.priority === 'urgent' ? 'urgent' : action.priority === 'high' ? 'high' : 'nice'}">
                <strong>${action.title}</strong>
                <span class="priority-badge priority-${action.priority === 'urgent' ? 'urgent' : action.priority === 'high' ? 'high' : 'nice'}">${action.priority.replace('-', ' ')}</span>
                <p style="font-size: 14px; color: #666; margin-top: 8px;">${action.description}</p>
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <div class="footer-logo">FININCIA</div>
            <p>Your AI-Powered Personal Finance CFO</p>
            <p class="footer-disclaimer">This report is generated for informational purposes only. For personalized financial advice, please consult a certified financial advisor.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const printContent = generatePDFContent();
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
        }, 300);
      } else {
        toast.error("Please allow pop-ups to download the report");
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

      <Button
        onClick={generatePDF}
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4 mr-2" />
        )}
        Download as PDF
      </Button>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Professional CA-style reports with FININCIA branding. Perfect for sharing with your spouse or financial advisor.
      </p>
    </div>
  );
};

export default PDFReportGenerator;
