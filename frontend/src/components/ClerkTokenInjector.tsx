import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/tanstack-react-start";
import { setClerkTokenGetter } from "@/services/apiClient";
import { apiClient } from "@/services/apiClient";

/**
 * Mounted inside ClerkProvider. Injects Clerk's getToken into the Axios client
 * so all API requests carry a valid JWT. Also upserts the user record in the
 * Zestigo backend whenever a Clerk user is signed in.
 */
export function ClerkTokenInjector() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  // Wire Clerk token getter into Axios immediately.
  useEffect(() => {
    setClerkTokenGetter(() => getToken());
  }, [getToken]);

  // On sign-in: upsert user record in Spring Boot backend.
  useEffect(() => {
    if (!isSignedIn || !user) return;

    const payload = {
      clerkId: user.id,
      name: user.fullName ?? user.firstName ?? "",
      email: user.primaryEmailAddress?.emailAddress ?? "",
      phone: user.primaryPhoneNumber?.phoneNumber ?? "",
      avatar: user.imageUrl ?? "",
    };

    apiClient.post("/api/users/clerk-sync", payload).catch(() => {
      // Best-effort — backend may not have this endpoint yet
    });
  }, [isSignedIn, user]);

  return null;
}
