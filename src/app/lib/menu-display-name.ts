/** Strip optional parenthetical choice fragments for display / cart name. Matches MenuItemCard behavior. */
export function stripChoiceParentheses(name: string): string {
  const match = name.match(/\(([^)]+)\)/);
  if (!match) return name;

  const inside = match[1].trim();
  const looksLikeChoice = /\s+or\s+/i.test(inside) || /\//.test(inside);
  if (!looksLikeChoice) return name;

  return name.replace(/\s*\([^)]+\)\s*/, " ").replace(/\s{2,}/g, " ").trim();
}
