import fs from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdminClient } from "@/app/lib/db/supabase-admin";
import { notifyDiscordDbEventFireAndForget } from "@/app/lib/notify/discord-db-log";

type CartItem = {
  name: string;
  quantity: number;
  price: number;
  instructions?: string;
  selectedSpice?: number;
  selectedVariant?: string;
};

export type LocalOrder = {
  id: string;
  /** Set when the user was signed in with local auth at checkout; used for reliable history matching. */
  accountId?: string;
  name: string;
  email: string;
  phone: string;
  requests: string;
  scheduledFor?: string | null;
  cart: CartItem[];
  totalPrice: number;
  tax: number;
  totalWithTax: number;
  status: "Received" | "Preparing" | "Ready for Pickup" | "Picked Up";
  createdAt: string;
};

export type LocalOrderStatus = LocalOrder["status"];

type DbOrderRow = {
  id: string;
  account_id: string | null;
  name: string;
  email: string;
  phone: string;
  requests: string;
  scheduled_for: string | null;
  cart_json: CartItem[];
  total_price: number;
  tax: number;
  total_with_tax: number;
  status: LocalOrderStatus;
  created_at: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readOrders(): Promise<LocalOrder[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalOrder[]) : [];
  } catch {
    return [];
  }
}

async function writeOrders(orders: LocalOrder[]) {
  await ensureDataDir();
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

function mapDbRowToLocalOrder(row: DbOrderRow): LocalOrder {
  return {
    id: row.id,
    ...(row.account_id ? { accountId: row.account_id } : {}),
    name: row.name,
    email: row.email,
    phone: row.phone,
    requests: row.requests,
    scheduledFor: row.scheduled_for ?? null,
    cart: Array.isArray(row.cart_json) ? row.cart_json : [],
    totalPrice: Number(row.total_price || 0),
    tax: Number(row.tax || 0),
    totalWithTax: Number(row.total_with_tax || 0),
    status: row.status,
    createdAt: row.created_at,
  };
}

async function pruneOldSupabaseOrders() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;
  const cutoff = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("orders").delete().lt("created_at", cutoff);
}

export async function saveOrder(order: LocalOrder) {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    await pruneOldSupabaseOrders();
    const row = {
      id: order.id,
      account_id: order.accountId || null,
      name: order.name || "Guest",
      email: order.email || "unknown",
      phone: order.phone || "",
      requests: order.requests || "",
      scheduled_for: order.scheduledFor ?? null,
      cart_json: order.cart || [],
      total_price: order.totalPrice,
      tax: order.tax,
      total_with_tax: order.totalWithTax,
      status: order.status,
      created_at: order.createdAt,
    };
    const { error } = await supabase.from("orders").upsert(row, { onConflict: "id" });
    if (error) throw error;
    notifyDiscordDbEventFireAndForget({
      title: "Database: order saved",
      description: "Row upserted in Supabase `orders`.",
      fields: [
        { name: "Order ID", value: order.id, inline: true },
        { name: "Total (incl. tax)", value: `$${Number(order.totalWithTax).toFixed(2)}`, inline: true },
        { name: "Email", value: order.email || "—", inline: true },
        { name: "Name", value: order.name || "—", inline: true },
      ],
    });
    return;
  }

  const orders = await readOrders();
  const exists = orders.some((o) => o.id === order.id);
  const next = exists ? orders.map((o) => (o.id === order.id ? order : o)) : [order, ...orders];
  await writeOrders(next);
}

export async function getOrdersByEmail(email: string) {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    await pruneOldSupabaseOrders();
    const normalized = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from("orders")
      .select("id,account_id,name,email,phone,requests,scheduled_for,cart_json,total_price,tax,total_with_tax,status,created_at")
      .eq("email", normalized)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => mapDbRowToLocalOrder(row as DbOrderRow));
  }

  const orders = await readOrders();
  const normalized = email.trim().toLowerCase();
  return orders.filter((o) => o.email.trim().toLowerCase() === normalized);
}

/** Orders for a local account: match by accountId when present, otherwise fall back to email (legacy rows). */
export async function getOrdersForLocalAccount(accountId: string, email: string) {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    await pruneOldSupabaseOrders();
    const normalized = email.trim().toLowerCase();
    const { data: byAccount, error: accountErr } = await supabase
      .from("orders")
      .select("id,account_id,name,email,phone,requests,scheduled_for,cart_json,total_price,tax,total_with_tax,status,created_at")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false });
    if (accountErr) throw accountErr;

    const { data: byEmailLegacy, error: emailErr } = await supabase
      .from("orders")
      .select("id,account_id,name,email,phone,requests,scheduled_for,cart_json,total_price,tax,total_with_tax,status,created_at")
      .is("account_id", null)
      .eq("email", normalized)
      .order("created_at", { ascending: false });
    if (emailErr) throw emailErr;

    const seen = new Set<string>();
    const merged = [...(byAccount || []), ...(byEmailLegacy || [])].filter((row) => {
      const id = (row as { id: string }).id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    return merged.map((row) => mapDbRowToLocalOrder(row as DbOrderRow));
  }

  const orders = await readOrders();
  const normalized = email.trim().toLowerCase();
  return orders.filter((o) => {
    if (o.accountId) return o.accountId === accountId;
    return o.email.trim().toLowerCase() === normalized;
  });
}

export async function getOrderById(orderId: string) {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    await pruneOldSupabaseOrders();
    const normalized = orderId.trim();
    if (!normalized) return null;
    const { data, error } = await supabase
      .from("orders")
      .select("id,account_id,name,email,phone,requests,scheduled_for,cart_json,total_price,tax,total_with_tax,status,created_at")
      .eq("id", normalized)
      .maybeSingle();
    if (error) throw error;
    return data ? mapDbRowToLocalOrder(data as DbOrderRow) : null;
  }

  const orders = await readOrders();
  const normalized = orderId.trim().toLowerCase();
  if (!normalized) return null;
  return orders.find((o) => o.id.trim().toLowerCase() === normalized) ?? null;
}

export async function listRecentOrders(limit = 200) {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    await pruneOldSupabaseOrders();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id,account_id,name,email,phone,requests,scheduled_for,cart_json,total_price,tax,total_with_tax,status,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map((row) => mapDbRowToLocalOrder(row as DbOrderRow));
  }

  const orders = await readOrders();
  return orders
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

