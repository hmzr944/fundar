import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  index,
  uniqueIndex,
  numeric,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const missionStatus = pgEnum("mission_status", [
  "DRAFT",
  "NEEDS_INPUT",
  "PLANNED",
  "IN_PROGRESS",
  "WAITING_FOR_USER",
  "BLOCKED",
  "PARTIALLY_COMPLETED",
  "COMPLETED",
  "FAILED",
]);

export const stepStatus = pgEnum("step_status", [
  "PENDING",
  "IN_PROGRESS",
  "DONE",
  "WAITING_USER",
  "BLOCKED",
  "FAILED",
  "SKIPPED",
]);

export const stepKind = pgEnum("step_kind", [
  "research",
  "document_analysis",
  "deliverable",
  "planning",
  "user_action",
]);

/** Who performed / declared a step outcome. */
export const actor = pgEnum("actor", ["atlas", "user"]);

export const messageRole = pgEnum("message_role", ["user", "assistant", "event"]);

export const runStatus = pgEnum("run_status", [
  "RUNNING",
  "SUCCEEDED",
  "STOPPED",
  "FAILED",
  "CANCELLED",
  "INTERRUPTED",
]);

export const runKind = pgEnum("run_kind", ["analysis", "execution"]);

export const documentStatus = pgEnum("document_status", ["PROCESSING", "READY", "FAILED"]);

export const logStatus = pgEnum("log_status", ["ok", "error", "rejected"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name"),
    passwordHash: text("password_hash").notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    /** SHA-256 of the session token. The raw token only lives in the cookie. */
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export type Constraint = { label: string; value: string };
export type MissingInfo = { question: string; reason: string; blocking: boolean; answered?: boolean };
export type UnsupportedRequest = { request: string; reason: string; alternative: string };

export const missions = pgTable(
  "missions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    /** The user's original request, verbatim. */
    description: text("description").notNull(),
    objective: text("objective"),
    /** Atlas' reformulation of the request. */
    reformulation: text("reformulation"),
    constraints: jsonb("constraints").$type<Constraint[]>().notNull().default([]),
    missingInfo: jsonb("missing_info").$type<MissingInfo[]>().notNull().default([]),
    unsupported: jsonb("unsupported").$type<UnsupportedRequest[]>().notNull().default([]),
    status: missionStatus("status").notNull().default("DRAFT"),
    /** Short rolling summary of what has been done, fed back to the agent on resume. */
    contextSummary: text("context_summary"),
    /** Final report of the last execution run (markdown). */
    report: text("report"),
    remainingActions: jsonb("remaining_actions").$type<string[]>().notNull().default([]),
    limitations: jsonb("limitations").$type<string[]>().notNull().default([]),
    lastError: text("last_error"),
    /**
     * Random reference used by the usage ledger instead of the mission id, so
     * that ledger rows cannot be joined back to missions once they are deleted.
     */
    usageRef: uuid("usage_ref").notNull().defaultRandom(),
    ...timestamps,
  },
  (t) => [
    index("missions_user_updated_idx").on(t.userId, t.updatedAt),
    index("missions_user_status_idx").on(t.userId, t.status),
  ],
);

export const missionSteps = pgTable(
  "mission_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    /** Stable key assigned at planning time, used to merge plan revisions. */
    key: text("key").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    kind: stepKind("kind").notNull(),
    position: integer("position").notNull(),
    dependsOn: jsonb("depends_on").$type<string[]>().notNull().default([]),
    status: stepStatus("status").notNull().default("PENDING"),
    result: text("result"),
    error: text("error"),
    /** Who set the current terminal status (atlas executed it, or user declared it). */
    completedBy: actor("completed_by"),
    evidence: jsonb("evidence")
      .$type<{ sourceIds?: string[]; artifactIds?: string[]; documentIds?: string[] }>()
      .notNull()
      .default({}),
    ...timestamps,
  },
  (t) => [
    index("steps_mission_idx").on(t.missionId, t.position),
    uniqueIndex("steps_mission_key_unique").on(t.missionId, t.key),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    role: messageRole("role").notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_mission_idx").on(t.missionId, t.createdAt)],
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    /** Opaque key inside the storage backend. Never exposed to clients. */
    storageKey: text("storage_key").notNull(),
    status: documentStatus("status").notNull().default("PROCESSING"),
    extractedText: text("extracted_text"),
    extractedChars: integer("extracted_chars"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("documents_mission_idx").on(t.missionId), index("documents_user_idx").on(t.userId)],
);

export const artifactType = pgEnum("artifact_type", [
  "letter",
  "email",
  "checklist",
  "action_plan",
  "comparison_table",
  "summary",
  "report",
  "other",
]);

export const artifacts = pgTable(
  "artifacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    stepId: uuid("step_id").references(() => missionSteps.id, { onDelete: "set null" }),
    type: artifactType("type").notNull(),
    name: text("name").notNull(),
    /** Markdown body. Downloadable files are rendered from it on demand. */
    content: text("content").notNull(),
    editedByUser: boolean("edited_by_user").notNull().default(false),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    ...timestamps,
  },
  (t) => [index("artifacts_mission_idx").on(t.missionId)],
);

