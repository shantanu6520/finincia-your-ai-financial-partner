import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Wallet as WalletIcon, Building2, Smartphone, Banknote, CreditCard, Pencil, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useWallets, Wallet, CreateWalletInput } from "@/hooks/useWallets";
import { useProfile } from "@/hooks/useProfile";
import type { Database } from "@/integrations/supabase/types";

type WalletType = Database["public"]["Enums"]["wallet_type"];

const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
};

const walletTypeIcons: Record<WalletType, React.ReactNode> = {
  bank: <Building2 className="w-5 h-5" />,
  upi: <Smartphone className="w-5 h-5" />,
  cash: <Banknote className="w-5 h-5" />,
  credit_card: <CreditCard className="w-5 h-5" />,
};

const walletTypeLabels: Record<WalletType, string> = {
  bank: "Bank Account",
  upi: "UPI",
  cash: "Cash",
  credit_card: "Credit Card",
};

const Wallets = () => {
  const { profile } = useProfile();
  const { wallets, totalBalance, createWallet, updateWallet, deleteWallet, isCreating, isUpdating, isDeleting } = useWallets();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [formData, setFormData] = useState<CreateWalletInput>({
    name: "",
    type: "bank",
    balance: 0,
  });

  const currencySymbol = currencySymbols[profile?.currency || "INR"] || "₹";

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWallet) {
      updateWallet({
        id: editingWallet.id,
        name: formData.name,
        type: formData.type,
        balance: formData.balance,
      });
    } else {
      createWallet(formData);
    }
    handleCloseDialog();
  };

  const handleOpenDialog = (wallet?: Wallet) => {
    if (wallet) {
      setEditingWallet(wallet);
      setFormData({
        name: wallet.name,
        type: wallet.type,
        balance: Number(wallet.balance),
      });
    } else {
      setEditingWallet(null);
      setFormData({ name: "", type: "bank", balance: 0 });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingWallet(null);
    setFormData({ name: "", type: "bank", balance: 0 });
  };

  const handleDelete = (id: string) => {
    deleteWallet(id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Wallets</h1>
            <p className="text-muted-foreground mt-1">Manage your financial accounts</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingWallet ? "Edit Wallet" : "Add New Wallet"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Wallet Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., HDFC Savings"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Wallet Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: WalletType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Account</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="balance">Current Balance ({currencySymbol})</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.balance || ""}
                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isCreating || isUpdating}>
                    {editingWallet ? "Update" : "Create"} Wallet
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Total Balance Card */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-primary-foreground/70 text-sm uppercase tracking-wider mb-2">Total Balance</p>
              <p className="font-display text-4xl md:text-5xl font-bold">
                {currencySymbol}{formatAmount(totalBalance)}
              </p>
              <p className="text-primary-foreground/70 mt-2">
                Across {wallets.length} {wallets.length === 1 ? "wallet" : "wallets"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Wallets Grid */}
        {wallets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet, index) => (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border/50 hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        {walletTypeIcons[wallet.type]}
                      </div>
                      <div>
                        <CardTitle className="text-base">{wallet.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{walletTypeLabels[wallet.type]}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(wallet)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Wallet?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove "{wallet.name}" and all associated transactions. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(wallet.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className={`font-display text-2xl font-bold ${Number(wallet.balance) < 0 ? "text-muted-foreground" : ""}`}>
                      {currencySymbol}{formatAmount(Number(wallet.balance))}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="py-16 text-center">
              <WalletIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-display text-xl font-semibold mb-2">No Wallets Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start tracking your finances by adding your first wallet. You can add bank accounts, UPI, cash, or credit cards.
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Wallet
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Wallets;
