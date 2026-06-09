import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { InputField } from "@/components/InputField";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: (s.redirect as string) || undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in — Zestigo" }] }),
  component: Login,
});

function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const [email, setEmail] = useState("demo@zestigo.com");
  const [password, setPassword] = useState("password");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login({ email, password });
      toast.success("Welcome back!");
      navigate({ to: redirect ?? "/" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      toast.error(message);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="rounded-4xl bg-card p-8 shadow-card animate-scale-in">
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue ordering.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="size-4" />}
            required
          />
          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="size-4" />}
            required
          />
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" className="size-4 rounded accent-[oklch(0.49_0.083_162)]" />{" "}
              Remember me
            </label>
            <button type="button" className="font-medium text-primary hover:underline">
              Forgot password?
            </button>
          </div>
          <Button type="submit" block size="lg" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="h-px w-full bg-border" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">or</span>
          <div className="h-px w-full bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          block
          size="lg"
          className="mt-4 flex items-center justify-center gap-2 hover:bg-muted"
          onClick={() => {
            const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8081";
            window.location.href = `${apiBaseUrl}/oauth2/authorization/google`;
          }}
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
