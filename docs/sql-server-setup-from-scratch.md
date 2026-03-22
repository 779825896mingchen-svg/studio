# SQL Server from zero (Windows) — for checkout + OrderWatchingDesktop

You need a **SQL Server database** on your PC (or in the cloud) that has the **`CSK_Store_Order`** table. This guide assumes you’re starting with **nothing installed**.

---

## Overview of options

| Option | Best for | You install |
|--------|----------|-------------|
| **A. SQL Server Express (local)** | Free, runs on your PC | SQL Server + SSMS |
| **B. SQL Server Developer (local)** | Same as Express but full features (dev only) | SQL Server + SSMS |
| **C. Docker** | If you already use Docker | SQL Server Linux container |
| **D. Cloud (Azure SQL, etc.)** | No local SQL | Cloud DB + firewall rules |

Below is **Option A (Express)** — the most common for “I have no SQL yet.”

---

## Part 1 — Install SQL Server Express (local)

### 1.1 Download the installer

1. Open a browser and go to:  
   **https://www.microsoft.com/en-us/sql-server/sql-server-downloads**
2. Under **Express**, click **Download now** (free).
3. Run the downloaded **`SQL2022-SSEI-Expr.exe`** (or similar — year may change).

### 1.2 Run the installation

1. Choose **Custom** (recommended) or **Basic**.  
   - **Basic** is fastest: it picks an instance name and folders for you.  
   - **Custom** lets you name the instance (e.g. `SQLEXPRESS`).
2. Accept the license.
3. Wait for **Download Media** / **Install** to finish.
4. Important choices (if you see them):
   - **Instance name**: Default is often **`SQLEXPRESS`**. Remember it. Your server will be **`localhost\SQLEXPRESS`** or **`.\SQLEXPRESS`**.
   - **Authentication**: Prefer **Mixed Mode** (SQL Server + Windows authentication) so **Node.js** can use **SQL login + password** later (Windows-only auth is painful from Node).
   - Set a strong **`sa`** password if you enable Mixed Mode — **save it somewhere safe** (password manager).
   - Add your **Windows user** as a **SQL Server administrator** when offered.

### 1.3 Confirm the Windows service is running

1. Press **Win + R**, type **`services.msc`**, Enter.
2. Find **SQL Server (SQLEXPRESS)** (or whatever matches your instance name).
3. **Status** should be **Running**. If not, right‑click → **Start**.

You do **not** need **SQL Server Browser** if you connect using **port** (see Part 3).

---

## Part 2 — Install SSMS (SQL Server Management Studio)

SSMS is the GUI to run queries, create databases, and test connection strings.

1. Go to: **https://aka.ms/ssmsfullsetup**
2. Download and install **Microsoft SQL Server Management Studio**.
3. Open **SSMS**.
4. **Connect to server**:
   - **Server name**: `localhost\SQLEXPRESS`  
     (If your instance name differs, use `localhost\YOURINSTANCE`.)
   - **Authentication**: **Windows Authentication** first (easiest test).
5. Click **Connect**. If this works, SQL Server is installed correctly.

---

## Part 3 — TCP port (avoid SQL Server Browser)

You said you **don’t have SQL Server Browser** — you can **ignore Browser** if you use a **port** in your connection string.

### 3.1 Enable TCP/IP

1. Open **SQL Server Configuration Manager**.  
   - Search Windows for **SQL Server Configuration Manager**  
   - Or: `C:\Windows\SysWOW64\SQLServerManager16.msc` (version number may vary).
2. Expand **SQL Server Network Configuration**.
3. Click **Protocols for SQLEXPRESS** (or your instance name).
4. Right‑click **TCP/IP** → **Enabled** → **OK**.
5. Double‑click **TCP/IP** → tab **IP Addresses**.
6. Scroll to **IPAll** at the bottom:
   - **TCP Dynamic Ports**: note the number (e.g. `49152`), **or**
   - Clear dynamic port and set **TCP Port** to **`1433`** only if you know nothing else uses it (Express often uses a dynamic port — **using the dynamic port number is fine**).
7. **Restart** the SQL Server service:  
   **SQL Server Services** → **SQL Server (SQLEXPRESS)** → **Restart**.

### 3.2 Connection string format (no Browser)

Use **comma + port**, **no** `\instance`:

