import React, { useEffect, useMemo, useRef, useState } from "react";

type OrderItem = {
  quantity: number;
  name: string;
  price: number;
  instructions?: string;
  selectedVariant?: string;
  selectedSpice?: number;
};

type Order = {
  id: string;
  name: string;
  email: string;
  phone: string;
  requests: string;
  scheduledFor?: string | null;
  cart: OrderItem[];
  totalPrice: number;
  tax: number;
  totalWithTax: number;
  createdAt: string;
};

type Settings = {
  /** Website origin only, e.g. http://localhost:9003 */
  siteBaseUrl: string;
  /** Same value as `POS_API_KEY` on the Next.js server */
  posApiKey: string;
};

const SETTINGS_KEY = "emperors-pos-settings-v2";

function coalesceNonEmpty(...vals: Array<string | undefined | null>) {
  for (const v of vals) {
    const t = (v ?? "").trim();
    if (t) return t;
  }
  return "";
}

function envFromElectronFile(): Partial<Settings> {
  const pe = typeof window !== "undefined" ? window.posEnv : undefined;
  if (!pe) return {};
  return {
    siteBaseUrl: coalesceNonEmpty(pe.VITE_POS_SITE_URL),
    posApiKey: coalesceNonEmpty(pe.VITE_POS_API_KEY),
  };
}

function readSettings(): Settings {
  const fromElectron = envFromElectronFile();
  const fromVite = {
    siteBaseUrl: coalesceNonEmpty(import.meta.env.VITE_POS_SITE_URL as string | undefined),
    posApiKey: coalesceNonEmpty(import.meta.env.VITE_POS_API_KEY as string | undefined),
  };

  let fromLs: Partial<Settings> = {};
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) fromLs = JSON.parse(raw) as Partial<Settings>;
  } catch {
    fromLs = {};
  }

  // Priority: Saved UI settings → .env beside exe (preload) → Vite build env
  return {
    siteBaseUrl: coalesceNonEmpty(fromLs.siteBaseUrl, fromElectron.siteBaseUrl, fromVite.siteBaseUrl),
    posApiKey: coalesceNonEmpty(fromLs.posApiKey, fromElectron.posApiKey, fromVite.posApiKey),
  };
}

