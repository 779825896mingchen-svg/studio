import type { MenuItem } from "@/app/lib/menu-data";

export type OrderLine = {
  name: string;
  quantity: number;
  price: number;
  instructions?: string;
  selectedSpice?: number;
  selectedVariant?: string;
};

/** Pick the best menu row for a historical line (names are often shortened vs. the full menu title). */
export function findBestMenuItem(line: OrderLine, catalog: MenuItem[]): MenuItem | null {
  const n = line.name.trim().toLowerCase();
  if (!n) return null;

  const exact = catalog.find((i) => i.name.trim().toLowerCase() === n);
  if (exact) return exact;

  const price = line.price;
  const candidates = catalog.filter((i) => {
    const mn = i.name.toLowerCase();
    return (
      mn === n ||
      mn.startsWith(n + " ") ||
      mn.startsWith(n + "(") ||
      (n.length >= 4 && mn.includes(n))
    );
  });

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const sorted = [...candidates].sort(
    (a, b) => Math.abs(a.price - price) - Math.abs(b.price - price),
  );
  return sorted[0] ?? null;
}

export function syntheticMenuItem(line: OrderLine, idSuffix: string): MenuItem {
  const safe = idSuffix.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 80);
  const seed = encodeURIComponent(line.name.slice(0, 20).replace(/\s+/g, "-") || "dish");
  return {
    id: `history-${safe}`,
    name: line.name,
    description: "From a previous order — confirm details at checkout.",
    price: line.price,
    category: "Order History",
    imageUrl: `https://picsum.photos/seed/${seed}/600/400`,
  };
}
