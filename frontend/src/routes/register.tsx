import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { InputField } from "@/components/InputField";
import { useAuth, ValidationError } from "@/context/AuthContext";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Zestigo" }] }),
  component: Register,
});

function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    console.log("REGISTER SUBMIT FIRED");
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setFieldErrors({});
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone.replace(/[\s\-()]/g, ""),
      password: form.password,
    };
    console.log("REGISTER PAYLOAD", payload);
    try {
      await register(payload);
      toast.success("Account created! Welcome to Zestigo 🎉");
      navigate({ to: "/" });
    } catch (err: unknown) {
      console.error("register.tsx onSubmit: Caught error:", err);
      let message = "Registration failed. Please try again.";
      if (err instanceof ValidationError) {
        message = err.message;
        if (err.errors) {
          setFieldErrors(err.errors);
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="rounded-4xl bg-card p-8 shadow-card animate-scale-in">
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join Zestigo and start ordering.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <InputField
            label="Full name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            icon={<User className="size-4" />}
            error={fieldErrors.name}
            required
          />
          <InputField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            icon={<Mail className="size-4" />}
            error={fieldErrors.email}
            required
          />
          <InputField
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            icon={<Phone className="size-4" />}
            error={fieldErrors.phone}
            required
          />
          <InputField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            icon={<Lock className="size-4" />}
            error={fieldErrors.password}
            required
          />
          <InputField
            label="Confirm password"
            type="password"
            value={form.confirm}
            onChange={(e) => set("confirm", e.target.value)}
            icon={<Lock className="size-4" />}
            error={error}
            required
          />
          <Button type="submit" block size="lg" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
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
          Already have an account?{" "}
          <Link
            to="/login"
            search={{ redirect: undefined }}
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
