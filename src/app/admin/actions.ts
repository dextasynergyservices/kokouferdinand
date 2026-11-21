"use server";

import crypto from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { account, user } from "@/db/auth-schema";
import {
  artworkMedia,
  artworks,
  enquiries,
  exhibitions,
  pressItems,
  sitePages,
  videos,
} from "@/db/schema";
import { hasAnyAdmin, requireAdmin } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { deleteR2Object } from "@/lib/r2";
import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  artworkSchema,
  enquiryStatusSchema,
  exhibitionSchema,
  pressSchema,
  setupAdminSchema,
  sitePageSchema,
  videoSchema,
} from "@/lib/validations/admin";

type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

async function safeDeleteR2(key: string | null | undefined) {
  if (!key) return;
  try {
    await deleteR2Object(key);
  } catch (err) {
    console.warn(`Failed to delete R2 object ${key}:`, err);
  }
}

async function getClientIp(): Promise<string | null> {
  const hdrs = await headers();
  return hdrs.get("cf-connecting-ip") ?? hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

/**
 * One-time initial admin creation. Permanently locked once at least 1 user exists.
 */
export async function setupInitialAdminAction(input: unknown): Promise<ActionResult> {
  if (await hasAnyAdmin()) {
    return { ok: false, error: "Admin account already exists. Setup is permanently locked." };
  }

  const parsed = setupAdminSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form input" };
  }

  if (process.env.TURNSTILE_SECRET_KEY) {
    const ip = await getClientIp();
    const verified = await verifyTurnstileToken(parsed.data.turnstileToken ?? "", ip);
    if (!verified) {
      return { ok: false, error: "Turnstile verification failed. Please try again." };
    }
  }

  // Re-check right before inserting to minimize race window
  if (await hasAnyAdmin()) {
    return { ok: false, error: "Admin account already exists." };
  }

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(parsed.data.password);

  await db.insert(user).values({
    id: userId,
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    emailVerified: true,
    role: "admin",
  });

  await db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: passwordHash,
  });

  return { ok: true };
}

/**
 * Verifies Cloudflare Turnstile before client-side Better Auth signIn.email.
 */
export async function verifyAdminTurnstileAction(token: string): Promise<ActionResult> {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    return { ok: true };
  }
  const ip = await getClientIp();
  const verified = await verifyTurnstileToken(token, ip);
  if (!verified) {
    return { ok: false, error: "Security verification failed. Please retry." };
  }
  return { ok: true };
}

export async function saveSitePageAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = sitePageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid page payload" };
  }

  const { key, content, cvUrl, cvR2Key } = parsed.data;
  const existing = await db.query.sitePages.findFirst({ where: eq(sitePages.key, key) });

  if (existing?.cvR2Key && existing.cvR2Key !== cvR2Key) {
    await safeDeleteR2(existing.cvR2Key);
  }

  if (existing) {
    await db
      .update(sitePages)
      .set({
        content,
        cvUrl: cvUrl || null,
        cvR2Key: cvR2Key || null,
        updatedAt: new Date(),
      })
      .where(eq(sitePages.key, key));
  } else {
    await db.insert(sitePages).values({
      key,
      content,
      cvUrl: cvUrl || null,
      cvR2Key: cvR2Key || null,
    });
  }

  updateTag(CACHE_TAGS.page(key));
  return { ok: true };
}

