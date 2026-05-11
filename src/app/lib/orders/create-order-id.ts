import crypto from "node:crypto";

/**
 * Short order id for receipts and lookup (e.g. QJRM).
 * 4 letters is intentionally brief; collisions are possible at high volume.
 */
export function createOrderId(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let id = "";
  for (let i = 0; i < 4; i++) {
    id += letters[crypto.randomInt(0, letters.length)];
  }
  return id;
}
