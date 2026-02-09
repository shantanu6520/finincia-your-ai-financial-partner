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

  // Check if user email is in whitelist
  const isAllowedEmail = user.email && ALLOWED_EMAILS.includes(user.email.toLowerCase());
  
  if (!isAllowedEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-md p-8">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Access Restricted</h1>
          <p className="text-muted-foreground">
            FININCIA is currently in private beta. Your email ({user.email}) is not authorized to access this dashboard.
          </p>
          <a 
            href="/" 
            className="text-primary hover:underline"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // Redirect to subscription if not Pro
  if (!isPro) {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
};

export default ProProtectedRoute;