export async function upsertArtworkAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = artworkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid artwork data" };
  }

  const { id, media, ...fields } = parsed.data;

  let artworkId = id;
  let previousSlug: string | undefined;

  if (id) {
    const existing = await db.query.artworks.findFirst({
      where: eq(artworks.id, id),
      with: { media: true },
    });
    if (!existing) {
      return { ok: false, error: "Artwork not found" };
    }
    previousSlug = existing.slug;

    if (existing.model3dR2Key && existing.model3dR2Key !== fields.model3dR2Key) {
      await safeDeleteR2(existing.model3dR2Key);
    }

    const incomingKeys = new Set(media.map((m) => m.r2Key));
    for (const oldItem of existing.media) {
      if (!incomingKeys.has(oldItem.r2Key)) {
        await safeDeleteR2(oldItem.r2Key);
      }
    }

    await db
      .update(artworks)
      .set({
        ...fields,
        series: fields.series || null,
        provenance: fields.provenance ?? null,
        model3dUrl: fields.model3dUrl || null,
        model3dR2Key: fields.model3dR2Key || null,
        updatedAt: new Date(),
      })
      .where(eq(artworks.id, id));

    await db.delete(artworkMedia).where(eq(artworkMedia.artworkId, id));
  } else {
    const [inserted] = await db
      .insert(artworks)
      .values({
        ...fields,
        series: fields.series || null,
        provenance: fields.provenance ?? null,
        model3dUrl: fields.model3dUrl || null,
        model3dR2Key: fields.model3dR2Key || null,
      })
      .returning({ id: artworks.id });
    artworkId = inserted?.id;
  }

  if (artworkId && media.length > 0) {
    const hasPrimary = media.some((m) => m.isPrimary);
    await db.insert(artworkMedia).values(
      media.map((item, idx) => ({
        artworkId,
        url: item.url,
        r2Key: item.r2Key,
        alt: item.alt,
        width: item.width,
        height: item.height,
        blurDataUrl: item.blurDataUrl ?? null,
        isPrimary: hasPrimary ? item.isPrimary : idx === 0,
        sortOrder: idx,
      })),
    );
  }

  updateTag(CACHE_TAGS.works);
  updateTag(CACHE_TAGS.work(fields.slug));
  if (previousSlug && previousSlug !== fields.slug) {
    updateTag(CACHE_TAGS.work(previousSlug));
  }

  return { ok: true, data: { id: artworkId ?? "" } };
}

export async function deleteArtworkAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const existing = await db.query.artworks.findFirst({
    where: eq(artworks.id, id),
    with: { media: true },
  });
  if (!existing) {
    return { ok: false, error: "Artwork not found" };
  }

  await safeDeleteR2(existing.model3dR2Key);
  for (const m of existing.media) {
    await safeDeleteR2(m.r2Key);
  }

  await db.delete(artworks).where(eq(artworks.id, id));

  updateTag(CACHE_TAGS.works);
  updateTag(CACHE_TAGS.work(existing.slug));
  return { ok: true };
}

export async function upsertExhibitionAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = exhibitionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid exhibition data" };
  }

  const { id, startDate, endDate, ...fields } = parsed.data;
  const payload = {
    ...fields,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : null,
    coverUrl: fields.coverUrl || null,
    coverR2Key: fields.coverR2Key || null,
  };

  let exhibitionId = id;
  if (id) {
    const existing = await db.query.exhibitions.findFirst({ where: eq(exhibitions.id, id) });
    if (!existing) return { ok: false, error: "Exhibition not found" };

    if (existing.coverR2Key && existing.coverR2Key !== payload.coverR2Key) {
      await safeDeleteR2(existing.coverR2Key);
    }
    const nextGalleryKeys = new Set(payload.galleryImages.map((img) => img.r2Key));
    for (const oldImg of existing.galleryImages) {
      if (!nextGalleryKeys.has(oldImg.r2Key)) {
        await safeDeleteR2(oldImg.r2Key);
      }
    }

    await db
      .update(exhibitions)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(exhibitions.id, id));
  } else {
    const [inserted] = await db
      .insert(exhibitions)
      .values(payload)
      .returning({ id: exhibitions.id });
    exhibitionId = inserted?.id;
  }

  updateTag(CACHE_TAGS.exhibitions);
  return { ok: true, data: { id: exhibitionId ?? "" } };
}

export async function deleteExhibitionAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const existing = await db.query.exhibitions.findFirst({ where: eq(exhibitions.id, id) });
  if (!existing) return { ok: false, error: "Exhibition not found" };

  await safeDeleteR2(existing.coverR2Key);
  for (const img of existing.galleryImages) {
    await safeDeleteR2(img.r2Key);
  }

  await db.delete(exhibitions).where(eq(exhibitions.id, id));
  updateTag(CACHE_TAGS.exhibitions);
  return { ok: true };
}

