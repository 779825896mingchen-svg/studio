
"use client";

import { useMemo } from "react";
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from '@/contexts/locale-context';
import { useBatchTranslate } from '@/hooks/use-batch-translate';

export function CartContent() {
  const { t, locale } = useLocale();
  const { cart, updateQuantity, removeFromCart, totalPrice, totalItems, setIsCartOpen } = useCart();

  const translateKeys = useMemo(() => {
    const s = new Set<string>();
    cart.forEach((c) => {
      if (c.name) s.add(c.name);
      if (c.selectedVariant?.trim()) s.add(c.selectedVariant.trim());
      if (c.instructions?.trim()) s.add(c.instructions.trim());
    });
    return [...s];
  }, [cart]);

  const { resolve } = useBatchTranslate(translateKeys, locale);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h3 className="font-headline text-xl font-bold">{t("cart.emptyTitle")}</h3>
        <p className="text-muted-foreground">{t("cart.emptyBody")}</p>
        <Link
          href="/menu"
          className="w-full"
          onClick={() => setIsCartOpen(false)}
        >
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {t("cart.browseMenu")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cart.map((item) => (
          <div key={item.uid} className="flex gap-4 p-3 bg-card rounded-lg border border-border shadow-sm group">
            <div className="relative w-20 h-20 rounded-md overflow-hidden shrink-0">
              <Image 
                src={item.imageUrl} 
                alt={resolve(item.name)} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-headline font-bold text-sm leading-tight">{resolve(item.name)}</h4>
                  {item.selectedVariant && (
                    <p className="text-[10px] text-primary font-medium mt-0.5">
                      {t("cart.choice")} {resolve(item.selectedVariant.trim())}
                    </p>
                  )}
                  {item.instructions && (
                    <p className="text-[10px] text-muted-foreground italic line-clamp-1 mt-0.5">
                      &ldquo;{resolve(item.instructions.trim())}&rdquo;
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => removeFromCart(item.uid)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-sm text-primary">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <div className="flex items-center gap-2 bg-muted rounded-full px-2 py-1">
                  <button 
                    onClick={() => updateQuantity(item.uid, -1)}
                    className="p-1 hover:text-primary disabled:opacity-30"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.uid, 1)}
                    className="p-1 hover:text-primary"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-card border-t border-border space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("cart.items")} ({totalItems})</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("cart.estimatedTax")}</span>
            <span>${(totalPrice * 0.08).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>{t("cart.total")}</span>
            <span className="text-primary">${(totalPrice * 1.08).toFixed(2)}</span>
          </div>
        </div>
        
        <Link
          href="/checkout"
          onClick={() => setIsCartOpen(false)}
        >
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-xl shadow-lg shadow-primary/20">
            {t("cart.proceedCheckout")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
