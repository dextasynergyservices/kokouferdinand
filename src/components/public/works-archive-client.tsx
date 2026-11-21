"use client";

import { useMemo, useState } from "react";
import { CreaseReveal } from "@/components/motion/crease-reveal";
import { LivingArtworkPlane } from "@/components/three/living-artwork-plane";
import { Link } from "@/i18n/navigation";

export type PublicWorkCardItem = {
  id: string;
  slug: string;
  title: string;
  series: string | null;
  year: number;
  medium: string;
  dimensions: string;
  primaryImageUrl: string | null;
  has3d: boolean;
};

export function WorksArchiveClient({
  works,
  labels,
  pageSize = 6,
}: {
  works: PublicWorkCardItem[];
  labels: {
    all: string;
    series: string;
    year: string;
    reset: string;
    empty: string;
    loadMore: string;
  };
  pageSize?: number;
}) {
  const [selectedSeries, setSelectedSeries] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const seriesList = useMemo(
    () => Array.from(new Set(works.map((w) => w.series).filter(Boolean) as string[])),
    [works],
  );
  const yearList = useMemo(
    () =>
      Array.from(new Set(works.map((w) => String(w.year)))).sort((a, b) => Number(b) - Number(a)),
    [works],
  );

  const filtered = useMemo(
    () =>
      works.filter((w) => {
        if (selectedSeries !== "all" && w.series !== selectedSeries) return false;
        if (selectedYear !== "all" && String(w.year) !== selectedYear) return false;
        return true;
      }),
    [works, selectedSeries, selectedYear],
  );

  const hasFilter = selectedSeries !== "all" || selectedYear !== "all";
  const visibleWorks = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="space-y-12">
      {/* Editorial Recessed Filter Bar */}
      <div className="relief-well flex flex-col gap-5 bg-board-200/60 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
            {labels.series}
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedSeries("all");
              setVisibleCount(pageSize);
            }}
            className={
              selectedSeries === "all"
                ? "border border-ink-950 bg-ink-950 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-board-50"
                : "border border-transparent px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-600 hover:border-ink-950/20 hover:bg-board-50 hover:text-ink-950"
            }
          >
            {labels.all}
          </button>
          {seriesList.map((series) => (
            <button
              key={series}
              type="button"
              onClick={() => {
                setSelectedSeries(series);
                setVisibleCount(pageSize);
              }}
              className={
                selectedSeries === series
                  ? "border border-ink-950 bg-ink-950 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-board-50"
                  : "border border-transparent px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-600 hover:border-ink-950/20 hover:bg-board-50 hover:text-ink-950"
              }
            >
              {series}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
            {labels.year}
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedYear("all");
              setVisibleCount(pageSize);
            }}
            className={
              selectedYear === "all"
                ? "border border-ink-950 bg-ink-950 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-board-50"
                : "border border-transparent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-600 hover:border-ink-950/20 hover:bg-board-50 hover:text-ink-950"
            }
          >
            {labels.all}
          </button>
          {yearList.map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => {
                setSelectedYear(yr);
                setVisibleCount(pageSize);
              }}
              className={
                selectedYear === yr
                  ? "border border-ink-950 bg-ink-950 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-board-50"
                  : "border border-transparent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-600 hover:border-ink-950/20 hover:bg-board-50 hover:text-ink-950"
              }
            >
              {yr}
            </button>
          ))}

          {hasFilter ? (
            <button
              type="button"
              onClick={() => {
                setSelectedSeries("all");
                setSelectedYear("all");
                setVisibleCount(pageSize);
              }}
              className="ml-2 font-mono text-[10px] uppercase tracking-[0.16em] text-oxide underline underline-offset-4"
            >
              {labels.reset}
            </button>
          ) : null}

          <span className="ml-auto pl-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
            {String(filtered.length).padStart(2, "0")} / {String(works.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Staggered Asymmetric Editorial Grid */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center font-serif text-xl italic text-ink-600">{labels.empty}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-y-24">
            {visibleWorks.map((work, idx) => {
              const row = Math.floor(idx / 2);
              const isLeft = idx % 2 === 0;
              const isWide = row % 2 === 0 ? isLeft : !isLeft;
              const colSpan = isWide ? "lg:col-span-7" : "lg:col-span-5";
              const offsetClass = !isWide ? "lg:mt-16" : "";
              const aspect = isWide ? "aspect-[4/3]" : "aspect-[4/5]";

              return (
                <CreaseReveal key={work.id} className={`${colSpan} ${offsetClass}`}>
                  <Link
                    href={{ pathname: "/works/[slug]", params: { slug: work.slug } }}
                    className="group block space-y-4"
                  >
                    <LivingArtworkPlane
                      imageUrl={work.primaryImageUrl}
                      alt={work.title}
                      aspectClass={aspect}
                      plateLabel={work.series ?? `Plate ${String(idx + 1).padStart(2, "0")}`}
                      year={work.year}
                    />

                    <div className="flex items-baseline justify-between gap-4 border-t border-ink-950/12 pt-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate font-serif text-2xl font-light text-ink-950 transition-colors group-hover:text-oxide">
                            {work.title}
                          </h2>
                          {work.has3d ? (
                            <span className="border border-oxide/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-oxide">
                              3D
                            </span>
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-ink-600">{work.medium}</p>
                      </div>
                      <span className="shrink-0 font-mono text-[11px] text-ink-400">
                        {work.year}
                      </span>
                    </div>
                  </Link>
                </CreaseReveal>
              );
            })}
          </div>

          {hasMore ? (
            <div className="flex flex-col items-center gap-3 pt-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                {String(visibleWorks.length).padStart(2, "0")} /{" "}
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
    </div>
  );
}
