"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/dictionaries";

const CACHE_VER = "v1";

function cacheId(locale: Locale, text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `studio_tr:${CACHE_VER}:${locale}:${(h >>> 0).toString(16)}:${text.length}`;
}

function readCache(locale: Locale, keys: string[]): Map<string, string> {
  const m = new Map<string, string>();
  if (typeof sessionStorage === "undefined" || locale !== "es") return m;
  try {
    for (const k of keys) {
      if (!k) continue;
      const v = sessionStorage.getItem(cacheId(locale, k));
      if (v) m.set(k, v);
    }
  } catch {
    /* private mode */
  }
  return m;
}

function writeCache(locale: Locale, pairs: [string, string][]) {
  if (typeof sessionStorage === "undefined" || locale !== "es") return;
  try {
    for (const [en, es] of pairs) {
      if (!en || !es || en === es) continue;
      sessionStorage.setItem(cacheId(locale, en), es);
    }
  } catch {
    /* quota */
  }
}

/**
 * Batch-translate English strings via POST /api/translate when locale is `es`.
 * Orders / cart still store English; this is display-only.
 */
export function useBatchTranslate(texts: string[], locale: Locale) {
  const [map, setMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fingerprint = useMemo(() => {
    const uniq = [...new Set(texts.filter(Boolean))].sort();
    return uniq.join("\u0001");
  }, [texts]);

  useEffect(() => {
    if (locale !== "es") {
      setMap({});
      setLoading(false);
      return;
    }

    const uniq = [...new Set(texts.filter(Boolean))];
    if (uniq.length === 0) {
      setMap({});
      setLoading(false);
      return;
    }

    const cached = readCache("es", uniq);
    const base: Record<string, string> = {};
    uniq.forEach((t) => {
      base[t] = cached.get(t) ?? t;
    });

    const need = uniq.filter((t) => !cached.has(t));
    setMap(base);

    if (need.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts: need, to: "es" }),
        });
        const data = (await res.json()) as { translations?: string[] };
        if (
          !res.ok ||
          !Array.isArray(data.translations) ||
          data.translations.length !== need.length
        ) {
          if (!cancelled) setLoading(false);
          return;
        }

        const pairs: [string, string][] = [];
        const next = { ...base };
        need.forEach((t, i) => {
          const tr = data.translations![i] ?? t;
          next[t] = tr;
          pairs.push([t, tr]);
        });
        writeCache("es", pairs);

        if (!cancelled) {
          setMap(next);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locale, fingerprint]);

  const resolve = useCallback(
    (text: string) => {
      if (locale !== "es" || !text) return text;
      return map[text] ?? text;
    },
    [locale, map],
  );

  return { resolve, loading, map };
}
