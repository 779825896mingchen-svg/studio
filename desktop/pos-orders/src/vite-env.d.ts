/// <reference types="vite/client" />

/** Values read by Electron preload from `.env` next to the exe (or project folder). */
type PosBridgeEnv = {
  VITE_POS_SITE_URL?: string;
  VITE_POS_API_KEY?: string;
};

declare global {
  interface Window {
    posEnv?: PosBridgeEnv;
    posApi?: {
      getOrders: (params: {
        siteBaseUrl: string;
        posApiKey: string;
      }) => Promise<{ ok: true; data: any[] } | { ok: false; error: string }>;
    };
  }
}

export {};
