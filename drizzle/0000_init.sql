CREATE TYPE "public"."actor" AS ENUM('atlas', 'user');--> statement-breakpoint
CREATE TYPE "public"."artifact_type" AS ENUM('letter', 'email', 'checklist', 'action_plan', 'comparison_table', 'summary', 'report', 'other');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('PROCESSING', 'READY', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."log_status" AS ENUM('ok', 'error', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant', 'event');--> statement-breakpoint
CREATE TYPE "public"."mission_status" AS ENUM('DRAFT', 'NEEDS_INPUT', 'PLANNED', 'IN_PROGRESS', 'WAITING_FOR_USER', 'BLOCKED', 'PARTIALLY_COMPLETED', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."run_kind" AS ENUM('analysis', 'execution');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('RUNNING', 'SUCCEEDED', 'STOPPED', 'FAILED', 'CANCELLED', 'INTERRUPTED');--> statement-breakpoint
CREATE TYPE "public"."step_kind" AS ENUM('research', 'document_analysis', 'deliverable', 'planning', 'user_action');--> statement-breakpoint
CREATE TYPE "public"."step_status" AS ENUM('PENDING', 'IN_PROGRESS', 'DONE', 'WAITING_USER', 'BLOCKED', 'FAILED', 'SKIPPED');--> statement-breakpoint
CREATE TABLE "artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"step_id" uuid,
	"type" "artifact_type" NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"edited_by_user" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"storage_key" text NOT NULL,
	"status" "document_status" DEFAULT 'PROCESSING' NOT NULL,
	"extracted_text" text,
	"extracted_chars" integer,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "execution_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"run_id" uuid,
	"step_id" uuid,
	"kind" text NOT NULL,
	"status" "log_status" NOT NULL,
	"duration_ms" integer NOT NULL,
	"input_tokens" integer,
	"output_tokens" integer,
	"estimated_cost_usd" numeric(12, 6),
	"attempt" integer DEFAULT 1 NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" "run_kind" NOT NULL,
	"status" "run_status" DEFAULT 'RUNNING' NOT NULL,
	"cancel_requested" boolean DEFAULT false NOT NULL,
	"stop_reason" text,
	"iterations" integer DEFAULT 0 NOT NULL,
	"tool_calls" integer DEFAULT 0 NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"estimated_cost_usd" numeric(12, 6),
	"heartbeat_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mission_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"kind" "step_kind" NOT NULL,
	"position" integer NOT NULL,
	"depends_on" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "step_status" DEFAULT 'PENDING' NOT NULL,
	"result" text,
	"error" text,
	"completed_by" "actor",
	"evidence" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"objective" text,
	"reformulation" text,
	"constraints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"missing_info" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"unsupported" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "mission_status" DEFAULT 'DRAFT' NOT NULL,
	"context_summary" text,
	"report" text,
	"remaining_actions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"limitations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"excerpt" text,
	"origin" text NOT NULL,
	"published_at" text,
	"retrieved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_step_id_mission_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."mission_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "execution_logs" ADD CONSTRAINT "execution_logs_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "execution_logs" ADD CONSTRAINT "execution_logs_run_id_mission_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."mission_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "execution_logs" ADD CONSTRAINT "execution_logs_step_id_mission_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."mission_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_runs" ADD CONSTRAINT "mission_runs_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_runs" ADD CONSTRAINT "mission_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_steps" ADD CONSTRAINT "mission_steps_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "artifacts_mission_idx" ON "artifacts" USING btree ("mission_id");--> statement-breakpoint
CREATE INDEX "documents_mission_idx" ON "documents" USING btree ("mission_id");--> statement-breakpoint
CREATE INDEX "documents_user_idx" ON "documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "logs_mission_idx" ON "execution_logs" USING btree ("mission_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_mission_idx" ON "messages" USING btree ("mission_id","created_at");--> statement-breakpoint
CREATE INDEX "runs_mission_idx" ON "mission_runs" USING btree ("mission_id","started_at");--> statement-breakpoint
CREATE INDEX "runs_user_started_idx" ON "mission_runs" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "runs_one_active_per_mission" ON "mission_runs" USING btree ("mission_id") WHERE "mission_runs"."status" = 'RUNNING';--> statement-breakpoint
CREATE INDEX "steps_mission_idx" ON "mission_steps" USING btree ("mission_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "steps_mission_key_unique" ON "mission_steps" USING btree ("mission_id","key");--> statement-breakpoint
CREATE INDEX "missions_user_updated_idx" ON "missions" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "missions_user_status_idx" ON "missions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sources_mission_idx" ON "sources" USING btree ("mission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sources_mission_url_origin_unique" ON "sources" USING btree ("mission_id","url","origin");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");