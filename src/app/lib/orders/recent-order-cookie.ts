import type { NextResponse } from "next/server";

export const RECENT_ORDER_COOKIE_NAME = "studio_recent_order";

/** ~2 months — enough to revisit status; new checkout overwrites. */
export const RECENT_ORDER_COOKIE_MAX_AGE = 60 * 60 * 24 * 60;

export function attachRecentOrderCookie(res: NextResponse, orderId: string) {
  const id = orderId.trim();
  if (!id) return;
  res.cookies.set(RECENT_ORDER_COOKIE_NAME, id, {
    path: "/",
    maxAge: RECENT_ORDER_COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearRecentOrderCookie(res: NextResponse) {
  res.cookies.set(RECENT_ORDER_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
  });
}
