// Error reporting stub — reports errors to console in production.
// Replace this with a real error reporting service (e.g., Sentry) if needed.

export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[ZestiGo] Unhandled error:", error, context);
}
