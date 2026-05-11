import { NextRequest, NextResponse } from "next/server";
import { OAUTH_GOOGLE_INTENT_COOKIE } from "@/app/lib/auth/set-google-oauth-intent";

export async function POST(req: NextRequest) {
  let intent: unknown;
  try {
    const body = (await req.json()) as { intent?: unknown };
    intent = body?.intent;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (intent !== "signup" && intent !== "signin") {
    return NextResponse.json({ error: "Invalid intent" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(OAUTH_GOOGLE_INTENT_COOKIE, intent, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
