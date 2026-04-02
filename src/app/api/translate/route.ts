import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { translateTextsToSpanish } from "@/app/lib/translate/server-translate";

const bodySchema = z.object({
  texts: z.array(z.string()).min(1).max(45),
  to: z.enum(["es", "en"]).default("es"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", detail: parsed.error.flatten() }, { status: 400 });
    }

    const { texts, to } = parsed.data;
    const trimmed = texts.map((t) => t.slice(0, 500));

    if (to === "en") {
      return NextResponse.json({ translations: trimmed });
    }

    const unique: string[] = [];
    const indexMap: number[] = [];
    const seen = new Map<string, number>();
    trimmed.forEach((t, i) => {
      const key = t;
      if (!key) {
        indexMap[i] = -1;
        return;
      }
      let u = seen.get(key);
      if (u === undefined) {
        u = unique.length;
        seen.set(key, u);
        unique.push(key);
      }
      indexMap[i] = u;
    });

    const translatedUnique = await translateTextsToSpanish(unique);
    const translations = trimmed.map((t, i) => {
      const u = indexMap[i];
      if (u < 0 || !t) return t;
      return translatedUnique[u] ?? t;
    });

    return NextResponse.json({ translations });
  } catch (e) {
    console.error("translate API:", e);
    return NextResponse.json({ error: "Translation failed" }, { status: 502 });
  }
}
