"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import type { NavbarUser } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Mail,
  Phone,
  Shield,
  Package,
  Settings,
  Sparkles,
} from "lucide-react";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

export default function AccountPage() {
  const [user, setUser] = useState<NavbarUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { user: NavbarUser | null }) => {
        if (!mounted) return;
        setUser(data.user ?? null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Subtle top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-primary" />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">Your account</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage your profile, orders, and preferences in one place.
            </p>
          </div>

          {loading ? (
            <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
              <CardContent className="p-8 flex items-center gap-3 text-muted-foreground">
                <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-56 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ) : user ? (
            <>
              {/* Profile hero */}
              <Card className="rounded-2xl border-border/60 shadow-md overflow-hidden">
                <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-6 py-8 md:px-8 md:py-10">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background shadow-lg ring-2 ring-primary/20">
                      {user.image ? (
                        <AvatarImage src={user.image} alt="" className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-primary/15 text-primary text-3xl font-headline font-bold">
                        {initialsFromName(user.name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl md:text-3xl font-headline font-bold truncate">{user.name}</h2>
                        {user.role === "admin" && (
                          <Badge variant="secondary" className="rounded-full font-semibold">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground flex items-center gap-2 text-sm break-all">
                        <Mail className="w-4 h-4 shrink-0" />
                        {user.email}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {user.provider === "google" ? (
                          <Badge variant="outline" className="rounded-full gap-1.5 font-normal">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            Signed in with Google
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-full gap-1.5 font-normal">
                            <Shield className="w-3.5 h-3.5" />
                            Email account
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="rounded-2xl border-border/60 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-headline flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      Contact details
                    </CardTitle>
                    <CardDescription>How we reach you about your orders</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Phone</p>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        {user.phone?.trim() ? user.phone : "Not set"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Update your phone at checkout or contact us if you need to change it on file.
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-border/60 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-headline flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Quick links
                    </CardTitle>
                    <CardDescription>Orders and admin tools</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-between rounded-xl h-auto py-3 px-4 font-normal"
                      asChild
                    >
                      <Link href="/account/orders">
                        <span className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-primary" />
                          Order history
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    </Button>
                    {user.role === "admin" && (
                      <Button
                        variant="outline"
                        className="w-full justify-between rounded-xl h-auto py-3 px-4 font-normal"
                        asChild
                      >
                        <Link href="/admin/menu">
                          <span className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-primary" />
                            Admin menu
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </Link>
                      </Button>
                    )}
                    <Separator className="my-2" />
                    <Button className="w-full rounded-xl bg-primary hover:bg-primary/90" asChild>
                      <Link href="/menu">Browse menu</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="rounded-2xl border-border/60 shadow-sm max-w-md mx-auto">
              <CardHeader className="text-center pb-2">
                <CardTitle className="font-headline text-xl">You&apos;re not signed in</CardTitle>
                <CardDescription>Sign in to view your account and order history.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-2">
                <Button className="rounded-xl bg-primary hover:bg-primary/90" asChild>
                  <Link href="/signin">Sign in</Link>
                </Button>
                <Button variant="outline" className="rounded-xl" asChild>
                  <Link href="/signup">Create an account</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
