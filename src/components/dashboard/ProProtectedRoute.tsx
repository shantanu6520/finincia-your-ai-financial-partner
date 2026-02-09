import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";

interface ProProtectedRouteProps {
  children: React.ReactNode;
}

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

  // Redirect to subscription if not Pro
  if (!isPro) {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
};

export default ProProtectedRoute;
