# Orderwatching desktop app ↔ website checkout

## How the Windows app works

The **orderwatching** project (`orderwatching` folder on your machine):

1. Calls the SOAP web service **`hkinfo.asmx`** (configured as `orderwatching_hawaii_Service` in `app.config`, e.g. `http://emperorschoiceclayton.com/hkinfo.asmx`).
2. Uses **`get_order(dstart, dend, ui)`** to load orders into a grid. The third argument **`ui`** is the store user id (example in code: `suj9988`).
3. Uses a **Timer** (~120 seconds) to refresh orders and detect new ones for printing / sound.
4. The legacy schema centers on SQL Server table **`dbo.CSK_Store_Order`** (see `CSK_Store_OrderTableAdapter` insert command).

So: **new website orders must land in the same database (and same logical store user) that `get_order` returns**, or the desktop app will never see them.

## What we added in this repo

When **`STORE_SQL_CONNECTION_STRING`** is set, the Next.js **`POST /api/order`** handler **inserts one row** into `dbo.CSK_Store_Order` with:

- `userName` = **`ORDERWATCHING_UI`** (default **`suj9988`** if unset) so it matches what orderwatching filters on.
- Line items and notes packed into **`specialInstructions`** (truncated to DB-safe length).
- Money fields aligned with checkout (subtotal, tax, etc.).

If the SQL insert fails, the API **still succeeds** for the customer (local order file + Discord still run); errors are logged on the server.

## SQL scripts (SSMS)

In **`docs/sql/orderwatching/`**:

- **`01-verify-csk-store-order.sql`** — Confirms `dbo.CSK_Store_Order` exists, lists columns, shows recent rows for `suj9988`, counts today’s orders.
- **`02-sample-insert-test-order.sql`** — Inserts one test row (dev DB only) in the same shape as the website.
- **`README.md`** — Why orders might not appear in the desktop app (wrong DB vs `hkinfo.asmx`, `userName`, date range).

## Configuration (`.env`)

```env
# Required for orderwatching / store DB integration
STORE_SQL_CONNECTION_STRING=Server=...;Database=...;User Id=...;Password=...;Encrypt=true

# Must match the `ui` value used in orderwatching when calling get_order (see Form1_chinese.cs)
ORDERWATCHING_UI=suj9988

# Optional — new order row status (depends on your DB)
STORE_ORDER_STATUS_ID=1

# Optional — matches 8% tax in checkout UI
STORE_TAX_RATE=0.08
```

### “Failed to connect to localhost:1433”

The **`mssql`** package uses **Tedious**, which often mis-parses `Server=host\instance` and falls back to the **default instance port 1433** only. The code now splits **`host\instance`** and passes **`options.instanceName`** explicitly.

If it still fails:

1. **SQL Server Browser** must be running for named instances (UDP 1434), or use an **explicit TCP port** instead of the instance name: in SSMS / SQL Server Configuration Manager find **TCP port** for `sqlstd`, then set in `.env`:
   - `STORE_SQL_PORT=49170` (example), **or**
   - `Server=localhost,49170;Database=...` in the connection string (comma + port, no `\instance`).
2. **Windows Integrated Auth** (`Trusted_Connection`) is **not reliable** from Node/Tedious. Prefer **SQL Server authentication** (`User Id=...;Password=...`) for the website, or run against a server that accepts SQL logins.

## Local development

- Your PC must **reach the SQL Server** (VPN / same network / firewall rules).
- Point **`STORE_SQL_CONNECTION_STRING`** at the **same database** the production site uses (or a dev copy with the same schema).
- Run orderwatching with **`app.config`** pointing **`orderwatching_hawaii_Service`** to the environment whose `get_order` includes these rows (usually production `hkinfo.asmx`).

## If you cannot use SQL from Node

Alternative is to add a small **HTTP endpoint on your existing ASP.NET site** that performs the same insert, then set a **`STORE_ORDER_WEBHOOK_URL`** in this project and `fetch` it from `POST /api/order` (not implemented here; ask if you want that pattern instead).

## “Our own” desktop viewer (`tools/OrderWatchingDesktop`)

This repo includes a **new** .NET 8 WinForms app (**`OrderWatchingDesktop`**) that polls **`CSK_Store_Order`** over **SQL** (not SOAP). It uses **`Microsoft.Data.SqlClient`**, so **Windows auth** matches SSMS and the legacy app’s connection strings.

Build: `dotnet build tools/OrderWatchingDesktop -c Release` — see **`tools/OrderWatchingDesktop/README.md`**.

## Building the legacy orderwatching `.exe`

The Windows app source is outside this repo (e.g. `Documents\Website App\orderwatching`). A **Release build** is copied to **`dist/orderwatching/`** in this repo (`orderwatching.exe` + config).

To rebuild:

```powershell
dotnet build "C:\Users\video\Documents\Website App\orderwatching\orderwatching.Sdk.csproj" -c Release
```

Details: **`dist/orderwatching/README.md`**.
