import { eq } from "drizzle-orm";
import type { Db } from "@/db";
import { documents, messages, missions, missionSteps } from "@/db/schema";
import { LlmError, type LlmProvider, type LlmUsage } from "@/server/llm/types";
import { addMessage, applyAnalysis } from "@/server/missions/service";
import { analysisJsonSchema, analysisSchema, type Analysis } from "./analysis-schema";
import { logExecution } from "./log";
import { analyzeSystemPrompt, type Capabilities } from "./prompts";

export type AnalyzeDeps = { db: Db; llm: LlmProvider; capabilities: Capabilities };

/** Builds the analysis input from persisted state only (no document or page contents). */
export async function buildAnalysisInput(db: Db, missionId: string) {
  const mission = await db.query.missions.findFirst({ where: eq(missions.id, missionId) });
  if (!mission) throw new Error("mission not found");
  const [steps, msgs, docs] = await Promise.all([
    db.select().from(missionSteps).where(eq(missionSteps.missionId, missionId)).orderBy(missionSteps.position),
    db.select().from(messages).where(eq(messages.missionId, missionId)).orderBy(messages.createdAt),
    db
      .select({ id: documents.id, name: documents.name, status: documents.status })
      .from(documents)
      .where(eq(documents.missionId, missionId)),
  ]);
  const conversation = msgs
    .filter((m) => m.role !== "event" || m.metadata?.kind === "step_update")
    .slice(-30)
    .map((m) => `[${m.role === "user" ? "Utilisateur" : m.role === "assistant" ? "Atlas" : "Événement"}] ${m.content.slice(0, 4000)}`)
    .join("\n\n");
  const plan = steps.length
    ? steps.map((s) => `- ${s.key} [${s.kind}] ${s.title} — statut ${s.status}${s.completedBy === "user" ? " (déclarée par l'utilisateur)" : ""}`).join("\n")
    : "(aucun plan pour l'instant)";
  const docList = docs.length ? docs.map((d) => `- ${d.name} (${d.status === "READY" ? "lisible" : d.status === "FAILED" ? "illisible" : "en cours"})`).join("\n") : "(aucun)";

  return `<mission>
Demande initiale : ${mission.description}
${mission.objective ? `Objectif actuel : ${mission.objective}` : ""}
</mission>

<plan_actuel>
${plan}
</plan_actuel>

<documents_importes>
${docList}
</documents_importes>

<conversation>
${conversation}
</conversation>

Analyse la mission à la lumière de toute la conversation (les derniers messages de l'utilisateur peuvent apporter des réponses ou de nouvelles informations) et renvoie l'analyse complète à jour.`;
}

function parseAnalysis(text: string): Analysis | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = analysisSchema.safeParse(JSON.parse(text.slice(start, end + 1)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Understanding + clarification + planning phase. Returns the updated mission.
 * Throws LlmError when the provider fails (the caller records it).
 */
export async function analyzeMission(deps: AnalyzeDeps, missionId: string, runId: string | null, signal?: AbortSignal) {
  const input = await buildAnalysisInput(deps.db, missionId);
  const system = analyzeSystemPrompt(deps.capabilities);
  const total: LlmUsage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };

  let analysis: Analysis | null = null;
  for (let attempt = 1; attempt <= 2 && !analysis; attempt++) {
    const started = Date.now();
    try {
      const res = await deps.llm.complete({
        purpose: "analyze",
        system,
        messages: [{ role: "user", content: input }],
        jsonSchema: analysisJsonSchema as unknown as Record<string, unknown>,
        maxTokens: 16000,
        signal,
      });
      for (const k of Object.keys(total) as (keyof LlmUsage)[]) total[k] += res.usage[k];
      analysis = parseAnalysis(res.text);
      await logExecution(deps.db, {
        missionId,
        runId,
        kind: "llm:analyze",
        status: analysis ? "ok" : "error",
        durationMs: Date.now() - started,
        attempt,
        model: res.model,
        usage: res.usage,
        details: analysis ? { steps: analysis.steps.length, questions: analysis.missing_info.length } : { error: "invalid_json" },
      });
    } catch (e) {
      await logExecution(deps.db, {
        missionId,
        runId,
        kind: "llm:analyze",
        status: "error",
        durationMs: Date.now() - started,
        attempt,
        details: { error: e instanceof LlmError ? e.kind : "unknown", message: e instanceof Error ? e.message.slice(0, 300) : "" },
      });
      throw e;
    }
  }
  if (!analysis) {
    throw new LlmError("La réponse du modèle n'a pas pu être interprétée. Réessayez.", true, "unknown");
  }

  const mission = await applyAnalysis(deps.db, missionId, analysis);
  await addMessage(deps.db, missionId, "assistant", analysis.reply, {
    kind: "analysis",
    questions: analysis.missing_info,
    unsupported: analysis.unsupported,
  });
  return { mission, analysis, usage: total };
}
