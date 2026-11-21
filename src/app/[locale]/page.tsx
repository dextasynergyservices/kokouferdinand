import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CreaseReveal } from "@/components/motion/crease-reveal";
import { ReliefReveal } from "@/components/motion/relief-reveal";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";
import { MatterProcessBand } from "@/components/public/matter-process-band";
import { LivingArtworkPlane } from "@/components/three/living-artwork-plane";
import { getCurrentExhibition } from "@/db/queries/exhibitions";
import { getSitePage } from "@/db/queries/pages";
import { getFeaturedPressItems } from "@/db/queries/press";
import { getFeaturedWorks } from "@/db/queries/works";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { pickLocalized } from "@/lib/i18n-helpers";

const MATERIALS_STRIP: Record<AppLocale, string[]> = {
  fr: ["Fer forgé", "Cuir", "Bois calciné", "Cuivre", "Terre & Cire", "Encre de Chine"],
  en: ["Forged Iron", "Leather", "Charred Wood", "Copper", "Earth & Wax", "Indian Ink"],
  es: ["Hierro forjado", "Cuero", "Madera carbonizada", "Cobre", "Tierra y cera", "Tinta china"],
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const [tHome, tCommon, homePage, featuredWorks, currentExhibition, featuredPress] =
    await Promise.all([
      getTranslations("home"),
      getTranslations("common"),
      getSitePage("home"),
      getFeaturedWorks(6),
      getCurrentExhibition(),
      getFeaturedPressItems(3),
    ]);

  const heroTitle =
    pickLocalized(homePage?.content?.heroTitle, locale) || "Kokou Ferdinand Makouvia";
  const heroSubtitle =
    pickLocalized(homePage?.content?.heroSubtitle, locale) ||
    "Sculpture, installation & matière vive — Lomé / Paris / Amsterdam";
  const statement = pickLocalized(homePage?.content?.statement, locale);
  const heroPortraitUrl = "/images/hero-portrait.jpg";

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
      {/* 1. Relevo & Vinco Inspired Monumental Split Hero */}
      <section className="flex min-h-[calc(100svh-4rem)] flex-col justify-between py-6 sm:py-10 lg:min-h-[calc(100svh-5rem)] lg:py-10">
        <div className="flex items-center justify-between border-b border-ink-950/12 pb-3.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-600">
          <span>TG / FR · b. 1989, Lomé</span>
          <span>Paris · Amsterdam · Galerie Sator</span>
        </div>

        <div className="my-8 grid gap-10 lg:my-10 lg:grid-cols-12 lg:items-center">
          <div className="space-y-7 lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-oxide">
              {heroSubtitle}
            </p>
            <div className="space-y-2">
              <div className="cavity-dark inline-block px-5 py-3 sm:px-7 sm:py-4">
                <SplitTextReveal
                  as="h1"
                  immediate
                  className="relief-raised-text font-serif text-4xl font-semibold uppercase leading-[0.98] tracking-tight sm:text-6xl xl:text-[4.8rem]"
                >
                  {heroTitle}
                </SplitTextReveal>
              </div>
            </div>
            {statement ? (
              <p className="max-w-xl text-base leading-relaxed text-ink-600 sm:text-lg">
                {statement}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <Link
                href="/works"
                className="relief-btn group inline-flex items-center gap-3 px-6 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em]"
              >
                <span>{tHome("exploreArchive")}</span>
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="link-dashed font-mono text-[11px] uppercase tracking-[0.18em] text-ink-800"
              >
                {tCommon("nav.about")}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Link href="/about" className="group block space-y-3">
              <LivingArtworkPlane
                imageUrl={heroPortraitUrl}
                alt="Kokou Ferdinand Makouvia"
                aspectClass="aspect-[4/5]"
                plateLabel="Portrait"
              />
              <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink-600">
                <span className="truncate group-hover:text-oxide">Kokou Ferdinand Makouvia</span>
                <span className="shrink-0 text-ink-400">Lomé · Paris</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Tactile Material Ledger Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-950/15 pt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-600">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {MATERIALS_STRIP[locale].map((mat) => (
              <span key={mat}>{mat}</span>
            ))}
          </div>
          <span className="hidden text-ink-400 sm:inline">{tHome("scrollPrompt")} ↓</span>
        </div>
      </section>

      <div className="crease-rule" />

      {/* 1.5 Scroll-Scrubbed Four Moves of Matter (Relevo & Vinco Storytelling Band) */}
      <MatterProcessBand locale={locale} />

      <div className="crease-rule" />

      {/* 2. Curated Asymmetric Featured Works */}
      {featuredWorks.length > 0 ? (
        <section className="py-20 lg:py-28">
          <div className="mb-14 flex flex-col justify-between gap-4 border-b border-ink-950/12 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-oxide">
                01 · Catalogue
              </p>
              <SplitTextReveal
                as="h2"
                className="debossed-heading mt-1 font-serif text-4xl font-light tracking-tight text-ink-950 sm:text-5xl"
              >
                {tHome("featuredWorks")}
              </SplitTextReveal>
            </div>
            <Link
              href="/works"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-600 transition-colors hover:text-oxide"
            >
              <span>{tCommon("actions.viewAll")}</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-y-24">
            {featuredWorks.map((work, idx) => {
              const primary = work.media.find((m) => m.isPrimary) ?? work.media[0];
              const row = Math.floor(idx / 2);
              const isLeft = idx % 2 === 0;
              const isWide = row % 2 === 0 ? isLeft : !isLeft;
              const colSpan = isWide ? "lg:col-span-7" : "lg:col-span-5";
              const offset = !isWide ? "lg:mt-16" : "";
              const aspect = isWide ? "aspect-[4/3]" : "aspect-[4/5]";

              return (
                <CreaseReveal key={work.id} className={`${colSpan} ${offset}`}>
                  <Link
                    href={{ pathname: "/works/[slug]", params: { slug: work.slug } }}
                    className="group block space-y-4"
                  >
                    <LivingArtworkPlane
                      imageUrl={primary?.url}
                      alt={pickLocalized(work.title, locale)}
                      aspectClass={aspect}
                      plateLabel={work.series ?? `Plate ${String(idx + 1).padStart(2, "0")}`}
                      year={work.year}
                    />
                    <div className="flex items-baseline justify-between gap-4 border-t border-ink-950/12 pt-3">
                      <div className="min-w-0 space-y-1">
                        <h3 className="truncate font-serif text-2xl font-light text-ink-950 transition-colors group-hover:text-oxide">
                          {pickLocalized(work.title, locale)}
                        </h3>
                        <p className="truncate text-xs text-ink-600">
                          {pickLocalized(work.medium, locale)}
                        </p>
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
        </section>
      ) : null}

      <div className="crease-rule" />

      {/* 3. Current Exhibition Spotlight */}
      {currentExhibition ? (
        <section className="py-20 lg:py-28">
          <CreaseReveal>
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="space-y-6 lg:col-span-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-oxide">
                  02 · {tHome("currentExhibition")}
                </p>
                <h2 className="debossed-heading font-serif text-4xl font-light leading-tight tracking-tight text-ink-950 sm:text-5xl">
                  {pickLocalized(currentExhibition.title, locale)}
                </h2>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-600">
                  {currentExhibition.venue} — {currentExhibition.city}, {currentExhibition.country}
                </p>
                <p className="max-w-xl text-sm leading-relaxed text-ink-600 sm:text-base">
                  {pickLocalized(currentExhibition.curatorialText, locale)}
                </p>
                <Link
                  href="/exhibitions"
                  className="group inline-flex items-center gap-2 border border-ink-950 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-950 transition-colors hover:border-oxide hover:bg-oxide hover:text-board-50"
                >
                  <span>{tCommon("nav.exhibitions")}</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="lg:col-span-6">
                {currentExhibition.coverUrl ? (
                  <div className="relief-well bg-board-200/80 p-2.5 sm:p-3.5">
                    <div className="relief-raised aspect-[4/3] overflow-hidden bg-board-100">
                      {/* biome-ignore lint/performance/noImgElement: Dynamic exhibition spotlight photograph. */}
                      <img
                        src={currentExhibition.coverUrl}
                        alt={pickLocalized(currentExhibition.title, locale)}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </CreaseReveal>
        </section>
      ) : null}

      <div className="crease-rule" />

      {/* 4. Artist Portrait & Atelier Interlude */}
      <section className="py-20 lg:py-28">
        <ReliefReveal>
          <div className="relief-raised grid gap-10 border border-ink-950/12 bg-board-50/80 p-6 sm:p-10 lg:grid-cols-12 lg:items-center lg:p-14">
            <div className="lg:col-span-5">
              <figure className="space-y-2">
                <div className="aspect-[4/5] overflow-hidden border border-ink-950/15 bg-board-200">
                  {/* biome-ignore lint/performance/noImgElement: Official artist portrait by Grégory Copitet. */}
                  <img
                    src="/images/artist-portrait.jpg"
                    alt="Kokou Ferdinand Makouvia"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                  Portrait © Grégory Copitet
                </figcaption>
              </figure>
            </div>
            <div className="space-y-6 lg:col-span-7 lg:pl-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-oxide">
                03 · {tCommon("nav.about")}
              </p>
              <blockquote className="font-serif text-2xl font-light leading-relaxed text-ink-950 sm:text-3xl lg:text-4xl">
                “{statement}”
              </blockquote>
              <div className="flex flex-wrap gap-6 pt-2">
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-950 underline decoration-oxide underline-offset-4 hover:text-oxide"
                >
                  <span>{tCommon("actions.readMore")}</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </ReliefReveal>
      </section>

      <div className="crease-rule" />

      {/* 5. Selected Press & Studio Invitation */}
      <section className="grid gap-12 py-20 lg:grid-cols-12 lg:py-28">
        <div className="space-y-6 lg:col-span-7">
          <div className="flex items-end justify-between border-b border-ink-950/12 pb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-oxide">04</p>
              <h2 className="mt-1 font-serif text-3xl font-light sm:text-4xl">
                {tHome("selectedPress")}
              </h2>
            </div>
            <Link
              href="/press"
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-600 hover:text-oxide"
            >
              {tCommon("actions.viewAll")} ↗
            </Link>
          </div>

          <div className="divide-y divide-ink-950/12">
            {featuredPress.map((item) => (
              <article key={item.id} className="space-y-2 py-5">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                  <span>{item.publication}</span>
                  <span>{item.publishedDate.toISOString().slice(0, 10)}</span>
                </div>
                {item.slug ? (
                  <Link
                    href={{ pathname: "/press/[slug]", params: { slug: item.slug } }}
                    className="group block"
                  >
                    <h3 className="font-serif text-2xl font-light text-ink-950 transition-colors group-hover:text-oxide">
                      {pickLocalized(item.title, locale)}
                    </h3>
                  </Link>
                ) : (
                  <h3 className="font-serif text-2xl font-light text-ink-950">
                    {pickLocalized(item.title, locale)}
                  </h3>
                )}
                <p className="text-sm leading-relaxed text-ink-600">
                  {pickLocalized(item.excerpt, locale)}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="relief-raised flex flex-col justify-between border border-ink-950/12 bg-board-50/85 p-8 lg:col-span-5 lg:p-10">
          <div className="space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-oxide">
              Atelier / Galerie Sator
            </p>
            <h2 className="font-serif text-3xl font-light leading-tight text-ink-950 sm:text-4xl">
              {tHome("studioEnquiry")}
            </h2>
            <p className="text-sm leading-relaxed text-ink-600">
              {tCommon("footer.representedBy")} · {tCommon("footer.studio")}
            </p>
          </div>

          <div className="pt-8">
            <Link
              href="/contact"
              className="group inline-flex w-full items-center justify-between border border-ink-950 bg-ink-950 px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-board-50 transition-colors hover:border-oxide hover:bg-oxide"
            >
              <span>{tCommon("actions.enquire")}</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
