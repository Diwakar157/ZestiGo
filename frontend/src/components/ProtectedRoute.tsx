import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@clerk/tanstack-react-start";
import { LoadingSpinner } from "./LoadingSpinner";

/**
 * Client-side route guard powered by Clerk.
 * Redirects unauthenticated users to /login.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: "/login", search: { redirect: window.location.pathname } });
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return <LoadingSpinner label="Loading..." />;
  }

  if (!isSignedIn) {
    return <LoadingSpinner label="Redirecting to sign in..." />;
  }

  return <>{children}</>;
}