function writeSettings(next: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

/** GET /api/pos/orders — Electron main uses fetch (no CORS); fallback uses browser fetch (CORS enabled on route). */
async function loadOrderRows(s: Settings): Promise<any[]> {
  if (window.posApi?.getOrders) {
    const res = await window.posApi.getOrders({
      siteBaseUrl: s.siteBaseUrl,
      posApiKey: s.posApiKey,
    });
    if (!res.ok) throw new Error(res.error);
    return res.data;
  }

  const base = s.siteBaseUrl.trim().replace(/\/$/, "");
  const url = `${base}/api/pos/orders?limit=200`;
  const r = await fetch(url, {
    headers: { "x-pos-api-key": s.posApiKey.trim() },
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(
      text ||
        `Orders request failed (${r.status}). Start the Next site and use the same POS_API_KEY as in its .env.`,
    );
  }
  let json: { orders?: unknown };
  try {
    json = JSON.parse(text) as { orders?: unknown };
  } catch {
    throw new Error("Invalid JSON from orders API.");
  }
  if (!Array.isArray(json.orders)) {
    throw new Error("Invalid API response (expected { orders: [...] }).");
  }
  return json.orders as any[];
}

function formatPickupTime(order: Order) {
  if (!order.scheduledFor) return "ASAP";
  const d = new Date(order.scheduledFor);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatPlacedTime(order: Order) {
  const d = new Date(order.createdAt);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDate(order: Order) {
  const d = new Date(order.createdAt);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Button({
  children,
  variant = "solid",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "danger";
}) {
  const base = "rounded-xl px-4 py-2 text-sm font-bold transition";
  const styles =
    variant === "outline"
      ? "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
      : variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-700"
        : "bg-slate-950 text-white hover:bg-slate-800";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "green" | "yellow" | "blue" }) {
  const tones: Record<string, string> = {
    gray: "bg-slate-100 text-slate-700 border-slate-200",
    green: "bg-green-100 text-green-700 border-green-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return <span className={`rounded-full border px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-300 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-600">{title}</h3>
      </div>
      <div className="space-y-3 p-4">{children}</div>
    </div>
  );
}

function Info({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div>
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className={strong ? "text-2xl font-black text-slate-950" : "text-base font-bold text-slate-900"}>{value}</p>
    </div>
  );
}

export default function RestaurantTakeoutOrdersApp() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<Settings>(() => readSettings());

  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  async function fetchOrders(opts?: { silent?: boolean }) {
    const silent = !!opts?.silent;
    if (!silent) setLoading(true);
    setError(null);

    const s = readSettings();
    if (!s.siteBaseUrl || !s.posApiKey) {
      setOrders([]);
      setError(
        'Missing website URL or POS API key. Use the same POS_API_KEY as your Next.js .env (see desktop `.env.example`), or set them in the top‑right Settings.',
      );
      setLoading(false);
      return;
    }

    try {
      const data = await loadOrderRows(s);

      const next = (data || []).map((row: any) => ({
        id: String(row.id || ""),
        name: String(row.name || ""),
        email: String(row.email || ""),
        phone: String(row.phone || ""),
        requests: String(row.requests || ""),
        scheduledFor: row.scheduledFor ?? row.scheduled_for ?? null,
        cart: Array.isArray(row.cart)
          ? row.cart
          : Array.isArray(row.cart_json)
            ? row.cart_json
            : [],
        totalPrice: Number(row.totalPrice ?? row.total_price ?? 0),
        tax: Number(row.tax ?? 0),
        totalWithTax: Number(row.totalWithTax ?? row.total_with_tax ?? 0),
        createdAt: String(row.createdAt ?? row.created_at ?? new Date().toISOString()),
      })) as Order[];

      setOrders(next);
      setSelectedOrderId((prev) => prev || next[0]?.id || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const cfg = readSettings();
    if (!cfg.siteBaseUrl || !cfg.posApiKey) {
      setSettingsOpen(true);
    }
    void fetchOrders();
    pollRef.current = window.setInterval(() => void fetchOrders({ silent: true }), 5000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      return (
        !q ||
        order.id.toLowerCase().includes(q) ||
        (order.name || "").toLowerCase().includes(q) ||
        (order.phone || "").includes(q) ||
        order.cart.some((item) => item.name.toLowerCase().includes(q))
      );
    });
  }, [orders, query]);

  const selectedOrder = useMemo(() => {
    return filteredOrders.find((o) => o.id === selectedOrderId) || filteredOrders[0] || orders[0] || null;
  }, [filteredOrders, orders, selectedOrderId]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl">
        <header className="border-b border-slate-300 bg-slate-950 px-5 py-4 text-white">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight">Takeout Orders</h1>
              <p className="text-sm text-slate-300">Emperor&apos;s Choice • Desktop POS</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="border-slate-200 bg-white text-slate-950 hover:bg-slate-200" onClick={() => void fetchOrders()}>
                Refresh
              </Button>
              <Button className="bg-slate-800 text-white hover:bg-slate-700" onClick={() => setSettingsOpen(true)}>
                Settings
              </Button>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-[330px_1fr]">
          <aside className="border-r border-slate-300 bg-slate-50">
            <div className="border-b border-slate-300 p-4">
              <label className="mb-2 block text-xs font-black uppercase text-slate-500">Find Order</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Order #, name, phone, food..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-700"
              />
            </div>

            <div className="max-h-[720px] overflow-y-auto p-3">
              {loading ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
                  Loading orders…
                </div>
              ) : error ? (
                <div className="rounded-xl border border-red-200 bg-white p-5 text-center text-sm text-red-700">
                  {error}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
                  No matching orders.
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`mb-2 w-full rounded-xl border p-4 text-left ${
                      selectedOrder?.id === order.id
                        ? "border-slate-950 bg-white shadow-md"
                        : "border-slate-300 bg-white hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-black">#{order.id}</p>
                        <p className="text-sm font-bold text-slate-700">{order.name || "Guest"}</p>
                        <p className="text-xs text-slate-500">{order.phone || "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase text-slate-500">Pickup</p>
                        <p className="text-lg font-black">{formatPickupTime(order)}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone="blue">Takeout</Badge>
                      <Badge tone="gray">{order.cart.length} item(s)</Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="p-5">
            {!selectedOrder ? (
              <div className="rounded-2xl border border-slate-300 bg-white p-8 text-center text-slate-600">
                No order selected.
              </div>
            ) : (
              <>
                <div className="mb-5 flex flex-col gap-3 border-b border-slate-300 pb-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase text-slate-500">Order Number</p>
                    <h2 className="text-5xl font-black tracking-tight">#{selectedOrder.id}</h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                      Print Ticket
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <Panel title="Customer">
                    <Info label="Name" value={selectedOrder.name || "Guest"} />
                    <Info label="Phone" value={selectedOrder.phone || "—"} />
                    <Info label="Email" value={selectedOrder.email || "—"} />
                  </Panel>

                  <Panel title="Time">
                    <Info label="Date" value={formatDate(selectedOrder)} />
                    <Info label="Placed" value={formatPlacedTime(selectedOrder)} />
                    <Info label="Pickup" value={formatPickupTime(selectedOrder)} strong />
                  </Panel>

                  <Panel title="Order Type">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="blue">Takeout</Badge>
                      <Badge tone="green">Pay at pickup</Badge>
                    </div>
                  </Panel>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
                  <Panel title="Food Items">
                    <div className="space-y-3">
                      {selectedOrder.cart.map((item, index) => (
                        <div key={`${item.name}-${index}`} className="rounded-xl border border-slate-300 bg-white p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xl font-black text-white">
                              {item.quantity}x
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xl font-black">{item.name}</p>
                              {item.selectedVariant?.trim() ? (
                                <p className="mt-1 text-sm font-semibold text-slate-700">{item.selectedVariant.trim()}</p>
                              ) : null}
                              {item.instructions?.trim() ? (
                                <p className="mt-2 text-sm font-semibold text-slate-700 italic">&ldquo;{item.instructions.trim()}&rdquo;</p>
                              ) : (
                                <p className="mt-2 text-sm text-slate-500">No changes</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900 whitespace-nowrap">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>

                  <Panel title="Instructions">
                    <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
                      <p className="text-sm font-bold leading-6 text-yellow-900">
                        {selectedOrder.requests?.trim() || "No special instructions."}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-300 bg-white p-4">
                      <div className="flex justify-between text-sm text-slate-600">
                        <span className="font-bold">Subtotal</span>
                        <span className="font-black">${Number(selectedOrder.totalPrice || 0).toFixed(2)}</span>
                      </div>
                      <div className="mt-2 flex justify-between text-sm text-slate-600">
                        <span className="font-bold">Tax</span>
                        <span className="font-black">${Number(selectedOrder.tax || 0).toFixed(2)}</span>
                      </div>
                      <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base">
                        <span className="font-black">Total</span>
                        <span className="text-xl font-black">${Number(selectedOrder.totalWithTax || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </Panel>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {settingsOpen ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-2xl border border-slate-300 bg-white shadow-2xl overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-black">Settings</h3>
              <p className="text-sm text-slate-600">
                Or edit <span className="font-mono">.env</span> beside the exe / in this folder and restart—the app reads that too.
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-slate-500">Website URL</label>
                <input
                  value={settingsDraft.siteBaseUrl}
                  onChange={(e) => setSettingsDraft((p) => ({ ...p, siteBaseUrl: e.target.value }))}
                  placeholder="http://localhost:9003"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-700"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-slate-500">POS API key</label>
                <input
                  value={settingsDraft.posApiKey}
                  onChange={(e) => setSettingsDraft((p) => ({ ...p, posApiKey: e.target.value }))}
                  placeholder="Same as POS_API_KEY on the server"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-700"
                />
              </div>
            </div>
            <div className="border-t border-slate-200 px-5 py-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const next = {
                    siteBaseUrl: settingsDraft.siteBaseUrl.trim(),
                    posApiKey: settingsDraft.posApiKey.trim(),
                  };
                  writeSettings(next);
                  setSettingsOpen(false);
                  void fetchOrders();
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
