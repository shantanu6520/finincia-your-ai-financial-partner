import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Phone, 
  Mail, 
  CheckCircle, 
  IndianRupee,
  Sparkles,
  MessageSquare,
  TrendingDown,
  Calendar
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useRecurringBills, CreateBillInput } from "@/hooks/useRecurringBills";
import { useAIChat } from "@/hooks/useAIChat";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

const frequencies = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const categories = [
  "Streaming",
  "Insurance",
  "Internet",
  "Phone",
  "Utilities",
  "Subscriptions",
  "Gym",
  "Other",
];

const BillNegotiation = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSavingsDialogOpen, setIsSavingsDialogOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [savingsAmount, setSavingsAmount] = useState("");
  const [aiInput, setAIInput] = useState("");
  const [newBill, setNewBill] = useState<CreateBillInput>({
    name: "",
    provider: "",
    amount: 0,
    frequency: "monthly",
    category: "",
  });

  const {
    bills,
    isLoading,
    totalMonthlyBills,
    totalAnnualBills,
    totalSavingsAchieved,
    negotiatedCount,
    getAnnualCost,
    createBill,
    deleteBill,
    markAsNegotiated,
    isCreating,
  } = useRecurringBills();

  const { messages, isLoading: isAILoading, sendMessage } = useAIChat({
    type: "bill",
    context: { bills },
  });

  const handleCreateBill = () => {
    if (!newBill.name || newBill.amount <= 0) return;
    createBill(newBill);
    setNewBill({
      name: "",
      provider: "",
      amount: 0,
      frequency: "monthly",
      category: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleMarkNegotiated = () => {
    if (!selectedBillId) return;
    markAsNegotiated({ id: selectedBillId, savings: Number(savingsAmount) || 0 });
    setIsSavingsDialogOpen(false);
    setSelectedBillId(null);
    setSavingsAmount("");
  };

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || isAILoading) return;
    sendMessage(aiInput.trim());
    setAIInput("");
  };

  const generateNegotiationPrompt = (bill: typeof bills[0]) => {
    sendMessage(
      `Generate a negotiation script for my ${bill.name} bill from ${bill.provider || "the provider"}. Current amount: ₹${bill.amount}/${bill.frequency}. I want to reduce this bill.`
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <Receipt className="w-6 h-6 text-purple-500" />
              </div>
              Bill Negotiation
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">PRO</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Reduce recurring bills with AI-powered negotiation scripts
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Bill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Recurring Bill</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Bill Name</Label>
                  <Input
                    value={newBill.name}
                    onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                    placeholder="e.g., Netflix, Electricity"
                  />
                </div>
                <div>
                  <Label>Provider</Label>
                  <Input
                    value={newBill.provider || ""}
                    onChange={(e) => setNewBill({ ...newBill, provider: e.target.value })}
                    placeholder="e.g., Netflix Inc, BESCOM"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      value={newBill.amount || ""}
                      onChange={(e) => setNewBill({ ...newBill, amount: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Select
                      value={newBill.frequency}
                      onValueChange={(value) => setNewBill({ ...newBill, frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencies.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newBill.category || ""}
                    onValueChange={(value) => setNewBill({ ...newBill, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateBill} disabled={isCreating} className="w-full">
                  {isCreating ? "Adding..." : "Add Bill"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <IndianRupee className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Bills</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(totalMonthlyBills)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annual Cost</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(totalAnnualBills)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                  <p className="text-xl font-bold text-green-500">{formatCurrency(totalSavingsAchieved)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Negotiated</p>
                  <p className="text-xl font-bold text-foreground">{negotiatedCount} / {bills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bills List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Your Recurring Bills</h2>
            {isLoading ? (
              <Card className="p-8 text-center text-muted-foreground">Loading...</Card>
            ) : bills.length === 0 ? (
              <Card className="p-8 text-center">
                <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recurring bills added yet</p>
                <p className="text-sm text-muted-foreground">Add your bills to get AI negotiation scripts</p>
              </Card>
            ) : (
              bills.map((bill) => (
                <motion.div
                  key={bill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{bill.name}</h3>
                            {bill.is_negotiated && (
                              <Badge variant="secondary" className="text-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Negotiated
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {bill.provider || "Unknown provider"} • {bill.category || "Uncategorized"}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Per {bill.frequency}</p>
                              <p className="font-semibold">{formatCurrency(bill.amount)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Annual</p>
                              <p className="font-semibold">{formatCurrency(getAnnualCost(bill))}</p>
                            </div>
                            {bill.savings_achieved > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground">Saved</p>
                                <p className="font-semibold text-green-500">
                                  {formatCurrency(bill.savings_achieved)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateNegotiationPrompt(bill)}
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Script
                          </Button>
                          {!bill.is_negotiated && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBillId(bill.id);
                                setIsSavingsDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Done
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBill(bill.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* AI Negotiation Panel */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Negotiation Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-4 pt-0">
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Click "Script" on any bill to get:</p>
                    <ul className="mt-2 space-y-1 text-left max-w-[200px] mx-auto">
                      <li>• <Phone className="w-3 h-3 inline" /> Call scripts</li>
                      <li>• <Mail className="w-3 h-3 inline" /> Email templates</li>
                      <li>• Retention offer tips</li>
                    </ul>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground ml-8"
                          : "bg-secondary mr-4"
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
                  placeholder="Ask for negotiation help..."
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

        {/* Savings Dialog */}
        <Dialog open={isSavingsDialogOpen} onOpenChange={setIsSavingsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Savings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                How much did you save through negotiation? (monthly amount)
              </p>
              <div>
                <Label>Monthly Savings (₹)</Label>
                <Input
                  type="number"
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <Button onClick={handleMarkNegotiated} className="w-full">
                Record Savings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default BillNegotiation;
