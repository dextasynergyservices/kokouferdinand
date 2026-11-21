"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Relevo & Vinco–inspired tactile Sleeve & Tray artwork plate:
 * - Recessed debossed board well (.relief-well)
 * - Scroll-scrubbed GSAP tray reveal + gentle photographic settle (scale 1.14 -> 1.0)
 * - Subtle cursor-driven studio raking light on desktop hover (zero WebGL Clock overhead)
 */
export function LivingArtworkPlane({
  imageUrl,
  alt,
  aspectClass = "aspect-[4/5]",
  plateLabel,
  year,
}: {
  imageUrl?: string | null;
  alt: string;
  aspectClass?: string;
  plateLabel?: string;
  year?: number;
}) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const trayRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [lightPos, setLightPos] = useState<{ x: number; y: number; active: boolean }>({
    x: 50,
    y: 50,
    active: false,
  });

  useGSAP(
    () => {
      if (
        !outerRef.current ||
        !trayRef.current ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: outerRef.current,
          start: "top 92%",
          end: "center 48%",
          scrub: 0.7,
        },
      });

      tl.fromTo(
        trayRef.current,
        { y: 26, scale: 0.96 },
        { y: 0, scale: 1, ease: "power2.out", duration: 1 },
        0,
      );

      if (imgRef.current) {
        tl.fromTo(imgRef.current, { scale: 1.14 }, { scale: 1, ease: "none", duration: 1 }, 0);
      }
    },
    { scope: outerRef },
  );

  if (!imageUrl) {
    return (
      <div
        ref={outerRef}
        className={`relief-well relative flex ${aspectClass} w-full flex-col justify-between overflow-hidden bg-board-200/80 p-6 transition-colors duration-500`}
      >
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-ink-600">
          <span>{plateLabel ?? "Plate"}</span>
          {year ? <span>{year}</span> : null}
        </div>
        <div className="my-auto border-y border-ink-950/12 py-6 text-center">
          <p className="debossed-heading font-serif text-xl font-light italic text-ink-800">
            {alt}
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
          Atelier Makouvia
        </p>
      </div>
    );
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Decorative cursor-reactive studio lighting surface; navigation is handled by parent Link.
    <div
      ref={outerRef}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setLightPos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
          active: true,
        });
      }}
      onMouseLeave={() => setLightPos((prev) => ({ ...prev, active: false }))}
      className={`relief-well relative ${aspectClass} w-full overflow-hidden bg-board-200/75 p-2.5 sm:p-3.5`}
    >
      <div
        ref={trayRef}
        className="relief-raised relative h-full w-full overflow-hidden bg-board-100"
      >
        {/* biome-ignore lint/performance/noImgElement: Dynamic artwork plate inside scroll-scrubbed tray. */}
        <img
          ref={imgRef}
          src={imageUrl}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />

        {/* Raking warm studio light on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: lightPos.active ? 1 : 0,
            background: `radial-gradient(circle 340px at ${lightPos.x}% ${lightPos.y}%, rgba(247, 232, 210, 0.24), transparent 72%)`,
          }}
        />
      </div>
    </div>
  );
}
