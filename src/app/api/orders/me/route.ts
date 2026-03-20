import { NextRequest, NextResponse } from "next/server";
import { getAccountById, getSessions } from "@/app/lib/auth/local-auth-store";
import { getOrdersByEmail } from "@/app/lib/orders/local-orders-store";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_session")?.value;
    if (!token) return NextResponse.json({ orders: [] });

    const sessions = await getSessions();
    const session = sessions.find((s) => s.token === token) ?? null;
    if (!session) return NextResponse.json({ orders: [] });

    const account = await getAccountById(session.accountId);
    if (!account) return NextResponse.json({ orders: [] });

    const orders = await getOrdersByEmail(account.email);
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}