export const sources = pgTable(
  "sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    title: text("title"),
    excerpt: text("excerpt"),
    /** "search_result" = seen in a result list; "page" = page content actually fetched. */
    origin: text("origin").notNull(),
    publishedAt: text("published_at"),
    retrievedAt: timestamp("retrieved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("sources_mission_idx").on(t.missionId),
    uniqueIndex("sources_mission_url_origin_unique").on(t.missionId, t.url, t.origin),
  ],
);

export const missionRuns = pgTable(
  "mission_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: runKind("kind").notNull(),
    status: runStatus("status").notNull().default("RUNNING"),
    cancelRequested: boolean("cancel_requested").notNull().default(false),
    stopReason: text("stop_reason"),
    iterations: integer("iterations").notNull().default(0),
    toolCalls: integer("tool_calls").notNull().default(0),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    estimatedCostUsd: numeric("estimated_cost_usd", { precision: 12, scale: 6 }),
    heartbeatAt: timestamp("heartbeat_at", { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (t) => [
    index("runs_mission_idx").on(t.missionId, t.startedAt),
    index("runs_user_started_idx").on(t.userId, t.startedAt),
    // At most one active run per mission, enforced by the database.
    uniqueIndex("runs_one_active_per_mission").on(t.missionId).where(sql`${t.status} = 'RUNNING'`),
  ],
);

export const executionLogs = pgTable(
  "execution_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    runId: uuid("run_id").references(() => missionRuns.id, { onDelete: "cascade" }),
    stepId: uuid("step_id").references(() => missionSteps.id, { onDelete: "set null" }),
    /** "llm:analyze", "llm:execute", "tool:web_search", ... */
    kind: text("kind").notNull(),
    status: logStatus("status").notNull(),
    durationMs: integer("duration_ms").notNull(),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    /** Estimate computed from public list prices; null when no data is available. */
    estimatedCostUsd: numeric("estimated_cost_usd", { precision: 12, scale: 6 }),
    attempt: integer("attempt").notNull().default(1),
    /** Technical details only: never raw document contents or secrets. */
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("logs_mission_idx").on(t.missionId, t.createdAt)],
);

export type User = typeof users.$inferSelect;
export type Mission = typeof missions.$inferSelect;
export type MissionStep = typeof missionSteps.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Artifact = typeof artifacts.$inferSelect;
export type Source = typeof sources.$inferSelect;
export type MissionRun = typeof missionRuns.$inferSelect;
export type ExecutionLog = typeof executionLogs.$inferSelect;
export type MissionStatus = (typeof missionStatus.enumValues)[number];
export type StepStatus = (typeof stepStatus.enumValues)[number];
export type StepKind = (typeof stepKind.enumValues)[number];
export type ArtifactType = (typeof artifactType.enumValues)[number];

/**
 * Usage ledger: one row per analysis or execution run, kept independently of
 * missions (quotas and pilot economics survive mission deletion). Holds counters
 * and costs only, never content. On account deletion rows are anonymized.
 */
export const usageRecords = pgTable(
  "usage_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Null once the account is deleted (anonymized row). */
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    /** Copy of missions.usage_ref (no foreign key); re-randomized on anonymization. */
    missionRef: uuid("mission_ref").notNull(),
    /** Run being measured (no foreign key); cleared on anonymization. */
    runId: uuid("run_id"),
    kind: runKind("kind").notNull(),
    model: text("model"),
    searchProvider: text("search_provider"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),
    outcome: runStatus("outcome"),
    llmCalls: integer("llm_calls").notNull().default(0),
    toolCalls: integer("tool_calls").notNull().default(0),
    webSearches: integer("web_searches").notNull().default(0),
    pagesFetched: integer("pages_fetched").notNull().default(0),
    errors: integer("errors").notNull().default(0),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    /** Null when a model call had no known price. */
    estimatedCostUsd: numeric("estimated_cost_usd", { precision: 12, scale: 6 }),
    pricingVersion: text("pricing_version"),
    anonymizedAt: timestamp("anonymized_at", { withTimezone: true }),
  },
  (t) => [
    index("usage_user_kind_started_idx").on(t.userId, t.kind, t.startedAt),
    index("usage_run_idx").on(t.runId),
    index("usage_started_idx").on(t.startedAt),
  ],
);

export type UsageRecord = typeof usageRecords.$inferSelect;

/** Instance-wide settings (e.g. the identity of the storage volume). */
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
