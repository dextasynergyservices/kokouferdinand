ALTER TABLE "press_items" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "press_items" ADD COLUMN "cover_url" text;--> statement-breakpoint
ALTER TABLE "press_items" ADD COLUMN "cover_r2_key" text;--> statement-breakpoint
ALTER TABLE "press_items" ADD COLUMN "body" jsonb;--> statement-breakpoint
ALTER TABLE "press_items" ADD CONSTRAINT "press_items_slug_unique" UNIQUE("slug");