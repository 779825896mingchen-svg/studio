"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Clock, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useLocale } from "@/contexts/locale-context";

export default function InfoPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto max-w-6xl px-4 py-12">
        <header className="mb-10 space-y-3 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
            {t("info.eyebrow")}
          </p>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
            {t("info.title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">{t("info.subtitle")}</p>
        </header>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-8">
            <Card className="flex flex-col overflow-hidden rounded-3xl border-border/60 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-primary">
                  <MapPin className="h-5 w-5 shrink-0" /> {t("info.ourLocation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-6 p-6 md:p-8">
                <div className="space-y-2">
                  <p className="text-xl font-bold">10125 US-70 BUS</p>
                  <p className="text-muted-foreground">Clayton, NC 27520</p>
                </div>

                <div className="group relative h-48 overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src="https://picsum.photos/seed/map/600/400"
                    alt={t("info.mapAlt")}
                    fill
                    unoptimized
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Button variant="secondary" size="sm" className="rounded-full" asChild>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=10125+US-70+BUS,+Clayton,+NC+27520"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("info.getDirections")}
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="flex flex-col overflow-hidden rounded-3xl border-border/60 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-primary">
                  <Clock className="h-5 w-5 shrink-0" /> {t("info.serviceHours")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 space-y-4 p-6 md:p-8">
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">{t("info.monday")}</span>
                    <span className="text-muted-foreground">{t("info.closed")}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">{t("info.tuesday")}</span>
                    <span className="text-muted-foreground">{t("info.hoursTueThu")}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">{t("info.wednesday")}</span>
                    <span className="text-muted-foreground">{t("info.hoursTueThu")}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">{t("info.thursday")}</span>
                    <span className="text-muted-foreground">{t("info.hoursTueThu")}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2 font-bold text-primary">
                    <span>{t("info.friday")}</span>
                    <span>{t("info.hoursFriSat")}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2 font-bold text-primary">
                    <span>{t("info.saturday")}</span>
                    <span>{t("info.hoursFriSat")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t("info.sunday")}</span>
                    <span className="text-muted-foreground">{t("info.hoursSun")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-3xl border-primary/20 bg-primary/5">
              <CardContent className="space-y-6 p-8 text-center md:space-y-8 md:p-12">
                <h3 className="font-headline text-2xl font-bold text-primary md:text-3xl">
                  {t("info.deliveryPartners")}
                </h3>
                <p className="mx-auto max-w-xl text-base text-muted-foreground md:text-lg">
                  {t("info.deliveryBody")}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                  <a
                    href="https://www.doordash.com/store/emperor's-choice-chinese-restaurant-clayton-555783/1534229/?pickup=false"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      className="rounded-2xl bg-[#FF3008] px-8 py-8 text-xl text-white shadow-xl shadow-[#FF3008]/20 hover:bg-[#FF3008]/90"
                    >
                      DoorDash <ExternalLink className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                  <a
                    href="https://www.ubereats.com/store/emperors-choice-chinese/LSvUUpr3XReBK4G-QPLLuw"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      className="rounded-2xl bg-[#06C167] px-8 py-8 text-xl text-white shadow-xl shadow-[#06C167]/20 hover:bg-[#06C167]/90"
                    >
                      UberEats <ExternalLink className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full">
            <Card className="overflow-hidden rounded-3xl border-border/60 bg-card shadow-lg">
              <CardContent className="space-y-6 p-6 md:space-y-8 md:p-8">
                <div className="space-y-1">
                  <h3 className="font-headline text-xl font-bold md:text-2xl">{t("info.contactUs")}</h3>
                  <p className="text-sm text-muted-foreground">{t("info.contactIntro")}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 rounded-2xl bg-muted/80 p-4">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t("info.directLine")}
                      </p>
                      <p className="text-lg font-bold">(919) 359-2288</p>
                    </div>
                  </div>

                  <Button asChild variant="secondary" className="w-full rounded-2xl">
                    <a href="tel:+19193592288">{t("info.callCta")}</a>
                  </Button>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold">
                    <Info className="h-4 w-4 shrink-0 text-secondary" /> {t("info.orderingInfo")}
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">• {t("info.pickupTimeInfo")}</li>
                    <li className="flex gap-2">• {t("info.paymentInfo")}</li>
                  </ul>
                </div>

                <Button asChild className="w-full rounded-2xl bg-primary hover:bg-primary/90">
                  <a href="/menu">{t("info.browseMenu")}</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
