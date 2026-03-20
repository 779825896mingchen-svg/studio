import { NextRequest, NextResponse } from "next/server";
import { saveOrder } from "@/app/lib/orders/local-orders-store";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

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

function buildOrderItemsText(cart: OrderItem[]): string {
  return cart
    .map((item, i) => {
      const lineTotal = (item.price * item.quantity).toFixed(2);
      const lines = [
        `**${i + 1}. ${item.name}** — $${lineTotal}`,
        `   ×${item.quantity} @ $${item.price.toFixed(2)} each`,
      ];
      if (item.selectedVariant?.trim()) {
        lines.push(`   ✓ Choice: ${item.selectedVariant}`);
      }
      if (item.instructions?.trim()) {
        lines.push(`   _"${item.instructions}"_`);
      }
      return lines.join("\n");
    })
    .join("\n\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderPayload;
    const { name, email, phone, requests, scheduledFor, cart, totalPrice, tax, totalWithTax } = body;

    // Persist order locally so the user can view order history without any external database.
    const orderId = `ORD-${Date.now()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
    await saveOrder({
      id: orderId,
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
      createdAt: new Date().toISOString(),
    });

    const orderItemsText = buildOrderItemsText(cart);
    const formattedPhone =
      phone.length >= 10
        ? `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`
        : phone;

    const scheduledLabel = scheduledFor
      ? `**Scheduled pickup:** ${new Date(scheduledFor).toLocaleString(undefined, {
          timeZone: "America/New_York",
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        })}`
      : "**Pick up:** ASAP";

    const payload = {
      embeds: [
        {
          title: "👑 New Royal Order",
          description: scheduledFor
            ? "A scheduled order has been placed from the Emperor's Choice checkout."
            : "A new order has been placed from the Emperor's Choice checkout.",
          color: 0xd4af37, // gold
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "📋 Guest Details",
              value: [
                `**Name:** ${name || "_not provided_"}`,
                `**Email:** ${email}`,
                `**Phone:** ${formattedPhone}`,
                scheduledLabel,
                requests?.trim()
                  ? `**Special requests:**\n${requests.trim()}`
                  : "**Special requests:** _none_",
              ]
                .filter(Boolean)
                .join("\n"),
              inline: false,
            },
            {
              name: "🛒 Order Items",
              value: orderItemsText.slice(0, 1024) + (orderItemsText.length > 1024 ? "\n\n_…more items_" : ""),
              inline: false,
            },
            {
              name: "💰 Total",
              value: [
                `Subtotal: **$${totalPrice.toFixed(2)}**`,
                `Estimated tax: **$${tax.toFixed(2)}**`,
                `**Total due: $${totalWithTax.toFixed(2)}**`,
              ].join("\n"),
              inline: false,
            },
          ],
          footer: {
            text: "Emperor's Choice · Royal Checkout",
          },
        },
      ],
    };

    if (DISCORD_WEBHOOK_URL) {
      try {
        const res = await fetch(DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error("Discord webhook error:", res.status, errText);
          // Still return ok because we successfully saved the order locally.
        }
      } catch (discordError) {
        console.error("Discord webhook request failed:", discordError);
        // Non-blocking by design: order placement should succeed even if Discord is down.
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Order API error:", e);
    return NextResponse.json(
      { error: "Failed to process order" },
      { status: 500 }
    );
  }
}