```text
Server=localhost,49152;Database=YourDatabaseName;User Id=YOUR_SQL_USER;Password=YOUR_PASSWORD;Encrypt=True;TrustServerCertificate=True
```

Replace **`49152`** with **your** port from **IPAll**.

For **Windows auth** from .NET only:

```text
Server=localhost,49152;Database=YourDatabaseName;Integrated Security=True;TrustServerCertificate=True;Encrypt=Optional
```

---

## Part 4 — Database and table (`CSK_Store_Order`)

Your website expects a table **`dbo.CSK_Store_Order`** (same as the legacy store).

- If you have a **backup** from production or a dev server: in SSMS → **Databases** → **Restore Database**.
- If you have **no backup**: you need the **CREATE TABLE** script from whoever owns the database, or export schema from an environment that already has it.  
  **We can’t invent production schema safely** without your real script.

**Minimum for testing:** create an empty database, then add the table when you have the script:

```sql
CREATE DATABASE hokkaido5;
```

(Use whatever database name matches your app — `hokkaido5` appears in your old `app.config` examples.)

---

## Part 5 — SQL login for Node.js (website)

The **Next.js** app uses the **`mssql`** driver; **Windows Integrated Security often doesn’t work** from Node. Easiest path: **SQL login**.

### 5.1 Ensure Mixed Mode (if you didn’t at install)

1. In SSMS, right‑click server → **Properties** → **Security** → **SQL Server and Windows Authentication mode** → OK.
2. Restart SQL Server service.

### 5.2 Create a login and user

In SSMS, **New Query** on your server (adjust names):

```sql
CREATE LOGIN website_app WITH PASSWORD = 'Use_A_Strong_Password_Here!';
USE hokkaido5;
CREATE USER website_app FOR LOGIN website_app;
ALTER ROLE db_datareader ADD MEMBER website_app;
ALTER ROLE db_datawriter ADD MEMBER website_app;
-- If inserts need explicit rights on the table only, you can use GRANT instead of db_datawriter.
```

Grant **`INSERT`** on **`dbo.CSK_Store_Order`** (and any other required objects) per your DBA rules.

### 5.2 Put this in your website `.env`

```env
STORE_SQL_CONNECTION_STRING=Server=localhost,PORT;Database=hokkaido5;User Id=website_app;Password=Use_A_Strong_Password_Here!;Encrypt=True;TrustServerCertificate=True
```

Replace **`PORT`** with the port from Part 3.

Restart **`npm run dev`** after changing `.env`.

---

## Part 6 — OrderWatchingDesktop (`appsettings.json`)

Next to **`OrderWatchingDesktop.exe`**, edit **`appsettings.json`**:

**Windows auth** (works in .NET on your PC):

```json
"ConnectionStrings": {
  "Store": "Server=localhost,PORT;Database=hokkaido5;Integrated Security=True;TrustServerCertificate=True;Encrypt=Optional"
}
```

**Or SQL login** (same user as Node):

```json
"ConnectionStrings": {
  "Store": "Server=localhost,PORT;Database=hokkaido5;User Id=website_app;Password=Use_A_Strong_Password_Here!;Encrypt=True;TrustServerCertificate=True"
}
```

---

## Part 7 — Checklist

- [ ] SQL Server Express (or Developer) installed; service **Running**
- [ ] SSMS installed; can connect to `localhost\SQLEXPRESS` (or your instance)
- [ ] TCP/IP **Enabled**; **port** noted from **IPAll**
- [ ] Database exists; **`CSK_Store_Order`** present (from backup or script)
- [ ] SQL login created (for website); password in `.env` only on your machine
- [ ] `.env` uses **`Server=localhost,PORT`** (comma, not `\`)
- [ ] `appsettings.json` for desktop app updated to match
- [ ] Restart dev server after `.env` changes

---

## If you don’t want to install SQL on your PC

- Use **Azure SQL Database**, **AWS RDS**, or another host; put the server name, port, and firewall rules in the connection string.
- Your PC must be allowed to connect (firewall / VPN / “allow Azure services” etc.).

---

## Quick links

- SQL Server Express: https://www.microsoft.com/en-us/sql-server/sql-server-downloads  
- SSMS: https://aka.ms/ssmsfullsetup  
- Connection string reference: https://learn.microsoft.com/en-us/sql/connect/connection-string-syntax
