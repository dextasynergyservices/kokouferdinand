import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";
import { WorksArchiveClient } from "@/components/public/works-archive-client";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublishedWorks } from "@/db/queries/works";
import type { AppLocale } from "@/i18n/routing";
import { pickLocalized } from "@/lib/i18n-helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "works" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      languages: {
        fr: "/fr/oeuvres",
        en: "/en/works",
        es: "/es/obras",
        "x-default": "/fr/oeuvres",
      },
    },
  };
}

async function WorksContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const [t, tCommon, works] = await Promise.all([
    getTranslations("works"),
    getTranslations("common"),
    getPublishedWorks(),
  ]);

  const items = works.map((w) => {
    const primary = w.media.find((m) => m.isPrimary) ?? w.media[0];
    return {
      id: w.id,
      slug: w.slug,
      title: pickLocalized(w.title, locale),
      series: w.series,
      year: w.year,
      medium: pickLocalized(w.medium, locale),
      dimensions: w.dimensions,
      primaryImageUrl: primary?.url ?? null,
      has3d: Boolean(w.model3dUrl),
    };
  });

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <header className="mb-12 space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-oxide">Archive</p>
        <SplitTextReveal
          as="h1"
          immediate
          className="font-serif text-5xl font-light tracking-tight text-ink-950 sm:text-6xl"
        >
          {t("title")}
        </SplitTextReveal>
        <p className="max-w-xl text-sm leading-relaxed text-ink-600 sm:text-base">
          {t("subtitle")}
        </p>
      </header>

      <WorksArchiveClient
        works={items}
        labels={{
          all: t("filters.all"),
          series: t("filters.series"),
          year: t("filters.year"),
          reset: t("filters.reset"),
          empty: t("empty"),
          loadMore: tCommon("actions.loadMore"),
        }}
      />
    </div>
  );
}

export default function WorksPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] space-y-8 px-5 py-16 sm:px-8 lg:px-12">
          <Skeleton className="h-14 w-1/3 bg-board-200" />
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="aspect-[4/3] bg-board-200" />
            <Skeleton className="aspect-[4/5] bg-board-200" />
          </div>
        </div>
      }
    >
      <WorksContent params={params} />
    </Suspense>
  );
}
