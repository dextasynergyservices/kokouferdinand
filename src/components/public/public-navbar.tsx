"use client";

import { cn } from "cn";
import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

const NAV_LINKS = [
  { href: "/works" as const, key: "works" as const },
  { href: "/exhibitions" as const, key: "exhibitions" as const },
  { href: "/about" as const, key: "about" as const },
  { href: "/press" as const, key: "press" as const },
];

const LOCALES: AppLocale[] = ["fr", "en", "es"];

export function PublicNavbar() {
  const t = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (y > 120 && y > lastScrollY.current + 6) {
        setHidden(true);
      } else if (y < lastScrollY.current - 6 || y < 80) {
        setHidden(false);
      }
      lastScrollY.current = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function switchLocale(nextLocale: AppLocale) {
    if (nextLocale === locale) return;
    if (pathname.startsWith("/works/")) {
      const slug = pathname.replace("/works/", "");
      router.replace({ pathname: "/works/[slug]", params: { slug } }, { locale: nextLocale });
    } else if (pathname.startsWith("/press/")) {
      const slug = pathname.replace("/press/", "");
      router.replace({ pathname: "/press/[slug]", params: { slug } }, { locale: nextLocale });
    } else {
      router.replace(pathname as "/", { locale: nextLocale });
    }
    setMenuOpen(false);
  }

  return (
    <>
      <header
        className={cn(
          "relief-nav paper-grain fixed inset-x-0 top-0 z-40 border-b border-ink-950/10 bg-board-100/95 backdrop-blur-md transition-transform duration-500 ease-out",
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:h-20 lg:px-12">
          <Link
            href="/"
            className="debossed-heading font-serif text-lg font-medium tracking-tight text-ink-950 transition-colors hover:text-oxide sm:text-xl"
          >
            KOKOU F. MAKOUVIA.
          </Link>

          {/* Laptop & Desktop Navigation with Relevo & Vinco dashed links + raised CTA tablet */}
          <div className="hidden items-center gap-7 lg:flex xl:gap-8">
            <nav aria-label="Main navigation" className="flex items-center gap-7">
              {NAV_LINKS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "link-dashed text-xs font-medium tracking-[0.04em]",
                      active ? "border-oxide text-oxide" : "text-ink-950",
                    )}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                );
              })}
            </nav>

            <fieldset
              aria-label={t("locale.label")}
              className="inline-flex items-center border border-ink-950/15 bg-board-50/70 p-0.5 font-mono text-[10px] uppercase tracking-[0.16em]"
            >
              {LOCALES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => switchLocale(code)}
                  className={cn(
                    "px-2 py-1 transition-colors",
                    locale === code
                      ? "bg-ink-950 text-board-50"
                      : "text-ink-600 hover:text-ink-950",
                  )}
                >
                  {code}
                </button>
              ))}
            </fieldset>

            <Link
              href="/contact"
              className="relief-btn px-5 py-2.5 text-xs font-semibold tracking-[0.04em]"
            >
              {t("nav.contact")}
            </Link>
          </div>

          {/* Mobile & Tablet Raised Circular Menu Disc (strictly hidden on desktop lg+) */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("nav.menu")}
              className="relief-btn size-10 rounded-full"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Dark Die-Cut Mobile Menu with Raised Warm-Board Typography */}
      {menuOpen ? (
        <div className="cavity-dark fixed inset-0 z-50 flex flex-col justify-between rounded-none! px-7 py-6 text-board-100 lg:hidden">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-board-300/80"
            >
              Kokou F. Makouvia
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t("nav.close")}
              className="relief-btn flex size-11 items-center justify-center rounded-full! text-ink-950"
            >
              <X className="size-4" />
            </button>
          </div>

          <nav className="my-auto flex flex-col gap-3 py-8">
            {[...NAV_LINKS, { href: "/contact" as const, key: "contact" as const }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="relief-raised-text font-serif text-4xl font-semibold uppercase tracking-wide transition-opacity hover:opacity-80 sm:text-5xl"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}

            <div className="mt-8 flex items-center gap-4 pt-4 font-mono text-xs uppercase tracking-[0.2em]">
              {LOCALES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => switchLocale(code)}
                  className={
                    locale === code
                      ? "border-b border-dashed border-board-100 pb-0.5 text-board-50"
                      : "text-board-300/60 hover:text-board-50"
                  }
                >
                  {code}
                </button>
              ))}
            </div>
          </nav>

          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-board-300/60">
            {t("footer.studio")} · Galerie Sator
          </p>
        </div>
      ) : null}
    </>
  );
}
