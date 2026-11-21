import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";
import { PressArchiveClient } from "@/components/public/press-archive-client";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublishedPressItems } from "@/db/queries/press";
import type { AppLocale } from "@/i18n/routing";
import { pickLocalized } from "@/lib/i18n-helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "videos" });
  return {
    title: t("pressTitle"),
    alternates: {
      languages: {
        fr: "/fr/presse",
        en: "/en/press",
        es: "/es/prensa",
        "x-default": "/fr/presse",
      },
    },
  };
}

async function PressContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const [tVideos, tCommon, items] = await Promise.all([
    getTranslations("videos"),
    getTranslations("common"),
    getPublishedPressItems(),
  ]);

  const mapped = items.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: pickLocalized(item.title, locale),
    publication: item.publication,
    publishedDate: item.publishedDate.toISOString().slice(0, 10),
    excerpt: pickLocalized(item.excerpt, locale),
    pdfUrl: item.pdfUrl,
    externalUrl: item.externalUrl,
  }));

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <header className="mb-14 space-y-4 border-b border-ink-950/15 pb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-oxide">Publications</p>
        <SplitTextReveal
          as="h1"
          immediate
          className="debossed-heading font-serif text-5xl font-light tracking-tight text-ink-950 sm:text-6xl"
        >
          {tVideos("pressTitle")}
        </SplitTextReveal>
      </header>

      <PressArchiveClient
        items={mapped}
        labels={{
          empty: tVideos("emptyPress"),
          readMore: tCommon("actions.readMore"),
          readArticle: tVideos("readArticle"),
          loadMore: tCommon("actions.loadMore"),
        }}
      />
    </div>
  );
}

export default function PressPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] space-y-8 px-5 py-16 sm:px-8 lg:px-12">
          <Skeleton className="h-14 w-1/2 bg-board-200" />
          <Skeleton className="h-48 w-full bg-board-200" />
        </div>
      }
    >
      <PressContent params={params} />
    </Suspense>
  );
}
