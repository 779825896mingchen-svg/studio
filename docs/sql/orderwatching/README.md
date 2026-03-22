# SQL helpers for orderwatching / `CSK_Store_Order`

## Easiest: create the table from the repo (no SSMS)

1. Put **`STORE_SQL_CONNECTION_STRING`** in `.env` (same one checkout uses), with **`Database=YourDbName`** — not `master`.
2. From the project root run:

```bash
npm run sql:create-order-table
```

If the table already exists, it prints that and exits. If login fails, use **SQL Server authentication** (user + password) in the string; Node often cannot use Windows auth.

### Node: `Port for SQLEXPRESS not found in localhost`

Tedious needs either **SQL Server Browser** running **or** an explicit TCP port.

1. From the repo root: **`npm run sql:find-sqlexpress-port`** (reads the port from the Windows registry; use **Admin** PowerShell if it errors).
2. In **`.env`**, set **`STORE_SQL_PORT=<that number>`** (must **not** be commented with `#`) and restart **`npm run dev`**.

Or set a **static** port under Configuration Manager → **IPAll** → **TCP Port**, then use that number in **`STORE_SQL_PORT`**.

### `Test-NetConnection` → `TcpTestSucceeded : False` on your port

Nothing is listening on that TCP port. **SSMS can still connect** using **Shared Memory** / **named pipes**, while **Node needs TCP**.

1. Run **`npm run sql:list-sqlexpress-ports`** — lists ports **sqlservr** for SQLEXPRESS is **actually** listening on (if empty, TCP/IP is off or the service wasn’t restarted after changes).
2. In **SQL Server Configuration Manager**: **Protocols for SQLEXPRESS** → **TCP/IP** → **Enabled** → **IP Addresses** → **IPAll** → clear **TCP Dynamic Ports**, set **TCP Port** (e.g. `14330`) → **OK**.
3. **Restart** **SQL Server (SQLEXPRESS)** in **services.msc**.
4. Run **`npm run sql:list-sqlexpress-ports`** again, then set **`STORE_SQL_PORT`** to that port and **`Test-NetConnection -ComputerName 127.0.0.1 -Port <port>`** until **`TcpTestSucceeded : True`**.

### `Login failed for user ''` (Node / checkout)

**Tedious does not use Windows credentials** the way SSMS does. Use **SQL Server authentication**:

1. In SSMS: server **Properties** → **Security** → **SQL Server and Windows Authentication mode** → **OK** → **restart** **SQL Server (SQLEXPRESS)**.
2. Run **`04-create-studio-sql-login.sql`** (edit the password in the script if you want, then use the **same** password in **`.env`**).
3. **`STORE_SQL_CONNECTION_STRING`** must include **`User Id=...;Password=...`** and **must not** use **`Trusted_Connection=True`**.

---

| File | Purpose |
|------|--------|
| `01-verify-csk-store-order.sql` | Confirm the table exists, inspect columns, list recent rows for `userName` = `suj9988`, count today’s rows. |
| `02-sample-insert-test-order.sql` | One manual test row (dev DB only) in the same shape as the Next.js insert. |
| `03-create-csk-store-order.sql` | **Create** `dbo.CSK_Store_Order` from scratch (lengths/types aligned with legacy `DataSet1` + website insert). Edit `USE […]` to your DB name first. If you already have production schema, prefer backup/restore or **Generate Scripts** instead. |
| `04-create-studio-sql-login.sql` | **SQL login** `studio_store` for Node checkout (Tedious). Enables **Mixed Mode** note + `db_datareader` / `db_datawriter` on `hokkaido5`. Match password to **`.env`**. |

## Why the website might not show in orderwatching

1. **Different database** — The desktop app loads orders via **`hkinfo.asmx` → `get_order`**. That hits whatever SQL Server the **web server** uses. Inserts on `localhost\sqlstd` only appear in orderwatching if `get_order` reads that same database (e.g. local SOAP + local DB).

2. **Wrong `userName`** — Must match the third argument to `get_order` (e.g. `suj9988`). Use `ORDERWATCHING_UI` in `.env`.

3. **Date range** — `get_order` uses start/end of selected dates. Your row’s **`orderDate`** must fall in the range the UI is showing (usually “today”).

4. **Insert errors** — Checkout still returns success if SQL fails; check the Next.js server console for `[store-sql-order]`.

After changing `.env`, restart `npm run dev`.
