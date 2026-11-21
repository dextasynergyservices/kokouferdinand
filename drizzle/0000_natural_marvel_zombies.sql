CREATE TYPE "public"."artwork_availability" AS ENUM('available', 'sold', 'private_collection', 'on_request');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('unread', 'read', 'archived');--> statement-breakpoint
CREATE TYPE "public"."exhibition_type" AS ENUM('solo', 'group', 'biennale', 'fair');--> statement-breakpoint
CREATE TYPE "public"."publish_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."site_page_key" AS ENUM('home', 'about', 'contact', 'global');--> statement-breakpoint
CREATE TYPE "public"."video_source_type" AS ENUM('external_link', 'r2_upload');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'admin',
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artwork_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artwork_id" uuid NOT NULL,
	"url" text NOT NULL,
	"r2_key" text NOT NULL,
	"alt" jsonb NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"blur_data_url" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artworks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" jsonb NOT NULL,
	"series" text,
	"year" integer NOT NULL,
	"medium" jsonb NOT NULL,
	"dimensions" text NOT NULL,
	"description" jsonb NOT NULL,
	"provenance" jsonb,
	"availability" "artwork_availability" DEFAULT 'on_request' NOT NULL,
	"model_3d_url" text,
	"model_3d_r2_key" text,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "publish_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "artworks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"artwork_id" uuid,
	"locale" text DEFAULT 'fr' NOT NULL,
	"status" "enquiry_status" DEFAULT 'unread' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exhibitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"type" "exhibition_type" NOT NULL,
	"title" jsonb NOT NULL,
	"venue" text NOT NULL,
	"city" text NOT NULL,
	"country" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"curatorial_text" jsonb NOT NULL,
	"cover_url" text,
	"cover_r2_key" text,
	"gallery_images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"status" "publish_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "exhibitions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "press_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" jsonb NOT NULL,
	"publication" text NOT NULL,
	"published_date" timestamp NOT NULL,
	"external_url" text,
	"pdf_url" text,
	"pdf_r2_key" text,
	"excerpt" jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "publish_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" "site_page_key" NOT NULL,
	"content" jsonb NOT NULL,
	"cv_url" text,
	"cv_r2_key" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_pages_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"source_type" "video_source_type" NOT NULL,
	"external_url" text,
	"video_url" text,
	"video_r2_key" text,
	"poster_url" text,
	"poster_r2_key" text,
	"duration" text,
	"year" integer NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "publish_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "videos_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artwork_media" ADD CONSTRAINT "artwork_media_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "artwork_media_artwork_idx" ON "artwork_media" USING btree ("artwork_id","sort_order");--> statement-breakpoint
CREATE INDEX "artworks_status_sort_idx" ON "artworks" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "artworks_series_idx" ON "artworks" USING btree ("series");--> statement-breakpoint
CREATE INDEX "enquiries_status_created_idx" ON "enquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "exhibitions_status_start_idx" ON "exhibitions" USING btree ("status","start_date");--> statement-breakpoint
CREATE INDEX "press_status_date_idx" ON "press_items" USING btree ("status","published_date");--> statement-breakpoint
CREATE INDEX "videos_status_sort_idx" ON "videos" USING btree ("status","sort_order");