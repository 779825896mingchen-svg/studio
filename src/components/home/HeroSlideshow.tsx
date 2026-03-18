"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type HeroSlideshowProps = {
  intervalMs?: number;
  className?: string;
};

export function HeroSlideshow({ intervalMs = 5000, className }: HeroSlideshowProps) {
  const images = useMemo(
    () => [
      "https://picsum.photos/seed/emperor-hero-1/2400/1400",
      "https://picsum.photos/seed/emperor-hero-2/2400/1400",
      "https://picsum.photos/seed/emperor-hero-3/2400/1400",
      "https://picsum.photos/seed/emperor-hero-4/2400/1400",
      "https://picsum.photos/seed/emperor-hero-5/2400/1400",
    ],
    []
  );

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [images.length, intervalMs]);

  return (
    <div className={className}>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt="Emperor's Choice featured dish"
          fill
          sizes="100vw"
          priority={i === 0}
          className={[
            "object-cover brightness-[0.7]",
            "transition-opacity duration-1000 ease-in-out",
            i === idx ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

