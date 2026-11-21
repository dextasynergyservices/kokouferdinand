import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { sitePages } from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";

export type SitePageKey = "home" | "about" | "contact" | "global";

export async function getSitePage(key: SitePageKey) {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.page(key));

  return db.query.sitePages.findFirst({
    where: eq(sitePages.key, key),
  });
}
