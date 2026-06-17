import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Server-side helper that verifies the current Clerk user is the admin.
 * If not authenticated, redirects to /sign-in.
 * If not the admin email, redirects to /unauthorized.
 * Returns the Clerk user object on success.
 */
export async function requireAdmin() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = user.primaryEmailAddress?.emailAddress;

  if (!adminEmail || userEmail !== adminEmail) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Check if a Clerk user email matches the admin email.
 * Does NOT redirect — returns a boolean for conditional rendering.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email === process.env.ADMIN_EMAIL;
}
