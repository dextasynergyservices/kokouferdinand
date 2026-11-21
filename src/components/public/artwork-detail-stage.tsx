"use client";

import { Box, Expand, Image as ImageIcon, Ruler } from "lucide-react";
import { useMemo, useState } from "react";
import { DeepZoomViewer } from "@/components/public/deep-zoom-viewer";
import { SculptureStage } from "@/components/three/sculpture-stage";

export type StageMediaItem = {
  id: string;
  url: string;
  alt: string;
};

function parseDimensionsCm(raw: string): { heightCm: number; widthCm: number } | null {
  const matches = raw.match(/\d+(?:[.,]\d+)?/g);
  if (!matches || matches.length < 2) return null;
  const nums = matches.map((m) => Number.parseFloat(m.replace(",", "."))).filter((n) => n > 0);
  if (nums.length < 2) return null;
  // Standard art convention: Height × Width (× Depth)
  return {
    heightCm: Math.min(400, Math.max(18, nums[0] ?? 100)),
    widthCm: Math.min(950, Math.max(18, nums[1] ?? 80)),
  };
}

export function ArtworkDetailStage({
  title,
  year,
  dimensions,
  media,
  model3dUrl,
  labels,
}: {
  title: string;
  year: number;
  dimensions: string;
  media: StageMediaItem[];
  model3dUrl?: string | null;
  labels: {
    explore3d: string;
    viewPhotography: string;
    deepZoom: string;
  };
}) {
  const [mode, setMode] = useState<"3d" | "photo" | "room">(model3dUrl ? "3d" : "photo");
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const activeImage = media[activeIndex] ?? media[0];
  const parsedDims = useMemo(() => parseDimensionsCm(dimensions), [dimensions]);

  // Compute proportional pixel height for Room View (175 cm human = 220px reference height)
  const humanPx = 220;
  const pxPerCm = humanPx / 175;
  const workHeightPx = parsedDims
    ? Math.min(290, Math.max(52, Math.round(parsedDims.heightCm * pxPerCm)))
    : 150;

  return (
    <div className="space-y-4">
      <div className="relief-well relative overflow-hidden bg-board-200/80">
        {/* Top gallery ruler bar */}
        <div className="flex items-center justify-between border-b border-ink-950/12 bg-board-100/70 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-600 sm:px-6">
          <span className="truncate">
            {title} · {year}
          </span>
          <span className="hidden shrink-0 sm:inline">{dimensions}</span>
        </div>

        {/* Main Exhibition Stage */}
        {mode === "3d" && model3dUrl ? (
          <SculptureStage modelUrl={model3dUrl} exploreLabel={labels.explore3d} />
        ) : mode === "room" && activeImage ? (
          <div className="relative flex min-h-[48vh] flex-col justify-end overflow-hidden bg-gradient-to-b from-board-100 via-board-100 to-board-200/90 px-6 pt-12 pb-10 sm:min-h-[62vh] sm:px-12">
            {/* Subtle architectural wall light */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(ellipse 65% 50% at 50% 25%, rgba(255,252,245,0.85), transparent 75%)",
              }}
            />

            <div className="relative mx-auto flex w-full max-w-4xl items-end justify-center gap-8 border-b border-ink-950/25 pb-0 sm:gap-16">
              {/* Quiet 175 cm human architectural silhouette */}
              <div className="flex flex-col items-center">
                <svg
                  viewBox="0 0 60 175"
                  style={{ height: `${humanPx}px` }}
                  className="w-auto fill-ink-950/18"
                  aria-hidden="true"
                >
                  <circle cx="30" cy="14" r="9.5" />
                  <path d="M18 30 C18 26 42 26 42 30 L46 84 L40 85 L38 50 L36 100 L40 175 L32 175 L30 118 L28 175 L20 175 L24 100 L22 50 L20 85 L14 84 Z" />
                </svg>
                <span className="mt-2 pb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-400">
                  175 cm
                </span>
              </div>

              {/* Artwork rendered in proportional scale */}
              <div className="mb-10 flex flex-col items-center">
                <div className="relief-raised bg-board-50 p-1.5">
                  {/* biome-ignore lint/performance/noImgElement: Proportional scale room view plate. */}
                  <img
                    src={activeImage.url}
                    alt={activeImage.alt || title}
                    style={{ height: `${workHeightPx}px` }}
                    className="w-auto max-w-[58vw] object-contain sm:max-w-[460px]"
                  />
                </div>
                <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-oxide">
                  {dimensions}
                </span>
              </div>
            </div>

            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
              Scale Reference · 175 cm
            </p>
          </div>
        ) : activeImage ? (
          <div className="group relative flex min-h-[46vh] items-center justify-center p-5 sm:min-h-[62vh] sm:p-10 lg:min-h-[72vh] lg:p-14">
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              aria-label={`${labels.deepZoom}: ${activeImage.alt || title}`}
              className="relief-raised cursor-zoom-in bg-board-50 p-2 transition-transform duration-700 ease-out hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxide sm:p-3"
            >
              {/* biome-ignore lint/performance/noImgElement: Museum-grade full-bleed artwork photograph. */}
              <img
                src={activeImage.url}
                alt={activeImage.alt || title}
                className="max-h-[66vh] w-auto object-contain"
              />
            </button>

            <DeepZoomViewer
              src={activeImage.url}
              alt={activeImage.alt || title}
              open={zoomOpen}
              onClose={() => setZoomOpen(false)}
            />
          </div>
        ) : (
          <div className="flex min-h-[48vh] flex-col justify-between p-8 sm:p-14">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-400">
              Archival Plate
            </span>
            <p className="my-auto text-center font-serif text-3xl font-light italic text-ink-800 sm:text-5xl">
              {title}
            </p>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
              Atelier Makouvia · {year}
            </span>
          </div>
        )}

        {/* Bottom Architectural Control Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-950/10 bg-board-50/75 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            {model3dUrl ? (
              <button
                type="button"
                onClick={() => setMode("3d")}
                className={
                  mode === "3d"
                    ? "inline-flex items-center gap-1.5 border border-ink-950 bg-ink-950 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-board-50"
                    : "inline-flex items-center gap-1.5 border border-ink-950/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-600 hover:border-oxide hover:text-oxide"
                }
              >
                <Box className="size-3.5" />
                3D
              </button>
            ) : null}

            {activeImage ? (
              <>
                <button
                  type="button"
                  onClick={() => setMode("photo")}
                  className={
                    mode === "photo"
                      ? "inline-flex items-center gap-1.5 border border-ink-950 bg-ink-950 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-board-50"
                      : "inline-flex items-center gap-1.5 border border-ink-950/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-600 hover:border-oxide hover:text-oxide"
                  }
                >
                  <ImageIcon className="size-3.5" />
                  {labels.viewPhotography}
                </button>

                <button
                  type="button"
                  onClick={() => setMode("room")}
                  className={
                    mode === "room"
                      ? "inline-flex items-center gap-1.5 border border-ink-950 bg-ink-950 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-board-50"
                      : "inline-flex items-center gap-1.5 border border-ink-950/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-600 hover:border-oxide hover:text-oxide"
                  }
                >
                  <Ruler className="size-3.5" />
                  Scale
                </button>
              </>
            ) : null}
          </div>

          {mode === "photo" && activeImage ? (
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="inline-flex items-center gap-2 border border-ink-950/20 bg-board-100 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-950 transition-colors hover:border-oxide hover:bg-oxide hover:text-board-50"
            >
              <Expand className="size-3.5" />
              {labels.deepZoom}
            </button>
          ) : null}
        </div>
      </div>

      {/* Multi-view Thumbnails */}
      {media.length > 1 && mode !== "3d" ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {media.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={
                idx === activeIndex
                  ? "shrink-0 border-2 border-oxide bg-board-200 p-0.5"
                  : "shrink-0 border border-ink-950/15 bg-board-200 p-0.5 opacity-65 transition-opacity hover:opacity-100"
              }
            >
              {/* biome-ignore lint/performance/noImgElement: Artwork detail view thumbnail. */}
              <img src={item.url} alt={item.alt} className="size-16 object-cover sm:size-20" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
