import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  ensureAdminAccount,
  getAccountByEmail,
  getAccountByPhone,
  normalizePhoneDigits,
  getSessions,
  saveSessions,
  verifyPassword,
} from "@/app/lib/auth/local-auth-store";

export async function POST(req: NextRequest) {
  try {
    await ensureAdminAccount();
    const body = (await req.json()) as {
      identifier?: string;
      password?: string;
    };

    const identifier = (body.identifier ?? "").trim();
    const normalizedEmail = identifier.toLowerCase();
    const normalizedPhone = normalizePhoneDigits(identifier);
    const password = body.password ?? "";

    const isEmailIdentifier = /\S+@\S+\.\S+/.test(normalizedEmail);
    const isPhoneIdentifier = normalizedPhone.length === 10;
    const isValidPassword = password.trim().length >= 6;

    if ((!isEmailIdentifier && !isPhoneIdentifier) || !isValidPassword) {
      return NextResponse.json({ error: "Invalid phone/email or password" }, { status: 400 });
    }

    const account = isEmailIdentifier
      ? await getAccountByEmail(normalizedEmail)
      : await getAccountByPhone(normalizedPhone);
    if (!account) {
      return NextResponse.json({ error: "Invalid phone/email or password" }, { status: 401 });
    }

    const ok = verifyPassword(password, account.password.salt, account.password.hash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid phone/email or password" }, { status: 401 });
    }

    const token = createSessionToken();
    const now = Date.now();
    const expiresAt = new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days

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
      user: { id: account.id, name: account.name, email: account.email, role: account.role ?? "customer" },
    });
    res.cookies.set("auth_session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (e) {
    return NextResponse.json({ error: "Signin failed" }, { status: 500 });
  }
}

