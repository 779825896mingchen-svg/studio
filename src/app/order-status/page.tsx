"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  ChevronDown,
  Copy,
  Loader2,
  MapPin,
  Receipt,
  RefreshCcw,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/locale-context";
import { useBatchTranslate } from "@/hooks/use-batch-translate";

type Line = {
  name: string;
  quantity: number;
  price: number;
  instructions?: string;
  selectedVariant?: string;
};

type LookupOrder = {
  id: string;
  status: string;
  createdAt?: string;
  scheduledFor?: string | null;
  cart: Line[];
  totalPrice: number;
  tax: number;
  totalWithTax: number;
};

function formatEST(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function statusIndex(status: string, steps: readonly { status: string }[]): number {
  const i = steps.findIndex((s) => s.status === status);
  return i >= 0 ? i : 0;
}

export default function OrderStatusPage() {
  const { t, locale } = useLocale();
  const sp = useSearchParams();
  const router = useRouter();
  const claimFromUrl = (sp.get("orderId") ?? "").trim();

  const trackSteps = useMemo(
    () =>
      [
        { status: "Received" as const, label: t("orderStatus.stepReceived"), hint: t("orderStatus.stepReceivedHint") },
        { status: "Preparing" as const, label: t("orderStatus.stepPreparing"), hint: t("orderStatus.stepPreparingHint") },
        {
          status: "Ready for Pickup" as const,
          label: t("orderStatus.stepReady"),
          hint: t("orderStatus.stepReadyHint"),
        },
        { status: "Picked Up" as const, label: t("orderStatus.stepPickedUp"), hint: t("orderStatus.stepPickedUpHint") },
      ] as const,
    [t],
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [order, setOrder] = useState<LookupOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"id" | "link" | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(true);

  const orderLineTexts = useMemo(() => {
    if (!order?.cart?.length) return [];
    const s = new Set<string>();
    order.cart.forEach((l) => {
      if (l.name) s.add(l.name);
      if (l.selectedVariant?.trim()) s.add(l.selectedVariant.trim());
      if (l.instructions?.trim()) s.add(l.instructions.trim());
    });
    return [...s];
  }, [order]);

  const { resolve: resolveLine } = useBatchTranslate(orderLineTexts, locale);

  const loadRecent = useCallback(
    async (claim?: string, options?: { quiet?: boolean }) => {
      const quiet = options?.quiet === true;
      if (quiet) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const url = claim
          ? `/api/orders/recent?claim=${encodeURIComponent(claim)}`
          : "/api/orders/recent";
        const res = await fetch(url, { credentials: "include", cache: "no-store" });
        const data = (await res.json()) as { order: LookupOrder | null; error?: string };
        if (!res.ok) {
          setOrder(null);
          setError(
            data?.error ||
              (res.status === 404 ? t("orderStatus.errorNotFound") : t("orderStatus.errorLoad")),
          );
          if (claim) {
            toast({
              variant: "destructive",
              title: t("orderStatus.invalidLinkTitle"),
              description: t("orderStatus.invalidLinkDesc"),
            });
          }
          return;
        }
        setOrder(data.order ?? null);
        if (claim) {
          router.replace("/order-status", { scroll: false });
        }
      } catch {
        setOrder(null);
        setError(t("orderStatus.errorNetwork"));
      } finally {
        if (quiet) setRefreshing(false);
        else setLoading(false);
      }
    },
    [router, t],
  );

  useEffect(() => {
    void loadRecent(claimFromUrl || undefined);
  }, [claimFromUrl, loadRecent]);

  const currentStep = order ? statusIndex(order.status, trackSteps) : -1;
  const progressPct = order
    ? Math.round(((currentStep + 1) / trackSteps.length) * 100)
    : 0;

  const copyId = async () => {
    if (!order?.id) return;
    try {
      await navigator.clipboard.writeText(order.id);
      setCopied("id");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const shareTracking = async () => {
    if (!order?.id) return;
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/order-status?orderId=${encodeURIComponent(order.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: t("orderStatus.shareTitle"),
          text: t("orderStatus.shareText", { id: order.id }),
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied("link");
        setTimeout(() => setCopied(null), 2000);
      }
    } catch {
      /* user cancelled or denied */
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[min(420px,55vh)] bg-gradient-to-b from-primary/[0.07] via-secondary/[0.08] to-transparent"
          aria-hidden
        />
        <div className="relative container mx-auto max-w-2xl px-4 pb-16 pt-8 sm:pt-12">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15">
              <Receipt className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              {t("orderStatus.title")}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
              {t("orderStatus.subtitle")}
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              className="mt-8 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
            >
              {error}
            </div>
          ) : null}

          {loading ? (
            <div
              className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card/50 px-6 py-14 text-center"
              aria-live="polite"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">{t("orderStatus.loading")}</p>
            </div>
          ) : null}

          {!loading && !order && !error ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border/80 bg-muted/30 px-6 py-10 text-center">
              <Receipt className="mx-auto h-8 w-8 text-primary/80" />
              <p className="mt-3 font-headline text-lg font-semibold">{t("orderStatus.noOrderTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("orderStatus.noOrderBody")}</p>
              <Button asChild className="mt-6 rounded-xl bg-primary hover:bg-primary/90">
                <Link href="/menu">{t("orderStatus.orderFood")}</Link>
              </Button>
            </div>
          ) : null}

          {!loading && order ? (
            <div className="mt-10 space-y-6">
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                <div className="border-b border-border/50 bg-muted/30 px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("orderStatus.orderNumber")}
                      </p>
                      <p className="font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        {order.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("orderStatus.placed")} {formatEST(order.createdAt)}
                      </p>
                      {order.scheduledFor?.trim() ? (
                        <p className="flex items-center gap-1.5 pt-1 text-sm font-medium text-foreground">
                          <MapPin className="h-4 w-4 shrink-0 text-primary" />
                          {t("orderStatus.pickup")} {formatEST(order.scheduledFor)}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => void copyId()}
                      >
                        {copied === "id" ? (
                          <Check className="mr-1.5 h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="mr-1.5 h-4 w-4" />
                        )}
                        {copied === "id" ? t("orderStatus.copied") : t("orderStatus.copyId")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => void shareTracking()}
                      >
                        <Share2 className="mr-1.5 h-4 w-4" />
                        {copied === "link" ? t("orderStatus.linkCopied") : t("orderStatus.share")}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => void loadRecent(undefined, { quiet: true })}
                        disabled={refreshing}
                      >
                        <RefreshCcw className={cn("mr-1.5 h-4 w-4", refreshing && "animate-spin")} />
                        {t("orderStatus.refresh")}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-6 sm:px-6">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{t("orderStatus.progress")}</p>
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      {t("orderStatus.stepOf", { current: currentStep + 1, total: trackSteps.length })}
                    </span>
                  </div>
                  <Progress value={progressPct} className="mb-8 h-2 rounded-full bg-muted" />

                  <ol className="relative space-y-0">
                    {trackSteps.map((step, i) => {
                      const done = i < currentStep;
                      const active = i === currentStep;
                      const lineDone = i < currentStep;
                      return (
                        <li key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
                          {i < trackSteps.length - 1 ? (
                            <span
                              className={cn(
                                "absolute left-[15px] top-8 h-[calc(100%-0.5rem)] w-0.5 -translate-x-1/2 rounded-full",
                                lineDone ? "bg-primary" : "bg-border",
                              )}
                              aria-hidden
                            />
                          ) : null}
                          <div
                            className={cn(
                              "relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                              done &&
                                "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20",
                              active &&
                                "border-primary bg-primary/15 text-primary ring-4 ring-primary/10",
                              !done && !active && "border-border bg-card text-muted-foreground",
                            )}
                          >
                            {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : i + 1}
                          </div>
                          <div className="min-w-0 pt-0.5">
                            <p
                              className={cn(
                                "font-semibold leading-tight",
                                active && "text-primary",
                              )}
                            >
                              {step.label}
                            </p>
                            <p className="text-sm text-muted-foreground">{step.hint}</p>
                            {active ? (
                              <p className="mt-2 text-sm font-medium text-foreground">
                                {t("orderStatus.currentStatus")}{" "}
                                <span className="text-primary">{order.status}</span>
                              </p>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>

              <Collapsible open={receiptOpen} onOpenChange={setReceiptOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-card px-5 py-4 text-left shadow-sm transition hover:bg-muted/40 sm:px-6">
                  <div>
                    <p className="font-headline font-semibold">{t("orderStatus.receiptTitle")}</p>
                    <p className="text-sm text-muted-foreground">
                      {(order.cart?.length ?? 0) === 1
                        ? t("orderStatus.receiptSummary", {
                            count: order.cart?.length ?? 0,
                            total: money(order.totalWithTax ?? 0),
                          })
                        : t("orderStatus.receiptSummaryPlural", {
                            count: order.cart?.length ?? 0,
                            total: money(order.totalWithTax ?? 0),
                          })}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                      receiptOpen && "rotate-180",
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 overflow-hidden rounded-2xl border border-border/50 bg-muted/20">
                  <div className="p-5 sm:p-6">
                    <ul className="space-y-4">
                      {(order.cart ?? []).map((l, idx) => (
                        <li key={`${order.id}-${idx}`} className="text-sm">
                          <div className="flex justify-between gap-3">
                            <span className="min-w-0">
                              <span className="font-semibold text-foreground">{l.quantity}×</span>{" "}
                              <span className="break-words">{resolveLine(l.name)}</span>
                            </span>
                            <span className="shrink-0 font-medium tabular-nums text-foreground">
                              {money(l.price * l.quantity)}
                            </span>
                          </div>
                          {l.selectedVariant?.trim() ? (
                            <p className="mt-1 text-xs font-medium text-primary">
                              {resolveLine(l.selectedVariant.trim())}
                            </p>
                          ) : null}
                          {l.instructions?.trim() ? (
                            <p className="mt-1 text-xs italic text-muted-foreground line-clamp-2">
                              “{resolveLine(l.instructions.trim())}”
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    <Separator className="my-5" />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>{t("orderStatus.subtotal")}</span>
                        <span className="tabular-nums">{money(order.totalPrice ?? 0)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>{t("orderStatus.tax")}</span>
                        <span className="tabular-nums">{money(order.tax ?? 0)}</span>
                      </div>
                      <div className="flex justify-between border-t border-border/60 pt-3 text-base font-bold text-foreground">
                        <span>{t("orderStatus.total")}</span>
                        <span className="tabular-nums text-primary">
                          {money(order.totalWithTax ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <p className="text-center text-xs text-muted-foreground">
                {t("orderStatus.footerHint")}{" "}
                <Link href="/info" className="font-medium text-primary underline-offset-4 hover:underline">
                  {t("orderStatus.contactLocation")}
                </Link>
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
