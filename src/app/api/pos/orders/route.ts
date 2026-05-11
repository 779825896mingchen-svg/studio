import { NextRequest, NextResponse } from "next/server";
import { listRecentOrders } from "@/app/lib/orders/local-orders-store";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-pos-api-key, Authorization",
};

function withCors(res: NextResponse) {
  for (const [k, v] of Object.entries(corsHeaders)) res.headers.set(k, v);
  return res;
}

function readHeader(req: NextRequest, name: string) {
  return (req.headers.get(name) || "").trim();
}

/** Preflight for Electron/Vite or other cross-origin POS clients. */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  const expected = (process.env.POS_API_KEY || "").trim();
  if (!expected) {
    return withCors(NextResponse.json({ error: "POS API not configured" }, { status: 503 }));
  }

  const got = readHeader(req, "x-pos-api-key");
  if (!got || got !== expected) {
    return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const { searchParams } = new URL(req.url);
  const limitRaw = searchParams.get("limit") || "";
  const limit = Math.max(1, Math.min(500, Number.parseInt(limitRaw || "200", 10) || 200));

  const orders = await listRecentOrders(limit);
  return withCors(NextResponse.json({ orders }));
}

