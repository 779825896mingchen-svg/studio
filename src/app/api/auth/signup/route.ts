import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createPasswordHash, ensureAdminAccount, getAccountByEmail, getAccountByPhone, normalizePhoneDigits, upsertAccount } from "@/app/lib/auth/local-auth-store";

export async function POST(req: NextRequest) {
  try {
    await ensureAdminAccount();
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
    };

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const phone = normalizePhoneDigits(body.phone ?? "");
    const password = body.password ?? "";

    const isValidEmail = /\S+@\S+\.\S+/.test(email);
    const isValidPhone = phone.length === 10;
    const isValidPassword = password.trim().length >= 6;
    const isValidName = name.length >= 2;

    if (!isValidEmail || !isValidPhone || !isValidPassword || !isValidName) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const existing = await getAccountByEmail(email);
    const existingByPhone = await getAccountByPhone(phone);
    if (existing || existingByPhone) {
      return NextResponse.json({ error: "Account already exists" }, { status: 409 });
    }

    const passwordHash = createPasswordHash(password);
    const account = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      role: "customer" as const,
      password: passwordHash,
      createdAt: new Date().toISOString(),
    };

    await upsertAccount(account);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}

