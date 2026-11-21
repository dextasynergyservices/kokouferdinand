import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

async function RedirectToAbout({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/about", locale: locale as AppLocale });
  return null;
}

export default function VideosRedirectPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense fallback={null}>
      <RedirectToAbout params={params} />
    </Suspense>
  );
}
