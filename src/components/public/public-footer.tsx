import { cacheLife } from "next/cache";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

async function getCurrentYear() {
  "use cache";
  cacheLife("max");
  return new Date().getFullYear();
}

export async function PublicFooter() {
  const [t, year] = await Promise.all([getTranslations("common"), getCurrentYear()]);

  return (
    <footer className="mt-24 w-full px-3 pb-3 sm:px-5 sm:pb-5">
      {/* Relevo & Vinco Full-Width Inset Dark Die-Cut Cavity Footer */}
      <div className="cavity-dark w-full rounded-[6px] px-6 py-12 text-board-200 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
        <div className="mx-auto max-w-[1440px]">
          <p className="relief-raised-text font-serif text-4xl font-semibold uppercase leading-none tracking-tight sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
            Kokou Ferdinand Makouvia.
          </p>

          <div className="my-10 h-px w-full bg-board-100/20 lg:my-14" />

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-board-300/65">
                Atelier
              </p>
              <p className="text-sm leading-relaxed text-board-200/85">
                {t("footer.studio")}. {t("footer.representedBy")}.
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-board-300/65">
                Pages
              </p>
              <div className="flex flex-col items-start gap-2.5 text-sm">
                <Link
                  href="/works"
                  className="border-b border-dashed border-board-200/40 pb-0.5 text-board-100 transition-colors hover:border-board-50 hover:text-board-50"
                >
                  {t("nav.works")}
                </Link>
                <Link
                  href="/exhibitions"
                  className="border-b border-dashed border-board-200/40 pb-0.5 text-board-100 transition-colors hover:border-board-50 hover:text-board-50"
                >
                  {t("nav.exhibitions")}
                </Link>
                <Link
                  href="/about"
                  className="border-b border-dashed border-board-200/40 pb-0.5 text-board-100 transition-colors hover:border-board-50 hover:text-board-50"
                >
                  {t("nav.about")}
                </Link>
                <Link
                  href="/press"
                  className="border-b border-dashed border-board-200/40 pb-0.5 text-board-100 transition-colors hover:border-board-50 hover:text-board-50"
                >
                  {t("nav.press")}
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-board-300/65">
                {t("nav.contact")}
              </p>
              <div className="flex flex-col items-start gap-2.5 text-sm">
                <Link
                  href="/contact"
                  className="border-b border-dashed border-board-200/40 pb-0.5 text-board-100 transition-colors hover:border-board-50"
                >
                  {t("actions.enquire")}
                </Link>
                <a
                  href="https://www.galeriesator.com/artists/25-kokou-ferdinand-makouvia/"
                  target="_blank"
                  rel="noreferrer"
                  className="border-b border-dashed border-board-200/40 pb-0.5 text-board-100 transition-colors hover:border-board-50"
                >
                  Galerie Sator ↗
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-board-300/65">
                Galerie
              </p>
              <p className="text-sm leading-relaxed text-board-200/85">
                8 passage des Gravilliers
                <br />
                75003 Paris &amp; Komunuma
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-3 pt-6 text-xs text-board-300/70 sm:flex-row sm:items-center">
            <span>
              © {year} Kokou Ferdinand Makouvia. {t("footer.rights")}
            </span>
            <a
              href="#top"
              className="w-fit border-b border-dashed border-board-300/50 pb-0.5 transition-colors hover:border-board-50 hover:text-board-50"
            >
              ↑ Top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
