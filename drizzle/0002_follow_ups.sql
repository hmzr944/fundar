ALTER TYPE "public"."mission_status" ADD VALUE 'SCHEDULED';--> statement-breakpoint
ALTER TABLE "missions" ADD COLUMN "next_follow_up_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "missions" ADD COLUMN "follow_up_reason" text;--> statement-breakpoint
CREATE INDEX "missions_follow_up_idx" ON "missions" USING btree ("next_follow_up_at");