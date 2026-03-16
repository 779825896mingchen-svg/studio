 "use client";

import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Phone, User, MessageSquare, ShoppingBag, ArrowRight } from "lucide-react";

export default function CheckoutPage() {
  const { cart, totalPrice, totalItems, clearCart } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [requests, setRequests] = useState("");

  const formattedPhone = useMemo(() => {
    const digits = phoneDigits;
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 10);

    if (digits.length <= 3) return part1;
    if (digits.length <= 6) return `(${part1}) ${part2}`;
    return `(${part1}) ${part2}-${part3}`;
  }, [phoneDigits]);

  const isValidPhone = phoneDigits.length === 10;
  const isValidEmail = /\S+@\S+\.\S+/.test(email);

  const handlePlaceOrder = () => {
    // For now, just log and clear cart. Hook up to backend later.
    console.log("Placing order", {
      name,
      email,
      phone: phoneDigits,
      requests,
      cart,
    });
    clearCart();
    alert("Your royal order has been placed! (demo)");
  };

  const tax = totalPrice * 0.08;
  const totalWithTax = totalPrice + tax;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Emperor&apos;s Choice
              </p>
              <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
                Royal Checkout
              </h1>
              <p className="text-sm text-muted-foreground">
                Review your basket and share your details so our kitchen can begin your feast.
              </p>
            </div>
            <Badge className="w-fit bg-secondary text-secondary-foreground rounded-full px-4 py-1 text-xs font-semibold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              {totalItems} item{totalItems === 1 ? "" : "s"} in basket
            </Badge>
          </header>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-card rounded-3xl border border-border">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h2 className="font-headline text-2xl font-bold">Your basket is empty</h2>
              <p className="text-muted-foreground max-w-md">
                Add a few imperial favorites from the menu before you return to the throne room.
              </p>
              <Button
                asChild
                className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6"
              >
                <a href="/menu">Browse Menu</a>
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] items-start">
              {/* Left column: customer details */}
              <Card className="border-border/60 shadow-sm bg-card/95 rounded-3xl">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Guest Details
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      So we can reach you if the kitchen has any questions.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
                        Name <span className="text-[11px] text-muted-foreground font-normal">(optional)</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g. Alex Chen"
                        className="h-11 rounded-xl"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
                        Email <span className="text-[11px] text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="h-11 rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      {!isValidEmail && email.length > 0 && (
                        <p className="text-[11px] text-destructive">
                          Please enter a valid email address.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
                        Phone Number <span className="text-[11px] text-destructive">*</span>
                        <Phone className="w-3 h-3 text-muted-foreground" />
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        placeholder="(555) 123-4567"
                        className="h-11 rounded-xl"
                        value={formattedPhone}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setPhoneDigits(digitsOnly);
                        }}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Numbers only. We&apos;ll only call if there&apos;s an issue with your order.
                      </p>
                      {!isValidPhone && phoneDigits.length > 0 && (
                        <p className="text-[11px] text-destructive">
                          Please enter a 10-digit phone number.
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div className="space-y-2">
                    <Label
                      htmlFor="requests"
                      className="text-sm font-medium flex items-center gap-1.5"
                    >
                      Special Requests
                      <MessageSquare className="w-3 h-3 text-muted-foreground" />
                    </Label>
                    <Textarea
                      id="requests"
                      placeholder="Allergies, sauce on the side, extra spice, pickup time preferences..."
                      className="min-h-[96px] rounded-2xl resize-none"
                      value={requests}
                      onChange={(e) => setRequests(e.target.value)}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      We&apos;ll do our best to honor every request. Some changes may affect pricing.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Right column: order summary */}
              <div className="space-y-4">
                <Card className="border-border/60 shadow-md bg-card/95 rounded-3xl">
                  <CardContent className="p-6 md:p-7 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-headline font-bold">Order Summary</h2>
                        <p className="text-xs text-muted-foreground">
                          {totalItems} dish{totalItems === 1 ? "" : "es"} from the imperial kitchen
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div
                          key={`${item.id}-${item.instructions}-${item.selectedSpice}`}
                          className="flex items-start justify-between gap-3 rounded-2xl bg-muted/60 px-3 py-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-muted-foreground">
                                ×{item.quantity}
                              </span>
                              <p className="text-sm font-medium">{item.name}</p>
                            </div>
                            {item.selectedSpice !== undefined && (
                              <p className="text-[11px] text-primary">
                                Spice Level: {item.selectedSpice}
                              </p>
                            )}
                            {item.instructions && (
                              <p className="text-[11px] text-muted-foreground italic line-clamp-1">
                                “{item.instructions}”
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-primary">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated tax</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border text-base font-bold">
                        <span>Total due</span>
                        <span className="text-primary">${totalWithTax.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base md:text-lg rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                      onClick={handlePlaceOrder}
                      disabled={!isValidEmail || !isValidPhone || cart.length === 0}
                    >
                      Place Royal Order
                      <ArrowRight className="w-4 h-4" />
                    </Button>

                    <p className="text-[11px] text-muted-foreground text-center">
                      By placing your order you agree to our house policies on substitutions, allergies, and
                      preparation time.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

