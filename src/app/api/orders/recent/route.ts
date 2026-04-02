import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/app/lib/orders/local-orders-store";
import {
  attachRecentOrderCookie,
  clearRecentOrderCookie,
  RECENT_ORDER_COOKIE_NAME,
} from "@/app/lib/orders/recent-order-cookie";

function publicOrder(order: NonNullable<Awaited<ReturnType<typeof getOrderById>>>) {
  return {
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    scheduledFor: order.scheduledFor ?? null,
    cart: order.cart,
    totalPrice: order.totalPrice,
    tax: order.tax,
    totalWithTax: order.totalWithTax,
  };
}

export async function GET(req: NextRequest) {
  try {
    const claim = req.nextUrl.searchParams.get("claim")?.trim() ?? "";

    if (claim) {
      const order = await getOrderById(claim);
      if (!order) {
        return NextResponse.json({ error: "Order not found", order: null }, { status: 404 });
      }
      const res = NextResponse.json({ order: publicOrder(order) });
      attachRecentOrderCookie(res, order.id);
      return res;
    }

    const fromCookie = req.cookies.get(RECENT_ORDER_COOKIE_NAME)?.value?.trim() ?? "";
    if (!fromCookie) {
      return NextResponse.json({ order: null });
    }

    const order = await getOrderById(fromCookie);
    if (!order) {
      const res = NextResponse.json({ order: null });
      clearRecentOrderCookie(res);
      return res;
    }

    return NextResponse.json({ order: publicOrder(order) });
  } catch {
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}
