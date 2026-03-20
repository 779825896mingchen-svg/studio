
"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { MenuItem } from '@/app/lib/menu-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Star, Info, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

function stripChoiceParentheses(name: string): string {
  // Only remove parentheses that look like selectable choices, not counts like "(4)" or sizes like "(Large)".
  // Examples removed: "(Chicken or Pork)", "(Soft/Crispy)", "(Lemon Pepper/Bar-B-Q/Honey/...)".
  const match = name.match(/\(([^)]+)\)/);
  if (!match) return name;

  const inside = match[1].trim();
  const looksLikeChoice = /\s+or\s+/i.test(inside) || /\//.test(inside);
  if (!looksLikeChoice) return name;

  return name.replace(/\s*\([^)]+\)\s*/, " ").replace(/\s{2,}/g, " ").trim();
}

export function MenuItemCard({ item }: { item: MenuItem }) {
  const [instructions, setInstructions] = useState("");
  const [quantity, setQuantity] = useState(1);
  const computedVariants = useMemo(() => {
    if (item.variants && item.variants.length > 0) return item.variants;

    const match = item.name.match(/\(([^)]+)\)/);
    if (!match) return [];

    const inside = match[1].trim();
    const hasOr = /\s+or\s+/i.test(inside);
    const hasSlash = /\s*\/\s*/.test(inside);
    if (!hasOr && !hasSlash) return [];

    const parts = inside
      .split(/\s+or\s+|\/+/i)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length < 2) return [];

    return [{ label: "Choice", options: parts }];
  }, [item.name, item.variants]);

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    computedVariants.forEach((v) => {
      const first = v.options[0];
      initial[v.label] =
        typeof first === "string" ? first : (first?.label ?? "");
    });
    setSelectedVariants(initial);
  }, [computedVariants]);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const variants = computedVariants;
  const displayName = useMemo(() => stripChoiceParentheses(item.name), [item.name]);
  const unitPrice = (() => {
    let p = item.price;
    for (const v of variants) {
      const selected = selectedVariants[v.label];
      const selectedOpt = v.options.find((opt) =>
        typeof opt === "string" ? opt === selected : opt.label === selected
      );
      if (
        selectedOpt &&
        typeof selectedOpt !== "string" &&
        typeof selectedOpt.price === "number"
      ) {
        p = selectedOpt.price;
      }
    }
    return p;
  })();

  const handleAdd = () => {
    const variantStr = variants.length
      ? variants
          .map((v) => `${v.label}: ${selectedVariants[v.label] ?? (typeof v.options[0] === "string" ? v.options[0] : v.options[0]?.label)}`)
          .join(", ")
      : undefined;

    addToCart(
      { ...item, name: displayName, price: unitPrice },
      quantity,
      instructions,
      undefined,
      variantStr
    );
    toast({
      title: "Added to basket",
      description: `${quantity}x ${displayName} has been added to your royal order.`,
      duration: 3500,
    });
    setQuantity(1);
    setInstructions("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="w-full min-w-0 overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 border-border/60 hover:border-primary/40 flex flex-col h-full bg-card">
          {/* Mobile: shorter media block so the whole card fits more comfortably */}
          <div className="relative h-36 sm:h-48 overflow-hidden">
            <Image 
              src={item.imageUrl} 
              alt={item.name} 
              fill 
              unoptimized
              loading="lazy"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {item.popular && (
              <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground gap-1 border-none shadow-md">
                <Star className="w-3 h-3 fill-current" /> Popular
              </Badge>
            )}
          </div>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div className="min-w-0">
              <div className="flex justify-between items-start mb-2">
                <h3 className="min-w-0 pr-2 break-words font-headline font-bold text-base sm:text-lg leading-tight group-hover:text-primary transition-colors">
                  {displayName}
                </h3>
                <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed italic font-body">
                {item.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.category}</span>
              <Button size="sm" variant="outline" className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary group/btn h-8">
                ADD <Plus className="ml-1 w-3 h-3 group-hover/btn:scale-110" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="relative h-48 sm:h-64">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            unoptimized
            loading="lazy"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white space-y-1">
            <DialogTitle className="text-3xl font-headline font-bold">
              {displayName}
            </DialogTitle>
            <p className="text-white/80 max-w-sm text-sm">{item.description}</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {item.variants && item.variants.length > 0 && (
            <div className="space-y-4">
              {item.variants.map((variant) => (
                <div key={variant.label} className="space-y-3">
                  <Label className="text-lg font-headline font-bold">{variant.label}</Label>
                  <RadioGroup
                    value={
                      selectedVariants[variant.label] ??
                      (typeof variant.options[0] === "string"
                        ? variant.options[0]
                        : variant.options[0]?.label)
                    }
                    onValueChange={(value) =>
                      setSelectedVariants((prev) => ({ ...prev, [variant.label]: value }))
                    }
                    className="flex flex-wrap gap-2"
                  >
                    {variant.options.map((opt) => {
                      const label = typeof opt === "string" ? opt : opt.label;
                      const price = typeof opt === "string" ? undefined : opt.price;
                      return (
                      <div
                        key={label}
                        className="flex items-center space-x-2 border border-border px-4 py-2 rounded-xl cursor-pointer hover:bg-muted transition-colors"
                      >
                        <RadioGroupItem value={label} id={`${item.id}-${variant.label}-${label}`} />
                        <Label htmlFor={`${item.id}-${variant.label}-${label}`} className="cursor-pointer font-medium">
                          {label}{typeof price === "number" ? ` ($${price.toFixed(2)})` : ""}
                        </Label>
                      </div>
                    );
                    })}
                  </RadioGroup>
                </div>
              ))}
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
              <p className="text-2xl font-headline font-bold text-primary">${(unitPrice * quantity).toFixed(2)}</p>
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
