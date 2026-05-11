import type { LocalOrder } from "@/app/lib/orders/local-orders-store";

function formatReceiptDate(iso: string) {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart} • ${timePart}`;
}

function formatPhoneDisplay(digits: string) {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  if (d.length !== 10) return digits || "—";
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function spiceLabel(level?: number) {
  if (level == null) return null;
  const labels = ["None", "Mild", "Medium", "Hot"] as const;
  const s = labels[Math.min(Math.max(level, 0), 3)];
  return s === "None" ? null : s;
}

export function ReceiptView({ order }: { order: LocalOrder }) {
  const note = order.requests?.trim();
  const scheduled = order.scheduledFor
    ? new Date(order.scheduledFor).toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-8">
      <div className="w-[380px] bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center border-b border-zinc-200">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Emperor&apos;s Choice</h1>
          <p className="text-sm text-zinc-500 mt-2">Online Pickup Receipt</p>
        </div>

        <div className="px-8 py-5 border-b border-zinc-200 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500 shrink-0">Order #</span>
            <span className="font-medium text-zinc-900 text-right">{order.id}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500 shrink-0">Date</span>
            <span className="font-medium text-zinc-900 text-right">{formatReceiptDate(order.createdAt)}</span>
          </div>
          {scheduled ? (
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500 shrink-0">Pickup</span>
              <span className="font-medium text-zinc-900 text-right">{scheduled}</span>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <span className="text-zinc-500 shrink-0">Payment</span>
            <span className="font-medium text-green-600">Pay at pickup</span>
          </div>
        </div>

        <div className="px-8 py-6 border-b border-zinc-200">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase mb-4">Customer</h2>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-zinc-900">{order.name || "Guest"}</p>
            <p className="text-sm text-zinc-600">{formatPhoneDisplay(order.phone)}</p>
            <p className="text-sm text-zinc-600 break-all">{order.email || "—"}</p>
          </div>
        </div>

        {note ? (
          <div className="px-8 py-6 border-b border-zinc-200">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase mb-4">Customer Note</h2>
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm text-zinc-700 whitespace-pre-wrap">
              {note}
            </div>
          </div>
        ) : null}

        <div className="px-8 py-6 border-b border-zinc-200">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-zinc-400 uppercase mb-5">Items</h2>
          <div className="space-y-5">
            {order.cart.map((item, i) => {
              const lineTotal = item.price * item.quantity;
              const spice = spiceLabel(item.selectedSpice);
              return (
                <div key={`${item.name}-${i}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-zinc-900 leading-tight">{item.name}</p>
                      {item.instructions ? (
                        <p className="text-sm text-zinc-500 mt-1 italic">&ldquo;{item.instructions}&rdquo;</p>
                      ) : null}
                    </div>
                    <p className="text-base font-semibold text-zinc-900 whitespace-nowrap">
                      ${lineTotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-3 mt-3 flex-wrap">
                    <div className="px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 border border-zinc-200">
                      Qty: {item.quantity}
                    </div>
                    {spice ? (
                      <div className="px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 border border-zinc-200">
                        Spice: {spice}
                      </div>
                    ) : null}
                    {item.selectedVariant?.trim() ? (
                      <div className="px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 border border-zinc-200 max-w-full truncate">
                        {item.selectedVariant.trim()}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-8 py-6">
          <div className="space-y-3 text-sm border-b border-zinc-200 pb-5">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span>${Number(order.totalPrice || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Tax</span>
              <span>${Number(order.tax || 0).toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-5">
            <span className="text-lg font-bold text-zinc-900">Total</span>
            <span className="text-3xl font-bold tracking-tight text-zinc-900">
              ${Number(order.totalWithTax || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="px-8 py-5 bg-zinc-50 border-t border-zinc-200 text-center">
          <p className="text-sm text-zinc-500">Thank you for your order.</p>
          <p className="text-xs text-zinc-400 mt-2 break-all">Bookmark this page to save your receipt.</p>
        </div>
      </div>
    </div>
  );
}
