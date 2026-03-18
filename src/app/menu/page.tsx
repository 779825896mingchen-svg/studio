
"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { categories, menuItems, MenuItem } from '@/app/lib/menu-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Flame, Star, Info } from 'lucide-react';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const categoryScrollAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = categoryScrollAreaRef.current;
    if (!root) return;

    const viewport = root.querySelector<HTMLElement>('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    const onWheel = (e: WheelEvent) => {
      const canScrollHorizontally = viewport.scrollWidth > viewport.clientWidth;
      if (!canScrollHorizontally) return;

      // Only remap "vertical wheel" to horizontal scroll.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      e.preventDefault();
      viewport.scrollLeft += e.deltaY;
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <header className="bg-primary text-primary-foreground py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4 select-none pointer-events-none">
          <div className="text-[20rem] font-bold">Menu</div>
        </div>
        <div className="container mx-auto relative z-10 text-center space-y-6">
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
        {/* Category Selector */}
        <div className="mb-12">
          <ScrollArea ref={categoryScrollAreaRef} className="w-full whitespace-nowrap pb-4">
            <div className="flex gap-2">
              <Button 
                variant={activeCategory === "All" ? "default" : "outline"}
                className={`rounded-full px-6 transition-all ${activeCategory === "All" ? "bg-primary text-primary-foreground" : "border-primary/20 hover:bg-primary/5"}`}
                onClick={() => setActiveCategory("All")}
              >
                All Dishes
              </Button>
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
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-headline font-bold">No dishes found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
              <Button variant="outline" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-16 p-6 bg-card rounded-2xl border border-border flex flex-wrap gap-8 items-center justify-center text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-secondary fill-secondary" />
            <span className="font-medium">Guest Favorite</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary fill-primary" />
            <span className="font-medium">Spicy Option</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm border border-border bg-muted" />
            <span className="font-medium text-muted-foreground">Images may differ from actual presentation</span>
          </div>
        </div>
      </main>
    </div>
  );
}
