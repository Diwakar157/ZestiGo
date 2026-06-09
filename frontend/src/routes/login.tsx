import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: (s.redirect as string) || undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in — Zestigo" }] }),
  component: Login,
});

function Login() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <SignIn
        routing="hash"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "rounded-4xl shadow-card bg-card w-full",
            headerTitle: "text-foreground font-bold text-2xl",
            headerSubtitle: "text-muted-foreground text-sm",
            formButtonPrimary:
              "bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 font-semibold transition-all",
            footerActionLink: "text-primary font-semibold hover:underline",
            formFieldInput:
              "rounded-xl border-border bg-background text-foreground focus:ring-primary",
            dividerLine: "bg-border",
          },
        }}
      />
    </div>
  );
}
