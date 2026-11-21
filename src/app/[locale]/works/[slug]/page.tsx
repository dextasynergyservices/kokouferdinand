import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CreaseReveal } from "@/components/motion/crease-reveal";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";
import { ArtworkDetailStage } from "@/components/public/artwork-detail-stage";
import { EnquiryDrawer } from "@/components/public/enquiry-drawer";
import { LivingArtworkPlane } from "@/components/three/living-artwork-plane";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getPublishedWorkBySlug,
  getPublishedWorkSlugs,
  getPublishedWorks,
  getRelatedWorks,
} from "@/db/queries/works";
import { Link } from "@/i18n/navigation";
import { type AppLocale, routing } from "@/i18n/routing";
import { pickLocalized } from "@/lib/i18n-helpers";

export async function generateStaticParams() {
  const slugs = await getPublishedWorkSlugs();
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
  const work = await getPublishedWorkBySlug(slug);
  if (!work) return {};

  const title = pickLocalized(work.title, locale);
  const description = pickLocalized(work.description, locale);
  const primary = work.media.find((m) => m.isPrimary) ?? work.media[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: primary?.url
        ? [{ url: primary.url, width: primary.width, height: primary.height }]
        : [],
    },
    alternates: {
      languages: {
        fr: `/fr/oeuvres/${slug}`,
        en: `/en/works/${slug}`,
        es: `/es/obras/${slug}`,
        "x-default": `/fr/oeuvres/${slug}`,
      },
    },
  };
}

