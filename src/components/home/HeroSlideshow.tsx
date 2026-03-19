"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type HeroSlideshowProps = {
  intervalMs?: number;
  className?: string;
};

export function HeroSlideshow({ intervalMs = 5000, className }: HeroSlideshowProps) {
  const images = useMemo(
    () => ["/1.png", "/2.png", "/3.png", "/4.png", "/5.png"],
    []
  );

  const [idx, setIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  // If the caller already positions this container (e.g. `absolute inset-0`),
  // we shouldn't force `relative` as it can conflict with the intended layout.
  const rootClassName = className ?? "relative";

  useEffect(() => {
    const t = setInterval(() => {
      // Keep rerenders cheap by only mounting the current slide (+ previous for fade).
      setIdx((prev) => {
        setPrevIdx(prev);
        return (prev + 1) % images.length;
      });
    }, intervalMs);
    return () => clearInterval(t);
  }, [images.length, intervalMs]);

  return (
    <div
      className={rootClassName}
      onPointerDown={(e) => {
        if (e.pointerType !== "touch") return;
        touchStartX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (e.pointerType !== "touch") return;
        if (touchStartX.current === null) return;

        const dx = e.clientX - touchStartX.current;
        touchStartX.current = null;

        // Swipe threshold tuned for typical finger movement.
        if (Math.abs(dx) < 40) return;
        setIdx((prev) => {
          if (dx < 0) return (prev + 1) % images.length;
          return (prev - 1 + images.length) % images.length;
        });
      }}
    >
      {images.map((src, i) => {
        const shouldRender = i === idx || i === prevIdx;
        if (!shouldRender) return null;

        return (
          <Image
            key={src}
            src={src}
            alt="Emperor's Choice featured dish"
            fill
            // Request higher quality output; actual pixel sharpness is limited by source image resolution.
            quality={100}
            sizes="(max-width: 768px) 100vw, 1920px"
            loading={i === idx ? "eager" : "lazy"}
            priority={i === idx}
            className={[
              "object-cover brightness-[0.7]",
              "transition-opacity duration-700 ease-in-out",
              i === idx ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}

