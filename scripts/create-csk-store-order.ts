/**
 * One-command setup: creates dbo.CSK_Store_Order using STORE_SQL_CONNECTION_STRING from .env
 *
 * Usage (from repo root):
 *   npm run sql:create-order-table
 *
 * Requires SQL auth (or working Windows auth to SQL from Node — often needs SQL login).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import sql from "mssql";
import { buildSqlPoolConfig } from "../src/app/lib/orders/store-sql-connection";

function loadDotEnv(): void {
  const p = resolve(process.cwd(), ".env");
  if (!existsSync(p)) return;
  const text = readFileSync(p, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const CREATE_TABLE = `
CREATE TABLE [dbo].[CSK_Store_Order] (
  [orderID]                  INT IDENTITY(1,1) NOT NULL,
  [orderGuid]                NVARCHAR(50)  NOT NULL,
  [orderNumber]              NVARCHAR(50)  NULL,
  [orderDate]                SMALLDATETIME NOT NULL,
  [orderStatusID]            INT           NOT NULL,
  [userName]                 NVARCHAR(100) NOT NULL,
  [email]                    NVARCHAR(50)  NULL,
  [firstName]                NVARCHAR(50)  NULL,
  [lastName]                 NVARCHAR(50)  NULL,
  [shippingMethod]           NVARCHAR(100) NULL,
  [subTotalAmount]           MONEY         NOT NULL CONSTRAINT [DF_CSK_Store_Order_subTotal] DEFAULT (0),
  [shippingAmount]           MONEY         NOT NULL CONSTRAINT [DF_CSK_Store_Order_ship] DEFAULT (0),
  [handlingAmount]           MONEY         NOT NULL CONSTRAINT [DF_CSK_Store_Order_hand] DEFAULT (0),
  [taxAmount]                MONEY         NOT NULL CONSTRAINT [DF_CSK_Store_Order_tax] DEFAULT (0),
  [taxRate]                  DECIMAL(18,4) NOT NULL CONSTRAINT [DF_CSK_Store_Order_taxRate] DEFAULT (0),
  [couponCodes]              NVARCHAR(50)  NULL,
  [discountAmount]           MONEY         NOT NULL CONSTRAINT [DF_CSK_Store_Order_disc] DEFAULT (0),
  [specialInstructions]      NVARCHAR(500) NULL,
  [shipToAddress]            NVARCHAR(500) NULL,
  [billToAddress]            NVARCHAR(500) NULL,
  [userIP]                   NVARCHAR(50)  NOT NULL CONSTRAINT [DF_CSK_Store_Order_ip] DEFAULT (N'0.0.0.0'),
  [shippingTrackingNumber]   NVARCHAR(500) NULL,
  [numberOfPackages]         INT           NOT NULL CONSTRAINT [DF_CSK_Store_Order_pkgs] DEFAULT (0),
  [packagingNotes]           NVARCHAR(2500) NULL,
  [createdOn]                DATETIME2(7)  NOT NULL CONSTRAINT [DF_CSK_Store_Order_createdOn] DEFAULT (SYSUTCDATETIME()),
  [createdBy]                NVARCHAR(50)  NULL,
  [modifiedOn]               DATETIME2(7)  NOT NULL CONSTRAINT [DF_CSK_Store_Order_modOn] DEFAULT (SYSUTCDATETIME()),
  [modifiedBy]               NVARCHAR(50)  NULL,
  [address1]                 NVARCHAR(50)  NULL,
  [paymentMethod]            NVARCHAR(50)  NULL,
  [address2]                 NVARCHAR(50)  NULL,
  [city]                     NVARCHAR(50)  NULL,
  CONSTRAINT [PK_CSK_Store_Order] PRIMARY KEY CLUSTERED ([orderID] ASC)
);
`;

const CREATE_INDEX = `
IF NOT EXISTS (
  SELECT 1 FROM sys.indexes i
  INNER JOIN sys.tables t ON i.object_id = t.object_id
  WHERE t.name = N'CSK_Store_Order' AND SCHEMA_NAME(t.schema_id) = N'dbo'
    AND i.name = N'IX_CSK_Store_Order_userName_orderDate'
)
CREATE NONCLUSTERED INDEX [IX_CSK_Store_Order_userName_orderDate]
  ON [dbo].[CSK_Store_Order] ([userName] ASC, [orderDate] DESC);
`;

async function main(): Promise<void> {
  loadDotEnv();
  const raw = process.env.STORE_SQL_CONNECTION_STRING?.trim();
  if (!raw) {
    console.error(
      "Missing STORE_SQL_CONNECTION_STRING in .env — add your SQL connection string first."
    );
    process.exit(1);
  }

  const config = buildSqlPoolConfig(raw);
  let pool: sql.ConnectionPool | undefined;
  try {
    pool = await sql.connect(config);
    console.log("Connected. Ensuring dbo.CSK_Store_Order exists…");

    const check = await pool.request().query<{ c: number }>(`
      SELECT COUNT(*) AS c FROM sys.tables
      WHERE name = N'CSK_Store_Order' AND SCHEMA_NAME(schema_id) = N'dbo';
    `);
    const exists = (check.recordset[0]?.c ?? 0) > 0;

    if (exists) {
      console.log("✓ Table dbo.CSK_Store_Order already exists — nothing to do.");
      process.exit(0);
    }

    await pool.request().query(CREATE_TABLE);
    await pool.request().query(CREATE_INDEX);
    console.log("✓ Created dbo.CSK_Store_Order and index.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Failed:", msg);
    process.exit(1);
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

void main();
