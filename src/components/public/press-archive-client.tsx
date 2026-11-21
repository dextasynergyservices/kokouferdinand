"use client";

import { ArrowRight, ArrowUpRight, FileText } from "lucide-react";
import { useState } from "react";
import { CreaseReveal } from "@/components/motion/crease-reveal";
import { Link } from "@/i18n/navigation";

export type PublicPressItem = {
  id: string;
  slug: string | null;
  title: string;
  publication: string;
  publishedDate: string;
  excerpt: string;
  pdfUrl: string | null;
  externalUrl: string | null;
};

export function PressArchiveClient({
  items,
  labels,
  pageSize = 6,
}: {
  items: PublicPressItem[];
  labels: {
    empty: string;
    readMore: string;
    readArticle: string;
    loadMore: string;
  };
  pageSize?: number;
}) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  if (items.length === 0) {
    return <p className="py-16 font-serif text-xl italic text-ink-600">{labels.empty}</p>;
  }

  return (
    <div className="space-y-10">
      <div className="space-y-8">
        {visibleItems.map((item, idx) => (
          <CreaseReveal key={item.id}>
            <article className="relief-raised grid gap-6 border border-ink-950/12 bg-board-50/85 p-6 transition-colors hover:border-oxide/40 sm:p-8 lg:grid-cols-12 lg:items-center">
              <div className="space-y-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-600 lg:col-span-3">
                <p className="text-[10px] text-ink-400">{String(idx + 1).padStart(2, "0")}</p>
                <p className="text-oxide">{item.publication}</p>
                <p className="text-ink-400">{item.publishedDate}</p>
              </div>

              <div className="space-y-3 lg:col-span-6">
                {item.slug ? (
                  <Link
                    href={{ pathname: "/press/[slug]", params: { slug: item.slug } }}
                    className="group block"
                  >
                    <h2 className="debossed-heading font-serif text-3xl font-light text-ink-950 transition-colors group-hover:text-oxide">
                      {item.title}
                    </h2>
                  </Link>
                ) : (
                  <h2 className="debossed-heading font-serif text-3xl font-light text-ink-950">
                    {item.title}
                  </h2>
                )}
                <p className="text-sm leading-relaxed text-ink-600">{item.excerpt}</p>
              </div>

              <div className="flex flex-wrap gap-3 lg:col-span-3 lg:justify-end">
                {item.slug ? (
                  <Link
                    href={{ pathname: "/press/[slug]", params: { slug: item.slug } }}
                    className="group inline-flex items-center gap-2 border border-ink-950 bg-ink-950 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-board-50 transition-colors hover:border-oxide hover:bg-oxide"
                  >
                    <span>{labels.readMore}</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : null}
                {item.pdfUrl ? (
                  <a
                    href={item.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 border border-ink-950/20 bg-board-100 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-950 transition-colors hover:border-oxide hover:text-oxide"
                  >
                    <FileText className="size-3.5" />
                    <span>PDF</span>
                  </a>
                ) : null}
                {!item.slug && item.externalUrl ? (
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 border border-ink-950/20 bg-board-100 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-950 transition-colors hover:border-oxide hover:text-oxide"
                  >
                    <span>{labels.readArticle}</span>
                    <ArrowUpRight className="size-3.5" />
                  </a>
                ) : null}
              </div>
            </article>
          </CreaseReveal>
        ))}
      </div>

      {hasMore ? (
        <div className="flex flex-col items-center gap-3 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
            {String(visibleItems.length).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
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
    </div>
  );
}
