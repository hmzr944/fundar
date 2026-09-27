CREATE TYPE "public"."postal_letter_status" AS ENUM('PENDING_PAYMENT', 'PAID', 'SENT', 'FAILED');--> statement-breakpoint
CREATE TABLE "postal_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"artifact_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "postal_letter_status" DEFAULT 'PENDING_PAYMENT' NOT NULL,
	"recipient_address" jsonb NOT NULL,
	"price_cents" integer NOT NULL,
	"checkout_session_id" text,
	"paid_at" timestamp with time zone,
	"provider_id" text,
	"tracking_url" text,
	"failure" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "postal_address" jsonb;--> statement-breakpoint
ALTER TABLE "postal_letters" ADD CONSTRAINT "postal_letters_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postal_letters" ADD CONSTRAINT "postal_letters_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postal_letters" ADD CONSTRAINT "postal_letters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "postal_letters_mission_idx" ON "postal_letters" USING btree ("mission_id");--> statement-breakpoint
CREATE INDEX "postal_letters_artifact_idx" ON "postal_letters" USING btree ("artifact_id");