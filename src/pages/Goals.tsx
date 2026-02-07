import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit2,
  Calendar,
  TrendingUp,
  CheckCircle,
  Pause,
  Play,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useGoals, Goal, GoalStatus } from "@/hooks/useGoals";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

const goalIcons = [
  { value: "target", label: "Target" },
  { value: "home", label: "Home" },
  { value: "car", label: "Car" },
  { value: "plane", label: "Travel" },
  { value: "graduation-cap", label: "Education" },
  { value: "heart", label: "Health" },
  { value: "piggy-bank", label: "Savings" },
  { value: "gift", label: "Gift" },
];

const goalColors = [
  { value: "#10B981", label: "Green" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" },
  { value: "#EC4899", label: "Pink" },
];

const Goals = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributionGoal, setContributionGoal] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  
  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTargetAmount, setFormTargetAmount] = useState("");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formIcon, setFormIcon] = useState("target");
  const [formColor, setFormColor] = useState("#10B981");

  const {
    goals,
    loading,
    activeGoals,
    completedGoals,
    totalTargetAmount,
    totalSavedAmount,
    createGoal,
    updateGoal,
    addContribution,
    deleteGoal,
    getProgress,
    getMonthsRemaining,
    getMonthlyContribution,
    getStatusLabel,
  } = useGoals();
  
  const { profile } = useProfile();

  const currencySymbol = profile?.currency === "INR" ? "₹" : 
                         profile?.currency === "USD" ? "$" : 
                         profile?.currency === "EUR" ? "€" : 
                         profile?.currency === "GBP" ? "£" : "₹";

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString("en-IN")}`;
  };

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormTargetAmount("");
    setFormTargetDate("");
    setFormIcon("target");
    setFormColor("#10B981");
  };

  const handleCreateGoal = async () => {
    if (!formName || !formTargetAmount || !formTargetDate) return;
    
    await createGoal({
      name: formName,
      description: formDescription || undefined,
      target_amount: parseFloat(formTargetAmount),
      target_date: formTargetDate,
      icon: formIcon,
      color: formColor,
    });
    
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal || !formName || !formTargetAmount || !formTargetDate) return;
    
    await updateGoal(editingGoal.id, {
      name: formName,
      description: formDescription || null,
      target_amount: parseFloat(formTargetAmount),
      target_date: formTargetDate,
      icon: formIcon,
      color: formColor,
    });
    
    resetForm();
    setEditingGoal(null);
  };

  const handleAddContribution = async () => {
    if (!contributionGoal || !contributionAmount) return;
    
    await addContribution(contributionGoal.id, parseFloat(contributionAmount));
    setContributionGoal(null);
    setContributionAmount("");
  };

  const handleTogglePause = async (goal: Goal) => {
    const newStatus: GoalStatus = goal.status === "paused" ? "active" : "paused";
    await updateGoal(goal.id, { status: newStatus });
  };

  const openEditDialog = (goal: Goal) => {
    setFormName(goal.name);
    setFormDescription(goal.description || "");
    setFormTargetAmount(goal.target_amount.toString());
    setFormTargetDate(goal.target_date);
    setFormIcon(goal.icon || "target");
    setFormColor(goal.color || "#10B981");
    setEditingGoal(goal);
  };

  const renderGoalCard = (goal: Goal, index: number) => {
    const progress = getProgress(goal);
    const monthsRemaining = getMonthsRemaining(goal);
    const monthlyNeeded = getMonthlyContribution(goal);
    const statusLabel = getStatusLabel(goal);
    
    return (
      <motion.div
        key={goal.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${goal.color}20` }}
            >
              <Target className="w-6 h-6" style={{ color: goal.color || "#10B981" }} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{goal.name}</h3>
              <span className={`text-xs font-medium ${statusLabel.color}`}>
                {statusLabel.label}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {goal.status !== "completed" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTogglePause(goal)}
                  title={goal.status === "paused" ? "Resume" : "Pause"}
                >
                  {goal.status === "paused" ? (
                    <Play className="w-4 h-4 text-green-500" />
                  ) : (
                    <Pause className="w-4 h-4 text-yellow-500" />
                  )}
                </Button>
                <Dialog 
                  open={contributionGoal?.id === goal.id} 
                  onOpenChange={(open) => !open && setContributionGoal(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setContributionGoal(goal)}
                      disabled={goal.status === "paused"}
                    >
                      <DollarSign className="w-4 h-4 text-accent" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Contribution</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Goal: {goal.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Current: {formatCurrency(Number(goal.current_amount))} / {formatCurrency(Number(goal.target_amount))}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Contribution Amount ({currencySymbol})</Label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleAddContribution} className="w-full">
                        Add Contribution
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
            
            <Dialog 
              open={editingGoal?.id === goal.id} 
              onOpenChange={(open) => {
                if (!open) {
                  setEditingGoal(null);
                  resetForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(goal)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label>Goal Name</Label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g., Emergency Fund"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="What's this goal for?"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Target Amount ({currencySymbol})</Label>
                      <Input
                        type="number"
                        value={formTargetAmount}
                        onChange={(e) => setFormTargetAmount(e.target.value)}
                        placeholder="100000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Date</Label>
                      <Input
                        type="date"
                        value={formTargetDate}
                        onChange={(e) => setFormTargetDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <Select value={formIcon} onValueChange={setFormIcon}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {goalIcons.map(icon => (
                            <SelectItem key={icon.value} value={icon.value}>
                              {icon.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Select value={formColor} onValueChange={setFormColor}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {goalColors.map(color => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: color.value }} 
                                />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleUpdateGoal} className="w-full">
                    Update Goal
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
                  <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{goal.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteGoal(goal.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {goal.description && (
          <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatCurrency(Number(goal.current_amount))} of {formatCurrency(Number(goal.target_amount))}
            </span>
            <span className="font-medium">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          
          <div className="flex items-center justify-between text-sm pt-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {monthsRemaining > 0 
                  ? `${monthsRemaining} months remaining`
                  : goal.status === "completed" 
                    ? "Completed!"
                    : "Past due date"
                }
              </span>
            </div>
            {goal.status === "active" && monthsRemaining > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>{formatCurrency(monthlyNeeded)}/mo needed</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
              Goal Tracking
            </h1>
            <p className="text-muted-foreground mt-1">
              Set financial goals and track your progress
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Goal Name</Label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Emergency Fund"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="What's this goal for?"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Amount ({currencySymbol})</Label>
                    <Input
                      type="number"
                      value={formTargetAmount}
                      onChange={(e) => setFormTargetAmount(e.target.value)}
                      placeholder="100000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Date</Label>
                    <Input
                      type="date"
                      value={formTargetDate}
                      onChange={(e) => setFormTargetDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Select value={formIcon} onValueChange={setFormIcon}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {goalIcons.map(icon => (
                          <SelectItem key={icon.value} value={icon.value}>
                            {icon.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Select value={formColor} onValueChange={setFormColor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {goalColors.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: color.value }} 
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreateGoal} className="w-full">
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-4 lg:p-6"
          >
            <p className="text-sm text-muted-foreground">Active Goals</p>
            <p className="text-xl lg:text-2xl font-bold text-foreground mt-1">
              {loading ? <Skeleton className="h-8 w-12" /> : activeGoals.length}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-4 lg:p-6"
          >
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-xl lg:text-2xl font-bold text-accent mt-1">
              {loading ? <Skeleton className="h-8 w-12" /> : completedGoals.length}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-4 lg:p-6"
          >
            <p className="text-sm text-muted-foreground">Total Target</p>
            <p className="text-xl lg:text-2xl font-bold text-foreground mt-1">
              {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalTargetAmount)}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-4 lg:p-6"
          >
            <p className="text-sm text-muted-foreground">Total Saved</p>
            <p className="text-xl lg:text-2xl font-bold text-accent mt-1">
              {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalSavedAmount)}
            </p>
          </motion.div>
        </div>

        {/* Goals Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {loading ? (
              [...Array(2)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))
            ) : activeGoals.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No active goals
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first financial goal
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Goal
                </Button>
              </div>
            ) : (
              activeGoals.map((goal, index) => renderGoalCard(goal, index))
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {loading ? (
              <div className="bg-card rounded-xl border border-border p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : completedGoals.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No completed goals yet
                </h3>
                <p className="text-muted-foreground">
                  Keep working on your active goals!
                </p>
              </div>
            ) : (
              completedGoals.map((goal, index) => renderGoalCard(goal, index))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Goals;
