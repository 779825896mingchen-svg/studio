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
      // Current + previous (fade) + next (preload); see map() below.
      setIdx((prev) => {
        setPrevIdx(prev);
        return (prev + 1) % images.length;
      });
    }, intervalMs);
    return () => clearInterval(t);
  }, [images.length, intervalMs]);

  const nextIdx = (idx + 1) % images.length;

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
        // Current + previous (crossfade) + next (hidden preload) so the next frame is decoded at full res.
        const shouldRender = i === idx || i === prevIdx || i === nextIdx;
        if (!shouldRender) return null;

        const isCurrent = i === idx;
        const isPrev = prevIdx !== null && i === prevIdx && !isCurrent;
        const zClass = isCurrent ? "z-[2]" : isPrev ? "z-[1]" : "z-0";

        return (
          <Image
            key={src}
            src={src}
            alt="Emperor's Choice featured dish"
            fill
            quality={100}
            // Full-bleed hero: match viewport width so 1080p (and 2×) requests ~3840px from the default srcset.
            sizes="100vw"
            loading={i === idx || i === nextIdx ? "eager" : "lazy"}
            priority={i === idx}
            className={[
              "object-cover object-center brightness-[0.7]",
              "transform-gpu [backface-visibility:hidden]",
              "transition-opacity duration-700 ease-in-out",
              zClass,
              isCurrent ? "opacity-100" : "opacity-0 pointer-events-none",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}

