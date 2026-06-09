import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, MapPin, Settings, User } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — Zestigo" }] }),
  component: () => (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  ),
});

function Profile() {
  const { user, logout } = useAuth();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-5 rounded-4xl bg-card p-6 shadow-card">
        <img src={user?.avatar} alt={user?.name} className="size-20 rounded-3xl object-cover" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
          <p className="text-sm text-muted-foreground">
            {user?.email} • {user?.phone}
          </p>
        </div>
        <Button variant="outline" className="ml-auto" onClick={() => logout()}>
          Logout
        </Button>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Card icon={User} title="Account information">
          <Field label="Name" value={user?.name ?? ""} />
          <Field label="Email" value={user?.email ?? ""} />
          <Field label="Phone" value={user?.phone ?? ""} />
        </Card>
        <Card icon={MapPin} title="Saved addresses">
          <Field label="Home" value="12, 4th Block, Koramangala, Bengaluru" />
          <Field label="Work" value="Prestige Tech Park, Marathahalli, Bengaluru" />
        </Card>
        <Card icon={CreditCard} title="Payment methods">
          <Field label="UPI" value="aarav@okhdfcbank" />
          <Field label="Wallet" value="₹450.00 balance" />
        </Card>
        <Card icon={Settings} title="Preferences">
          <Field label="Notifications" value="Enabled" />
          <Field label="Dietary" value="Vegetarian-friendly" />
        </Card>
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-card p-6 shadow-soft">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
        <Icon className="size-5 text-primary" /> {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
