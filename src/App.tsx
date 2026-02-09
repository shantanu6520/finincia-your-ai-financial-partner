import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Wallets from "./pages/Wallets";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import AICoach from "./pages/AICoach";
import LoanStrategist from "./pages/LoanStrategist";
import BillNegotiation from "./pages/BillNegotiation";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Security from "./pages/Security";
import Subscription from "./pages/Subscription";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/dashboard/ProtectedRoute";
import ProProtectedRoute from "@/components/dashboard/ProProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/security" element={<Security />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/dashboard"
              element={
                <ProProtectedRoute>
                  <Dashboard />
                </ProProtectedRoute>
              }
            />
            <Route
              path="/wallets"
              element={
                <ProProtectedRoute>
                  <Wallets />
                </ProProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProProtectedRoute>
                  <Transactions />
                </ProProtectedRoute>
              }
            />
            <Route
              path="/budgets"
              element={
                <ProProtectedRoute>
                  <Budgets />
                </ProProtectedRoute>
              }
            />
            <Route
              path="/goals"
              element={
                <ProProtectedRoute>
                  <Goals />
                </ProProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProProtectedRoute>
                  <Profile />
                </ProProtectedRoute>
              }
            />
            <Route
              path="/ai-coach"
              element={
                <ProProtectedRoute>
                  <AICoach />
                </ProProtectedRoute>
              }
            />
            <Route
              path="/loan-strategist"
              element={
                <ProProtectedRoute>
                  <LoanStrategist />
                </ProProtectedRoute>
              }
            />
            <Route
              path="/bill-negotiation"
              element={
                <ProProtectedRoute>
                  <BillNegotiation />
                </ProProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProProtectedRoute>
                  <Analytics />
                </ProProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProProtectedRoute>
                  <Reports />
                </ProProtectedRoute>
              }
            />
            <Route
              path="/subscription"
              element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
