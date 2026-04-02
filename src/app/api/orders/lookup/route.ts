import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/app/lib/orders/local-orders-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId") ?? "";
    if (!orderId.trim()) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ order: null }, { status: 404 });
    }

    // Public lookup: return only what the user needs to track + view receipt.
    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        scheduledFor: order.scheduledFor ?? null,
        cart: order.cart,
        totalPrice: order.totalPrice,
        tax: order.tax,
        totalWithTax: order.totalWithTax,
      },
    });
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}

