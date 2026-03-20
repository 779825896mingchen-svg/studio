import { NextRequest, NextResponse } from "next/server";
import { deleteSessionToken } from "@/app/lib/auth/local-auth-store";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  const token = req.cookies.get("auth_session")?.value;

  if (token) {
    await deleteSessionToken(token);
  }

  res.cookies.set("auth_session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}

