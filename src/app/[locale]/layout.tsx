import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavbar } from "@/components/public/public-navbar";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://makouvia.com").replace(/\/$/, "");

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Kokou Ferdinand Makouvia",
      template: "%s — Kokou Ferdinand Makouvia",
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        fr: "/fr",
        en: "/en",
        es: "/es",
        "x-default": "/fr",
      },
    },
  };
}

async function LocaleShell({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const allMessages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={{ common: allMessages.common }}>
      <div id="top" className="paper-grain min-h-screen bg-board-100 text-ink-950">
        <PublicNavbar />
        <SmoothScrollProvider>
          <main className="pt-16 lg:pt-20">{children}</main>
          <PublicFooter />
        </SmoothScrollProvider>
      </div>
    </NextIntlClientProvider>
  );
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-board-100" />}>
      <LocaleShell params={params}>{children}</LocaleShell>
    </Suspense>
  );
}
