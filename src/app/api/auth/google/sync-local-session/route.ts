import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import {
  createSessionToken,
  getAccountByEmail,
  getSessions,
  saveSessions,
} from "@/app/lib/auth/local-auth-store";

/**
 * When the user has a valid NextAuth Google session and a matching row in `customers`,
 * issue the same httpOnly `auth_session` cookie used for email/password sign-in.
 */
export async function POST() {
  const nextAuthSession = await getServerSession(authOptions);
  const emailRaw = nextAuthSession?.user?.email?.trim().toLowerCase();
  if (!emailRaw) {
    return NextResponse.json({ error: "No Google session" }, { status: 401 });
  }

  const account = await getAccountByEmail(emailRaw);
  if (!account) {
    return NextResponse.json({ error: "No local account for this Google email" }, { status: 404 });
  }

  const token = createSessionToken();
  const now = Date.now();
  const expiresAt = new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString();

  const sessions = await getSessions();
  sessions.unshift({
    token,
    accountId: account.id,
    createdAt: new Date().toISOString(),
    expiresAt,
  });
  await saveSessions(sessions);

  const res = NextResponse.json({
    ok: true,
    user: {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role ?? "customer",
    },
  });
  res.cookies.set("auth_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
