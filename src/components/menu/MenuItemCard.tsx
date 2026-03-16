
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { MenuItem } from '@/app/lib/menu-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Flame, Star, Info, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

export function MenuItemCard({ item }: { item: MenuItem }) {
  const [instructions, setInstructions] = useState("");
  const [spice, setSpice] = useState(item.spiceLevel?.toString() || "0");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    addToCart(item, quantity, instructions, parseInt(spice));
    toast({
      title: "Added to Basket",
      description: `${quantity}x ${item.name} has been added to your royal order.`,
    });
    setQuantity(1);
    setInstructions("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 border-border/60 hover:border-primary/40 flex flex-col h-full bg-card">
          <div className="relative h-48 overflow-hidden">
            <Image 
              src={item.imageUrl} 
              alt={item.name} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {item.popular && (
              <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground gap-1 border-none shadow-md">
                <Star className="w-3 h-3 fill-current" /> Popular
              </Badge>
            )}
            {item.spiceLevel && item.spiceLevel > 0 && (
              <div className="absolute top-2 right-2 flex gap-0.5">
                {[...Array(item.spiceLevel)].map((_, i) => (
                  <Flame key={i} className="w-4 h-4 text-primary fill-primary" />
                ))}
              </div>
            )}
          </div>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-headline font-bold text-lg group-hover:text-primary transition-colors">{item.name}</h3>
                <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed italic font-body">
                {item.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.category}</span>
              <Button size="sm" variant="outline" className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary group/btn h-8">
                Customize <Plus className="ml-1 w-3 h-3 group-hover/btn:scale-110" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="relative h-48 sm:h-64">
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white space-y-1">
            <h2 className="text-3xl font-headline font-bold">{item.name}</h2>
            <p className="text-white/80 max-w-sm text-sm">{item.description}</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {item.spiceLevel !== undefined && (
            <div className="space-y-4">
              <Label className="text-lg font-headline font-bold flex items-center gap-2">
                Spice Level <Flame className="w-4 h-4 text-primary" />
              </Label>
              <RadioGroup value={spice} onValueChange={setSpice} className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 border border-border p-3 rounded-xl cursor-pointer hover:bg-muted transition-colors">
                  <RadioGroupItem value="0" id="s0" />
                  <Label htmlFor="s0" className="flex-1 cursor-pointer">Not Spicy</Label>
                </div>
                <div className="flex items-center space-x-2 border border-border p-3 rounded-xl cursor-pointer hover:bg-muted transition-colors">
                  <RadioGroupItem value="1" id="s1" />
                  <Label htmlFor="s1" className="flex-1 cursor-pointer">Mildly Spicy</Label>
                </div>
                <div className="flex items-center space-x-2 border border-border p-3 rounded-xl cursor-pointer hover:bg-muted transition-colors">
                  <RadioGroupItem value="2" id="s2" />
                  <Label htmlFor="s2" className="flex-1 cursor-pointer">Moderately Spicy</Label>
                </div>
                <div className="flex items-center space-x-2 border border-border p-3 rounded-xl cursor-pointer hover:bg-muted transition-colors">
                  <RadioGroupItem value="3" id="s3" />
                  <Label htmlFor="s3" className="flex-1 cursor-pointer">Extra Spicy</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-4">
            <Label className="text-lg font-headline font-bold" htmlFor="instructions">Special Instructions</Label>
            <Textarea 
              id="instructions"
              placeholder="E.g., No cilantro, extra sauce on the side, allergies etc." 
              className="resize-none h-24 rounded-xl"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" /> Specific requests may incur extra charges.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 bg-muted rounded-full p-1 px-4">
              <button 
                className="w-8 h-8 flex items-center justify-center font-bold text-xl disabled:opacity-30" 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              > - </button>
              <span className="w-8 text-center font-headline font-bold text-lg">{quantity}</span>
              <button 
                className="w-8 h-8 flex items-center justify-center font-bold text-xl" 
                onClick={() => setQuantity(quantity + 1)}
              > + </button>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Subtotal</p>
              <p className="text-2xl font-headline font-bold text-primary">${(item.price * quantity).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-card border-t flex sm:justify-between items-center gap-4">
          <DialogTrigger asChild>
            <Button variant="ghost" className="rounded-xl">Cancel</Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-xl shadow-lg shadow-primary/20">
              Add to Basket <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
