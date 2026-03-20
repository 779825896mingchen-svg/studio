import { NextRequest, NextResponse } from "next/server";
import {
  ensureAdminAccount,
  getAccountByIdentifier,
  getResetCodes,
  normalizePhoneDigits,
  saveResetCodes,
  updateAccountPassword,
} from "@/app/lib/auth/local-auth-store";

export async function POST(req: NextRequest) {
  try {
    await ensureAdminAccount();
    const body = (await req.json()) as {
      channel?: "email" | "phone";
      identifier?: string;
      code?: string;
      newPassword?: string;
    };

    const channel = body.channel === "phone" ? "phone" : "email";
    const identifierRaw = (body.identifier ?? "").trim();
    const identifier = channel === "phone" ? normalizePhoneDigits(identifierRaw) : identifierRaw.toLowerCase();
    const code = (body.code ?? "").trim();
    const newPassword = (body.newPassword ?? "").trim();

    if (!identifier || !code || newPassword.length < 6) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const account = await getAccountByIdentifier(identifier);
    if (!account) {
      return NextResponse.json({ error: "Invalid code or account" }, { status: 400 });
    }

    const codes = await getResetCodes();
    const idx = codes.findIndex(
      (c) =>
        c.accountId === account.id &&
        c.channel === channel &&
        c.identifier === identifier &&
        c.code === code &&
        !c.usedAt
    );

    if (idx < 0) {
      return NextResponse.json({ error: "Invalid code or account" }, { status: 400 });
    }

    const record = codes[idx];
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    const ok = await updateAccountPassword(account.id, newPassword);
    if (!ok) {
      return NextResponse.json({ error: "Could not update password" }, { status: 500 });
    }

    codes[idx] = { ...record, usedAt: new Date().toISOString() };
    await saveResetCodes(codes);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not reset password" }, { status: 500 });
  }
}

