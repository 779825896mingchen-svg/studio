import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  createResetCode,
  ensureAdminAccount,
  getAccountByIdentifier,
  getResetCodes,
  normalizePhoneDigits,
  saveResetCodes,
  storeResetDelivery,
} from "@/app/lib/auth/local-auth-store";

export async function POST(req: NextRequest) {
  try {
    await ensureAdminAccount();
    const body = (await req.json()) as {
      channel?: "email" | "phone";
      identifier?: string;
    };

    const channel = body.channel === "phone" ? "phone" : "email";
    const identifierRaw = (body.identifier ?? "").trim();
    const identifier = channel === "phone" ? normalizePhoneDigits(identifierRaw) : identifierRaw.toLowerCase();

    if (!identifier) {
      return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
    }

    const account = await getAccountByIdentifier(identifier);
    // Do not leak existence of account. Always respond success.
    if (!account) {
      return NextResponse.json({ ok: true, delivered: false });
    }

    const code = createResetCode();
    const ttlMinutesRaw = Number(process.env.RESET_CODE_TTL_MINUTES || "10");
    const ttlMinutes = Number.isFinite(ttlMinutesRaw) && ttlMinutesRaw > 0 ? ttlMinutesRaw : 10;
    const now = Date.now();
    const expiresAt = new Date(now + ttlMinutes * 60 * 1000).toISOString();

    const codes = await getResetCodes();
    codes.unshift({
      id: crypto.randomUUID(),
      accountId: account.id,
      identifier,
      channel,
      code,
      createdAt: new Date().toISOString(),
      expiresAt,
    });
    await saveResetCodes(codes);

    await storeResetDelivery({
      channel,
      destination: channel === "phone" ? account.phone : account.email,
      code,
      accountName: account.name,
    });

    return NextResponse.json({ ok: true, delivered: true });
  } catch {
    return NextResponse.json({ error: "Could not request reset code" }, { status: 500 });
  }
}

