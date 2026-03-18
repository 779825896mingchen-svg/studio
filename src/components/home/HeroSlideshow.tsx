"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type HeroSlideshowProps = {
  intervalMs?: number;
  className?: string;
};

export function HeroSlideshow({ intervalMs = 5000, className }: HeroSlideshowProps) {
  const images = useMemo(
    () => ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.png"],
    []
  );

  const [idx, setIdx] = useState(0);

  // If the caller already positions this container (e.g. `absolute inset-0`),
  // we shouldn't force `relative` as it can conflict with the intended layout.
  const rootClassName = className ?? "relative";

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [images.length, intervalMs]);

  return (
    <div className={rootClassName}>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt="Emperor's Choice featured dish"
          fill
          quality={100}
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

