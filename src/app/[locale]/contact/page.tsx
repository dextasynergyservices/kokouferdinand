import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";
import { EnquiryForm } from "@/components/public/enquiry-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getSitePage } from "@/db/queries/pages";
import type { AppLocale } from "@/i18n/routing";
import { pickLocalized } from "@/lib/i18n-helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    alternates: {
      languages: {
        fr: "/fr/contact",
        en: "/en/contact",
        es: "/es/contacto",
        "x-default": "/fr/contact",
      },
    },
  };
}

async function ContactContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const [t, contactPage] = await Promise.all([getTranslations("contact"), getSitePage("contact")]);

  const headline = pickLocalized(contactPage?.content?.headline, locale) || t("title");
  const intro = pickLocalized(contactPage?.content?.intro, locale);
  const studioLocation = pickLocalized(contactPage?.content?.studioLocation, locale);
  const galleryContact = pickLocalized(contactPage?.content?.galleryContact, locale);

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <header className="mb-14 space-y-4 border-b border-ink-950/15 pb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-oxide">Atelier</p>
        <SplitTextReveal
          as="h1"
          immediate
          className="font-serif text-5xl font-light tracking-tight text-ink-950 sm:text-6xl"
        >
          {headline}
        </SplitTextReveal>
      </header>

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="relief-raised space-y-8 border border-ink-950/12 bg-board-50/80 p-6 sm:p-8">
            {intro ? <p className="text-base leading-relaxed text-ink-600">{intro}</p> : null}

            <div className="space-y-6 border-t border-ink-950/12 pt-6">
              {studioLocation ? (
                <div className="space-y-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-oxide">
                    Studio
                  </p>
                  <p className="text-sm text-ink-800">{studioLocation}</p>
                </div>
              ) : null}
              {galleryContact ? (
                <div className="space-y-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-oxide">
                    Galerie Sator
                  </p>
                  <p className="text-sm text-ink-800">{galleryContact}</p>
                  <a
                    href="https://www.galeriesator.com/artists/25-kokou-ferdinand-makouvia/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-oxide underline underline-offset-4 hover:text-ink-950"
                  >
                    galeriesator.com ↗
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <EnquiryForm
            locale={locale}
            turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            labels={{
              name: t("form.name"),
              email: t("form.email"),
              subject: t("form.subject"),
              message: t("form.message"),
              submit: t("form.submit"),
              submitting: t("form.submitting"),
              success: t("form.success"),
              error: t("form.error"),
              captchaRequired: t("form.captchaRequired"),
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] space-y-8 px-5 py-16 sm:px-8 lg:px-12">
          <Skeleton className="h-14 w-1/2 bg-board-200" />
          <Skeleton className="h-80 w-full bg-board-200" />
        </div>
      }
    >
      <ContactContent params={params} />
    </Suspense>
  );
}
