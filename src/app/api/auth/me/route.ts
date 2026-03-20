import { NextRequest, NextResponse } from "next/server";
import { deleteSessionToken, ensureAdminAccount, getAccountById, getSessions } from "@/app/lib/auth/local-auth-store";

export async function GET(req: NextRequest) {
  await ensureAdminAccount();
  const token = req.cookies.get("auth_session")?.value;
  if (!token) return NextResponse.json({ user: null });

  const sessions = await getSessions();
  const session = sessions.find((s) => s.token === token) ?? null;
  if (!session) return NextResponse.json({ user: null });

  // Expired session -> delete it
  if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
    await deleteSessionToken(token);
    return NextResponse.json({ user: null });
  }

  const account = await getAccountById(session.accountId);
  if (!account) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      id: account.id,
      name: account.name,
      email: account.email,
      phone: account.phone || "",
      role: account.role ?? "customer",
    },
  });
}

