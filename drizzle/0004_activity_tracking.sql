ALTER TABLE "missions" ADD COLUMN "last_activity_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
-- Backfill from existing data, so the upgrade does not reset inactivity clocks.
UPDATE "missions" SET "last_activity_at" = "updated_at";--> statement-breakpoint
UPDATE "users" u SET "last_seen_at" = greatest(
  u."created_at",
  coalesce((SELECT max(s."created_at") FROM "sessions" s WHERE s."user_id" = u."id"), u."created_at"),
  coalesce((SELECT max(m."updated_at") FROM "missions" m WHERE m."user_id" = u."id"), u."created_at")
);
