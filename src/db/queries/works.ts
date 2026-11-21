import { and, asc, desc, eq, ne } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { artworks } from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function getPublishedWorks() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.works);

  return db.query.artworks.findMany({
    where: eq(artworks.status, "published"),
    orderBy: [asc(artworks.sortOrder), desc(artworks.year)],
    with: {
      media: {
        orderBy: (m, { asc: ascOrder }) => [ascOrder(m.sortOrder)],
      },
    },
  });
}

export async function getFeaturedWorks(limit = 6) {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.works);

  return db.query.artworks.findMany({
    where: and(eq(artworks.status, "published"), eq(artworks.featured, true)),
    orderBy: [asc(artworks.sortOrder), desc(artworks.year)],
    limit,
    with: {
      media: {
        orderBy: (m, { asc: ascOrder }) => [ascOrder(m.sortOrder)],
      },
    },
  });
}

export async function getPublishedWorkBySlug(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.works, CACHE_TAGS.work(slug));

  return db.query.artworks.findFirst({
    where: (a, { and: andOp, eq: eqOp }) => andOp(eqOp(a.slug, slug), eqOp(a.status, "published")),
    with: {
      media: { orderBy: (m, { asc: ascOrder }) => [ascOrder(m.sortOrder)] },
    },
  });
}

export async function getRelatedWorks(series: string | null, excludeId: string, limit = 3) {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.works);

  if (!series) return [];

  return db.query.artworks.findMany({
    where: and(
      eq(artworks.status, "published"),
      eq(artworks.series, series),
      ne(artworks.id, excludeId),
    ),
    orderBy: [asc(artworks.sortOrder), desc(artworks.year)],
    limit,
    with: {
      media: { orderBy: (m, { asc: ascOrder }) => [ascOrder(m.sortOrder)] },
    },
  });
}

export async function getPublishedWorkSlugs() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.works);

  const rows = await db
    .select({ slug: artworks.slug, updatedAt: artworks.updatedAt })
    .from(artworks)
    .where(eq(artworks.status, "published"));

  return rows;
}
