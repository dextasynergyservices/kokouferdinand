import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";
import { ExhibitionsArchiveClient } from "@/components/public/exhibitions-archive-client";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublishedExhibitions } from "@/db/queries/exhibitions";
import type { AppLocale } from "@/i18n/routing";
import { pickLocalized } from "@/lib/i18n-helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "exhibitions" });
  return {
    title: t("title"),
    alternates: {
      languages: {
        fr: "/fr/expositions",
        en: "/en/exhibitions",
        es: "/es/exposiciones",
        "x-default": "/fr/expositions",
      },
    },
  };
}

async function ExhibitionsContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const [t, tCommon, list] = await Promise.all([
    getTranslations("exhibitions"),
    getTranslations("common"),
    getPublishedExhibitions(),
  ]);

  const items = list.map((ex) => ({
    id: ex.id,
    type: ex.type,
    title: pickLocalized(ex.title, locale),
    venue: ex.venue,
    city: ex.city,
    country: ex.country,
    startDate: ex.startDate.toISOString().slice(0, 10),
    endDate: ex.endDate ? ex.endDate.toISOString().slice(0, 10) : null,
    curatorialText: pickLocalized(ex.curatorialText, locale),
    coverUrl: ex.coverUrl,
    isCurrent: ex.isCurrent,
  }));

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <header className="mb-12 space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-oxide">Program</p>
        <SplitTextReveal
          as="h1"
          immediate
          className="debossed-heading font-serif text-5xl font-light tracking-tight text-ink-950 sm:text-6xl"
        >
          {t("title")}
        </SplitTextReveal>
      </header>

      <ExhibitionsArchiveClient
        items={items}
        labels={{
          current: t("current"),
          empty: t("empty"),
          loadMore: tCommon("actions.loadMore"),
          types: {
            all: t("types.all"),
            solo: t("types.solo"),
            group: t("types.group"),
            biennale: t("types.biennale"),
            fair: t("types.fair"),
          },
        }}
      />
    </div>
  );
}

export default function ExhibitionsPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] space-y-8 px-5 py-16 sm:px-8 lg:px-12">
          <Skeleton className="h-14 w-1/2 bg-board-200" />
          <Skeleton className="h-64 w-full bg-board-200" />
        </div>
      }
    >
      <ExhibitionsContent params={params} />
    </Suspense>
  );
}
