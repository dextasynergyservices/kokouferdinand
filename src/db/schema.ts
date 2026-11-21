import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export type LocalizedText = {
  fr: string;
  en: string;
  es: string;
};

export const publishStatusEnum = pgEnum("publish_status", ["draft", "published"]);
export const availabilityEnum = pgEnum("artwork_availability", [
  "available",
  "sold",
  "private_collection",
  "on_request",
]);
export const exhibitionTypeEnum = pgEnum("exhibition_type", ["solo", "group", "biennale", "fair"]);
export const videoSourceEnum = pgEnum("video_source_type", ["external_link", "r2_upload"]);
export const enquiryStatusEnum = pgEnum("enquiry_status", ["unread", "read", "archived"]);
export const sitePageKeyEnum = pgEnum("site_page_key", ["home", "about", "contact", "global"]);

export const sitePages = pgTable("site_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: sitePageKeyEnum("key").notNull().unique(),
  content: jsonb("content").$type<Record<string, LocalizedText>>().notNull(),
  cvUrl: text("cv_url"),
  cvR2Key: text("cv_r2_key"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const artworks = pgTable(
  "artworks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    title: jsonb("title").$type<LocalizedText>().notNull(),
    series: text("series"),
    year: integer("year").notNull(),
    medium: jsonb("medium").$type<LocalizedText>().notNull(),
    dimensions: text("dimensions").notNull(),
    description: jsonb("description").$type<LocalizedText>().notNull(),
    provenance: jsonb("provenance").$type<LocalizedText>(),
    availability: availabilityEnum("availability").default("on_request").notNull(),
    model3dUrl: text("model_3d_url"),
    model3dR2Key: text("model_3d_r2_key"),
    featured: boolean("featured").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    status: publishStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("artworks_status_sort_idx").on(t.status, t.sortOrder),
    index("artworks_series_idx").on(t.series),
  ],
);

export const artworkMedia = pgTable(
  "artwork_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    artworkId: uuid("artwork_id")
      .notNull()
      .references(() => artworks.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    r2Key: text("r2_key").notNull(),
    alt: jsonb("alt").$type<LocalizedText>().notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    blurDataUrl: text("blur_data_url"),
    isPrimary: boolean("is_primary").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (t) => [index("artwork_media_artwork_idx").on(t.artworkId, t.sortOrder)],
);

export const exhibitions = pgTable(
  "exhibitions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    type: exhibitionTypeEnum("type").notNull(),
    title: jsonb("title").$type<LocalizedText>().notNull(),
    venue: text("venue").notNull(),
    city: text("city").notNull(),
    country: text("country").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    curatorialText: jsonb("curatorial_text").$type<LocalizedText>().notNull(),
    coverUrl: text("cover_url"),
    coverR2Key: text("cover_r2_key"),
    galleryImages: jsonb("gallery_images")
      .$type<Array<{ url: string; r2Key: string; caption?: LocalizedText }>>()
      .default([])
      .notNull(),
    isCurrent: boolean("is_current").default(false).notNull(),
    status: publishStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("exhibitions_status_start_idx").on(t.status, t.startDate)],
);

export const videos = pgTable(
  "videos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    title: jsonb("title").$type<LocalizedText>().notNull(),
    description: jsonb("description").$type<LocalizedText>().notNull(),
    sourceType: videoSourceEnum("source_type").notNull(),
    externalUrl: text("external_url"),
    videoUrl: text("video_url"),
    videoR2Key: text("video_r2_key"),
    posterUrl: text("poster_url"),
    posterR2Key: text("poster_r2_key"),
    duration: text("duration"),
    year: integer("year").notNull(),
    featured: boolean("featured").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    status: publishStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("videos_status_sort_idx").on(t.status, t.sortOrder)],
);

export const pressItems = pgTable(
  "press_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").unique(),
    title: jsonb("title").$type<LocalizedText>().notNull(),
    publication: text("publication").notNull(),
    publishedDate: timestamp("published_date").notNull(),
    externalUrl: text("external_url"),
    pdfUrl: text("pdf_url"),
    pdfR2Key: text("pdf_r2_key"),
    coverUrl: text("cover_url"),
    coverR2Key: text("cover_r2_key"),
    excerpt: jsonb("excerpt").$type<LocalizedText>().notNull(),
    body: jsonb("body").$type<LocalizedText>(),
    featured: boolean("featured").default(false).notNull(),
    status: publishStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("press_status_date_idx").on(t.status, t.publishedDate)],
);

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    artworkId: uuid("artwork_id").references(() => artworks.id, {
      onDelete: "set null",
    }),
    locale: text("locale").default("fr").notNull(),
    status: enquiryStatusEnum("status").default("unread").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("enquiries_status_created_idx").on(t.status, t.createdAt)],
);

export const artworksRelations = relations(artworks, ({ many }) => ({
  media: many(artworkMedia),
  enquiries: many(enquiries),
}));

export const artworkMediaRelations = relations(artworkMedia, ({ one }) => ({
  artwork: one(artworks, {
    fields: [artworkMedia.artworkId],
    references: [artworks.id],
  }),
}));

export const enquiriesRelations = relations(enquiries, ({ one }) => ({
  artwork: one(artworks, {
    fields: [enquiries.artworkId],
    references: [artworks.id],
  }),
}));
