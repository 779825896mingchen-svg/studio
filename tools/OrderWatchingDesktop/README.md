# OrderWatchingDesktop (our own “orderwatching”)

Small **.NET 8 WinForms** app in this repo that shows recent rows from **`dbo.CSK_Store_Order`** using **`Microsoft.Data.SqlClient`**. Unlike Node.js, **Windows Integrated Security works** with the same style of connection string as SSMS / the old VB app.

## Build

**Full rebuild every time** (recommended — `clean` + `build --no-incremental` so outputs aren’t stale):

```bash
npm run build:orderwatching
```

Or manually:

```powershell
powershell -ExecutionPolicy Bypass -File tools/OrderWatchingDesktop/rebuild.ps1
```

The rebuild script checks that **`OrderWatchingDesktop.exe` is not running** (exit code **2** if it is). Close the app first, then run **`npm run build:orderwatching`** again.

Run **`bin\Release\net8.0-windows\OrderWatchingDesktop.exe`** (keep **`appsettings.json`** next to the exe).

### App won’t open / nothing happens

1. **Use the `.exe` in the output folder** — `tools\OrderWatchingDesktop\bin\Release\net8.0-windows\OrderWatchingDesktop.exe`, not the project folder. **`appsettings.json` must sit in that same folder** (build copies it; don’t run only the `.dll`).
2. **Install [.NET 8 Desktop Runtime](https://dotnet.microsoft.com/download/dotnet/8.0)** (x64) if Windows shows a runtime prompt or the app exits immediately.
3. **See the real error** — open **Command Prompt**, `cd` to that folder, run `OrderWatchingDesktop.exe`. A dialog should appear on failures; startup/splitter bugs were fixed in code so the window should show instead of crashing silently.

### UI

**Emperor's POS (light)** — warm off-white **`#F7F3EE`**, white cards, **orange** accent **`#FF8A18`**, **Segoe UI**. **Sidebar:** **Orders** title, store card, **Live orders** / **History**, **Refresh**, footer stats. **Live:** stacked live order cards (collapse/expand) + rich **Order details** panel. **History:** search + status / date range / sort + **Filter**, wide history cards, pagination, same detail panel. Styling is **custom GDI+** (rounded cards, soft shadows). Set **`OrderWatch:UseSampleData`** to **`true`** to run without SQL (demo dataset + pagination). `RowLimit` still caps SQL `TOP N` per query.

## Configure

Edit **`appsettings.json`** next to the exe (same folder as **`OrderWatchingDesktop.exe`** — copy it from the project if you run from `bin\Release\...`):

- **`ConnectionStrings:Store`** — same database as checkout / SSMS. Use **`Data Source=...`** and **`Integrated Security=True`** when connecting with Windows auth.
- **`OrderWatch:StoreUserName`** — must match **`ORDERWATCHING_UI`** / `get_order` filter (e.g. `suj9988`).
- **`OrderWatch:PollSeconds`** — auto-refresh interval (live mode).
- **`OrderWatch:UseSampleData`** — **`true`** = in-memory demo orders (no DB). **`false`** = use **`ConnectionStrings:Store`**.
- **`OrderWatch:HistoryPageSize`** — rows per history page (default **8**).

### Error 26 — “Error Locating Server/Instance Specified”

Named instances like **`localhost\sqlstd`** need **SQL Server Browser** so the client can find the right TCP port. If you see **error 26**, try this order:

1. **Start SQL Server Browser** — `Win + R` → `services.msc` → find **SQL Server Browser** → **Start** and set **Startup type** to **Automatic**.
2. **Confirm your instance name** — In **SQL Server Configuration Manager**, under **SQL Server Services**, note the exact name (e.g. `SQL Server (SQLEXPRESS)` vs `SQLSTD`). Your `Data Source` must match (e.g. `localhost\SQLEXPRESS` or `.\sqlstd` if that’s what’s installed).
3. **Use an explicit TCP port** (most reliable) — In Configuration Manager → **SQL Server Network Configuration** → **Protocols for &lt;YOURINSTANCE&gt;** → **TCP/IP** → **Enabled** → **IP Addresses** → scroll to **IPAll** → note **TCP Dynamic Port** or **TCP Port** (e.g. `49170`). Then set:
   ```text
   Data Source=localhost,49170;Initial Catalog=hokkaido5;Integrated Security=True;TrustServerCertificate=True;Encrypt=Optional
   ```
   (Comma between host and port — **no** `\instance` when using a port.)
4. **SQL Server service** — Ensure **SQL Server (…)** for your instance is **Running** in `services.msc`.

**Test in SSMS first** with the same `Server name` you put in `Data Source`. If SSMS connects, copy that exact string into `appsettings.json`.

## UI theme

Premium **restaurant dashboard** look: white cards, soft borders, orange highlights. Older **UiTheme** (site reds / Inter) is unused by this shell; the POS uses **`EmperorPosTheme`** in code.

## vs legacy `orderwatching`

| | Legacy (VB, outside repo) | This app |
|---|---------------------------|----------|
| UI | Full featured | Sidebar + cards + detail pane + refresh + timer |
| SQL | Typed adapters | Direct `SELECT` |
| SOAP | Uses `hkinfo.asmx` | **Direct SQL only** (same table as the website insert) |

To watch **only** what the website writes into your DB, this app is enough. To match **production** orders that only exist behind the remote SOAP service, you’d need that DB or a small API—same as before.
