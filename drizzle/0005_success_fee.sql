ALTER TABLE "missions" ADD COLUMN "outcome" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_payment_method_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "card_saved_at" timestamp with time zone;