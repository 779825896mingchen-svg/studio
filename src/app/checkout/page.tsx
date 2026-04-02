"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Phone, User, MessageSquare, ShoppingBag, ArrowRight, Receipt, Clock, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getTodayDateString,
  getTimeSlotsForDate,
  isOpenToday,
} from "@/app/lib/store-hours";
import { useLocale } from "@/contexts/locale-context";
import { useBatchTranslate } from "@/hooks/use-batch-translate";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CheckoutPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { cart, totalPrice, totalItems, clearCart } = useCart();

  const checkoutTranslateKeys = useMemo(() => {
    const s = new Set<string>();
    cart.forEach((c) => {
      if (c.name) s.add(c.name);
      if (c.selectedVariant?.trim()) s.add(c.selectedVariant.trim());
      if (c.instructions?.trim()) s.add(c.instructions.trim());
    });
    return [...s];
  }, [cart]);
  const { resolve } = useBatchTranslate(checkoutTranslateKeys, locale);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [requests, setRequests] = useState("");
  const [orderTiming, setOrderTiming] = useState<"asap" | "scheduled">("asap");
  const [scheduleTime, setScheduleTime] = useState("");
  const [nameTouched, setNameTouched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { user?: { name?: string; email?: string; phone?: string } | null }) => {
        if (cancelled || !data?.user) return;
        const u = data.user;
        setName((prev) => prev.trim() || u.name?.trim() || "");
        setEmail((prev) => prev.trim() || u.email?.trim() || "");
        setPhoneDigits((prev) => {
          if (prev.length > 0) return prev;
          const digits = (u.phone || "").replace(/\D/g, "").slice(0, 10);
          return digits;
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
  const isValidName = name.trim().length > 0;

  const todayDateString = useMemo(() => getTodayDateString(), []);
  const todayDateObj = useMemo(() => new Date(todayDateString + "T12:00:00"), [todayDateString]);
  const timeSlots = useMemo(
    () => (orderTiming === "scheduled" && isOpenToday() ? getTimeSlotsForDate(todayDateObj) : []),
    [orderTiming, todayDateString]
  );
  const isScheduledValid =
    orderTiming === "asap" ||
    (orderTiming === "scheduled" && isOpenToday() && scheduleTime && timeSlots.some((s) => s.value === scheduleTime));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    const taxAmount = totalPrice * 0.08;
    const totalWithTaxAmount = totalPrice + taxAmount;

    let scheduledFor: string | null = null;
    if (orderTiming === "scheduled" && isOpenToday() && scheduleTime) {
      const [hours, minutes] = scheduleTime.split(":").map(Number);
      const d = new Date(todayDateString + "T12:00:00");
      d.setHours(hours, minutes, 0, 0);
      scheduledFor = d.toISOString();
    }

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phoneDigits,
          requests: requests.trim() || "",
          scheduledFor,
          cart: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            instructions: item.instructions || "",
            selectedSpice: item.selectedSpice,
            selectedVariant: item.selectedVariant,
          })),
          totalPrice,
          tax: taxAmount,
          totalWithTax: totalWithTaxAmount,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send order");
      }
      const data = (await res.json().catch(() => null)) as
        | { ok: true; orderId?: string; status?: string; createdAt?: string }
        | null;

      clearCart();
      toast({
        title: scheduledFor ? t("checkout.toastScheduled") : t("checkout.toastPlaced"),
        description: data?.orderId
          ? t("checkout.toastDescWithId", { id: data.orderId })
          : t("checkout.toastDescGeneric"),
      });
      router.push("/order-status");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
                {t("checkout.eyebrow")}
              </p>
              <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
                {t("checkout.title")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("checkout.subtitle")}</p>
            </div>
            <Badge className="w-fit bg-secondary text-secondary-foreground rounded-full px-4 py-1 text-xs font-semibold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              {totalItems} {totalItems === 1 ? t("checkout.item") : t("checkout.items")}{" "}
              {t("checkout.inBasket")}
            </Badge>
          </header>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-card rounded-3xl border border-border">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h2 className="font-headline text-2xl font-bold">{t("checkout.emptyTitle")}</h2>
              <p className="text-muted-foreground max-w-md">{t("checkout.emptyBody")}</p>
              <Button
                asChild
                className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6"
              >
                <a href="/menu">{t("checkout.browseMenu")}</a>
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2 items-start">
              {/* Left: Your Order – same structure as Guest Details */}
              <Card className="border-border/60 shadow-sm bg-card/95 rounded-3xl">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-primary" />
                      {t("checkout.yourOrder")}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {totalItems} {totalItems === 1 ? t("checkout.item") : t("checkout.items")}{" "}
                      {t("checkout.itemsFromKitchen")}
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <Card
                        key={item.uid}
                        className="rounded-xl border border-border overflow-hidden bg-background/50"
                      >
                        <CardContent className="p-0">
                          <div className="flex gap-3 p-3">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                              <Image
                                src={item.imageUrl}
                                alt={resolve(item.name)}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-headline font-semibold text-sm leading-tight">
                                  {resolve(item.name)}
                                </h3>
                                <span className="font-bold text-primary text-sm shrink-0">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                ×{item.quantity} @ ${item.price.toFixed(2)} {t("checkout.each")}
                              </p>
                              {item.selectedVariant && (
                                <p className="text-[11px] text-primary font-medium mt-1">
                                  {t("checkout.choice")} {resolve(item.selectedVariant.trim())}
                                </p>
                              )}
                              {item.instructions && (
                                <p className="text-[11px] text-muted-foreground italic mt-1 line-clamp-2">
                                  &ldquo;{resolve(item.instructions.trim())}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Right: Guest Details + Total Due */}
              <Card className="border-border/60 shadow-sm bg-card/95 rounded-3xl">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      {t("checkout.guestDetails")}
                    </h2>
                    <p className="text-xs text-muted-foreground">{t("checkout.guestDetailsHint")}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
                        {t("checkout.name")} <span className="text-[11px] text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g. Alex Chen"
                        className="h-11 rounded-xl"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => setNameTouched(true)}
                      />
                      {!isValidName && nameTouched && (
                        <p className="text-[11px] text-destructive">{t("checkout.nameRequired")}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
                        {t("checkout.email")} <span className="text-[11px] text-destructive">*</span>
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
                        <p className="text-[11px] text-destructive">{t("checkout.emailInvalid")}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
                        {t("checkout.phone")} <span className="text-[11px] text-destructive">*</span>
                        <Phone className="w-3 h-3 text-muted-foreground" />
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        placeholder="(919) 359-2288"
                        className="h-11 rounded-xl"
                        value={formattedPhone}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setPhoneDigits(digitsOnly);
                        }}
                      />
                      <p className="text-[11px] text-muted-foreground">{t("checkout.phoneHint")}</p>
                      {!isValidPhone && phoneDigits.length > 0 && (
                        <p className="text-[11px] text-destructive">{t("checkout.phoneInvalid")}</p>
                      )}
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div className="space-y-2">
                    <Label
                      htmlFor="requests"
                      className="text-sm font-medium flex items-center gap-1.5"
                    >
                      {t("checkout.specialRequests")}
                      <MessageSquare className="w-3 h-3 text-muted-foreground" />
                    </Label>
                    <Textarea
                      id="requests"
                      placeholder={t("checkout.requestsPlaceholder")}
                      className="min-h-[96px] rounded-2xl resize-none"
                      value={requests}
                      onChange={(e) => setRequests(e.target.value)}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      We&apos;ll do our best to honor every request. Some changes may affect pricing.
                    </p>
                  </div>

                  <Separator className="my-2" />

                  {/* Schedule ordering */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      When do you want your order?
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setOrderTiming("asap")}
                        className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 px-4 text-sm font-medium transition-colors ${
                          orderTiming === "asap"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted/50 text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        {t("checkout.pickupAsap")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderTiming("scheduled")}
                        className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 px-4 text-sm font-medium transition-colors ${
                          orderTiming === "scheduled"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted/50 text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule for later
                      </button>
                    </div>
                    {orderTiming === "scheduled" && (
                      <div className="pt-2">
                        {!isOpenToday() ? (
                          <p className="text-sm text-muted-foreground py-2">
                            {t("checkout.closedTodaySchedule")}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <Label htmlFor="schedule-time" className="text-xs font-medium text-muted-foreground">
                              Pick-up time today <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={scheduleTime}
                              onValueChange={setScheduleTime}
                              disabled={timeSlots.length === 0}
                            >
                              <SelectTrigger id="schedule-time" className="h-11 rounded-xl">
                                <SelectValue placeholder={t("checkout.selectTimePlaceholder")} />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((slot) => (
                                  <SelectItem key={slot.value} value={slot.value}>
                                    {slot.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground">{t("checkout.sameDayTimesHint")}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator className="my-2" />

                  {/* Total Due with Guest Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("checkout.estimatedTax")}</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border text-base font-bold">
                      <span>{t("checkout.totalDue")}</span>
                      <span className="text-primary">${totalWithTax.toFixed(2)}</span>
                    </div>
                  </div>

                  {submitError && (
                    <p className="text-sm text-destructive text-center bg-destructive/10 rounded-xl py-2 px-3">
                      {submitError}
                    </p>
                  )}

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base md:text-lg rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                    onClick={handlePlaceOrder}
                    disabled={!isValidName || !isValidEmail || !isValidPhone || !isScheduledValid || cart.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? "Sending order…" : "Place  Order"}
                    {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                  </Button>

                  <p className="text-[11px] text-muted-foreground text-center">{t("checkout.policyAgreement")}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

