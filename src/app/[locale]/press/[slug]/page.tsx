import { ArrowLeft, FileText } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublishedPressBySlug, getPublishedPressSlugs } from "@/db/queries/press";
import { Link } from "@/i18n/navigation";
import { type AppLocale, routing } from "@/i18n/routing";
import { pickLocalized } from "@/lib/i18n-helpers";

export async function generateStaticParams() {
  const slugs = await getPublishedPressSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((item) => ({
      locale,
      slug: item.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as AppLocale;
  const article = await getPublishedPressBySlug(slug);
  if (!article) return {};

  const title = pickLocalized(article.title, locale);
  const description = pickLocalized(article.excerpt, locale);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: article.coverUrl ? [{ url: article.coverUrl }] : [],
    },
    alternates: {
      languages: {
        fr: `/fr/presse/${slug}`,
        en: `/en/press/${slug}`,
        es: `/es/prensa/${slug}`,
        "x-default": `/fr/presse/${slug}`,
      },
    },
  };
}

async function PressArticleContent({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const [article, tCommon] = await Promise.all([
    getPublishedPressBySlug(slug),
    getTranslations("common"),
  ]);

  if (!article) notFound();

  const title = pickLocalized(article.title, locale);
  const excerpt = pickLocalized(article.excerpt, locale);
  const body = pickLocalized(article.body, locale) || excerpt;

  return (
    <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
      <div className="mb-10 flex items-center justify-between border-b border-ink-950/12 pb-5">
        <Link
          href="/press"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-600 transition-colors hover:text-oxide"
        >
          <ArrowLeft className="size-3.5" />
          {tCommon("nav.press")}
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
          {article.publishedDate.toISOString().slice(0, 10)}
        </span>
      </div>

      <header className="space-y-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-oxide">
          {article.publication}
        </p>
        <SplitTextReveal
          as="h1"
          immediate
          className="debossed-heading font-serif text-4xl font-light leading-[1.08] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl"
        >
          {title}
        </SplitTextReveal>
        <p className="font-serif text-xl font-light italic leading-relaxed text-ink-600 sm:text-2xl">
          {excerpt}
        </p>
      </header>

      {article.coverUrl ? (
        <div className="relief-well my-10 bg-board-200/80 p-2.5 sm:p-3.5">
          <div className="relief-raised aspect-[16/10] overflow-hidden bg-board-100">
            {/* biome-ignore lint/performance/noImgElement: Editorial press article cover image. */}
            <img src={article.coverUrl} alt={title} className="h-full w-full object-cover" />
          </div>
        </div>
      ) : (
        <div className="crease-rule my-10" />
      )}

      <div className="space-y-6 text-base leading-[1.85] text-ink-800 sm:text-lg">
        {body.split(/\n{2,}/).map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>

      {article.pdfUrl ? (
        <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-ink-950/15 pt-8">
          <a
            href={article.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-ink-950 bg-ink-950 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-board-50 transition-colors hover:border-oxide hover:bg-oxide"
          >
            <FileText className="size-4" />
            {tCommon("actions.downloadPdf")}
          </a>
        </div>
      ) : null}
    </article>
  );
}

export default function PressArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl space-y-8 px-5 py-16 sm:px-8">
          <Skeleton className="h-4 w-24 bg-board-200" />
          <Skeleton className="h-14 w-3/4 bg-board-200" />
          <Skeleton className="aspect-[16/10] w-full bg-board-200" />
        </div>
      }
    >
      <PressArticleContent params={params} />
    </Suspense>
  );
}
