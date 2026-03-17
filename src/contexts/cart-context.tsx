"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { MenuItem } from "@/app/lib/menu-data";

export type CartItem = MenuItem & {
  uid: string;
  quantity: number;
  instructions?: string;
  selectedSpice?: number;
  /** Selected option for items with variants (e.g. "Chicken" for "Chicken or Pork") */
  selectedVariant?: string;
};

type CartContextValue = {
  cart: CartItem[];
  isLoaded: boolean;
  addToCart: (
    item: MenuItem,
    quantity?: number,
    instructions?: string,
    spice?: number,
    selectedVariant?: string
  ) => void;
  removeFromCart: (itemUid: string) => void;
  updateQuantity: (itemUid: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "emperor_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch {
      // ignore invalid stored cart
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, isLoaded]);

  const addToCart = useCallback(
    (
      item: MenuItem,
      quantity: number = 1,
      instructions?: string,
      spice?: number,
      selectedVariant?: string
    ) => {
      const uid = `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setCart((prev) => [
        ...prev,
        { ...item, uid, quantity, instructions, selectedSpice: spice, selectedVariant },
      ]);
    },
    []
  );

  const removeFromCart = useCallback((itemUid: string) => {
    setCart((prev) => prev.filter((i) => i.uid !== itemUid));
  }, []);

  const updateQuantity = useCallback((itemUid: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.uid === itemUid) {
          const newQty = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQty };
        }
        return i;
      })
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const value: CartContextValue = {
    cart,
    isLoaded,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (ctx == null) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
