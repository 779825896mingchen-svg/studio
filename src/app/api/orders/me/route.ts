import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import {
  deleteSessionToken,
  getAccountById,
  getSessions,
} from "@/app/lib/auth/local-auth-store";
import { getOrdersByEmail, getOrdersForLocalAccount } from "@/app/lib/orders/local-orders-store";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_session")?.value;
    if (token) {
      const sessions = await getSessions();
      const session = sessions.find((s) => s.token === token) ?? null;
      if (session) {
        if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
          await deleteSessionToken(token);
        } else {
          const account = await getAccountById(session.accountId);
          if (account) {
            const orders = await getOrdersForLocalAccount(account.id, account.email);
            return NextResponse.json({ orders });
          }
        }
      }
    }

    const nextAuthSession = await getServerSession(authOptions);
    if (nextAuthSession?.user?.email) {
      const orders = await getOrdersByEmail(nextAuthSession.user.email);
      return NextResponse.json({ orders });
    }

    return NextResponse.json({ orders: [] });
  } catch {
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}
