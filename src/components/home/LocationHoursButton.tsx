"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const TARGET_ID = "location-hours";

export function LocationHoursButton() {
  const pathname = usePathname();
  const router = useRouter();

  const scrollToTarget = () => {
    const el = document.getElementById(TARGET_ID);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    // If we navigated here from elsewhere, we can optionally trigger the scroll once mounted.
    const w = window as any;
    if (!w.__scrollToLocationHours) return;
    w.__scrollToLocationHours = false;
    // Let layout settle before scrolling.
    requestAnimationFrame(() => scrollToTarget());
  }, []);

  return (
    <Button
      size="lg"
      variant="outline"
      className="bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20 px-8 py-7 text-xl rounded-xl"
      onClick={() => {
        if (pathname === "/" || pathname === "/home") {
          scrollToTarget();
          return;
        }

        // Otherwise: go to home, then scroll after mount.
        (window as any).__scrollToLocationHours = true;
        router.push("/home");
      }}
    >
      Location & Hours
    </Button>
  );
}

