import type { MenuItem } from "@/app/lib/menu-data";

const STORAGE_KEY = "emperors_choice_admin_menu_items_v1";

function safeParseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function loadPersistedMenuItems(): MenuItem[] | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  const parsed = safeParseJson<unknown>(raw);
  if (!Array.isArray(parsed)) return null;

  // Minimal validation: keep items that look like MenuItem
  const items: MenuItem[] = parsed
    .filter((x) => typeof x === "object" && x !== null)
    .map((x) => x as Partial<MenuItem>)
    .filter((x) => typeof x.id === "string" && typeof x.name === "string" && typeof x.category === "string" && typeof x.price === "number")
    .map((x) => ({
      id: x.id!,
      name: x.name!,
      category: x.category!,
      price: x.price!,
      description: typeof x.description === "string" ? x.description : "",
      imageUrl: typeof x.imageUrl === "string" ? x.imageUrl : "/1.png",
      spiceLevel: x.spiceLevel,
      popular: x.popular,
      variants: x.variants,
    }));

  return items.length > 0 ? items : null;
}

export function persistMenuItems(items: MenuItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

