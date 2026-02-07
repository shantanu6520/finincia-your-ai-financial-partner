import { useState } from "react";
import { motion } from "framer-motion";
import { 
  PieChart, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  Edit2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useBudgets, Budget } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Budgets = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [newBudgetCategory, setNewBudgetCategory] = useState("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");

  const { 
    budgets, 
    loading, 
    totalBudgeted, 
    totalSpent, 
    overBudgetCount,
    nearLimitCount,
    createBudget, 
    updateBudget, 
    deleteBudget 
  } = useBudgets(selectedMonth, selectedYear);
  
  const { categories } = useCategories();
  const { profile } = useProfile();

  const expenseCategories = categories.filter(c => c.type === "expense");
  const budgetedCategoryIds = budgets.map(b => b.category_id);
  const availableCategories = expenseCategories.filter(c => !budgetedCategoryIds.includes(c.id));

  const currencySymbol = profile?.currency === "INR" ? "₹" : 
                         profile?.currency === "USD" ? "$" : 
                         profile?.currency === "EUR" ? "€" : 
                         profile?.currency === "GBP" ? "£" : "₹";

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString("en-IN")}`;
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const handleCreateBudget = async () => {
    if (!newBudgetCategory || !newBudgetAmount) return;
    
    await createBudget(newBudgetCategory, parseFloat(newBudgetAmount));
    setNewBudgetCategory("");
    setNewBudgetAmount("");
    setIsAddDialogOpen(false);
  };

  const handleUpdateBudget = async () => {
    if (!editingBudget || !newBudgetAmount) return;
    
    await updateBudget(editingBudget.id, parseFloat(newBudgetAmount));
    setEditingBudget(null);
    setNewBudgetAmount("");
  };

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 80) return "bg-orange-500";
    return "bg-accent";
  };

  const getStatusBadge = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
          <AlertTriangle className="w-3 h-3" />
          Over Budget
        </span>
      );
    }
    if (percentage >= 80) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500">
          <AlertTriangle className="w-3 h-3" />
          Near Limit
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
        <CheckCircle className="w-3 h-3" />
        On Track
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
              Budget Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Set spending limits and track your progress
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={availableCategories.length === 0}>
                <Plus className="w-4 h-4" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newBudgetCategory} onValueChange={setNewBudgetCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Budget Amount ({currencySymbol})</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={newBudgetAmount}
                    onChange={(e) => setNewBudgetAmount(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateBudget} className="w-full">
                  Create Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center min-w-[200px]">
            <h2 className="font-display text-xl font-semibold">
              {months[selectedMonth - 1]} {selectedYear}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-4 lg:p-6"
          >
            <p className="text-sm text-muted-foreground">Total Budgeted</p>
            <p className="text-xl lg:text-2xl font-bold text-foreground mt-1">
              {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalBudgeted)}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-4 lg:p-6"
          >
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-xl lg:text-2xl font-bold text-foreground mt-1">
              {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalSpent)}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-4 lg:p-6"
          >
            <p className="text-sm text-muted-foreground">Over Budget</p>
            <p className={`text-xl lg:text-2xl font-bold mt-1 ${overBudgetCount > 0 ? "text-destructive" : "text-foreground"}`}>
              {loading ? <Skeleton className="h-8 w-16" /> : overBudgetCount}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-4 lg:p-6"
          >
            <p className="text-sm text-muted-foreground">Near Limit</p>
            <p className={`text-xl lg:text-2xl font-bold mt-1 ${nearLimitCount > 0 ? "text-orange-500" : "text-foreground"}`}>
              {loading ? <Skeleton className="h-8 w-16" /> : nearLimitCount}
            </p>
          </motion.div>
        </div>

        {/* Budget List */}
        <div className="space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          ) : budgets.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No budgets set for {months[selectedMonth - 1]}
              </h3>
              <p className="text-muted-foreground mb-4">
                Start by creating budgets for your expense categories
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} disabled={availableCategories.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Budget
              </Button>
            </div>
          ) : (
            budgets.map((budget, index) => {
              const spent = budget.spent || 0;
              const amount = Number(budget.amount);
              const percentage = Math.min(100, (spent / amount) * 100);
              
              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {budget.category?.name || "Unknown Category"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(spent, amount)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog open={editingBudget?.id === budget.id} onOpenChange={(open) => {
                        if (!open) {
                          setEditingBudget(null);
                          setNewBudgetAmount("");
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setEditingBudget(budget);
                              setNewBudgetAmount(budget.amount.toString());
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Budget</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label>Category</Label>
                              <Input value={budget.category?.name || ""} disabled />
                            </div>
                            <div className="space-y-2">
                              <Label>Monthly Budget Amount ({currencySymbol})</Label>
                              <Input
                                type="number"
                                value={newBudgetAmount}
                                onChange={(e) => setNewBudgetAmount(e.target.value)}
                              />
                            </div>
                            <Button onClick={handleUpdateBudget} className="w-full">
                              Update Budget
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the budget for {budget.category?.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteBudget(budget.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatCurrency(spent)} of {formatCurrency(amount)}
                      </span>
                      <span className="font-medium">{percentage.toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-3"
                    />
                    <p className="text-sm text-muted-foreground">
                      {spent <= amount 
                        ? `${formatCurrency(amount - spent)} remaining`
                        : `${formatCurrency(spent - amount)} over budget`
                      }
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Budgets;
