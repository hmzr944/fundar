import type { Db } from "@/db";
import { executionLogs } from "@/db/schema";
import { estimateCostUsd, type LlmUsage } from "@/server/llm/types";

export async function logExecution(
  db: Db,
  entry: {
    missionId: string;
    runId?: string | null;
    stepId?: string | null;
    kind: string;
    status: "ok" | "error" | "rejected";
    durationMs: number;
    attempt?: number;
    model?: string;
    usage?: LlmUsage;
    details?: Record<string, unknown>;
  },
) {
  const cost = entry.usage && entry.model ? estimateCostUsd(entry.model, entry.usage) : null;
  await db.insert(executionLogs).values({
    missionId: entry.missionId,
    runId: entry.runId ?? null,
    stepId: entry.stepId ?? null,
    kind: entry.kind,
    status: entry.status,
    durationMs: Math.round(entry.durationMs),
    attempt: entry.attempt ?? 1,
    inputTokens: entry.usage ? entry.usage.inputTokens + entry.usage.cacheReadTokens + entry.usage.cacheWriteTokens : null,
    outputTokens: entry.usage?.outputTokens ?? null,
    estimatedCostUsd: cost === null ? null : cost.toFixed(6),
    details: { ...(entry.model ? { model: entry.model } : {}), ...(entry.details ?? {}) },
  });
  return cost;
}
