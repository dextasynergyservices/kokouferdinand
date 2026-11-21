import type { MetadataRoute } from "next";
import { getPublishedPressSlugs } from "@/db/queries/press";
import { getPublishedWorkSlugs } from "@/db/queries/works";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const STATIC_PATHS = ["/", "/works", "/exhibitions", "/about", "/press", "/contact"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://makouvia.com").replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of routing.locales) {
      const localizedPath = getPathname({ locale, href: path });
      entries.push({
        url: `${siteUrl}${localizedPath}`,
        changeFrequency: path === "/" || path === "/works" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : 0.8,
      });
    }
  }

  const [workSlugs, pressSlugs] = await Promise.all([
    getPublishedWorkSlugs(),
    getPublishedPressSlugs(),
  ]);

  for (const item of workSlugs) {
    for (const locale of routing.locales) {
      const localizedPath = getPathname({
        locale,
        href: { pathname: "/works/[slug]", params: { slug: item.slug } },
      });
      entries.push({
        url: `${siteUrl}${localizedPath}`,
        lastModified: item.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  for (const item of pressSlugs) {
    for (const locale of routing.locales) {
      const localizedPath = getPathname({
        locale,
        href: { pathname: "/press/[slug]", params: { slug: item.slug } },
      });
      entries.push({
        url: `${siteUrl}${localizedPath}`,
        lastModified: item.publishedDate,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
