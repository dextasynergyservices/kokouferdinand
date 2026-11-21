import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "es"],
  defaultLocale: "fr",
  pathnames: {
    "/": "/",
    "/works": { fr: "/oeuvres", en: "/works", es: "/obras" },
    "/works/[slug]": { fr: "/oeuvres/[slug]", en: "/works/[slug]", es: "/obras/[slug]" },
    "/exhibitions": { fr: "/expositions", en: "/exhibitions", es: "/exposiciones" },
    "/about": { fr: "/a-propos", en: "/about", es: "/acerca" },
    "/press": { fr: "/presse", en: "/press", es: "/prensa" },
    "/press/[slug]": { fr: "/presse/[slug]", en: "/press/[slug]", es: "/prensa/[slug]" },
    "/contact": { fr: "/contact", en: "/contact", es: "/contacto" },
  },
});

export type AppLocale = (typeof routing.locales)[number];
