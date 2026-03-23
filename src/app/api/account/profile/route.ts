import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import {
  deleteSessionToken,
  ensureAdminAccount,
  getAccountById,
  getSessions,
  updateAccountProfile,
} from "@/app/lib/auth/local-auth-store";

type LocalCtx = { kind: "local"; accountId: string };

async function getLocalCtx(req: NextRequest): Promise<LocalCtx | null> {
  await ensureAdminAccount();
  const token = req.cookies.get("auth_session")?.value;
  if (!token) return null;
  const sessions = await getSessions();
  const session = sessions.find((s) => s.token === token) ?? null;
  if (!session) return null;
  if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
    await deleteSessionToken(token);
    return null;
  }
  const account = await getAccountById(session.accountId);
  if (!account) return null;
  return { kind: "local", accountId: account.id };
}

/** Update name + phone for email/password (local) accounts only. */
export async function PATCH(req: NextRequest) {
  const ctx = await getLocalCtx(req);
  if (!ctx) {
    const nextAuthSession = await getServerSession(authOptions);
    if (nextAuthSession?.user?.email) {
      return NextResponse.json(
        {
          error: "google_account",
          message: "Name and email are managed by Google. Phone can be updated at checkout.",
        },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { firstName?: string; lastName?: string; phone?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const first = (body.firstName ?? "").trim();
  const last = (body.lastName ?? "").trim();
  const name = [first, last].filter(Boolean).join(" ").trim();
  const phone = (body.phone ?? "").trim();

  const account = await getAccountById(ctx.accountId);
  if (!account) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const ok = await updateAccountProfile(ctx.accountId, {
    name: name || account.name,
    phone,
  });
  if (!ok) return NextResponse.json({ error: "update_failed" }, { status: 500 });

  const updated = await getAccountById(ctx.accountId);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 500 });

  return NextResponse.json({
    ok: true,
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone || "",
      role: updated.role ?? "customer",
      image: null as string | null,
      provider: "local" as const,
    },
  });
}
