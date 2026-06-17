import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <span className="text-2xl font-bold text-white">Z</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">ZestiGo Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to access the admin dashboard
          </p>
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
          fallbackRedirectUrl="/admin/dashboard"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border rounded-2xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "rounded-lg",
              formButtonPrimary: "bg-primary hover:bg-primary/90 rounded-lg",
            },
          }}
        />
      </div>
    </div>
  );
}
