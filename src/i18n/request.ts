import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const [common, home, works, about, exhibitions, videos, contact] = await Promise.all([
    import(`../messages/${locale}/common.json`),
    import(`../messages/${locale}/home.json`),
    import(`../messages/${locale}/works.json`),
    import(`../messages/${locale}/about.json`),
    import(`../messages/${locale}/exhibitions.json`),
    import(`../messages/${locale}/videos.json`),
    import(`../messages/${locale}/contact.json`),
  ]);

  return {
    locale,
    messages: {
      common: common.default,
      home: home.default,
      works: works.default,
      about: about.default,
      exhibitions: exhibitions.default,
      videos: videos.default,
      contact: contact.default,
    },
  };
});
