"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

/**
 * After Google OAuth, NextAuth has a session but checkout/order history use `auth_session`.
 * If /api/auth/me still reports provider "google", create a local session for the matching customer row.
 */
export function GoogleLocalSessionBridge() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const ranRef = useRef(false);

  useEffect(() => {
    // User may still have a NextAuth session while completing /signup; syncing 404s forever → refresh loop.
    if (pathname.startsWith("/signup")) {
      ranRef.current = false;
      return;
    }

    const user = session?.user;
    const googleEmail = user?.email?.trim();
    if (status !== "authenticated" || !user || !googleEmail) {
      ranRef.current = false;
      return;
    }
    if (ranRef.current) return;

    let cancelled = false;

    (async () => {
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      const me = (await meRes.json()) as {
        user?: { provider?: string; email?: string; name?: string | null } | null;
      };
      if (cancelled) return;
      if (me.user?.provider !== "google") return;

      ranRef.current = true;
      const syncRes = await fetch("/api/auth/google/sync-local-session", {
        method: "POST",
        credentials: "include",
      });

      if (syncRes.ok) {
        window.location.reload();
        return;
      }

      ranRef.current = false;
      if (syncRes.status === 404) {
        const e = encodeURIComponent(googleEmail.toLowerCase());
        const n = encodeURIComponent((user.name || "").trim());
        await signOut({ redirect: false });
        window.location.replace(`/signup?google=1&email=${e}&name=${n}`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, status, session?.user]);

  return null;
}
