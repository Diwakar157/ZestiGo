import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * This route was used for Spring Boot OAuth2 redirects.
 * Clerk now handles all OAuth flows internally. Redirect to home.
 */
export const Route = createFileRoute("/oauth2/redirect")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
