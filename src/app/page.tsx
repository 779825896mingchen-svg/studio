"use client";

import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, MapPin, ExternalLink } from "lucide-react";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { LocationHoursButton } from "@/components/home/LocationHoursButton";
import { useLocale } from "@/contexts/locale-context";

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}
    >
      {children}
    </span>
  );
}

export default function Home() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative flex h-[80vh] items-center justify-center overflow-hidden">
        <HeroSlideshow className="absolute inset-0 z-0" intervalMs={5000} />

        <div className="container relative z-10 mx-auto max-w-4xl space-y-8 px-4 text-center">
          <div className="space-y-4 duration-700 animate-in fade-in slide-in-from-bottom-4">
            <Badge className="mb-4 rounded-full bg-secondary px-4 py-1 text-xs font-bold uppercase tracking-widest text-secondary-foreground">
              {t("home.heroBadge")}
            </Badge>
            <h1 className="font-headline text-5xl font-bold tracking-tight text-white md:text-7xl">
              {t("home.heroTitle")}{" "}
              <span className="text-secondary">{t("home.heroTitleAccent")}</span>
            </h1>
            <p className="mx-auto max-w-2xl font-body text-xl leading-relaxed text-white/90 md:text-2xl">
              {t("home.heroSubtitle")}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 duration-700 delay-200 animate-in fade-in slide-in-from-bottom-8 sm:flex-row">
            <Link href="/menu">
              <Button
                size="lg"
                className="group rounded-xl bg-primary px-8 py-7 text-xl text-primary-foreground shadow-xl shadow-primary/30 hover:bg-primary/90"
              >
                {t("home.browseMenu")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <LocationHoursButton />
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white shadow-lg shadow-black/10 backdrop-blur-md">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Clock className="h-5 w-5 text-secondary" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-bold uppercase tracking-wider text-white/75">
                  {t("home.pickupReady")}
                </p>
                <p className="text-base font-bold">{t("home.pickupMinutes")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 flex flex-col items-center justify-between gap-12 md:flex-row">
            <div className="max-w-xl">
              <h2 className="mb-6 font-headline text-4xl font-bold text-primary">
                {t("home.qualityHeading")}
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">{t("home.qualityBody")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="group relative h-80 overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl">
              <Image
                src="https://picsum.photos/seed/chicken/600/400"
                alt={t("home.featuredDishes")}
                fill
                unoptimized
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                data-ai-hint="chinese dish"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
                <h3 className="mb-2 font-headline text-2xl font-bold text-white">{t("home.featuredDishes")}</h3>
                <p className="mb-4 text-sm text-white/70">{t("home.featuredDishesDesc")}</p>
                <Link href="/menu?cat=Chef's Specials">
                  <Button variant="secondary" size="sm" className="w-fit">
                    {t("common.explore")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="group relative h-80 overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl">
              <Image
                src="https://picsum.photos/seed/dimsum/600/400"
                alt={t("home.dimSum")}
                fill
                unoptimized
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                data-ai-hint="dim sum"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
                <h3 className="mb-2 font-headline text-2xl font-bold text-white">{t("home.dimSum")}</h3>
                <p className="mb-4 text-sm text-white/70">{t("home.dimSumDesc")}</p>
                <Link href="/menu?cat=Appetizers">
                  <Button variant="secondary" size="sm" className="w-fit">
                    {t("common.explore")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="group relative h-80 overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl">
              <Image
                src="https://picsum.photos/seed/friedrice/600/400"
                alt={t("home.riceNoodles")}
                fill
                unoptimized
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                data-ai-hint="fried rice"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
                <h3 className="mb-2 font-headline text-2xl font-bold text-white">{t("home.riceNoodles")}</h3>
                <p className="mb-4 text-sm text-white/70">{t("home.riceNoodlesDesc")}</p>
                <Link href="/menu?cat=Rice & Noodles">
                  <Button variant="secondary" size="sm" className="w-fit">
                    {t("common.explore")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="location-hours"
        className="container mx-auto scroll-mt-24 px-4 py-24"
      >
        <div className="relative flex flex-col items-center justify-between gap-12 overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground md:flex-row md:p-16">
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative z-10 max-w-xl space-y-6">
            <h2 className="font-headline text-4xl font-bold md:text-5xl">{t("home.locationSectionTitle")}</h2>
            <p className="text-xl leading-relaxed text-primary-foreground/80">
              {t("home.locationSectionBody")}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="https://www.doordash.com/store/emperor's-choice-chinese-restaurant-clayton-555783/1534229/?pickup=false"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="rounded-xl bg-white px-6 py-6 font-bold text-[#FF3008] hover:bg-white/90">
                  {t("home.orderDoorDash")} <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a
                href="https://www.ubereats.com/store/emperors-choice-chinese/LSvUUpr3XReBK4G-QPLLuw"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="rounded-xl bg-[#06C167] px-6 py-6 font-bold text-white hover:bg-[#06C167]/90">
                  {t("home.orderUberEats")} <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>

          <div className="relative z-10 w-full max-w-full space-y-6 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl sm:p-8 md:w-auto">
            <div className="flex items-center gap-4">
              <MapPin className="h-6 w-6 shrink-0 text-secondary" />
              <div>
                <p className="font-bold">{t("home.claytonLocation")}</p>
                <p className="text-sm opacity-80">{t("home.address")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="h-6 w-6 shrink-0 text-secondary" />
              <div>
                <p className="font-bold">{t("home.openingHours")}</p>
                <p className="text-sm opacity-80">{t("home.hoursMon")}</p>
                <p className="text-sm opacity-80">{t("home.hoursTueThu")}</p>
                <p className="text-sm opacity-80">{t("home.hoursFriSat")}</p>
                <p className="text-sm opacity-80">{t("home.hoursSun")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
