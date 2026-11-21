import { and, desc, eq, isNotNull } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { pressItems } from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function getPublishedPressItems() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.press);

  return db.query.pressItems.findMany({
    where: eq(pressItems.status, "published"),
    orderBy: [desc(pressItems.publishedDate)],
  });
}

export async function getFeaturedPressItems(limit = 3) {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.press);

  return db.query.pressItems.findMany({
    where: and(eq(pressItems.status, "published"), eq(pressItems.featured, true)),
    orderBy: [desc(pressItems.publishedDate)],
    limit,
  });
}

export async function getPublishedPressBySlug(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.press, CACHE_TAGS.pressItem(slug));

  return db.query.pressItems.findFirst({
    where: and(eq(pressItems.slug, slug), eq(pressItems.status, "published")),
  });
}

export async function getPublishedPressSlugs() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.press);

  const rows = await db
    .select({ slug: pressItems.slug, publishedDate: pressItems.publishedDate })
    .from(pressItems)
    .where(and(eq(pressItems.status, "published"), isNotNull(pressItems.slug)));

  return rows.filter((r): r is { slug: string; publishedDate: Date } => Boolean(r.slug));
}
