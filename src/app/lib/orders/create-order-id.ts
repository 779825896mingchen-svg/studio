import crypto from "node:crypto";

/**
 * Short order id for receipts, account history, and admin lookup (e.g. ORD-A3F91C2B).
 * 8 hex chars after ORD- — enough entropy for typical order volume; avoids long timestamps in the id.
 */
export function createOrderId(): string {
  return `ORD-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}
