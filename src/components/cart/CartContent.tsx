
"use client";

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function CartContent() {
  const { cart, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h3 className="font-headline text-xl font-bold">Your basket is empty</h3>
        <p className="text-muted-foreground">Hungry? Explore our delicious Chinese menu and start adding your favorites.</p>
        <Link href="/menu" className="w-full">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Browse Menu
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
                alt={item.name} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-headline font-bold text-sm leading-tight">{item.name}</h4>
                  {item.selectedVariant && (
                    <p className="text-[10px] text-primary font-medium mt-0.5">Choice: {item.selectedVariant}</p>
                  )}
                  {item.instructions && (
                    <p className="text-[10px] text-muted-foreground italic line-clamp-1 mt-0.5">"{item.instructions}"</p>
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
            <span className="text-muted-foreground">Items ({totalItems})</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Tax</span>
            <span>${(totalPrice * 0.08).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>Total</span>
            <span className="text-primary">${(totalPrice * 1.08).toFixed(2)}</span>
          </div>
        </div>
        
        <Link href="/checkout">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-xl shadow-lg shadow-primary/20">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}
