/**
 * Server-only translation. Configure one of:
 * - DEEPL_API_KEY — https://www.deepl.com/pro-api (recommended)
 * - GOOGLE_TRANSLATE_API_KEY — Cloud Translation API
 * If neither is set, uses MyMemory public API (strict rate limits; fine for dev/demo).
 */

const MAX_CHUNK = 25;

async function translateDeepL(texts: string[], target: "es"): Promise<string[]> {
  const key = process.env.DEEPL_API_KEY;
  if (!key) throw new Error("DEEPL_API_KEY missing");

  const out: string[] = [];
  for (let i = 0; i < texts.length; i += MAX_CHUNK) {
    const chunk = texts.slice(i, i + MAX_CHUNK);
    const body = new URLSearchParams();
    body.set("source_lang", "EN");
    body.set("target_lang", "ES");
    for (const t of chunk) body.append("text", t);

    const endpoint =
      process.env.DEEPL_API_ENDPOINT ?? "https://api-free.deepl.com/v2/translate";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `DeepL-Auth-Key ${key}` },
      body,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`DeepL error ${res.status}: ${err.slice(0, 200)}`);
    }
    const data = (await res.json()) as { translations: { text: string }[] };
    out.push(...data.translations.map((x) => x.text));
  }
  return out;
}

async function translateGoogle(texts: string[], target: "es"): Promise<string[]> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) throw new Error("GOOGLE_TRANSLATE_API_KEY missing");

  const out: string[] = [];
  for (let i = 0; i < texts.length; i += MAX_CHUNK) {
    const chunk = texts.slice(i, i + MAX_CHUNK);
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: chunk,
          source: "en",
          target,
          format: "text",
        }),
      },
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google Translate error ${res.status}: ${err.slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      data: { translations: { translatedText: string }[] };
    };
    out.push(...data.data.translations.map((t) => t.translatedText));
  }
  return out;
}

/** Public API; rate-limited — use sparingly or set a real provider in production. */
async function translateMyMemory(texts: string[]): Promise<string[]> {
  const results: string[] = [];
  const batchSize = 4;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const chunkResults = await Promise.all(
      batch.map(async (text) => {
        const q = encodeURIComponent(text.slice(0, 500));
        try {
          const r = await fetch(
            `https://api.mymemory.translated.net/get?q=${q}&langpair=en|es`,
            { next: { revalidate: 0 } },
          );
          const j = (await r.json()) as {
            responseData?: { translatedText?: string };
            responseStatus?: number;
          };
          if (j.responseStatus === 200 && j.responseData?.translatedText) {
            return j.responseData.translatedText;
          }
        } catch {
          /* ignore */
        }
        return text;
      }),
    );
    results.push(...chunkResults);
    if (i + batchSize < texts.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return results;
}

export async function translateTextsToSpanish(texts: string[]): Promise<string[]> {
  const normalized = texts.map((t) => (typeof t === "string" ? t : "").slice(0, 500));
  if (normalized.length === 0) return [];

  if (process.env.DEEPL_API_KEY) {
    return translateDeepL(normalized, "es");
  }
  if (process.env.GOOGLE_TRANSLATE_API_KEY) {
    return translateGoogle(normalized, "es");
  }
  return translateMyMemory(normalized);
}
