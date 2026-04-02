
"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { categories, menuItems, MenuItem } from '@/app/lib/menu-data';
import { loadPersistedMenuItems } from '@/app/lib/menu-persistence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown } from 'lucide-react';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLocale } from '@/contexts/locale-context';
import { stripChoiceParentheses } from '@/app/lib/menu-display-name';
import { useBatchTranslate } from '@/hooks/use-batch-translate';

export default function MenuPage() {
  const { t, locale } = useLocale();
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] ?? "Menu");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [popularOnly, setPopularOnly] = useState(false);
  const [persistedItems, setPersistedItems] = useState<MenuItem[] | null>(null);

  useEffect(() => {
    setPersistedItems(loadPersistedMenuItems());
  }, []);

  const itemsSource = persistedItems ?? menuItems;

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    // Split on non-alphanumeric so inputs like "chow |" still match "chow".
    const terms = normalizedQuery.split(/[^a-z0-9]+/i).filter(Boolean);

    return itemsSource.filter((item) => {
      // Category mode: when no query is typed, keep current behavior and only show the active category.
      if (terms.length === 0 && item.category !== activeCategory) return false;

      // Query mode: when a query is typed, match name across categories.
      if (terms.length > 0) {
        const haystack = item.name.toLowerCase();
        const matchesAllTerms = terms.every((t) => haystack.includes(t));
        if (!matchesAllTerms) return false;
      }

      // Optional "specific filters" toggles.
      if (spicyOnly && (item.spiceLevel ?? 0) < 2) return false;
      if (popularOnly && !item.popular) return false;

      return true;
    });
  }, [activeCategory, itemsSource, searchQuery, spicyOnly, popularOnly]);

  const stringsToTranslate = useMemo(() => {
    const s = new Set<string>();
    categories.forEach((c) => s.add(c));
    s.add(activeCategory);
    for (const i of filteredItems) {
      s.add(stripChoiceParentheses(i.name));
      if (i.description?.trim()) s.add(i.description.trim());
      if (i.category?.trim()) s.add(i.category);
    }
    return [...s];
  }, [filteredItems, activeCategory]);

  const { resolve } = useBatchTranslate(stringsToTranslate, locale);

  const categoryNote = useMemo(() => {
    if (activeCategory === "Lunch Combo") return t("menu.lunchComboNote");
    if (activeCategory === "Dinner Combo") return t("menu.dinnerComboNote");
    return null;
  }, [activeCategory, t]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <header className="text-primary-foreground py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/6.png"
            alt={t("menu.bannerAlt")}
            fill  
            quality={100}
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4 select-none pointer-events-none">
          <div className="text-[20rem] font-bold">{t("menu.waterMark")}</div>
        </div>
        <div className="container mx-auto relative z-10 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">{t("menu.ourMenu")}</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            {t("menu.subtitle")}
          </p>
          
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder={t("menu.searchPlaceholder")} 
              className="pl-10 h-12 bg-white text-foreground rounded-xl border-none shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-12 items-start">
          {/* Mobile category selector */}
          <div className="md:hidden">
            <div className="rounded-2xl border border-border bg-card p-3 mb-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
                    {t("menu.category")}
                  </p>
                  <p className="font-semibold truncate">{resolve(activeCategory)}</p>
                </div>

                <Sheet open={mobileCategoryOpen} onOpenChange={setMobileCategoryOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="rounded-full px-4 shrink-0">
                      {t("menu.browse")}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>

                  <SheetContent side="bottom" className="rounded-t-3xl">
                    <SheetHeader className="text-center pb-4 border-b">
                      <SheetTitle className="font-headline text-2xl">{t("menu.menuCategories")}</SheetTitle>
                      <p className="text-sm text-muted-foreground">
                        {t("menu.menuCategoriesHint")}
                      </p>
                    </SheetHeader>

                    <div className="pt-4 max-h-[65vh] overflow-y-auto space-y-2">
                      {categories.map((cat) => (
                        <SheetClose asChild key={cat}>
                          <button
                            type="button"
                            className={[
                              "w-full text-left rounded-xl px-4 py-3 border transition-colors",
                              activeCategory === cat
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border hover:bg-muted",
                            ].join(" ")}
                            onClick={() => setActiveCategory(cat)}
                          >
                            {resolve(cat)}
                          </button>
                        </SheetClose>
                      ))}
                    </div>

                    <SheetClose asChild>
                      <Button variant="outline" className="w-full mt-4 rounded-xl">
                        {t("menu.dismiss")}
                      </Button>
                    </SheetClose>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={spicyOnly ? "secondary" : "outline"}
                  className="rounded-full"
                  onClick={() => setSpicyOnly((v) => !v)}
                >
                  {t("menu.spicy")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={popularOnly ? "secondary" : "outline"}
                  className="rounded-full"
                  onClick={() => setPopularOnly((v) => !v)}
                >
                  {t("menu.popular")}
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop left sidebar category column */}
          <aside className="hidden md:block md:col-span-3">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border/60">
                  <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                    {t("menu.categories")}
                  </p>
                </div>
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="p-3 flex flex-col gap-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat}
                        variant={activeCategory === cat ? "default" : "ghost"}
                        className={`justify-start rounded-xl px-3 ${activeCategory === cat ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                        onClick={() => setActiveCategory(cat)}
                      >
                        {resolve(cat)}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border/60">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                      {t("menu.filters")}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 px-3 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                      disabled={!spicyOnly && !popularOnly}
                      onClick={() => {
                        setSpicyOnly(false);
                        setPopularOnly(false);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>

                <div className="p-3 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant={spicyOnly ? "default" : "outline"}
                    className="justify-start rounded-xl"
                    onClick={() => setSpicyOnly((v) => !v)}
                  >
                    {t("menu.spicy")}
                  </Button>
                  <Button
                    type="button"
                    variant={popularOnly ? "default" : "outline"}
                    className="justify-start rounded-xl"
                    onClick={() => setPopularOnly((v) => !v)}
                  >
                    {t("menu.popular")}
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Right content */}
          <section className="md:col-span-9">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="space-y-1 min-w-0">
                <h2 className="font-headline text-2xl font-bold break-words">
                  {resolve(activeCategory)}
                </h2>
                {categoryNote && (
                  <p className="text-sm text-muted-foreground break-words leading-relaxed">
                    {categoryNote}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                className="rounded-xl w-full sm:w-auto"
                onClick={() => {
                  setSearchQuery("");
                }}
              >
                {t("menu.clearSearch")}
              </Button>
            </div>

            {/* Menu Items Grid */}
            {/* Mobile-first layout: single column on small phones to prevent overflow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    nameTranslation={resolve(stripChoiceParentheses(item.name))}
                    descriptionTranslation={
                      item.description?.trim() ? resolve(item.description.trim()) : undefined
                    }
                    categoryTranslation={resolve(item.category)}
                  />
                ))
              ) : (
                <div className="col-span-full py-16 text-center space-y-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                    <Search className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold">{t("menu.noDishes")}</h3>
                  <p className="text-muted-foreground">{t("menu.adjustSearch")}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                    }}
                  >
                    {t("menu.clearSearch")}
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Legend removed to match latest design request */}
      </main>
    </div>
  );
}
