
"use client";

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { menuItems, categories, MenuItem } from '@/app/lib/menu-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Wand2, Search, ImageIcon, Save, X } from 'lucide-react';
import { generateMenuItemDescription } from '@/ai/flows/generate-menu-item-description';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ingredients, setIngredients] = useState("");
  const { toast } = useToast();

  const handleAiDescription = async () => {
    if (!editingItem?.name || !ingredients) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a dish name and key ingredients for the AI to work with.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateMenuItemDescription({
        dishName: editingItem.name,
        ingredients: ingredients,
      });
      setEditingItem(prev => ({ ...prev, description: result.description }));
      toast({
        title: "Description Generated",
        description: "The AI has crafted a new enticing description for your dish.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Failed",
        description: "There was an error connecting to the AI service.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    // In a real app, this would be a server action or API call
    toast({
      title: "Success",
      description: "Menu item has been updated across all platforms.",
    });
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary">Menu Management</h1>
            <p className="text-muted-foreground">Add, edit, or remove imperial dishes from the live menu.</p>
          </div>
          <Button onClick={() => setEditingItem({})} className="bg-primary hover:bg-primary/90 rounded-xl">
            <Plus className="mr-2 w-4 h-4" /> Add New Dish
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">Live Menu Items</CardTitle>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Filter items..." className="pl-9 h-9 rounded-lg" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between group hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-muted relative overflow-hidden flex-shrink-0">
                          <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.category} • ${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)} className="hover:bg-primary/10 hover:text-primary">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Panel */}
          <div className="space-y-6">
            {editingItem ? (
              <Card className="sticky top-24 border-primary/20 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-4">
                <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{editingItem.id ? "Edit Dish" : "New Dish"}</CardTitle>
                    <CardDescription>Imperial Kitchen Records</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setEditingItem(null)} className="rounded-full">
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Dish Name</Label>
                      <Input 
                        id="name" 
                        value={editingItem.name || ""} 
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        placeholder="e.g. Imperial Peaking Duck" 
                        className="rounded-xl"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={editingItem.category} 
                          onValueChange={(val) => setEditingItem({ ...editingItem, category: val })}
                        >
                          <SelectTrigger id="category" className="rounded-xl">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input 
                          id="price" 
                          type="number" 
                          step="0.01" 
                          value={editingItem.price || ""} 
                          onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                          placeholder="0.00" 
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-bold flex items-center gap-1.5 text-primary">
                          <Wand2 className="w-4 h-4" /> AI Description Assistant
                        </Label>
                      </div>
                      <div className="space-y-3 p-4 bg-muted/40 rounded-xl border border-dashed border-primary/20">
                        <div className="space-y-1.5">
                          <Label htmlFor="ingredients" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Key Ingredients / Flavors</Label>
                          <Input 
                            id="ingredients" 
                            placeholder="e.g. chicken, honey, garlic, ginger, star anise" 
                            className="bg-background text-xs rounded-lg"
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                          />
                        </div>
                        <Button 
                          onClick={handleAiDescription} 
                          disabled={isGenerating}
                          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm"
                        >
                          {isGenerating ? "Crafting..." : "Generate Creative Description"}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Public Description</Label>
                      <Textarea 
                        id="description" 
                        value={editingItem.description || ""} 
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        className="h-32 rounded-xl resize-none" 
                        placeholder="A mouth-watering description of your imperial dish..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Dish Image</Label>
                      <div className="h-40 bg-muted rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors group">
                        {editingItem.imageUrl ? (
                          <div className="relative w-full h-full p-2">
                            <img src={editingItem.imageUrl} className="w-full h-full object-cover rounded-lg" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button variant="secondary" size="sm">Replace</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">Click to upload photo</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setEditingItem(null)}>Discard</Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90 rounded-xl" onClick={handleSave}>
                      <Save className="mr-2 w-4 h-4" /> Save Record
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-24 border-dashed border-2 bg-muted/20">
                <CardContent className="p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                    <Pencil className="w-8 h-8" />
                  </div>
                  <h3 className="font-headline font-bold text-xl">Selection Required</h3>
                  <p className="text-muted-foreground text-sm">Select an existing dish to edit or create a new one to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
