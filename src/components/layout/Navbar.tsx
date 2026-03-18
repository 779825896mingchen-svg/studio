
"use client";

import Link from 'next/link';
import Image from "next/image";
import { ShoppingCart, User, Menu as MenuIcon, Phone, MapPin, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CartContent } from '@/components/cart/CartContent';

export function Navbar() {
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary">
              <Image
                src="https://img.cdn4dd.com/p/fit=contain,width=100,height=100,format=auto,quality=95/media/restaurant/cover_square/eeb136ba-d013-40ae-b212-2d2c89511c4a.png"
                alt="Emperor's Choice"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <span className="font-headline text-2xl font-bold tracking-tight text-primary hidden sm:block">
              EMPEROR'S CHOICE
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/menu" className="hover:text-primary transition-colors">Menu</Link>
            <Link href="/info" className="hover:text-primary transition-colors">Information</Link>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex flex-col items-end mr-4">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3"/> (919) 359-2288</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3"/> 10125 US-70 BUS, Clayton, NC 27520</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Button
              asChild
              className="rounded-full h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <Link href="/signin" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                <span className="font-semibold">Sign In</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="rounded-full h-9 px-4 bg-muted text-foreground hover:bg-muted/80 border border-border shadow-sm"
            >
              <Link href="/signup" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span className="font-semibold">Sign Up</span>
              </Link>
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full bg-[#ff3008] hover:bg-[#e22a06] px-3 py-1.5 flex items-center justify-center"
              >
                <div className="flex items-center gap-1 text-white">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-xs font-semibold">
                    {totalItems}
                  </span>
                </div>
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
                  <Link href="/delivery" className="text-lg font-medium hover:text-primary">Delivery Services</Link>
                  <div className="pt-4 border-t border-border/60 flex flex-col gap-3">
                    <Link href="/signin" className="text-lg font-medium hover:text-primary">Sign In</Link>
                    <Link href="/signup" className="text-lg font-medium hover:text-primary">Sign Up</Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
