
"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { categories, menuItems } from '@/app/lib/menu-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star } from 'lucide-react';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] ?? "Menu");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const categoryNote = useMemo(() => {
    if (activeCategory === "Lunch Combo") {
      return "Only available 11am–3pm Tuesday - Saturday. Includes roast pork fried rice + can soda.";
    }
    if (activeCategory === "Dinner Combo") {
      return "Available all time. Includes roast pork fried rice + pork egg roll.";
    }
    return null;
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <header className="text-primary-foreground px-4 relative overflow-hidden h-[35vh] md:h-[42vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/imperial-menu-bg.png"
            alt="Imperial Menu background"
            fill
            quality={100}
            sizes="100vw"
            className="bg-[#7a0d0d]"
            priority
          />
          <div className="absolute inset-0 bg-black/55" />
          </div>
        <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4 select-none pointer-events-none">
          <div className="text-[20rem] font-bold"></div>
        </div>
        <div className="container mx-auto relative z-10 text-center space-y-6 py-10">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Imperial Menu</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Each dish is prepared to order with authentic techniques and royal standards.
          </p>
          
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="Search for dishes..." 
              className="pl-10 h-12 bg-white text-foreground rounded-xl border-none shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-12 items-start">
          {/* Mobile category selector (horizontal like DoorDash tabs) */}
          <div className="md:hidden">
            <div className="flex flex-wrap gap-2 pb-4">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  className={`rounded-full px-6 transition-all ${activeCategory === cat ? "bg-primary text-primary-foreground" : "border-primary/20 hover:bg-primary/5"}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Desktop left sidebar category column */}
          <aside className="hidden md:block md:col-span-3">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border/60">
                  <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                    Categories
                  </p>
                </div>
                  <ScrollArea className="h-[calc(100vh-13.75rem)]">
                  <div className="p-3 flex flex-col gap-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat}
                        variant={activeCategory === cat ? "default" : "ghost"}
                        className={`justify-start rounded-xl px-3 ${activeCategory === cat ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                        onClick={() => setActiveCategory(cat)}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </aside>

          {/* Right content */}
          <section className="md:col-span-9">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-headline text-2xl font-bold">{activeCategory}</h2>
                {categoryNote && (
                  <p className="text-sm text-muted-foreground">{categoryNote}</p>
                )}
              </div>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            </div>

            {/* Menu Items as two-column rows */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} layout="row" />
                ))
              ) : (
                <div className="py-16 text-center space-y-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                    <Search className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold">No dishes found</h3>
                  <p className="text-muted-foreground">Try adjusting your search.</p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Legend */}
        <div className="mt-16 p-6 bg-card rounded-2xl border border-border flex flex-wrap gap-8 items-center justify-center text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-secondary fill-secondary" />
            <span className="font-medium">Guest Favorite</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm border border-border bg-muted" />
            <span className="font-medium text-muted-foreground">
              Images may differ from actual presentation
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
