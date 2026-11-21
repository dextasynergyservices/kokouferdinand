import { z } from "zod";
import { parseSafeImageUrl } from "@/lib/image-utils";
import { parseExternalVideoUrl } from "@/lib/video-utils";

export const localizedTextSchema = z.object({
  fr: z.string().trim().min(1, "French text is required"),
  en: z.string().trim().default(""),
  es: z.string().trim().default(""),
});

export const optionalLocalizedTextSchema = z.object({
  fr: z.string().trim().default(""),
  en: z.string().trim().default(""),
  es: z.string().trim().default(""),
});

export const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only");

const safeMediaUrlSchema = z
  .string()
  .trim()
  .refine((val) => val === "" || parseSafeImageUrl(val) !== null, {
    message: "URL must be a valid HTTPS R2 asset URL or root-relative path",
  });

export const setupAdminSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.email("Enter a valid email address"),
  password: z.string().min(10, "Password must be at least 10 characters").max(128),
  turnstileToken: z.string().optional(),
});

export const sitePageSchema = z.object({
  key: z.enum(["home", "about", "contact", "global"]),
  content: z.record(z.string(), optionalLocalizedTextSchema),
  cvUrl: safeMediaUrlSchema.optional().nullable(),
  cvR2Key: z.string().trim().optional().nullable(),
});

export const artworkMediaItemSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().trim().min(1),
  r2Key: z.string().trim().min(1),
  alt: optionalLocalizedTextSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurDataUrl: z.string().optional().nullable(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const artworkSchema = z.object({
  id: z.string().uuid().optional(),
  slug: slugSchema,
  title: localizedTextSchema,
  series: z.string().trim().max(120).optional().nullable(),
  year: z.number().int().min(1980).max(2100),
  medium: localizedTextSchema,
  dimensions: z.string().trim().min(1, "Dimensions are required").max(200),
  description: localizedTextSchema,
  provenance: optionalLocalizedTextSchema.optional().nullable(),
  availability: z.enum(["available", "sold", "private_collection", "on_request"]),
  model3dUrl: safeMediaUrlSchema.optional().nullable(),
  model3dR2Key: z.string().trim().optional().nullable(),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  status: z.enum(["draft", "published"]),
  media: z.array(artworkMediaItemSchema).default([]),
});

export const exhibitionGalleryItemSchema = z.object({
  url: z.string().trim().min(1),
  r2Key: z.string().trim().min(1),
  caption: optionalLocalizedTextSchema.optional(),
});

export const exhibitionSchema = z.object({
  id: z.string().uuid().optional(),
  slug: slugSchema,
  type: z.enum(["solo", "group", "biennale", "fair"]),
  title: localizedTextSchema,
  venue: z.string().trim().min(1, "Venue is required").max(200),
  city: z.string().trim().min(1, "City is required").max(120),
  country: z.string().trim().min(1, "Country is required").max(120),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  curatorialText: localizedTextSchema,
  coverUrl: safeMediaUrlSchema.optional().nullable(),
  coverR2Key: z.string().trim().optional().nullable(),
  galleryImages: z.array(exhibitionGalleryItemSchema).default([]),
  isCurrent: z.boolean().default(false),
  status: z.enum(["draft", "published"]),
});

export const videoSchema = z
  .object({
    id: z.string().uuid().optional(),
    slug: slugSchema,
    title: localizedTextSchema,
    description: localizedTextSchema,
    sourceType: z.enum(["external_link", "r2_upload"]),
    externalUrl: z.string().trim().optional().nullable(),
    videoUrl: safeMediaUrlSchema.optional().nullable(),
    videoR2Key: z.string().trim().optional().nullable(),
    posterUrl: safeMediaUrlSchema.optional().nullable(),
    posterR2Key: z.string().trim().optional().nullable(),
    duration: z.string().trim().max(20).optional().nullable(),
    year: z.number().int().min(1980).max(2100),
    featured: z.boolean().default(false),
    sortOrder: z.number().int().default(0),
    status: z.enum(["draft", "published"]),
  })
  .superRefine((data, ctx) => {
    if (data.sourceType === "external_link") {
      if (!data.externalUrl || !parseExternalVideoUrl(data.externalUrl)) {
        ctx.addIssue({
          code: "custom",
          path: ["externalUrl"],
          message: "Provide a valid YouTube or Vimeo URL",
        });
      }
    } else if (!data.videoUrl || !data.videoR2Key) {
      ctx.addIssue({
        code: "custom",
        path: ["videoUrl"],
        message: "Upload an MP4 or WebM video file",
      });
    }
  });

export const pressSchema = z.object({
  id: z.string().uuid().optional(),
  slug: slugSchema,
  title: localizedTextSchema,
  publication: z.string().trim().min(1, "Publication name is required").max(200),
  publishedDate: z.string().min(1, "Published date is required"),
  externalUrl: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || /^https?:\/\//i.test(val), "Must be an HTTP(S) URL"),
  pdfUrl: safeMediaUrlSchema.optional().nullable(),
  pdfR2Key: z.string().trim().optional().nullable(),
  coverUrl: safeMediaUrlSchema.optional().nullable(),
  coverR2Key: z.string().trim().optional().nullable(),
  excerpt: localizedTextSchema,
  body: optionalLocalizedTextSchema.optional().nullable(),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]),
});

export const enquiryStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["unread", "read", "archived"]),
});

export const publicEnquirySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.email("Enter a valid email address"),
  subject: z.string().trim().min(2, "Subject is required").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(4000),
  artworkId: z.string().uuid().optional().nullable(),
  locale: z.enum(["fr", "en", "es"]).default("fr"),
  turnstileToken: z.string().optional(),
});

export type ArtworkFormValues = z.infer<typeof artworkSchema>;
export type ExhibitionFormValues = z.infer<typeof exhibitionSchema>;
export type VideoFormValues = z.infer<typeof videoSchema>;
export type PressFormValues = z.infer<typeof pressSchema>;
export type SitePageFormValues = z.infer<typeof sitePageSchema>;
