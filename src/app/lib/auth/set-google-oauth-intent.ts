/** Call immediately before `signIn("google", ...)` so the server can tell registration vs login. */
export async function setGoogleOAuthIntent(intent: "signup" | "signin"): Promise<void> {
  await fetch("/api/auth/oauth-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ intent }),
  });
}

export const OAUTH_GOOGLE_INTENT_COOKIE = "oauth_google_intent";
