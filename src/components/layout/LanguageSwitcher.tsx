"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";
import { type Locale } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  const pill = (code: Locale, short: string) => (
    <button
      key={code}
      type="button"
      onClick={() => setLocale(code)}
      className={cn(
        "min-w-[2.25rem] rounded-full px-2 py-1 text-[11px] font-bold transition-colors sm:min-w-[2.5rem] sm:px-2.5",
        locale === code
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
      )}
      aria-pressed={locale === code}
      aria-label={code === "en" ? t("language.en") : t("language.es")}
      title={code === "en" ? t("language.en") : t("language.es")}
    >
      {short}
    </button>
  );

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-0.5",
        className,
      )}
      role="group"
      aria-label={t("language.label")}
    >
      <Languages className="ml-1 hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:block" />
      {pill("en", "EN")}
      {pill("es", "ES")}
    </div>
  );
}
