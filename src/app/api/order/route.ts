import { NextRequest, NextResponse } from "next/server";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  instructions?: string;
  selectedSpice?: number;
};

type OrderPayload = {
  name: string;
  email: string;
  phone: string;
  requests: string;
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
      if (item.selectedSpice !== undefined) {
        lines.push(`   🌶️ Spice level ${item.selectedSpice}`);
      }
      if (item.instructions?.trim()) {
        lines.push(`   _"${item.instructions}"_`);
      }
      return lines.join("\n");
    })
    .join("\n\n");
}

export async function POST(request: NextRequest) {
  if (!DISCORD_WEBHOOK_URL) {
    console.error("DISCORD_WEBHOOK_URL is not set. Add it to .env.local (see .env.example).");
    return NextResponse.json(
      { error: "Order notifications are not configured" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as OrderPayload;
    const { name, email, phone, requests, cart, totalPrice, tax, totalWithTax } = body;

    const orderItemsText = buildOrderItemsText(cart);
    const formattedPhone =
      phone.length >= 10
        ? `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`
        : phone;

    const payload = {
      embeds: [
        {
          title: "👑 New Royal Order",
          description: "A new order has been placed from the Emperor's Choice checkout.",
          color: 0xd4af37, // gold
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "📋 Guest Details",
              value: [
                `**Name:** ${name || "_not provided_"}`,
                `**Email:** ${email}`,
                `**Phone:** ${formattedPhone}`,
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

    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Discord webhook error:", res.status, errText);
      return NextResponse.json(
        { error: "Failed to send order to Discord", details: errText },
        { status: 502 }
      );
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
