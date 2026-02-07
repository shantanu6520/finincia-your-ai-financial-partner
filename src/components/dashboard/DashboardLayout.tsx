import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  PieChart,
  Target,
  Sparkles,
  Calculator,
  FileText,
  Activity,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import fininciaLogo from "@/assets/finincia-logo.png";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Wallet, label: "Wallets", path: "/wallets" },
  { icon: Receipt, label: "Transactions", path: "/transactions" },
  { icon: PieChart, label: "Budgets", path: "/budgets" },
  { icon: Target, label: "Goals", path: "/goals" },
  { icon: Activity, label: "Analytics", path: "/analytics", isPro: true },
  { icon: ClipboardList, label: "Reports", path: "/reports", isPro: true },
  { icon: Sparkles, label: "AI Coach", path: "/ai-coach", isPro: true },
  { icon: Calculator, label: "Loan Strategist", path: "/loan-strategist", isPro: true },
  { icon: FileText, label: "Recurring Spend Optimizer", path: "/bill-negotiation", isPro: true },
  { icon: User, label: "Profile", path: "/profile" },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 flex items-center justify-between px-4">
        <Link to="/dashboard">
          <img src={fininciaLogo} alt="FININCIA" className="h-8 invert" />
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-secondary rounded-lg"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 lg:h-20 flex items-center justify-center px-6 border-b border-border">
            <Link to="/dashboard">
              <img src={fininciaLogo} alt="FININCIA" className="h-8 lg:h-10 invert" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.isPro && (
                    <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full ml-auto">
                      PRO
                    </span>
                  )}
                  {isActive && !item.isPro && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <div className="px-4 py-3 mb-2">
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-medium text-foreground truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-4 lg:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;
