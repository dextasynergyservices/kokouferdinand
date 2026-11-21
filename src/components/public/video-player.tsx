"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { parseExternalVideoUrl } from "@/lib/video-utils";

export function VideoPlayerCard({
  title,
  description,
  year,
  duration,
  sourceType,
  externalUrl,
  videoUrl,
  posterUrl,
  playLabel,
}: {
  title: string;
  description: string;
  year: number;
  duration?: string | null;
  sourceType: "external_link" | "r2_upload";
  externalUrl?: string | null;
  videoUrl?: string | null;
  posterUrl?: string | null;
  playLabel: string;
}) {
  const [playing, setPlaying] = useState(false);
  const embed =
    sourceType === "external_link" && externalUrl ? parseExternalVideoUrl(externalUrl) : null;

  return (
    <article className="space-y-5">
      <div className="relief-well bg-board-200/80 p-2.5 sm:p-3.5">
        <div className="relief-raised relative aspect-video w-full overflow-hidden bg-ink-950">
          {playing ? (
            sourceType === "r2_upload" && videoUrl ? (
              <video
                src={videoUrl}
                poster={posterUrl || undefined}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="h-full w-full bg-ink-950 object-contain"
              >
                <track kind="captions" />
              </video>
            ) : embed ? (
              <iframe
                src={`${embed.embedUrl}${embed.embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
                title={title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : null
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`${playLabel}: ${title}`}
              className="group relative flex h-full w-full items-center justify-center text-left"
            >
              {posterUrl ? (
                // biome-ignore lint/performance/noImgElement: Dynamic R2 poster image for screening room card.
                <img
                  src={posterUrl}
                  alt={title}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-[1.03] group-hover:opacity-75"
                />
              ) : (
                <div className="flex h-full w-full flex-col justify-between bg-ink-950 p-6 text-board-100">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-board-300/70">
                    Screening Room · {year}
                  </span>
                  <p className="max-w-lg font-serif text-2xl font-light sm:text-3xl">{title}</p>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-board-300/60">
                    {duration || "Film"}
                  </span>
                </div>
              )}

              <span className="absolute flex size-16 items-center justify-center border border-board-50/70 bg-ink-950/70 text-board-50 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:border-oxide group-hover:bg-oxide">
                <Play className="ml-0.5 size-6 fill-current" />
              </span>

              {duration ? (
                <span className="absolute right-4 bottom-4 bg-ink-950/80 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] text-board-100">
                  {duration}
                </span>
              ) : null}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-2 border-b border-ink-950/12 pb-6 sm:flex-row sm:items-baseline">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-light text-ink-950">{title}</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-600">{description}</p>
        </div>
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
          {year}
        </span>
      </div>
    </article>
  );
}
