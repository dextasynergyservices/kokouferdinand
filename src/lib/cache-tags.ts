export const CACHE_TAGS = {
  works: "works",
  work: (slug: string) => `work:${slug}`,
  exhibitions: "exhibitions",
  videos: "videos",
  press: "press",
  pressItem: (slug: string) => `press:${slug}`,
  page: (key: "home" | "about" | "contact" | "global") => `page:${key}`,
} as const;
