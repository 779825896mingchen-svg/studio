
"use client";
import { useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { menuItems, categories, MenuItem } from '@/app/lib/menu-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Search, ImageIcon, Save, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { loadPersistedMenuItems, persistMenuItems } from '@/app/lib/menu-persistence';

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] ?? "Menu");
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const persisted = loadPersistedMenuItems();
    if (persisted) setItems(persisted);
  }, []);

  const handleSave = () => {
    if (!editingItem) return;

    const name = (editingItem.name ?? "").toString().trim();
    const category = (editingItem.category ?? activeCategory).toString();
    const price =
      typeof editingItem.price === "number" ? editingItem.price : Number(editingItem.price);
    const description = (editingItem.description ?? "").toString().trim();
    const imageUrl = (editingItem.imageUrl ?? "").toString().trim();

    if (!name || !category || !Number.isFinite(price) || price < 0) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter a dish name, category, and a valid price.",
      });
      return;
    }

    const normalized: MenuItem = {
      id: editingItem.id ?? `NEW-${Date.now()}`,
      name,
      category,
      price,
      description,
      imageUrl: imageUrl || "/1.png",
      spiceLevel: editingItem.spiceLevel,
      popular: editingItem.popular,
      variants: editingItem.variants,
    };

    setItems((prev) => {
      const exists = prev.some((p) => p.id === normalized.id);
      const next = exists
        ? prev.map((p) => (p.id === normalized.id ? normalized : p))
        : [normalized, ...prev];
      persistMenuItems(next);
      return next;
    });

    toast({
      title: "Saved",
      description: "Menu item updated.",
    });
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((p) => p.id !== id);
      persistMenuItems(next);
      return next;
    });
    setEditingItem((curr) => (curr?.id === id ? null : curr));
    toast({
      title: "Deleted",
      description: "Menu item removed from the list.",
    });
  };

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const terms = normalizedQuery.split(/[^a-z0-9]+/i).filter(Boolean);

    return items.filter((item) => {
      if (item.category !== activeCategory) return false;
      if (terms.length === 0) return true;
      const haystack = `${item.name} ${item.description ?? ""} ${item.category}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }, [activeCategory, items, searchQuery]);

  return (
    <div className="h-screen bg-background overflow-hidden">
      <Navbar />
      <div className="container mx-auto px-4 py-4 h-full overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary">Menu Management</h1>
            <p className="text-muted-foreground">Add, edit, or remove dishes from the live menu.</p>
          </div>
          <Button onClick={() => setEditingItem({})} className="bg-primary hover:bg-primary/90 rounded-xl">
            <Plus className="mr-2 w-4 h-4" /> Add New Dish
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Desktop category sidebar */}
              <aside className="hidden md:block md:col-span-3">
                <div className="sticky top-24">
                  <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border/60">
                      <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                        Categories
                      </p>
                    </div>
                    <ScrollArea className="h-[calc(100vh-245px)]">
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

              <div className="md:col-span-9 space-y-4">
                {/* Mobile category selector */}
                <div className="md:hidden">
                  <div className="rounded-2xl border border-border bg-card p-3 mb-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
                          Category
                        </p>
                        <p className="font-semibold truncate">{activeCategory}</p>
                      </div>

                      <Sheet open={mobileCategoryOpen} onOpenChange={setMobileCategoryOpen}>
                        <SheetTrigger asChild>
                          <Button variant="outline" className="rounded-full px-4 shrink-0">
                            Browse
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-3xl">
                          <SheetHeader className="text-center pb-4 border-b">
                            <SheetTitle className="font-headline text-2xl">Menu Categories</SheetTitle>
                            <p className="text-sm text-muted-foreground">Pick a section to manage.</p>
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
                                  {cat}
                                </button>
                              </SheetClose>
                            ))}
                          </div>
                          <SheetClose asChild>
                            <Button variant="outline" className="w-full mt-4 rounded-xl">
                              Dismiss
                            </Button>
                          </SheetClose>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                </div>

                <Card className="border-border shadow-sm">
                  <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 gap-4">
                    <CardTitle className="text-lg">Live Menu Items</CardTitle>
                    <div className="relative w-full max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search items..."
                        className="pl-9 h-9 rounded-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-140px)]">
                      <div className="p-4 pb-8">
                        {filteredItems.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredItems.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-2xl border border-border bg-background overflow-hidden shadow-sm"
                              >
                                <div className="h-36 bg-muted relative overflow-hidden">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div className="p-4 space-y-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <h4 className="font-bold text-sm truncate">{item.name}</h4>
                                      <p className="text-xs text-muted-foreground break-words">
                                        {item.category} • ${item.price.toFixed(2)}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingItem(item)}
                                        className="hover:bg-primary/10 hover:text-primary"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(item.id)}
                                        className="hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-16 text-center space-y-4">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                              <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-headline font-bold">No items found</h3>
                            <p className="text-muted-foreground">Try a different search or category.</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
          <div className="p-6 flex items-center justify-between gap-4 bg-primary/5 border-b">
            <div>
              <DialogHeader>
                <DialogTitle className="text-lg">
                  {editingItem?.id ? "Edit Dish" : "New Dish"}
                </DialogTitle>
              </DialogHeader>
              <p className="text-xs text-muted-foreground mt-1">Update dish details, description, and image URL.</p>
            </div>
          </div>

          <div className="max-h-[80vh] overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Dish Name</Label>
                <Input
                  id="name"
                  value={editingItem?.name || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...(prev ?? ({} as Partial<MenuItem>)), name: e.target.value }))
                  }
                  placeholder="e.g. General Tso Chicken"
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={String(editingItem?.category ?? activeCategory)}
                    onValueChange={(val) =>
                      setEditingItem((prev) => ({ ...(prev ?? ({} as Partial<MenuItem>)), category: val }))
                    }
                  >
                    <SelectTrigger id="category" className="rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={typeof editingItem?.price === "number" ? editingItem?.price : ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setEditingItem((prev) => ({
                        ...(prev ?? ({} as Partial<MenuItem>)),
                        price: raw === "" ? undefined : parseFloat(raw),
                      }));
                    }}
                    placeholder="0.00"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Public Description</Label>
                <Textarea
                  id="description"
                  value={editingItem?.description || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...(prev ?? ({} as Partial<MenuItem>)),
                      description: e.target.value,
                    }))
                  }
                  className="h-32 rounded-xl resize-none"
                  placeholder="Write a clear description of the dish."
                />
              </div>

              <div className="space-y-2">
                <Label>Dish Image</Label>
                <div className="h-40 bg-muted rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors group">
                  {editingItem?.imageUrl ? (
                    <div className="relative w-full h-full p-2">
                      <img
                        src={editingItem.imageUrl}
                        className="w-full h-full object-cover rounded-lg"
                        alt="Preview"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          Replace
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">
                        Click to upload photo
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setEditingItem(null)}
              >
                Discard
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
                onClick={handleSave}
              >
                <Save className="mr-2 w-4 h-4" /> Save Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
