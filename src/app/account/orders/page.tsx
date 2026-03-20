"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type StoredOrder = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalWithTax?: number;
  createdAt?: string;
  status?: string;
};

export default function AccountOrdersPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/orders/me")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      })
      .catch(() => {
        if (!mounted) return;
        toast({
          variant: "destructive",
          title: "Could not load order history",
        });
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [toast]);

  const formatEST = (value?: string) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline font-bold">Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : orders.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    No orders yet. Place an order from the checkout to see it here.
                  </p>
                  <Button className="bg-primary hover:bg-primary/90 rounded-xl" onClick={() => (window.location.href = "/menu")}>
                    Browse Menu
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={o.id} className="border rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-bold truncate">{o.id}</p>
                        <p className="text-sm text-muted-foreground break-words">
                          {formatEST(o.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{o.status ?? "Received"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

