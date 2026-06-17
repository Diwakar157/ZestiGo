import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@clerk/nextjs";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
      <Card className="max-w-md animate-scale-in border-destructive/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-muted-foreground">
            You are not authorized to access the ZestiGo Admin Dashboard.
            <br />
            Only designated administrators can access this area.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <SignOutButton redirectUrl="/sign-in">
              <Button variant="outline">Sign in with another account</Button>
            </SignOutButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
