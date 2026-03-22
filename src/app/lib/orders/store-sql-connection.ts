/**
 * Build `mssql` pool config so Tedious doesn't drop `Server=host\instance`
 * and fall back to `localhost:1433` (default instance only).
 *
 * @see https://github.com/tediousjs/node-mssql/issues — named instances + Node
 */

import type { config as SqlConfig } from "mssql";

/** Strip wrapping quotes from .env values */
function stripQuotes(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function parseConnectionString(raw: string): Record<string, string> {
  const cleaned = stripQuotes(raw);
  const map: Record<string, string> = {};
  for (const piece of cleaned.split(";")) {
    const idx = piece.indexOf("=");
    if (idx === -1) continue;
    const k = piece.slice(0, idx).trim().toLowerCase();
    const v = piece.slice(idx + 1).trim();
    map[k] = v;
  }
  return map;
}

function truthy(v: string | undefined): boolean {
  return /^(true|yes|1|sspi)$/i.test((v || "").trim());
}

/**
 * Returns a `sql.config` object (preferred) so `instanceName` / port are explicit.
 * Falls back to the original string if parsing fails.
 */
export function buildSqlPoolConfig(raw: string): string | SqlConfig {
  if (process.env.STORE_SQL_USE_LEGACY_CONNECTION_STRING === "1") {
    return stripQuotes(raw);
  }

  try {
    const m = parseConnectionString(raw);
    const serverRaw = (m.server || m["data source"] || "").trim();
    if (!serverRaw) return stripQuotes(raw);

    let server = serverRaw;
    let instanceName: string | undefined;
    let port: number | undefined;

    // host,49152 — explicit TCP port (no instance name)
    const tcp = /^(.+),(\d+)$/.exec(serverRaw.trim());
    if (tcp) {
      server = tcp[1].trim();
      port = parseInt(tcp[2], 10);
    } else {
      // host\instance — .env often doubles backslashes (\\sqlstd); split on one-or-more \
      const segments = serverRaw.split(/\\+/).filter((s) => s.length > 0);
      server = (segments[0] ?? serverRaw).trim();
      if (segments.length > 1) {
        instanceName = segments.slice(1).join("\\");
      }
    }

    const database = (m.database || m["initial catalog"] || "").trim();
    const user = (m["user id"] || m.uid || "").trim();
    const password = (m.password || m.pwd || "").trim();

    const encrypt = truthy(m.encrypt);
    const trustServerCertificate = truthy(m.trustservercertificate);

    const integrated =
      truthy(m["trusted_connection"]) || truthy(m["integrated security"]);

    const options: NonNullable<SqlConfig["options"]> = {
      database: database || undefined,
      encrypt,
      trustServerCertificate: trustServerCertificate || !encrypt,
      enableArithAbort: true,
    };

    if (instanceName) options.instanceName = instanceName;
    if (port !== undefined && !Number.isNaN(port)) options.port = port;

    // Optional: bypass instance resolution (SQL Browser) — set when you know the TCP port (SSMS → SQL Server Configuration Manager)
    const portOverride = process.env.STORE_SQL_PORT?.trim();
    if (portOverride) {
      const p = parseInt(portOverride, 10);
      if (!Number.isNaN(p)) {
        options.port = p;
        delete options.instanceName;
      }
    }

    // Tedious tries each resolved address for "localhost" (often ::1 then 127.0.0.1). SQL may only bind IPv4 →
    // AggregateError "Could not connect (sequence)". Prefer IPv4 when we have an explicit TCP port.
    const explicitPort =
      options.port !== undefined && !Number.isNaN(Number(options.port));
    if (
      explicitPort &&
      process.env.STORE_SQL_USE_IPV6_LOCALHOST !== "1" &&
      /^localhost$/i.test(server.trim())
    ) {
      server = "127.0.0.1";
    }

    const config: SqlConfig = {
      server,
      options,
    };

    if (user) {
      config.user = user;
      config.password = password;
    }

    if (integrated && !user) {
      console.warn(
        "[store-sql-order] Using Integrated/Trusted auth from Node: Tedious may not use Windows credentials. If login fails, use SQL Server auth (User Id + Password) and remove Trusted_Connection."
      );
    }

    return config;
  } catch {
    return stripQuotes(raw);
  }
}
