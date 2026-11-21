"use client";

import { Expand } from "lucide-react";
import { useState } from "react";
import { CreaseReveal } from "@/components/motion/crease-reveal";
import { DeepZoomViewer } from "@/components/public/deep-zoom-viewer";

export type PublicExhibitionItem = {
  id: string;
  type: "solo" | "group" | "biennale" | "fair";
  title: string;
  venue: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string | null;
  curatorialText: string;
  coverUrl: string | null;
  isCurrent: boolean;
};

export function ExhibitionsArchiveClient({
  items,
  labels,
  pageSize = 4,
}: {
  items: PublicExhibitionItem[];
  labels: {
    current: string;
    empty: string;
    loadMore: string;
    types: Record<"all" | "solo" | "group" | "biennale" | "fair", string>;
  };
  pageSize?: number;
}) {
  const [filter, setFilter] = useState<"all" | "solo" | "group" | "biennale" | "fair">("all");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const filtered = filter === "all" ? items : items.filter((item) => item.type === filter);
  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="space-y-12">
      <div className="relief-well flex flex-wrap items-center justify-between gap-3 bg-board-200/60 p-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "solo", "group", "biennale", "fair"] as const).map((typeKey) => (
            <button
              key={typeKey}
              type="button"
              onClick={() => {
                setFilter(typeKey);
                setVisibleCount(pageSize);
              }}
              className={
                filter === typeKey
                  ? "border border-ink-950 bg-ink-950 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-board-50"
                  : "border border-transparent px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-600 transition-colors hover:border-ink-950/20 hover:bg-board-50 hover:text-ink-950"
              }
            >
              {labels.types[typeKey]}
            </button>
          ))}
        </div>

        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
          {String(filtered.length).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 font-serif text-xl italic text-ink-600">{labels.empty}</p>
      ) : (
        <>
          <div className="space-y-10">
            {visibleItems.map((ex, idx) => (
              <CreaseReveal key={ex.id}>
                <article
                  className={
                    ex.isCurrent
                      ? "relief-raised grid gap-8 border border-oxide/30 bg-board-50/90 p-6 sm:p-10 lg:grid-cols-12"
                      : "grid gap-8 border-b border-ink-950/12 pb-10 lg:grid-cols-12"
                  }
                >
                  <div className="space-y-2 lg:col-span-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-oxide">
                        {labels.types[ex.type]}
                      </span>
                      {ex.isCurrent ? (
                        <span className="border border-oxide bg-oxide px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-board-50">
                          {labels.current}
                        </span>
                      ) : null}
                    </div>
                    <p className="font-mono text-xs text-ink-600">
                      {ex.startDate}
                      {ex.endDate ? ` — ${ex.endDate}` : ""}
                    </p>
                    <p className="text-xs text-ink-400">
                      {ex.city}, {ex.country}
                    </p>
                  </div>

                  <div className="space-y-4 lg:col-span-5">
                    <h2 className="debossed-heading font-serif text-3xl font-light text-ink-950 sm:text-4xl">
                      {ex.title}
                    </h2>
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-800">
                      {ex.venue}
                    </p>
                    <p className="text-sm leading-relaxed text-ink-600">{ex.curatorialText}</p>
                  </div>

                  <div className="lg:col-span-4">
                    {ex.coverUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (ex.coverUrl) setLightbox({ src: ex.coverUrl, alt: ex.title });
                        }}
                        className="relief-well group relative block aspect-[4/3] w-full overflow-hidden bg-board-200/80 p-2 text-left"
                      >
                        <div className="relief-raised relative h-full w-full overflow-hidden bg-board-100">
                          {/* biome-ignore lint/performance/noImgElement: Clickable exhibition photograph. */}
                          <img
                            src={ex.coverUrl}
                            alt={ex.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                          <span className="absolute right-2.5 bottom-2.5 flex size-8 items-center justify-center bg-board-50/90 text-ink-950 opacity-0 transition-opacity group-hover:opacity-100">
                            <Expand className="size-3.5" />
                          </span>
                        </div>
                      </button>
                    ) : null}
                  </div>
                </article>
              </CreaseReveal>
            ))}
          </div>

          {hasMore ? (
            <div className="flex flex-col items-center gap-3 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                {String(visibleItems.length).padStart(2, "0")} /{" "}
                {String(filtered.length).padStart(2, "0")}
              </p>
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + pageSize)}
                className="relief-btn px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em]"
              >
                {labels.loadMore}
              </button>
            </div>
          ) : null}
        </>
      )}

      {lightbox ? (
        <DeepZoomViewer
          src={lightbox.src}
          alt={lightbox.alt}
          open={Boolean(lightbox)}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </div>
  );
}
