const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

function parseDotEnv(contents) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) out[key] = val;
  }
  return out;
}

function tryReadEnvFile(absPath) {
  try {
    if (!absPath || !fs.existsSync(absPath)) return null;
    return parseDotEnv(fs.readFileSync(absPath, "utf8"));
  } catch {
    return null;
  }
}

function loadMergedEnvFromDisk() {
  const candidates = [
    path.join(path.dirname(process.execPath), ".env"),
    path.join(process.resourcesPath || "", ".env"),
    path.join(process.cwd(), ".env"),
    path.join(__dirname, "..", ".env"),
  ];

  const merged = {};
  for (const p of candidates) {
    const parsed = tryReadEnvFile(p);
    if (!parsed) continue;
    Object.assign(merged, parsed);
    if (merged.VITE_POS_SITE_URL && merged.VITE_POS_API_KEY) break;
  }

  /** @type {Record<string, string>} */
  const flat = {};

  flat.VITE_POS_SITE_URL =
    merged.VITE_POS_SITE_URL || merged.POS_SITE_URL || "";
  flat.VITE_POS_API_KEY =
    merged.VITE_POS_API_KEY || merged.POS_API_KEY || "";

  return flat;
}

const env = loadMergedEnvFromDisk();
contextBridge.exposeInMainWorld("posEnv", env);
contextBridge.exposeInMainWorld("posApi", {
  /** @param {{ siteBaseUrl: string; posApiKey: string }} params */
  getOrders: (params) => ipcRenderer.invoke("pos:get-orders", params),
});
