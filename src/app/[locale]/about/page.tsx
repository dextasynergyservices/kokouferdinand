import { Download } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CreaseReveal } from "@/components/motion/crease-reveal";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";
import { VideoPlayerCard } from "@/components/public/video-player";
import { Skeleton } from "@/components/ui/skeleton";
import { getSitePage } from "@/db/queries/pages";
import { getPublishedVideos } from "@/db/queries/videos";
import type { AppLocale } from "@/i18n/routing";
import { pickLocalized } from "@/lib/i18n-helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
    alternates: {
      languages: {
        fr: "/fr/a-propos",
        en: "/en/about",
        es: "/es/acerca",
        "x-default": "/fr/a-propos",
      },
    },
  };
}

async function AboutContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const [t, tVideos, aboutPage, videoList] = await Promise.all([
    getTranslations("about"),
    getTranslations("videos"),
    getSitePage("about"),
    getPublishedVideos(),
  ]);

  const headline = pickLocalized(aboutPage?.content?.headline, locale) || t("title");
  const biography = pickLocalized(aboutPage?.content?.biography, locale);
  const representation = pickLocalized(aboutPage?.content?.representation, locale);

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <header className="mb-14 space-y-4 border-b border-ink-950/15 pb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-oxide">
          {t("biography")} · TG / FR, 1989
        </p>
        <SplitTextReveal
          as="h1"
          immediate
          className="debossed-heading font-serif text-5xl font-light tracking-tight text-ink-950 sm:text-6xl"
        >
          {headline}
        </SplitTextReveal>
      </header>

      <div className="grid gap-14 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          {biography.split("\n\n").map((paragraph, idx) => (
            <p
              key={paragraph.slice(0, 24)}
              className={
                idx === 0
                  ? "font-serif text-2xl font-light leading-relaxed text-ink-950 sm:text-3xl"
                  : "text-base leading-relaxed text-ink-800"
              }
            >
              {paragraph}
            </p>
          ))}

          {/* Institutional Ledger */}
          <div className="relief-raised grid gap-6 border border-ink-950/12 bg-board-50/80 p-6 sm:grid-cols-3 sm:p-8">
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-oxide">
                Collections
              </p>
              <ul className="space-y-1 text-xs leading-relaxed text-ink-600">
                <li>FRAC Picardie</li>
                <li>FRAC Pays de la Loire</li>
                <li>CNAP, Paris</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-oxide">
                {locale === "fr" ? "Résidences" : locale === "es" ? "Residencias" : "Residencies"}
              </p>
              <ul className="space-y-1 text-xs leading-relaxed text-ink-600">
                <li>ISCP, New York (2023)</li>
                <li>De Ateliers, Amsterdam (2019–2021)</li>
                <li>ArtMéssiamé, Lomé (2020)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-oxide">
                {locale === "fr"
                  ? "Formation & Prix"
                  : locale === "es"
                    ? "Formación y Premios"
                    : "Education & Awards"}
              </p>
              <ul className="space-y-1 text-xs leading-relaxed text-ink-600">
                <li>DNSAP, Beaux-Arts de Paris (2019)</li>
                <li>Salomon Foundation Award (2021)</li>
                <li>Prix Révélation ADAGP (2017)</li>
              </ul>
            </div>
          </div>
        </div>

        <aside className="space-y-8 lg:col-span-5">
          <CreaseReveal>
            <figure className="space-y-2.5">
              <div className="relief-well bg-board-200/80 p-2.5 sm:p-3">
                <div className="relief-raised aspect-[4/5] overflow-hidden bg-board-100">
                  {/* biome-ignore lint/performance/noImgElement: Official artist portrait by Grégory Copitet. */}
                  <img
                    src="/images/artist-portrait.jpg"
                    alt="Kokou Ferdinand Makouvia"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <figcaption className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                Kokou Ferdinand Makouvia © Grégory Copitet
              </figcaption>
            </figure>
          </CreaseReveal>

          <div className="relief-raised space-y-6 border border-ink-950/12 bg-board-50/85 p-6 sm:p-8">
            <div className="space-y-2">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-oxide">
                {t("representation")}
              </h2>
              <p className="text-sm leading-relaxed text-ink-600">{representation}</p>
            </div>

            <div className="border-t border-ink-950/12 pt-5">
              {aboutPage?.cvUrl ? (
                <a
                  href={aboutPage.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2.5 border border-ink-950 bg-ink-950 px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-board-50 transition-colors hover:border-oxide hover:bg-oxide"
                >
                  <Download className="size-4" />
                  {t("downloadCv")}
                </a>
              ) : (
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
                  {t("cvUnavailable")}
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Embedded Screening Room / Studio Films inside About */}
      {videoList.length > 0 ? (
        <section id="videos" className="mt-24 space-y-10">
          <div className="crease-rule" />
          <div className="space-y-2 pt-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-oxide">
              Screening Room
            </p>
            <h2 className="debossed-heading font-serif text-4xl font-light tracking-tight text-ink-950 sm:text-5xl">
              {tVideos("title")}
            </h2>
            <p className="max-w-xl text-sm text-ink-600">{tVideos("subtitle")}</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {videoList.map((vid) => (
              <CreaseReveal key={vid.id}>
                <VideoPlayerCard
                  title={pickLocalized(vid.title, locale)}
                  description={pickLocalized(vid.description, locale)}
                  year={vid.year}
                  duration={vid.duration}
                  sourceType={vid.sourceType}
                  externalUrl={vid.externalUrl}
                  videoUrl={vid.videoUrl}
                  posterUrl={vid.posterUrl}
                  playLabel={tVideos("play")}
                />
              </CreaseReveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] space-y-8 px-5 py-16 sm:px-8 lg:px-12">
          <Skeleton className="h-14 w-1/2 bg-board-200" />
          <Skeleton className="h-96 w-full bg-board-200" />
        </div>
      }
    >
      <AboutContent params={params} />
    </Suspense>
  );
}
