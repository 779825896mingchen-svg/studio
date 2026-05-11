type VariantOption = string | { label: string; price?: number };

type MenuVariant = {
  label: string;
  options: VariantOption[];
};

type MenuItemLike = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  spiceLevel?: 0 | 1 | 2 | 3;
  popular?: boolean;
  variants?: MenuVariant[];
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slugifyIdPart(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function looksLikeChoiceText(s: string): boolean {
  return /\s+or\s+/i.test(s) || /\//.test(s);
}

function normalizeSpaces(s: string): string {
  return s.replace(/\s{2,}/g, " ").trim();
}

function flattenNonChoiceParens(name: string): string {
  const m = name.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (!m) return name;
  const inside = m[2].trim();
  if (looksLikeChoiceText(inside)) return name;
  return normalizeSpaces(`${m[1].trim()} ${inside}`);
}

function nameForChoice(baseName: string, optionLabel: string, allOptions: string[]): string {
  const paren = baseName.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (paren) {
    const outside = paren[1].trim();
    const inside = paren[2].trim();
    if (looksLikeChoiceText(inside)) {
      // "Chow Mein (Chicken or Pork)" -> "Chicken Chow Mein"
      return normalizeSpaces(`${optionLabel} ${outside}`);
    }
  }

  // Replace the first "choice phrase" occurrence with the selected option label.
  // Examples:
  // - "Chicken or Pork w. Broccoli" -> "Chicken w. Broccoli"
  // - "Beef, Chicken or Fish" -> "Beef"
  // - "Shrimp or Beef (Lo Mein)" -> "Shrimp (Lo Mein)" (then flattened to "Shrimp Lo Mein")
  const escaped = allOptions
    .map((o) => o.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex);
  const token = `(?:${escaped.join("|")})`;
  const phrase = new RegExp(
    `${token}(?:\\s*(?:,|\\s+or\\s+|/)\\s*${token})+`,
    "i"
  );
  const replaced = phrase.test(baseName) ? baseName.replace(phrase, optionLabel) : `${optionLabel} ${baseName}`;
  return flattenNonChoiceParens(normalizeSpaces(replaced));
}

function optionLabel(opt: VariantOption): string {
  return typeof opt === "string" ? opt : opt.label;
}

function optionPrice(opt: VariantOption): number | undefined {
  return typeof opt === "string" ? undefined : opt.price;
}

/**
 * Expand menu items that have a variant with label "Choice" into separate items.
 * Non-"Choice" variants (e.g., Size/Style/Sauce) are preserved.
 */
export function expandChoiceItems<T extends MenuItemLike>(items: T[]): T[] {
  const out: T[] = [];

  for (const item of items) {
    const variants = item.variants ?? [];
    const choiceVariant = variants.find((v) => v.label === "Choice");
    if (!choiceVariant) {
      out.push(item);
      continue;
    }

    const otherVariants = variants.filter((v) => v.label !== "Choice");
    const allOptions = choiceVariant.options.map(optionLabel);

    for (const opt of choiceVariant.options) {
      const label = optionLabel(opt).trim();
      if (!label) continue;

      const expandedId = `${item.id}-${slugifyIdPart(label)}` || item.id;
      const priceOverride = optionPrice(opt);
      const next = {
        ...item,
        id: expandedId,
        name: nameForChoice(item.name, label, allOptions),
        price: typeof priceOverride === "number" ? priceOverride : item.price,
        variants: otherVariants.length > 0 ? otherVariants : undefined,
      };
      out.push(next as T);
    }
  }

  return out;
}

