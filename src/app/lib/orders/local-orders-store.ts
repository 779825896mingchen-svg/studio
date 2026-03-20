import fs from "node:fs/promises";
import path from "node:path";

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

export async function saveOrder(order: LocalOrder) {
  const orders = await readOrders();
  const exists = orders.some((o) => o.id === order.id);
  const next = exists ? orders.map((o) => (o.id === order.id ? order : o)) : [order, ...orders];
  await writeOrders(next);
}

export async function getOrdersByEmail(email: string) {
  const orders = await readOrders();
  const normalized = email.trim().toLowerCase();
  return orders.filter((o) => o.email.trim().toLowerCase() === normalized);
}

