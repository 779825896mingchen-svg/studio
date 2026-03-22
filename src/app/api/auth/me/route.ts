import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { deleteSessionToken, ensureAdminAccount, getAccountById, getSessions } from "@/app/lib/auth/local-auth-store";

export async function GET(req: NextRequest) {
  await ensureAdminAccount();
  const token = req.cookies.get("auth_session")?.value;

  if (token) {
    const sessions = await getSessions();
    const session = sessions.find((s) => s.token === token) ?? null;
    if (session) {
      if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
        await deleteSessionToken(token);
      } else {
        const account = await getAccountById(session.accountId);
        if (account) {
          return NextResponse.json({
            user: {
              id: account.id,
              name: account.name,
              email: account.email,
              phone: account.phone || "",
              role: account.role ?? "customer",
              image: null as string | null,
              provider: "local" as const,
            },
          });
        }
      }
    }
  }

  // Google / NextAuth session (no local cookie)
  const nextAuthSession = await getServerSession(authOptions);
  if (nextAuthSession?.user?.email) {
    return NextResponse.json({
      user: {
        id: `google:${nextAuthSession.user.email}`,
        name: nextAuthSession.user.name || "Google User",
        email: nextAuthSession.user.email,
        phone: "",
        role: "customer" as const,
        image: nextAuthSession.user.image ?? null,
        provider: "google" as const,
      },
    });
  }

  return NextResponse.json({ user: null });
}
