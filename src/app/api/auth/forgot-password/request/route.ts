import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { Resend } from "resend";
import {
  createResetCode,
  ensureAdminAccount,
  getAccountByEmail,
  getResetCodes,
  saveResetCodes,
  storeResetDelivery,
} from "@/app/lib/auth/local-auth-store";

export async function POST(req: NextRequest) {
  try {
    await ensureAdminAccount();
    const body = (await req.json()) as { email?: string };

    const email = (body.email ?? "").trim().toLowerCase();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const account = await getAccountByEmail(email);
    if (!account) {
      // Same shape as success to avoid email enumeration
      return NextResponse.json({ ok: true });
    }

    const code = createResetCode();
    const ttlMinutesRaw = Number(process.env.RESET_CODE_TTL_MINUTES || "10");
    const ttlMinutes = Number.isFinite(ttlMinutesRaw) && ttlMinutesRaw > 0 ? ttlMinutesRaw : 10;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

    const codes = await getResetCodes();
    codes.unshift({
      id: crypto.randomUUID(),
      accountId: account.id,
      identifier: email,
      channel: "email",
      code,
      createdAt: new Date().toISOString(),
      expiresAt,
    });
    await saveResetCodes(codes);

    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;

    let sentViaResend = false;
    if (resendApiKey && emailFrom) {
      try {
        const resend = new Resend(resendApiKey);
        const { error } = await resend.emails.send({
          from: emailFrom,
          to: account.email,
          subject: "Reset your Emperor's Choice password",
          html: `<!doctype html>
<html>
  <body style="font-family: Inter, Arial, sans-serif; background:#f6f6f7; padding:24px;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #ececf0;">
      <div style="background:#f97316; color:#fff; padding:20px 24px; font-weight:700; font-size:20px;">Emperor's Choice</div>
      <div style="padding:24px;">
        <p style="margin:0 0 12px 0; color:#111827;">Hi ${account.name || "there"},</p>
        <p style="margin:0 0 16px 0; color:#374151;">Use this verification code to reset your password:</p>
        <div style="font-size:32px; font-weight:800; letter-spacing:6px; color:#f97316; margin:8px 0 16px 0;">${code}</div>
        <p style="margin:0; color:#6b7280;">This code expires in ${ttlMinutes} minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    </div>
  </body>
</html>`,
        });
        if (error) {
          console.error("Resend error:", error);
        } else {
          sentViaResend = true;
        }
      } catch (e) {
        console.error("Resend send failed:", e);
      }
    }

    if (!sentViaResend) {
      await storeResetDelivery({
        channel: "email",
        destination: account.email,
        code,
        accountName: account.name,
        ttlMinutes,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not request reset code" }, { status: 500 });
  }
}
