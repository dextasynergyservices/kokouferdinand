import { and, asc, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function getPublishedVideos() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.videos);

  return db.query.videos.findMany({
    where: eq(videos.status, "published"),
    orderBy: [asc(videos.sortOrder), desc(videos.year)],
  });
}

export async function getFeaturedVideos(limit = 3) {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.videos);

  return db.query.videos.findMany({
    where: and(eq(videos.status, "published"), eq(videos.featured, true)),
    orderBy: [asc(videos.sortOrder), desc(videos.year)],
    limit,
  });
}
