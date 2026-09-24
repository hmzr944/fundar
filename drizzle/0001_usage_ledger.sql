CREATE TABLE "usage_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"mission_ref" uuid NOT NULL,
	"run_id" uuid,
	"kind" "run_kind" NOT NULL,
	"model" text,
	"search_provider" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"duration_ms" integer,
	"outcome" "run_status",
	"llm_calls" integer DEFAULT 0 NOT NULL,
	"tool_calls" integer DEFAULT 0 NOT NULL,
	"web_searches" integer DEFAULT 0 NOT NULL,
	"pages_fetched" integer DEFAULT 0 NOT NULL,
	"errors" integer DEFAULT 0 NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"estimated_cost_usd" numeric(12, 6),
	"pricing_version" text,
	"anonymized_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "missions" ADD COLUMN "usage_ref" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "usage_user_kind_started_idx" ON "usage_records" USING btree ("user_id","kind","started_at");--> statement-breakpoint
CREATE INDEX "usage_run_idx" ON "usage_records" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "usage_started_idx" ON "usage_records" USING btree ("started_at");--> statement-breakpoint
-- Backfill: one ledger row per existing run, so quotas and costs survive the upgrade.
INSERT INTO "usage_records" ("user_id", "mission_ref", "run_id", "kind", "model", "started_at", "ended_at", "duration_ms", "outcome",
  "llm_calls", "tool_calls", "web_searches", "pages_fetched", "errors", "input_tokens", "output_tokens", "estimated_cost_usd", "pricing_version")
SELECT r."user_id", m."usage_ref", r."id", r."kind", a."model", r."started_at", r."finished_at",
  CASE WHEN r."finished_at" IS NULL THEN NULL ELSE (extract(epoch FROM (r."finished_at" - r."started_at")) * 1000)::int END,
  CASE WHEN r."status" = 'RUNNING' THEN NULL ELSE r."status" END,
  a."llm_calls", a."tool_calls", a."web_searches", a."pages_fetched", a."errors", a."input_tokens", a."output_tokens", a."cost", 'backfill'
FROM "mission_runs" r
JOIN "missions" m ON m."id" = r."mission_id"
CROSS JOIN LATERAL (
  SELECT
    max(l."details"->>'model') AS "model",
    (count(*) FILTER (WHERE l."kind" LIKE 'llm:%'))::int AS "llm_calls",
    (count(*) FILTER (WHERE l."kind" LIKE 'tool:%'))::int AS "tool_calls",
    (count(*) FILTER (WHERE l."kind" = 'tool:web_search'))::int AS "web_searches",
    (count(*) FILTER (WHERE l."kind" = 'tool:fetch_page' AND l."status" = 'ok'))::int AS "pages_fetched",
    (count(*) FILTER (WHERE l."status" <> 'ok'))::int AS "errors",
    coalesce(sum(l."input_tokens"), 0)::int AS "input_tokens",
    coalesce(sum(l."output_tokens"), 0)::int AS "output_tokens",
    CASE WHEN bool_or(l."kind" LIKE 'llm:%' AND l."status" = 'ok' AND l."estimated_cost_usd" IS NULL) THEN NULL
         ELSE coalesce(sum(l."estimated_cost_usd") FILTER (WHERE l."kind" LIKE 'llm:%' AND l."status" = 'ok'), 0) END AS "cost"
  FROM "execution_logs" l WHERE l."run_id" = r."id"
) a;
