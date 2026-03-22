/**
 * Optional integration with the legacy store database used by the Windows
 * "orderwatching" app (polls `hkinfo.asmx` → `get_order` → `CSK_Store_Order`).
 *
 * When `STORE_SQL_CONNECTION_STRING` is set, checkout inserts a row so the
 * desktop app can pick it up on its next poll (default ~2 minutes).
 *
 * Requires network/VPN access to the SQL Server from the machine running Next.js.
 */

import sql from "mssql";
import { randomUUID } from "node:crypto";
import { buildSqlPoolConfig } from "@/app/lib/orders/store-sql-connection";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  instructions?: string;
  selectedVariant?: string;
};

type InsertPayload = {
  name: string;
  email: string;
  phone: string;
  requests: string;
  scheduledFor: string | null;
  cart: OrderItem[];
  totalPrice: number;
  tax: number;
  totalWithTax: number;
  clientIp?: string | null;
};

/** Max lengths from orderwatching `DataSet1.CSK_Store_OrderDataTable.InitClass` (legacy typed dataset). */
const L = {
  orderGuid: 50,
  orderNumber: 50,
  email: 50,
  firstName: 50,
  lastName: 50,
  userName: 100,
  shippingMethod: 100,
  couponCodes: 50,
  specialInstructions: 500,
  shipToAddress: 500,
  billToAddress: 500,
  userIP: 50,
  shippingTrackingNumber: 500,
  packagingNotes: 2500,
  createdBy: 50,
  modifiedBy: 50,
  address1: 50,
  paymentMethod: 50,
  address2: 50,
  city: 50,
} as const;

function trunc(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max);
}

