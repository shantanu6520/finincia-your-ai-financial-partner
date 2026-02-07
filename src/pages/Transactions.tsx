import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Trash2,
  Receipt,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useTransactions, CreateTransactionInput } from "@/hooks/useTransactions";
import { useWallets } from "@/hooks/useWallets";
import { useCategories } from "@/hooks/useCategories";
import { useProfile } from "@/hooks/useProfile";
import { format, startOfMonth, endOfMonth } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type TransactionType = Database["public"]["Enums"]["transaction_type"];

const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
};

const Transactions = () => {
  const { profile } = useProfile();
  const { wallets } = useWallets();
  const { incomeCategories, expenseCategories } = useCategories();
  
  const now = new Date();
  const [startDate, setStartDate] = useState(format(startOfMonth(now), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(now), "yyyy-MM-dd"));
  const [filterWallet, setFilterWallet] = useState<string | undefined>();
  const [filterType, setFilterType] = useState<TransactionType | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { 
    transactions, 
    totalIncome, 
    totalExpenses, 
    createTransaction, 
    deleteTransaction,
    isCreating,
    isDeleting 
  } = useTransactions({
    startDate,
    endDate,
    walletId: filterWallet,
    type: filterType,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>("expense");
  const [formData, setFormData] = useState<CreateTransactionInput>({
    wallet_id: "",
    amount: 0,
    type: "expense",
    transaction_date: format(new Date(), "yyyy-MM-dd"),
  });

  const currencySymbol = currencySymbols[profile?.currency || "INR"] || "₹";

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tx.category?.name?.toLowerCase().includes(query) ||
      tx.wallet?.name?.toLowerCase().includes(query) ||
      tx.notes?.toLowerCase().includes(query)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTransaction({
      ...formData,
      type: transactionType,
    });
    handleCloseDialog();
  };

  const handleOpenDialog = (type: TransactionType = "expense") => {
    setTransactionType(type);
    setFormData({
      wallet_id: wallets[0]?.id || "",
      amount: 0,
      type,
      transaction_date: format(new Date(), "yyyy-MM-dd"),
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      wallet_id: "",
      amount: 0,
      type: "expense",
      transaction_date: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const categories = transactionType === "income" ? incomeCategories : expenseCategories;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1">Track your income and expenses</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog("expense")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <Tabs value={transactionType} onValueChange={(v) => setTransactionType(v as TransactionType)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="expense">Expense</TabsTrigger>
                    <TabsTrigger value="income">Income</TabsTrigger>
                  </TabsList>
                </Tabs>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ({currencySymbol})</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount || ""}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      required
                      className="text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wallet">Wallet</Label>
                    <Select
                      value={formData.wallet_id}
                      onValueChange={(value) => setFormData({ ...formData, wallet_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select wallet" />
                      </SelectTrigger>
                      <SelectContent>
                        {wallets.map((wallet) => (
                          <SelectItem key={wallet.id} value={wallet.id}>
                            {wallet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category_id || ""}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.transaction_date}
                      onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      placeholder="Add a note..."
                      value={formData.notes || ""}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={isCreating || !formData.wallet_id || !formData.amount}
                    >
                      Add {transactionType === "income" ? "Income" : "Expense"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-foreground/10 flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="font-display text-2xl font-bold">{currencySymbol}{formatAmount(totalIncome)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <ArrowDownRight className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="font-display text-2xl font-bold">{currencySymbol}{formatAmount(totalExpenses)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  totalIncome - totalExpenses >= 0 ? "bg-foreground/10" : "bg-muted"
                }`}>
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net</p>
                  <p className={`font-display text-2xl font-bold ${
                    totalIncome - totalExpenses < 0 ? "text-muted-foreground" : ""
                  }`}>
                    {totalIncome - totalExpenses >= 0 ? "+" : "-"}
                    {currencySymbol}{formatAmount(Math.abs(totalIncome - totalExpenses))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-36"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-36"
            />
            <Select value={filterWallet || "all"} onValueChange={(v) => setFilterWallet(v === "all" ? undefined : v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Wallets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wallets</SelectItem>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType || "all"} onValueChange={(v) => setFilterType(v === "all" ? undefined : v as TransactionType)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === "income" ? "bg-foreground/10" : "bg-muted"
                      }`}>
                        {tx.type === "income" ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.category?.name || "Uncategorized"}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{tx.wallet?.name}</span>
                          <span>•</span>
                          <span>{format(new Date(tx.transaction_date), "dd MMM yyyy")}</span>
                          {tx.notes && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-32">{tx.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`font-semibold text-lg ${tx.type === "income" ? "text-foreground" : ""}`}>
                        {tx.type === "income" ? "+" : "-"}{currencySymbol}{formatAmount(Number(tx.amount))}
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this transaction and update your wallet balance. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTransaction(tx.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50">
            <CardContent className="py-16 text-center">
              <Receipt className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-display text-xl font-semibold mb-2">No Transactions Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {wallets.length === 0 
                  ? "Add a wallet first, then start tracking your transactions."
                  : "Start tracking your finances by adding your first transaction."}
              </p>
              {wallets.length > 0 && (
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Transaction
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