export async function upsertVideoAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = videoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid video data" };
  }

  const { id, ...fields } = parsed.data;
  const payload = {
    ...fields,
    externalUrl: fields.sourceType === "external_link" ? fields.externalUrl || null : null,
    videoUrl: fields.sourceType === "r2_upload" ? fields.videoUrl || null : null,
    videoR2Key: fields.sourceType === "r2_upload" ? fields.videoR2Key || null : null,
    posterUrl: fields.posterUrl || null,
    posterR2Key: fields.posterR2Key || null,
    duration: fields.duration || null,
  };

  let videoId = id;
  if (id) {
    const existing = await db.query.videos.findFirst({ where: eq(videos.id, id) });
    if (!existing) return { ok: false, error: "Video not found" };

    if (existing.videoR2Key && existing.videoR2Key !== payload.videoR2Key) {
      await safeDeleteR2(existing.videoR2Key);
    }
    if (existing.posterR2Key && existing.posterR2Key !== payload.posterR2Key) {
      await safeDeleteR2(existing.posterR2Key);
    }

    await db
      .update(videos)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(videos.id, id));
  } else {
    const [inserted] = await db.insert(videos).values(payload).returning({ id: videos.id });
    videoId = inserted?.id;
  }

  updateTag(CACHE_TAGS.videos);
  return { ok: true, data: { id: videoId ?? "" } };
}

export async function deleteVideoAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const existing = await db.query.videos.findFirst({ where: eq(videos.id, id) });
  if (!existing) return { ok: false, error: "Video not found" };

  await safeDeleteR2(existing.videoR2Key);
  await safeDeleteR2(existing.posterR2Key);
  await db.delete(videos).where(eq(videos.id, id));

  updateTag(CACHE_TAGS.videos);
  return { ok: true };
}

export async function upsertPressAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = pressSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid press item" };
  }

  const { id, publishedDate, ...fields } = parsed.data;
  const payload = {
    ...fields,
    publishedDate: new Date(publishedDate),
    externalUrl: fields.externalUrl || null,
    pdfUrl: fields.pdfUrl || null,
    pdfR2Key: fields.pdfR2Key || null,
    coverUrl: fields.coverUrl || null,
    coverR2Key: fields.coverR2Key || null,
    body: fields.body ?? null,
  };

  let pressId = id;
  let previousSlug: string | null | undefined;
  if (id) {
    const existing = await db.query.pressItems.findFirst({ where: eq(pressItems.id, id) });
    if (!existing) return { ok: false, error: "Press item not found" };
    previousSlug = existing.slug;

    if (existing.pdfR2Key && existing.pdfR2Key !== payload.pdfR2Key) {
      await safeDeleteR2(existing.pdfR2Key);
    }
    if (existing.coverR2Key && existing.coverR2Key !== payload.coverR2Key) {
      await safeDeleteR2(existing.coverR2Key);
    }

    await db.update(pressItems).set(payload).where(eq(pressItems.id, id));
  } else {
    const [inserted] = await db.insert(pressItems).values(payload).returning({ id: pressItems.id });
    pressId = inserted?.id;
  }

  updateTag(CACHE_TAGS.press);
  updateTag(CACHE_TAGS.pressItem(payload.slug));
  if (previousSlug && previousSlug !== payload.slug) {
    updateTag(CACHE_TAGS.pressItem(previousSlug));
  }
  return { ok: true, data: { id: pressId ?? "" } };
}

export async function deletePressAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const existing = await db.query.pressItems.findFirst({ where: eq(pressItems.id, id) });
  if (!existing) return { ok: false, error: "Press item not found" };

  await safeDeleteR2(existing.pdfR2Key);
  await safeDeleteR2(existing.coverR2Key);
  await db.delete(pressItems).where(eq(pressItems.id, id));

  updateTag(CACHE_TAGS.press);
  if (existing.slug) {
    updateTag(CACHE_TAGS.pressItem(existing.slug));
  }
  return { ok: true };
}

export async function updateEnquiryStatusAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = enquiryStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid enquiry status" };
  }

  await db
    .update(enquiries)
    .set({ status: parsed.data.status })
    .where(eq(enquiries.id, parsed.data.id));
  return { ok: true };
}

export async function deleteEnquiryAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.delete(enquiries).where(eq(enquiries.id, id));
  return { ok: true };
}