function splitName(full: string): { firstName: string; lastName: string } {
  const t = full.trim();
  if (!t) return { firstName: "Guest", lastName: "" };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function buildSpecialInstructions(p: InsertPayload): string {
  const lines: string[] = [];
  if (p.scheduledFor) {
    lines.push(`Scheduled: ${new Date(p.scheduledFor).toLocaleString()}`);
  } else {
    lines.push("Pickup: ASAP");
  }
  lines.push(`Phone: ${p.phone}`);
  if (p.requests.trim()) lines.push(`Notes: ${p.requests.trim()}`);
  lines.push("");
  lines.push("--- Items ---");
  for (const item of p.cart) {
    const variant = item.selectedVariant ? ` (${item.selectedVariant})` : "";
    const note = item.instructions ? ` — "${item.instructions}"` : "";
    lines.push(`${item.quantity}× ${item.name}${variant} @ $${item.price.toFixed(2)}${note}`);
  }
  const text = lines.join("\n");
  // CSK_Store_Order.specialInstructions max length in typed dataset: 500
  return text.length > 500 ? text.slice(0, 497) + "..." : text;
}

export async function insertCskStoreOrder(
  p: InsertPayload
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const connectionString = process.env.STORE_SQL_CONNECTION_STRING?.trim();
  if (!connectionString) {
    return { ok: true, skipped: true };
  }

  const userName =
    process.env.ORDERWATCHING_UI?.trim() ||
    process.env.STORE_ORDER_USER_NAME?.trim() ||
    "suj9988";
  const orderStatusId = Number(process.env.STORE_ORDER_STATUS_ID || "1");
  const taxRate = Number(process.env.STORE_TAX_RATE || "0.08");

  const { firstName, lastName } = splitName(p.name);
  const orderGuid = trunc(randomUUID(), L.orderGuid);
  const orderNumber = trunc(`WEB-${Date.now()}`, L.orderNumber);
  const orderDate = new Date();
  const specialInstructions = trunc(buildSpecialInstructions(p), L.specialInstructions);
  const digits = (p.phone || "").replace(/\D/g, "");
  const shipToAddress = trunc(
    digits.length >= 10
      ? `Phone: (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
      : p.phone.trim()
        ? `Phone: ${p.phone.trim()}`
        : "",
    L.shipToAddress
  );

  let pool: sql.ConnectionPool | undefined;
  try {
    pool = new sql.ConnectionPool(buildSqlPoolConfig(connectionString));
    await pool.connect();
    const req = pool.request();
    req.input("orderGuid", sql.NVarChar(L.orderGuid), orderGuid);
    req.input("orderNumber", sql.VarChar(L.orderNumber), orderNumber);
    req.input("orderDate", sql.SmallDateTime, orderDate);
    req.input("orderStatusID", sql.Int, Number.isFinite(orderStatusId) ? orderStatusId : 1);
    req.input("userName", sql.VarChar(L.userName), trunc(userName, L.userName));
    req.input("email", sql.NVarChar(L.email), trunc(p.email || "", L.email));
    req.input("firstName", sql.NVarChar(L.firstName), trunc(firstName, L.firstName));
    req.input("lastName", sql.NVarChar(L.lastName), trunc(lastName, L.lastName));
    req.input("shippingMethod", sql.VarChar(L.shippingMethod), trunc("Pickup", L.shippingMethod));
    req.input("subTotalAmount", sql.Money, p.totalPrice);
    req.input("shippingAmount", sql.Money, 0);
    req.input("handlingAmount", sql.Money, 0);
    req.input("taxAmount", sql.Money, p.tax);
    req.input("taxRate", sql.Decimal(18, 4), taxRate);
    req.input("couponCodes", sql.NVarChar(L.couponCodes), "");
    req.input("discountAmount", sql.Money, 0);
    req.input("specialInstructions", sql.NVarChar(L.specialInstructions), specialInstructions);
    req.input("shipToAddress", sql.NVarChar(L.shipToAddress), shipToAddress);
    req.input("billToAddress", sql.NVarChar(L.billToAddress), "");
    req.input("userIP", sql.NVarChar(L.userIP), trunc((p.clientIp || "").trim() || "0.0.0.0", L.userIP));
    req.input("shippingTrackingNumber", sql.NVarChar(L.shippingTrackingNumber), "");
    req.input("numberOfPackages", sql.Int, 0);
    req.input("packagingNotes", sql.NVarChar(L.packagingNotes), "");
    req.input("createdOn", sql.DateTime2, orderDate);
    req.input("createdBy", sql.NVarChar(L.createdBy), trunc("website", L.createdBy));
    req.input("modifiedOn", sql.DateTime2, orderDate);
    req.input("modifiedBy", sql.NVarChar(L.modifiedBy), trunc("website", L.modifiedBy));
    req.input("address1", sql.NVarChar(L.address1), trunc("10125 US-70 BUS", L.address1));
    req.input("paymentMethod", sql.NVarChar(L.paymentMethod), trunc("Pay at pickup", L.paymentMethod));
    req.input("address2", sql.NVarChar(L.address2), "");
    req.input("city", sql.NVarChar(L.city), trunc("Clayton, NC 27520", L.city));

    await req.query(`
      INSERT INTO [dbo].[CSK_Store_Order] (
        [orderGuid], [orderNumber], [orderDate], [orderStatusID], [userName], [email],
        [firstName], [lastName], [shippingMethod], [subTotalAmount], [shippingAmount],
        [handlingAmount], [taxAmount], [taxRate], [couponCodes], [discountAmount],
        [specialInstructions], [shipToAddress], [billToAddress], [userIP],
        [shippingTrackingNumber], [numberOfPackages], [packagingNotes], [createdOn],
        [createdBy], [modifiedOn], [modifiedBy], [address1], [paymentMethod], [address2], [city]
      ) VALUES (
        @orderGuid, @orderNumber, @orderDate, @orderStatusID, @userName, @email,
        @firstName, @lastName, @shippingMethod, @subTotalAmount, @shippingAmount,
        @handlingAmount, @taxAmount, @taxRate, @couponCodes, @discountAmount,
        @specialInstructions, @shipToAddress, @billToAddress, @userIP,
        @shippingTrackingNumber, @numberOfPackages, @packagingNotes, @createdOn,
        @createdBy, @modifiedOn, @modifiedBy, @address1, @paymentMethod, @address2, @city
      )
    `);

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[store-sql-order]", message);
    if (e instanceof Error && e.name === "AggregateError" && "errors" in e) {
      const agg = e as AggregateError & { errors: unknown[] };
      for (const sub of agg.errors ?? []) {
        console.error("[store-sql-order]   cause:", sub instanceof Error ? sub.message : String(sub));
      }
    }
    if (/port for .+not found/i.test(message)) {
      console.error(
        "[store-sql-order] Fix: (1) Start service “SQL Server Browser” in services.msc (Automatic), or (2) set STORE_SQL_PORT in .env to your SQLEXPRESS TCP port (SQL Server Configuration Manager → TCP/IP → IPAll → TCP Dynamic Port / TCP Port), then restart npm run dev."
      );
    }
    if (/login failed for user/i.test(message)) {
      console.error(
        "[store-sql-order] Fix: use SQL Server auth in STORE_SQL_CONNECTION_STRING (User Id + Password, no Trusted_Connection). Run docs/sql/orderwatching/04-create-studio-sql-login.sql in SSMS; enable Mixed Mode on the server if needed."
      );
    }
    return { ok: false, error: message };
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch {
        /* ignore */
      }
    }
  }
}

