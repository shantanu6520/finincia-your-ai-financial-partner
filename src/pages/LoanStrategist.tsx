import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calculator, 
  Plus, 
  Trash2, 
  TrendingDown, 
  Calendar, 
  Percent,
  IndianRupee,
  MessageSquare,
  Sparkles
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useLoans, CreateLoanInput } from "@/hooks/useLoans";
import { useAIChat } from "@/hooks/useAIChat";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

const loanTypes = [
  { value: "home", label: "Home Loan" },
  { value: "personal", label: "Personal Loan" },
  { value: "car", label: "Car Loan" },
  { value: "education", label: "Education Loan" },
  { value: "credit_card", label: "Credit Card" },
  { value: "other", label: "Other" },
];

const LoanStrategist = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInput, setAIInput] = useState("");
  const [newLoan, setNewLoan] = useState<CreateLoanInput>({
    name: "",
    principal_amount: 0,
    current_balance: 0,
    interest_rate: 0,
    emi_amount: 0,
    tenure_months: 12,
    loan_type: "personal",
  });

  const {
    loans,
    isLoading,
    totalDebt,
    totalEMI,
    avgInterestRate,
    getMonthsToDebtFree,
    getTotalInterest,
    createLoan,
    deleteLoan,
    isCreating,
  } = useLoans();

  const { messages, isLoading: isAILoading, sendMessage, clearMessages } = useAIChat({
    type: "loan",
    context: { loans },
  });

  const handleCreateLoan = () => {
    if (!newLoan.name || newLoan.current_balance <= 0) return;
    createLoan(newLoan);
    setNewLoan({
      name: "",
      principal_amount: 0,
      current_balance: 0,
      interest_rate: 0,
      emi_amount: 0,
      tenure_months: 12,
      loan_type: "personal",
    });
    setIsAddDialogOpen(false);
  };

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || isAILoading) return;
    sendMessage(aiInput.trim());
    setAIInput("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate debt-free date
  const getDebtFreeDate = () => {
    if (loans.length === 0) return null;
    const maxMonths = Math.max(...loans.map(getMonthsToDebtFree));
    if (maxMonths === Infinity) return null;
    const date = new Date();
    date.setMonth(date.getMonth() + maxMonths);
    return date;
  };

  const debtFreeDate = getDebtFreeDate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-xl">
                <Calculator className="w-6 h-6 text-orange-500" />
              </div>
              Loan Strategist
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">PRO</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Optimize your debt repayment strategy
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsAIOpen(!isAIOpen)}>
              <Sparkles className="w-4 h-4 mr-2" />
              AI Advisor
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Loan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Loan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Loan Name</Label>
                    <Input
                      value={newLoan.name}
                      onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
                      placeholder="e.g., Home Loan - HDFC"
                    />
                  </div>
                  <div>
                    <Label>Loan Type</Label>
                    <Select
                      value={newLoan.loan_type}
                      onValueChange={(value) => setNewLoan({ ...newLoan, loan_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {loanTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Principal Amount (₹)</Label>
                      <Input
                        type="number"
                        value={newLoan.principal_amount || ""}
                        onChange={(e) => setNewLoan({ ...newLoan, principal_amount: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Current Balance (₹)</Label>
                      <Input
                        type="number"
                        value={newLoan.current_balance || ""}
                        onChange={(e) => setNewLoan({ ...newLoan, current_balance: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Interest Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newLoan.interest_rate || ""}
                        onChange={(e) => setNewLoan({ ...newLoan, interest_rate: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Monthly EMI (₹)</Label>
                      <Input
                        type="number"
                        value={newLoan.emi_amount || ""}
                        onChange={(e) => setNewLoan({ ...newLoan, emi_amount: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Tenure (Months)</Label>
                    <Input
                      type="number"
                      value={newLoan.tenure_months || ""}
                      onChange={(e) => setNewLoan({ ...newLoan, tenure_months: Number(e.target.value) })}
                    />
                  </div>
                  <Button onClick={handleCreateLoan} disabled={isCreating} className="w-full">
                    {isCreating ? "Adding..." : "Add Loan"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <IndianRupee className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Debt</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(totalDebt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly EMI</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(totalEMI)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Percent className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Interest</p>
                  <p className="text-xl font-bold text-foreground">{avgInterestRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Debt Free By</p>
                  <p className="text-xl font-bold text-foreground">
                    {debtFreeDate
                      ? debtFreeDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loans List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Your Loans</h2>
            {isLoading ? (
              <Card className="p-8 text-center text-muted-foreground">Loading...</Card>
            ) : loans.length === 0 ? (
              <Card className="p-8 text-center">
                <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No loans added yet</p>
                <p className="text-sm text-muted-foreground">Add your loans to get AI-powered repayment strategies</p>
              </Card>
            ) : (
              loans.map((loan) => {
                const paidPercent = loan.principal_amount > 0
                  ? ((loan.principal_amount - loan.current_balance) / loan.principal_amount) * 100
                  : 0;
                const monthsLeft = getMonthsToDebtFree(loan);
                const totalInterest = getTotalInterest(loan);

                return (
                  <motion.div
                    key={loan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-foreground">{loan.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {loan.loan_type.replace("_", " ")} • {loan.interest_rate}% p.a.
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteLoan(loan.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Outstanding</span>
                            <span className="font-medium">{formatCurrency(loan.current_balance)}</span>
                          </div>
                          <Progress value={paidPercent} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{paidPercent.toFixed(0)}% paid</span>
                            <span>{monthsLeft === Infinity ? "∞" : monthsLeft} months left</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                            <div>
                              <p className="text-xs text-muted-foreground">Monthly EMI</p>
                              <p className="font-medium">{formatCurrency(loan.emi_amount)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Est. Interest</p>
                              <p className="font-medium text-orange-500">{formatCurrency(totalInterest)}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* AI Advisor Panel */}
          <div className={`${isAIOpen ? "block" : "hidden lg:block"}`}>
            <Card className="h-[500px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Loan Advisor
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden p-4 pt-0">
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Ask me about:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• Best repayment strategy</li>
                        <li>• Prepayment calculations</li>
                        <li>• Interest savings tips</li>
                      </ul>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground ml-8"
                            : "bg-secondary mr-8"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleAISubmit} className="flex gap-2">
                  <Textarea
                    value={aiInput}
                    onChange={(e) => setAIInput(e.target.value)}
                    placeholder="Ask about loan strategy..."
                    className="min-h-[40px] max-h-20 resize-none text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAISubmit(e);
                      }
                    }}
                  />
                  <Button type="submit" size="icon" disabled={isAILoading}>
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LoanStrategist;