async function ArtworkDetailContent({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const [work, allWorks, tWorks, tCommon, tContact] = await Promise.all([
    getPublishedWorkBySlug(slug),
    getPublishedWorks(),
    getTranslations("works"),
    getTranslations("common"),
    getTranslations("contact"),
  ]);

  if (!work) notFound();

  const related = await getRelatedWorks(work.series, work.id, 3);
  const currentIdx = allWorks.findIndex((w) => w.id === work.id);
  const prevWork = currentIdx > 0 ? allWorks[currentIdx - 1] : null;
  const nextWork =
    currentIdx >= 0 && currentIdx < allWorks.length - 1 ? allWorks[currentIdx + 1] : null;

  const title = pickLocalized(work.title, locale);
  const medium = pickLocalized(work.medium, locale);
  const description = pickLocalized(work.description, locale);
  const provenance = pickLocalized(work.provenance, locale);

  const orderedMedia = [...work.media].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  const stageMedia = orderedMedia.map((m) => ({
    id: m.id,
    url: m.url,
    alt: pickLocalized(m.alt, locale) || title,
  }));
  const secondaryMedia = orderedMedia.slice(1);
  const plateNumber = currentIdx >= 0 ? String(currentIdx + 1).padStart(2, "0") : "01";
  const plateTotal = String(allWorks.length).padStart(2, "0");

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-14 lg:px-12">
      {/* Top Breadcrumb & Catalogue Index */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-ink-950/12 pb-5">
        <Link
          href="/works"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-600 transition-colors hover:text-oxide"
        >
          <ArrowLeft className="size-3.5" />
          {tCommon("nav.works")}
        </Link>

        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-600">
          {work.series ? <span className="text-oxide">{work.series}</span> : null}
          <span className="text-ink-400">
            PLATE {plateNumber} / {plateTotal}
          </span>
        </div>
      </div>

      {/* Archival Masthead */}
      <header className="mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="space-y-3 lg:col-span-8">
          <SplitTextReveal
            as="h1"
            immediate
            className="debossed-heading font-serif text-4xl font-light leading-[1.06] tracking-tight text-ink-950 sm:text-6xl lg:text-7xl"
          >
            {title}
          </SplitTextReveal>
          <p className="text-sm text-ink-600 sm:text-base">{medium}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-[0.18em] lg:col-span-4 lg:justify-end">
          <span className="text-ink-600">{work.year}</span>
          <span className="text-ink-400">·</span>
          <span className="border border-oxide/40 bg-board-50 px-3 py-1 text-[10px] text-oxide">
            {tWorks(`availability.${work.availability}`)}
          </span>
        </div>
      </header>

      {/* Full-Width Theatrical Exhibition Stage */}
      <ArtworkDetailStage
        title={title}
        year={work.year}
        dimensions={work.dimensions}
        media={stageMedia}
        model3dUrl={work.model3dUrl}
        labels={{
          explore3d: tWorks("detail.explore3d"),
          viewPhotography: tWorks("detail.viewPhotography"),
          deepZoom: tWorks("detail.deepZoom"),
        }}
      />

      <div className="crease-rule my-14 lg:my-20" />

      {/* Two-Column Monograph: Curatorial Essay + Sticky Archival Plate */}
      <section className="grid gap-12 lg:grid-cols-12 lg:items-start">
        <div className="space-y-10 lg:col-span-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-oxide">
            Curatorial Note
          </p>
          <p className="font-serif text-2xl font-light leading-relaxed text-ink-950 sm:text-3xl">
            {description}
          </p>

          <div className="grid gap-6 border-t border-ink-950/12 pt-8 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                {tWorks("detail.medium")}
              </p>
              <p className="text-sm leading-relaxed text-ink-800">{medium}</p>
            </div>
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                {tWorks("detail.dimensions")}
              </p>
              <p className="font-mono text-sm text-ink-800">{work.dimensions}</p>
            </div>
          </div>
        </div>

        <aside className="relief-slab space-y-8 p-6 sm:p-8 lg:sticky lg:top-28 lg:col-span-5">
          <div className="spec-rule flex items-center justify-between pb-4 font-mono text-[10px] uppercase tracking-[0.22em]">
            <span className="text-oxide">Catalogue Plate</span>
            <span className="text-ink-400">
              KFM-{work.year}-{plateNumber}
            </span>
          </div>

          <dl className="text-sm">
            <div className="spec-rule flex justify-between gap-4 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                {tWorks("detail.year")}
              </dt>
              <dd className="font-mono text-xs text-ink-950">{work.year}</dd>
            </div>
            {work.series ? (
              <div className="spec-rule flex justify-between gap-4 py-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                  {tWorks("detail.series")}
                </dt>
                <dd className="text-right text-xs text-ink-800">{work.series}</dd>
              </div>
            ) : null}
            <div className="spec-rule flex justify-between gap-4 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                {tWorks("detail.dimensions")}
              </dt>
              <dd className="font-mono text-xs text-ink-950">{work.dimensions}</dd>
            </div>
            <div className="spec-rule flex justify-between gap-4 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                {tWorks("detail.availability")}
              </dt>
              <dd className="font-mono text-xs text-oxide">
                {tWorks(`availability.${work.availability}`)}
              </dd>
            </div>
            {provenance ? (
              <div className="spec-rule flex justify-between gap-4 py-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                  {tWorks("detail.provenance")}
                </dt>
                <dd className="text-right text-xs text-ink-800">{provenance}</dd>
              </div>
            ) : null}
          </dl>

          <EnquiryDrawer
            locale={locale}
            artworkId={work.id}
            artworkTitle={title}
            triggerLabel={tWorks("detail.enquireWork")}
            drawerTitle={tContact("drawer.title")}
            regardingLabel={tContact("drawer.regarding")}
            turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            formLabels={{
              name: tContact("form.name"),
              email: tContact("form.email"),
              subject: tContact("form.subject"),
              message: tContact("form.message"),
              submit: tContact("form.submit"),
              submitting: tContact("form.submitting"),
              success: tContact("form.success"),
              error: tContact("form.error"),
              captchaRequired: tContact("form.captchaRequired"),
            }}
          />
        </aside>
      </section>

      {/* Installation Views */}
      {secondaryMedia.length > 0 ? (
        <section className="mt-20 space-y-8 border-t border-ink-950/15 pt-14">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-600">
            {tWorks("detail.installationViews")}
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {secondaryMedia.map((media) => (
              <CreaseReveal key={media.id}>
                <figure className="overflow-hidden border border-ink-950/12 bg-board-200">
                  {/* biome-ignore lint/performance/noImgElement: Dynamic R2 installation view. */}
                  <img
                    src={media.url}
                    alt={pickLocalized(media.alt, locale) || title}
                    loading="lazy"
                    className="w-full object-cover"
                  />
                </figure>
              </CreaseReveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* Monograph Previous / Next Navigation */}
      {prevWork || nextWork ? (
        <nav
          aria-label="Adjacent artworks"
          className="mt-20 grid grid-cols-1 gap-4 border-y border-ink-950/15 py-8 sm:grid-cols-2"
        >
          <div>
            {prevWork ? (
              <Link
                href={{ pathname: "/works/[slug]", params: { slug: prevWork.slug } }}
                className="group inline-flex flex-col gap-1"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400 group-hover:text-oxide">
                  <ArrowLeft className="size-3" />
                  {tCommon("actions.back")}
                </span>
                <span className="font-serif text-2xl font-light text-ink-950 transition-colors group-hover:text-oxide">
                  {pickLocalized(prevWork.title, locale)}
                </span>
              </Link>
            ) : null}
          </div>
          <div className="sm:text-right">
            {nextWork ? (
              <Link
                href={{ pathname: "/works/[slug]", params: { slug: nextWork.slug } }}
                className="group inline-flex flex-col gap-1 sm:items-end"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400 group-hover:text-oxide">
                  {tCommon("actions.readMore")}
                  <ArrowRight className="size-3" />
                </span>
                <span className="font-serif text-2xl font-light text-ink-950 transition-colors group-hover:text-oxide">
                  {pickLocalized(nextWork.title, locale)}
                </span>
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}

      {/* Related Works */}
      {related.length > 0 ? (
        <section className="mt-20 space-y-8">
          <h2 className="font-serif text-3xl font-light text-ink-950">
            {tWorks("detail.relatedWorks")}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => {
              const img = item.media.find((m) => m.isPrimary) ?? item.media[0];
              return (
                <Link
                  key={item.id}
                  href={{ pathname: "/works/[slug]", params: { slug: item.slug } }}
                  className="group block space-y-3"
                >
                  <LivingArtworkPlane
                    imageUrl={img?.url}
                    alt={pickLocalized(item.title, locale)}
                    aspectClass="aspect-[4/5]"
                    plateLabel={item.series ?? undefined}
                    year={item.year}
                  />
                  <div className="flex items-baseline justify-between gap-2 border-t border-ink-950/12 pt-2">
                    <h3 className="truncate font-serif text-xl font-light text-ink-950 group-hover:text-oxide">
                      {pickLocalized(item.title, locale)}
                    </h3>
                    <span className="font-mono text-[11px] text-ink-400">{item.year}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function ArtworkDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] space-y-10 px-5 py-14 sm:px-8 lg:px-12">
          <Skeleton className="h-4 w-24 bg-board-200" />
          <Skeleton className="h-16 w-2/3 bg-board-200" />
          <Skeleton className="aspect-[16/10] w-full bg-board-200" />
        </div>
      }
    >
      <ArtworkDetailContent params={params} />
    </Suspense>
  );
}
