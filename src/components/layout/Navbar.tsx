
"use client";

import Link from 'next/link';
import { ShoppingCart, User, Menu as MenuIcon, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CartContent } from '@/components/cart/CartContent';

export function Navbar() {
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
              E
            </div>
            <span className="font-headline text-2xl font-bold tracking-tight text-primary hidden sm:block">
              EMPEROR'S CHOICE
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/menu" className="hover:text-primary transition-colors">Menu</Link>
            <Link href="/info" className="hover:text-primary transition-colors">Information</Link>
            <Link href="/orders" className="hover:text-primary transition-colors">Track Order</Link>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex flex-col items-end mr-4">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3"/> (555) 123-4567</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3"/> 123 Imperial St, Clayton</span>
          </div>

          <Link href="/account">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="w-5 h-5" />
            </Button>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10">
                <ShoppingCart className="w-5 h-5 text-primary" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[20px] h-5 bg-secondary text-secondary-foreground flex items-center justify-center text-[10px] border-2 border-background">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md p-0 overflow-hidden flex flex-col">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="font-headline text-xl">Your Royal Basket</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <CartContent />
              </div>
            </SheetContent>
          </Sheet>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="text-left font-headline">Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/menu" className="text-lg font-medium hover:text-primary">Menu</Link>
                  <Link href="/info" className="text-lg font-medium hover:text-primary">Restaurant Info</Link>
                  <Link href="/orders" className="text-lg font-medium hover:text-primary">My Orders</Link>
                  <Link href="/delivery" className="text-lg font-medium hover:text-primary">Delivery Services</Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
