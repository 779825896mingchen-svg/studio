"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/contexts/cart-context";
import { LocaleProvider } from "@/contexts/locale-context";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LocaleProvider>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
