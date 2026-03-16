
"use client";

import { useState, useEffect } from 'react';
import { MenuItem } from '@/app/lib/menu-data';

export type CartItem = MenuItem & {
  quantity: number;
  instructions?: string;
  selectedSpice?: number;
};

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('emperor_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('emperor_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (item: MenuItem, quantity: number = 1, instructions?: string, spice?: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.selectedSpice === spice && i.instructions === instructions);
      if (existing) {
        return prev.map((i) => 
          (i.id === item.id && i.selectedSpice === spice && i.instructions === instructions) 
          ? { ...i, quantity: i.quantity + quantity } 
          : i
        );
      }
      return [...prev, { ...item, quantity, instructions, selectedSpice: spice }];
    });
  };

  const removeFromCart = (itemId: string, instructions?: string, spice?: number) => {
    setCart((prev) => prev.filter((i) => !(i.id === itemId && i.instructions === instructions && i.selectedSpice === spice)));
  };

  const updateQuantity = (itemId: string, delta: number, instructions?: string, spice?: number) => {
    setCart((prev) => 
      prev.map((i) => {
        if (i.id === itemId && i.instructions === instructions && i.selectedSpice === spice) {
          const newQty = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQty };
        }
        return i;
      })
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  return { cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice };
}
