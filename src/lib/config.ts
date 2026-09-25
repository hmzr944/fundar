import "server-only";

/**
 * Central runtime configuration. Every tunable limit lives here and can be
 * overridden through environment variables without touching the code.
 */

function int(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export type LlmProviderName = "anthropic" | "scripted" | "none";
export type SearchProviderName = "tavily" | "brave" | "none";

export function llmProviderName(): LlmProviderName {
  const explicit = process.env.ATLAS_LLM_PROVIDER?.trim().toLowerCase();
  if (explicit === "scripted") {
    // The scripted provider only exists for automated tests. It must never
    // answer real users.
    if (process.env.NODE_ENV === "production") return "none";
    return "scripted";
  }
  if (explicit === "none") return "none";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "none";
}

export function searchProviderName(): SearchProviderName {
  const explicit = process.env.ATLAS_SEARCH_PROVIDER?.trim().toLowerCase();
  if (explicit === "tavily" && process.env.TAVILY_API_KEY) return "tavily";
  if (explicit === "brave" && process.env.BRAVE_SEARCH_API_KEY) return "brave";
  if (explicit === "none") return "none";
  if (!explicit) {
    if (process.env.TAVILY_API_KEY) return "tavily";
    if (process.env.BRAVE_SEARCH_API_KEY) return "brave";
  }
  return "none";
}

export const config = {
  get databaseUrl() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL n'est pas défini.");
    return url;
  },
  get model() {
    return process.env.ATLAS_MODEL || "claude-opus-5";
  },
  /** Automatic proofreading of every deliverable (ATLAS_REVIEW=off disables it). */
  get reviewDeliverables() {
    return process.env.ATLAS_REVIEW?.trim().toLowerCase() !== "off";
  },
  get storageDir() {
    return process.env.ATLAS_STORAGE_DIR || "./storage";
  },
  get sessionDays() {
    return int("ATLAS_SESSION_DAYS", 30);
  },
  get retentionDays() {
    return int("ATLAS_RETENTION_DAYS", 365);
  },
  uploads: {
    get maxBytes() {
      return int("ATLAS_UPLOAD_MAX_MB", 10) * 1024 * 1024;
    },
    get maxPerMission() {
      return int("ATLAS_UPLOAD_MAX_PER_MISSION", 20);
    },
  },
  limits: {
    /** Model round-trips allowed in a single execution run. */
    get maxIterations() {
      return int("ATLAS_MAX_ITERATIONS", 24);
    },
    /** Tool calls allowed in a single execution run. */
    get maxToolCalls() {
      return int("ATLAS_MAX_TOOL_CALLS", 40);
    },
    /** Wall-clock budget of a single execution run, in seconds. */
    get maxRunSeconds() {
      return int("ATLAS_MAX_RUN_SECONDS", 600);
    },
    /** Total tokens (input + output) allowed in a single execution run. */
    get maxRunTokens() {
      return int("ATLAS_MAX_RUN_TOKENS", 1_500_000);
    },
    /** Identical tool calls (same name + same arguments) tolerated per run. */
    get maxIdenticalCalls() {
      return int("ATLAS_MAX_IDENTICAL_CALLS", 2);
    },
    /** Consecutive failing tool calls before the run is stopped. */
    get maxConsecutiveErrors() {
      return int("ATLAS_MAX_CONSECUTIVE_ERRORS", 5);
    },
    /** Execution runs a user may start per rolling 24h. */
    get runsPerDay() {
      return int("ATLAS_RUNS_PER_DAY", 40);
    },
    /** Analysis (understanding/planning) calls a user may trigger per rolling 24h. */
    get analysesPerDay() {
      return int("ATLAS_ANALYSES_PER_DAY", 150);
    },
    /** A running execution without heartbeat for this long is considered interrupted. */
    get staleRunSeconds() {
      return int("ATLAS_STALE_RUN_SECONDS", 180);
    },
  },
};
