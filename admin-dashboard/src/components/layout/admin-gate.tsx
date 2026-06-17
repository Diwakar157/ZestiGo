import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";

/**
 * Server component that wraps admin pages and checks that the signed-in
 * user's primary email matches the ADMIN_EMAIL environment variable.
 */
export async function AdminGate({ children }: { children: ReactNode }) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = user.primaryEmailAddress?.emailAddress;

  if (!adminEmail || userEmail !== adminEmail) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
