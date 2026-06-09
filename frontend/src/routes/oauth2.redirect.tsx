import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/oauth2/redirect")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: (s.token as string) || "",
    id: (s.id as string) || "",
    name: (s.name as string) || "",
    email: (s.email as string) || "",
    avatar: (s.avatar as string) || "",
    phone: (s.phone as string) || "",
  }),
  head: () => ({ meta: [{ title: "Authenticating — Zestigo" }] }),
  component: OAuth2Redirect,
});

function OAuth2Redirect() {
  const { token, id, name, email, avatar, phone } = useSearch({ from: "/oauth2/redirect" });
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && id && email) {
      const user = {
        id,
        name: decodeURIComponent(name),
        email: decodeURIComponent(email),
        avatar: decodeURIComponent(avatar),
        phone: decodeURIComponent(phone),
      };
      
      loginWithToken(user, token);
      toast.success("Welcome to Zestigo! 🎉");
      navigate({ to: "/" });
    } else {
      toast.error("Google Authentication failed. Please try again.");
      navigate({ to: "/login" });
    }
  }, [token, id, name, email, avatar, phone, loginWithToken, navigate]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-12 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="size-10 animate-spin text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Completing Sign In...</h2>
        <p className="text-sm text-muted-foreground">Please wait while we secure your session.</p>
      </div>
    </div>
  );
}
