import { eq } from "drizzle-orm";
import type { Analysis } from "@/server/agent/analysis-schema";
import { missionSteps } from "@/db/schema";
import type { LlmRequest } from "@/server/llm/types";
import { db } from "./db";

export function analysis(over: Partial<Analysis> = {}): Analysis {
  return {
    title: "Mission de test",
    objective: "Objectif de test",
    reformulation: "Reformulation",
    constraints: [],
    missing_info: [],
    capabilities_needed: ["planning"],
    unsupported: [],
    steps: [{ key: "s1", title: "Organiser", description: "", kind: "planning", depends_on: [] }],
    reply: "Voici le plan.",
    ...over,
  };
}

export async function stepsOf(missionId: string) {
  return db.select().from(missionSteps).where(eq(missionSteps.missionId, missionId)).orderBy(missionSteps.position);
}

/** Step ids by key, read from the execution briefing sent to the model. */
export function planFromBriefing(req: LlmRequest): Record<string, string> {
  const first = req.messages[0];
  const text = typeof first.content === "string" ? first.content : "";
  const plan = JSON.parse(text.match(/<plan_json>\n([\s\S]*?)\n<\/plan_json>/)![1]) as { key: string; step_id: string }[];
  return Object.fromEntries(plan.map((p) => [p.key, p.step_id]));
}

export const turn = (req: LlmRequest) => req.messages.filter((m) => m.role === "assistant").length;
