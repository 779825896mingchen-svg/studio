
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, Menu as MenuIcon, Phone, MapPin, LogOut } from 'lucide-react';
import { signOut as nextAuthSignOut } from "next-auth/react";
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Sheet, SheetClose, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CartContent } from '@/components/cart/CartContent';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export type NavbarUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: "admin" | "customer";
  image?: string | null;
  provider?: "local" | "google";
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

export function Navbar() {
  const { totalItems, isCartOpen, setIsCartOpen } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<NavbarUser | null>(null);

  const handleMobileNavigate = (path: string) => {
    setIsCartOpen(false);
    setMobileNavOpen(false);
    window.setTimeout(() => {
      router.push(path);
    }, 140);
  };

  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname, setIsCartOpen]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setAuthLoading(true);
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await res.json()) as { user: NavbarUser | null };
        if (!mounted) return;
        setUser(data.user ?? null);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/local-signout", { method: "POST" });
      await nextAuthSignOut({ redirect: false });
    } finally {
      setUser(null);
      router.push("/menu");
    }
  };

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
                unoptimized
                loading="eager"
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

          <div className="hidden lg:flex items-center gap-2">
            {authLoading ? null : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    className="rounded-full px-1.5 h-9 w-9 p-0 border border-border/70 bg-muted text-foreground hover:bg-muted/80 overflow-hidden"
                    aria-label="Account menu"
                  >
                    <Avatar className="h-8 w-8">
                      {user.image ? (
                        <AvatarImage src={user.image} alt="" className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                        {initialsFromName(user.name || user.email || "?")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">Manage Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">Order History</Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/menu">Admin Menu</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      void handleSignOut();
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  asChild
                  className="rounded-full px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                  <Link href="/signin" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  className="rounded-full px-4 border border-border/70 bg-muted text-foreground hover:bg-muted/80"
                >
                  <Link href="/signup" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </Button>
              </>
            )}
          </div>

          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
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
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 overflow-hidden flex flex-col">
                <div className="p-6 border-b">
                  <SheetTitle className="text-left font-headline">Navigation</SheetTitle>
                </div>

                <div className="flex flex-col gap-4 mt-8 px-6 pb-8">
                  <button
                    type="button"
                    className="text-left text-lg font-medium hover:text-primary"
                    onClick={() => handleMobileNavigate('/home')}
                  >
                    Home
                  </button>
                  <button
                    type="button"
                    className="text-left text-lg font-medium hover:text-primary"
                    onClick={() => handleMobileNavigate('/menu')}
                  >
                    Menu
                  </button>
                  <button
                    type="button"
                    className="text-left text-lg font-medium hover:text-primary"
                    onClick={() => handleMobileNavigate('/info')}
                  >
                    Restaurant Info
                  </button>
                  {user ? (
                    <>
                      <button
                        type="button"
                        className="text-left text-lg font-medium hover:text-primary"
                        onClick={() => handleMobileNavigate('/account')}
                      >
                        Account
                      </button>
                      <button
                        type="button"
                        className="text-left text-lg font-medium text-destructive"
                        onClick={() => {
                          setMobileNavOpen(false);
                          void handleSignOut();
                        }}
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="text-left text-lg font-medium hover:text-primary"
                      onClick={() => handleMobileNavigate('/signin')}
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
