const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

async function fetchOrdersFromPosApi({ siteBaseUrl, posApiKey }) {
  const base = String(siteBaseUrl || "").trim().replace(/\/$/, "");
  const key = String(posApiKey || "").trim();
  if (!base || !key) throw new Error("Missing site URL or POS API key");

  const url = `${base}/api/pos/orders?limit=200`;
  const r = await fetch(url, {
    headers: { "x-pos-api-key": key },
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(text || `Orders request failed (${r.status})`);
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON from orders API");
  }
  if (!json.orders || !Array.isArray(json.orders)) {
    throw new Error("Invalid API response (expected { orders: [...] })");
  }
  return json.orders;
}

function createWindow() {
  const preloadPath = path.join(__dirname, "preload.cjs");
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    backgroundColor: "#0b0b0d",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    win.loadURL(devUrl);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  ipcMain.handle("pos:get-orders", async (_evt, params) => {
    try {
      const data = await fetchOrdersFromPosApi(params || {});
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Failed to load orders" };
    }
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
