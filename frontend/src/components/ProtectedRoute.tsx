import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";

/**
 * Client-side route guard. Redirects unauthenticated users to /login.
 * Used to wrap protected page content (cart, checkout, orders, profile, wishlist).
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: window.location.pathname } });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return <LoadingSpinner label="Redirecting to sign in..." />;
  }

  return <>{children}</>;
}
