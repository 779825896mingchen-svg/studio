import { NextRequest, NextResponse } from "next/server";
import { getSessions } from "@/app/lib/auth/local-auth-store";
import { createOrderId } from "@/app/lib/orders/create-order-id";
import { saveOrder } from "@/app/lib/orders/local-orders-store";
import { attachRecentOrderCookie } from "@/app/lib/orders/recent-order-cookie";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  instructions?: string;
  selectedSpice?: number;
  selectedVariant?: string;
};

type OrderPayload = {
  name: string;
  email: string;
  phone: string;
  requests: string;
  scheduledFor?: string | null;
  cart: OrderItem[];
  totalPrice: number;
  tax: number;
  totalWithTax: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderPayload;
    const { name, email, phone, requests, scheduledFor, cart, totalPrice, tax, totalWithTax } = body;

    let localAccountId: string | undefined;
    const authToken = request.cookies.get("auth_session")?.value;
    if (authToken) {
      const sessions = await getSessions();
      const session = sessions.find((s) => s.token === authToken) ?? null;
      if (
        session &&
        (!session.expiresAt || new Date(session.expiresAt).getTime() >= Date.now())
      ) {
        localAccountId = session.accountId;
      }
    }

    // Persist order (Supabase when configured, else local JSON).
    const orderId = createOrderId();
    const createdAt = new Date().toISOString();
    await saveOrder({
      id: orderId,
      ...(localAccountId ? { accountId: localAccountId } : {}),
      name: name || "Guest",
      email: email || "unknown",
      phone: phone || "",
      requests: requests || "",
      scheduledFor: scheduledFor ?? null,
      cart: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        instructions: item.instructions,
        // checkout currently sends selectedSpice/selectedVariant, but this API payload already includes `selectedSpice` and `selectedVariant`
        selectedSpice: item.selectedSpice,
        selectedVariant: item.selectedVariant,
      })),
      totalPrice,
      tax,
      totalWithTax,
      status: "Received",
      createdAt,
    });

    const res = NextResponse.json({ ok: true, orderId, status: "Received", createdAt });
    attachRecentOrderCookie(res, orderId);
    return res;
  } catch (e) {
    console.error("Order API error:", e);
    return NextResponse.json(
      { error: "Failed to process order" },
      { status: 500 }
    );
  }
}
