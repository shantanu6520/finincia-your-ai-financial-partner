import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";

interface ProProtectedRouteProps {
  children: React.ReactNode;
}

// Whitelist of allowed email addresses
const ALLOWED_EMAILS = [
  "dhengre.shantanu2000@gmail.com",
  "test@razorpay.com",
];

const ProProtectedRoute = ({ children }: ProProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isPro, isLoading: subLoading } = useSubscription();

  // Show loading while checking auth or subscription
  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user email is in whitelist (bypass subscription for these emails)
  const isWhitelistedEmail = user.email && ALLOWED_EMAILS.includes(user.email.toLowerCase());
  
  // Whitelisted emails get full access without subscription
  if (isWhitelistedEmail) {
    return <>{children}</>;
  }

  // Everyone else needs a Pro subscription
  if (!isPro) {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
};

export default ProProtectedRoute;
