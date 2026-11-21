import { and, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { exhibitions } from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function getPublishedExhibitions() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.exhibitions);

  return db.query.exhibitions.findMany({
    where: eq(exhibitions.status, "published"),
    orderBy: [desc(exhibitions.isCurrent), desc(exhibitions.startDate)],
  });
}

export async function getCurrentExhibition() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.exhibitions);

  return db.query.exhibitions.findFirst({
    where: and(eq(exhibitions.status, "published"), eq(exhibitions.isCurrent, true)),
    orderBy: [desc(exhibitions.startDate)],
  });
}
