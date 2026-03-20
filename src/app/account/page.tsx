"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type UserSummary = { id: string; name: string; email: string; phone?: string; role?: "admin" | "customer" } | null;

export default function AccountPage() {
  const [user, setUser] = useState<UserSummary>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
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
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline font-bold">Manage Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : user ? (
                <>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-semibold">{user.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold break-words">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">{user.phone || "—"}</p>
                  </div>
                  {user.role === "admin" && (
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => {
                        window.location.href = "/admin/menu";
                      }}
                    >
                      Open Admin Menu
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      window.location.href = "/account/orders";
                    }}
                  >
                    View Order History
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground">You are not signed in.</p>
                  <Button className="bg-primary hover:bg-primary/90 rounded-xl" onClick={() => (window.location.href = "/signin")}>
                    Sign In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

