"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { menuItems } from "@/app/lib/menu-data";
import type { MenuItem } from "@/app/lib/menu-data";
import { loadPersistedMenuItems } from "@/app/lib/menu-persistence";
import {
  findBestMenuItem,
  syntheticMenuItem,
  type OrderLine,
} from "@/app/lib/orders/reorder-from-history";
import { RotateCcw, Receipt, ShoppingBag } from "lucide-react";

type StoredOrder = {
  id: string;
  name: string;
  email: string;
  phone: string;
  requests?: string;
  cart: OrderLine[];
  totalPrice?: number;
  tax?: number;
  totalWithTax?: number;
  createdAt?: string;
  status?: string;
};

function toUsd(amount: number) {
  return `$${amount.toFixed(2)}`;
}

function buildMenuCatalog(persisted: MenuItem[] | null): MenuItem[] {
  const base = [...menuItems];
  if (!persisted?.length) return base;
  const ids = new Set(base.map((m) => m.id));
  for (const p of persisted) {
    if (!ids.has(p.id)) {
      base.push(p);
      ids.add(p.id);
    }
  }
  return base;
}

export default function AccountOrdersPage() {
  const { toast } = useToast();
  const { addToCart, setIsCartOpen } = useCart();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [persistedMenu, setPersistedMenu] = useState<MenuItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Received" | "Preparing" | "Ready for Pickup" | "Picked Up"
  >("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  useEffect(() => {
    setPersistedMenu(loadPersistedMenuItems());
  }, []);

  const menuCatalog = useMemo(() => buildMenuCatalog(persistedMenu), [persistedMenu]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/orders/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      })
      .catch(() => {
        if (!mounted) return;
        toast({
          variant: "destructive",
          title: "Could not load order history",
        });
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [toast]);

  const formatEST = (value?: string) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });
  };

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromMs = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
    const toMs = toDate ? new Date(`${toDate}T23:59:59`).getTime() : null;

    const matchesQuery = (o: StoredOrder) => {
      if (!q) return true;
      if (o.id?.toLowerCase().includes(q)) return true;
      if (o.status?.toLowerCase().includes(q)) return true;
      for (const line of o.cart ?? []) {
        if (line.name?.toLowerCase().includes(q)) return true;
        if (line.selectedVariant?.toLowerCase().includes(q)) return true;
        if (line.instructions?.toLowerCase().includes(q)) return true;
      }
      return false;
    };

    const matchesStatus = (o: StoredOrder) => {
      if (statusFilter === "all") return true;
      return (o.status ?? "Received") === statusFilter;
    };

    const matchesDate = (o: StoredOrder) => {
      if (!fromMs && !toMs) return true;
      const createdMs = o.createdAt ? new Date(o.createdAt).getTime() : NaN;
      if (Number.isNaN(createdMs)) return true;
      if (fromMs !== null && createdMs < fromMs) return false;
      if (toMs !== null && createdMs > toMs) return false;
      return true;
    };

    const base = [...orders].filter((o) => matchesQuery(o) && matchesStatus(o) && matchesDate(o));

    const byCreated = (a: StoredOrder, b: StoredOrder) => {
      const am = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bm = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bm - am;
    };

    const byTotal = (a: StoredOrder, b: StoredOrder) => {
      const at = a.totalWithTax ?? a.totalPrice ?? 0;
      const bt = b.totalWithTax ?? b.totalPrice ?? 0;
      return bt - at;
    };

    if (sortBy === "newest") return base.sort(byCreated);
    if (sortBy === "oldest") return base.sort((a, b) => -byCreated(a, b));
    if (sortBy === "highest") return base.sort(byTotal);
    return base.sort((a, b) => -byTotal(a, b));
  }, [fromDate, orders, query, sortBy, statusFilter, toDate]);

  const statusStyles = useMemo(() => {
    return {
      Received: "bg-amber-100 text-amber-700 ring-amber-200",
      Preparing: "bg-sky-100 text-sky-700 ring-sky-200",
      "Ready for Pickup": "bg-emerald-100 text-emerald-700 ring-emerald-200",
      "Picked Up": "bg-neutral-100 text-neutral-700 ring-neutral-200",
    } as const;
  }, []);

  const quickStats = useMemo(() => {
    const all = orders ?? [];
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    let monthTotal = 0;
    for (const o of all) {
      if (!o.createdAt) continue;
      const d = new Date(o.createdAt);
      if (Number.isNaN(d.getTime())) continue;
      if (d.getMonth() !== month || d.getFullYear() !== year) continue;
      monthTotal += o.totalWithTax ?? o.totalPrice ?? 0;
    }
    const newest = [...all].sort((a, b) => {
      const am = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bm = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bm - am;
    })[0];
    return {
      totalOrders: all.length,
      monthTotal,
      newest,
    };
  }, [orders]);

  const handleReorder = useCallback(
    (order: StoredOrder) => {
      if (!order.cart?.length) {
        toast({
          variant: "destructive",
          title: "Nothing to reorder",
          description: "This order has no line items.",
        });
        return;
      }

      for (let i = 0; i < order.cart.length; i++) {
        const line = order.cart[i];
        const found = findBestMenuItem(line, menuCatalog);
        const item: MenuItem = found
          ? { ...found, price: line.price }
          : syntheticMenuItem(line, `${order.id}-${i}`);
        addToCart(
          item,
          line.quantity,
          line.instructions?.trim() || undefined,
          line.selectedSpice,
          line.selectedVariant?.trim() || undefined,
        );
      }

      const count = order.cart.reduce((s, l) => s + l.quantity, 0);
      toast({
        title: "Basket updated",
        description:
          count === 1
            ? "1 item from this order was added. Review checkout when you're ready."
            : `${count} items from this order were added. Review checkout when you're ready.`,
      });
      setIsCartOpen(true);
    },
    [addToCart, menuCatalog, setIsCartOpen, toast],
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl shadow-sm">
              🍜
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Emperor&apos;s Choice
              </p>
              <h1 className="text-lg font-bold tracking-tight">Order History</h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/info">Support</Link>
            </Button>
            <Button className="rounded-xl bg-neutral-900 text-white hover:bg-neutral-900/90" asChild>
              <Link href="/menu">Start New Order</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
              Filters
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Find past orders fast instead of digging through clutter.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700">Search</label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-2xl border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus-visible:ring-0 focus:border-orange-300 focus:bg-white"
                placeholder="Order ID, item, note..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700">Status</label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="h-11 rounded-2xl border-neutral-200 bg-neutral-50 px-4 text-sm">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Preparing">Preparing</SelectItem>
                  <SelectItem value="Ready for Pickup">Ready for Pickup</SelectItem>
                  <SelectItem value="Picked Up">Picked Up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">From</label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-11 rounded-2xl border-neutral-200 bg-neutral-50 px-4 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">To</label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-11 rounded-2xl border-neutral-200 bg-neutral-50 px-4 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700">Sort by</label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="h-11 rounded-2xl border-neutral-200 bg-neutral-50 px-4 text-sm">
                  <SelectValue placeholder="Newest first" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="highest">Highest total</SelectItem>
                  <SelectItem value="lowest">Lowest total</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              className="flex-1 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              onClick={() => {
                // filters are live; keep button for UX parity with the provided mock
              }}
            >
              Apply
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-2xl border-primary/20 hover:bg-primary/5"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
                setFromDate("");
                setToDate("");
                setSortBy("newest");
              }}
              disabled={!query && statusFilter === "all" && !fromDate && !toDate && sortBy === "newest"}
            >
              Reset
            </Button>
          </div>

          <div className="mt-6 rounded-2xl bg-primary/5 border border-primary/10 p-4">
            <p className="text-sm font-semibold text-primary">Quick stats</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white p-3">
                <p className="text-neutral-500">Orders</p>
                <p className="mt-1 text-lg font-bold">{quickStats.totalOrders}</p>
              </div>
              <div className="rounded-2xl bg-white p-3">
                <p className="text-neutral-500">This month</p>
                <p className="mt-1 text-lg font-bold">{toUsd(quickStats.monthTotal)}</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-5">
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Overview
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  Order History
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-neutral-500">
                  Fast reorder, clear totals, zero clutter.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="rounded-2xl border border-neutral-200 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Showing</p>
                  <p className="text-sm font-semibold">
                    {filteredOrders.length} order{filteredOrders.length === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-2xl border border-primary/20 px-4 py-3 text-left transition hover:bg-primary/5"
                  onClick={() => {
                    if (quickStats.newest) handleReorder(quickStats.newest);
                  }}
                  disabled={!quickStats.newest?.cart?.length}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Last order</p>
                  <p className="text-sm font-semibold">
                    {quickStats.newest?.createdAt ? formatEST(quickStats.newest.createdAt) : "—"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-primary">Quick reorder →</p>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-neutral-500">Loading your orders…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50">
                <ShoppingBag className="h-8 w-8 text-neutral-500" />
              </div>
              <p className="mt-4 font-headline text-lg font-bold">No orders yet</p>
              <p className="mt-1 text-sm text-neutral-500">
                Place an order from checkout to see it here.
              </p>
              <Button className="mt-5 rounded-2xl bg-neutral-900 text-white hover:bg-neutral-900/90" asChild>
                <Link href="/menu">Start an order</Link>
              </Button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
              <p className="font-headline text-lg font-bold">No matching orders</p>
              <p className="mt-1 text-sm text-neutral-500">
                Try a different search or widen the date range.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status = (order.status ?? "Received") as keyof typeof statusStyles;
              const statusClass = statusStyles[status] ?? "bg-neutral-100 text-neutral-700 ring-neutral-200";
              const itemCount = (order.cart ?? []).reduce((s, l) => s + (l.quantity || 0), 0);
              const total = order.totalWithTax ?? order.totalPrice ?? 0;
              const subtotal = order.totalPrice ?? 0;
              const tax = order.tax ?? Math.max(0, total - subtotal);

              const lines = order.cart ?? [];
              const maxPreview = 4;
              const expanded = !!expandedOrderIds[order.id];
              const visible = expanded ? lines : lines.slice(0, maxPreview);
              const hiddenCount = Math.max(0, lines.length - visible.length);

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="border-b border-neutral-100 px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-base font-semibold tracking-tight">{order.id}</h3>
                          <span
                            className={[
                              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1",
                              statusClass,
                            ].join(" ")}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                            {status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-neutral-500">{formatEST(order.createdAt)}</p>
                        <p className="mt-1 text-sm text-neutral-500">Emperor&apos;s Choice · Clayton, NC</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Items</p>
                          <p className="mt-1 font-bold">{itemCount}</p>
                        </div>
                        <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Total</p>
                          <p className="mt-1 font-bold">{toUsd(total)}</p>
                        </div>
                        <div className="col-span-2 flex gap-3 sm:col-span-1 sm:flex-col">
                          <button
                            type="button"
                            className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                            onClick={() => handleReorder(order)}
                            disabled={!order.cart?.length}
                          >
                            Reorder now
                          </button>
                          <button
                            type="button"
                            className="flex-1 rounded-2xl border border-primary/20 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5"
                            onClick={() =>
                              setExpandedOrderIds((prev) => ({ ...prev, [order.id]: !expanded }))
                            }
                            disabled={!lines.length || lines.length <= maxPreview}
                          >
                            {expanded ? "Collapse" : "Receipt"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 px-5 py-5 sm:px-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
                          Order summary
                        </p>
                        {lines.length > maxPreview && (
                          <button
                            type="button"
                            className="text-sm font-semibold text-primary hover:text-primary/80"
                            onClick={() =>
                              setExpandedOrderIds((prev) => ({ ...prev, [order.id]: true }))
                            }
                          >
                            Expand all
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {visible.map((line, idx) => (
                          <div
                            key={`${order.id}-summary-${idx}`}
                            className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3"
                          >
                            <span className="min-w-0 text-sm font-medium text-neutral-800">
                              {line.name} × {line.quantity}
                              {line.selectedVariant?.trim() ? (
                                <span className="text-neutral-500"> · {line.selectedVariant.trim()}</span>
                              ) : null}
                            </span>
                            <span className="shrink-0 text-sm text-neutral-500">
                              {toUsd(line.price * line.quantity)}
                            </span>
                          </div>
                        ))}
                        {!expanded && hiddenCount > 0 && (
                          <button
                            type="button"
                            className="text-sm font-semibold text-neutral-600 hover:text-neutral-900"
                            onClick={() =>
                              setExpandedOrderIds((prev) => ({ ...prev, [order.id]: true }))
                            }
                          >
                            + View remaining items ({hiddenCount})
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl bg-neutral-900 p-5 text-white shadow-inner">
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/60">
                        Receipt snapshot
                      </p>
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <span className="text-white/70">Food total</span>
                          <span>{toUsd(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <span className="text-white/70">Tax</span>
                          <span>{toUsd(tax)}</span>
                        </div>
                        <div className="flex items-center justify-between text-base font-bold">
                          <span>Total</span>
                          <span>{toUsd(total)}</span>
                        </div>
                      </div>

                      {order.requests?.trim() ? (
                        <div className="mt-5 rounded-2xl bg-white/10 p-4">
                          <p className="text-sm font-semibold">Notes</p>
                          <p className="mt-2 text-sm leading-6 text-white/75">
                            {order.requests.trim()}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
