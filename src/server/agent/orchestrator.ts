import { and, eq, inArray } from "drizzle-orm";
import type { Db } from "@/db";
import { artifacts, documents, messages, missionRuns, missions, missionSteps, sources } from "@/db/schema";
import { LlmError, estimateCostUsd, type LlmMessage, type LlmProvider } from "@/server/llm/types";
import type { PageFetcher } from "@/server/search/fetch-page";
import type { SearchProvider } from "@/server/search/providers";
import { addMessage, refreshMissionStatus } from "@/server/missions/service";
import { logExecution } from "./log";
import { executeSystemPrompt, type Capabilities } from "./prompts";
import { executeTool, toolDefinitions, type ToolContext } from "./tools";

export type RunLimits = {
  maxIterations: number;
  maxToolCalls: number;
  maxRunSeconds: number;
  maxRunTokens: number;
  maxIdenticalCalls: number;
  maxConsecutiveErrors: number;
};

export type ExecuteDeps = {
  db: Db;
  llm: LlmProvider;
  search: SearchProvider | null;
  fetchPage: PageFetcher;
  capabilities: Capabilities;
  limits: RunLimits;
};

export type RunOutcome = {
  runStatus: "SUCCEEDED" | "STOPPED" | "FAILED" | "CANCELLED";
  stopReason: string;
  finished: boolean;
};

/** Builds the execution briefing from persisted state (resumable at any time). */
export async function buildExecutionBriefing(db: Db, missionId: string) {
  const mission = await db.query.missions.findFirst({ where: eq(missions.id, missionId) });
  if (!mission) throw new Error("mission not found");
  const [steps, docs, msgs, arts, srcCount] = await Promise.all([
    db.select().from(missionSteps).where(eq(missionSteps.missionId, missionId)).orderBy(missionSteps.position),
    db
      .select({ id: documents.id, name: documents.name, status: documents.status, chars: documents.extractedChars, error: documents.error })
      .from(documents)
      .where(eq(documents.missionId, missionId)),
    db.select().from(messages).where(eq(messages.missionId, missionId)).orderBy(messages.createdAt),
    db.select({ id: artifacts.id, name: artifacts.name, type: artifacts.type }).from(artifacts).where(eq(artifacts.missionId, missionId)),
    db.select({ id: sources.id }).from(sources).where(eq(sources.missionId, missionId)),
  ]);

  const planJson = steps.map((s) => ({
    step_id: s.id,
    key: s.key,
    kind: s.kind,
    title: s.title,
    description: s.description,
    depends_on: s.dependsOn,
    status: s.status,
    declared_by_user: s.completedBy === "user",
    result: s.result?.slice(0, 1500) ?? null,
    error: s.error,
  }));
  const conversation = msgs
    .filter((m) => m.role !== "event")
    .slice(-20)
    .map((m) => `[${m.role === "user" ? "Utilisateur" : "Atlas"}] ${m.content.slice(0, 3000)}`)
    .join("\n\n");

  return `<mission>
Objectif : ${mission.objective ?? mission.description}
Demande initiale : ${mission.description}
Reformulation : ${mission.reformulation ?? "-"}
Contraintes : ${mission.constraints.length ? mission.constraints.map((c) => `${c.label} = ${c.value}`).join(" ; ") : "aucune connue"}
Informations encore manquantes : ${mission.missingInfo.length ? mission.missingInfo.map((m) => `${m.question}${m.blocking ? " (bloquante)" : ""}`).join(" ; ") : "aucune"}
</mission>

<plan_json>
${JSON.stringify(planJson, null, 1)}
</plan_json>

<documents>
${docs.length ? docs.map((d) => `- document_id=${d.id} « ${d.name} » ${d.status === "READY" ? `(${d.chars} caractères lisibles)` : `(illisible : ${d.error ?? d.status})`}`).join("\n") : "(aucun document importé)"}
</documents>

<deja_produit>
Livrables existants : ${arts.length ? arts.map((a) => `${a.name} [${a.type}] artifact_id=${a.id}`).join(" ; ") : "aucun"}
Sources déjà enregistrées : ${srcCount.length}
${mission.contextSummary ? `Résumé des exécutions précédentes :\n${mission.contextSummary}` : ""}
</deja_produit>

<conversation>
${conversation}
</conversation>

Exécute les étapes encore ouvertes (statut PENDING, IN_PROGRESS, BLOCKED ou FAILED ; les étapes DONE/SKIPPED sont closes). Réessaie une étape BLOCKED/FAILED seulement si une nouvelle information le permet. Termine par finish_mission.`;
}

function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}
const stableKey = (name: string, input: unknown) => `${name}:${canonical(input)}`;

/**
 * Central orchestrator: drives the model/tool loop under hard limits,
 * validates every tool call, persists every effect and derives the mission
 * status from evidence at the end.
 */
export async function executeMission(
  deps: ExecuteDeps,
  params: { runId: string; missionId: string; userId: string; signal: AbortSignal },
): Promise<RunOutcome> {
  const { db, limits } = deps;
  const { runId, missionId, userId, signal } = params;
  const startedAt = Date.now();
  const system = executeSystemPrompt(deps.capabilities);
  const tools = toolDefinitions({ webSearch: deps.capabilities.webSearch });
  const history: LlmMessage[] = [{ role: "user", content: await buildExecutionBriefing(db, missionId) }];
  const ctx: ToolContext = {
    db,
    userId,
    missionId,
    runId,
    search: deps.search,
    fetchPage: deps.fetchPage,
    signal,
    readDocumentIds: new Set(),
  };

  let iterations = 0;
  let toolCalls = 0;
  let tokens = 0;
  let cost = 0;
  let costKnown = true;
  let consecutiveErrors = 0;
  let nudged = false;
  const seen = new Map<string, number>();
  let finish: { summary: string; remainingActions: string[]; limitations: string[] } | null = null;
  let outcome: RunOutcome | null = null;

  const stop = (runStatus: RunOutcome["runStatus"], stopReason: string) => {
    outcome = { runStatus, stopReason, finished: false };
  };

  while (!outcome && !finish) {
    // ── Guards ────────────────────────────────────────────────────────────
    const run = await db.query.missionRuns.findFirst({ where: eq(missionRuns.id, runId) });
    if (!run || run.status !== "RUNNING") {
      // This run's own row was flipped away from RUNNING by something
      // outside this loop (stale-run recovery is the only source today)
      // while the loop was still alive. That path already reopened this
      // run's steps and posted a message about it, so stop immediately
      // without calling finalizeRun on top of it: doing so would post a
      // second, contradictory message and could race a resumed run that
      // has since started on the same mission.
      return { runStatus: "CANCELLED", stopReason: "Exécution arrêtée : elle n'est plus considérée active par le système.", finished: false };
    }
    if (signal.aborted || run.cancelRequested) {
      stop("CANCELLED", "Exécution interrompue à votre demande.");
      break;
    }
    if (iterations >= limits.maxIterations) {
      stop("STOPPED", `Limite de ${limits.maxIterations} échanges avec le modèle atteinte.`);
      break;
    }
    if ((Date.now() - startedAt) / 1000 > limits.maxRunSeconds) {
      stop("STOPPED", `Durée maximale d'exécution (${limits.maxRunSeconds} s) atteinte.`);
      break;
    }
    if (tokens > limits.maxRunTokens) {
      stop("STOPPED", "Budget de tokens de l'exécution épuisé.");
      break;
    }

    // ── Model call ────────────────────────────────────────────────────────
    iterations++;
    const t0 = Date.now();
    let res;
    try {
      res = await deps.llm.complete({ purpose: "execute", system, messages: history, tools, maxTokens: 16000, signal });
    } catch (e) {
      const err = e instanceof LlmError ? e : new LlmError(e instanceof Error ? e.message : "Erreur inconnue.", false, "unknown");
      await logExecution(db, {
        missionId,
        runId,
        kind: "llm:execute",
        status: "error",
        durationMs: Date.now() - t0,
        attempt: iterations,
        details: { error: err.kind, message: err.message.slice(0, 300) },
      });
      if (err.kind === "aborted") stop("CANCELLED", "Exécution interrompue à votre demande.");
      else stop("FAILED", err.message);
      break;
    }
    const callCost = await logExecution(db, {
      missionId,
      runId,
      kind: "llm:execute",
      status: "ok",
      durationMs: Date.now() - t0,
      attempt: iterations,
      model: res.model,
      usage: res.usage,
      details: { stopReason: res.stopReason, toolCalls: res.toolCalls.map((c) => c.name) },
    });
    const callTokens = res.usage.inputTokens + res.usage.outputTokens + res.usage.cacheReadTokens + res.usage.cacheWriteTokens;
    tokens += callTokens;
    if (callCost === null) costKnown = false;
    else cost += callCost;
    await db
      .update(missionRuns)
      .set({
        iterations,
        inputTokens: sqlAdd(run?.inputTokens, res.usage.inputTokens + res.usage.cacheReadTokens + res.usage.cacheWriteTokens),
        outputTokens: sqlAdd(run?.outputTokens, res.usage.outputTokens),
        heartbeatAt: new Date(),
      })
      .where(eq(missionRuns.id, runId));

    history.push({ role: "assistant", content: res.assistantContent });

    if (res.stopReason === "pause_turn") continue;

    if (res.toolCalls.length === 0) {
      if (!nudged) {
        nudged = true;
        history.push({
          role: "user",
          content:
            res.stopReason === "max_tokens"
              ? "Ta réponse a été coupée. Continue en utilisant les outils, et crée les contenus longs avec create_deliverable."
              : "Utilise les outils pour avancer sur les étapes ouvertes, puis appelle finish_mission avec ton compte rendu.",
        });
        continue;
      }
      stop("STOPPED", "Le modèle a cessé d'utiliser les outils sans clore l'exécution.");
      break;
    }

    // ── Tool calls (sequential: they write to the same mission) ──────────
    const results = [];
    for (const call of res.toolCalls) {
      toolCalls++;
      const key = stableKey(call.name, call.input);
      const count = (seen.get(key) ?? 0) + 1;
      seen.set(key, count);
      const t1 = Date.now();
      let result;
      if (toolCalls > limits.maxToolCalls) {
        result = {
          ok: false,
          content: { ok: false, error: { code: "limit", message: "Nombre maximal d'appels d'outils atteint. Appelle finish_mission." } },
          error: { code: "limit", message: "limit" },
        };
      } else if (count > limits.maxIdenticalCalls && call.name !== "update_step") {
        result = {
          ok: false,
          content: {
            ok: false,
            error: { code: "repeated_call", message: "Appel identique déjà effectué plusieurs fois. Change d'approche ou passe l'étape en blocked." },
          },
          error: { code: "repeated_call", message: "repeated" },
        };
      } else {
        result = await executeTool(ctx, call.name, call.input);
      }
      await logExecution(db, {
        missionId,
        runId,
        kind: `tool:${call.name}`,
        status: result.ok ? "ok" : result.error?.code === "invalid_input" || result.error?.code === "repeated_call" ? "rejected" : "error",
        durationMs: Date.now() - t1,
        details: { ...(("logDetails" in result && result.logDetails) || {}), ...(result.error ? { error: result.error.code } : {}) },
      });
      consecutiveErrors = result.ok ? 0 : consecutiveErrors + 1;
      if ("finish" in result && result.finish) finish = result.finish;
      results.push({
        type: "tool_result" as const,
        tool_use_id: call.id,
        content: JSON.stringify(result.content),
        ...(result.ok ? {} : { is_error: true }),
      });
    }
    await db.update(missionRuns).set({ toolCalls, heartbeatAt: new Date() }).where(eq(missionRuns.id, runId));
    history.push({ role: "user", content: results });

    if (consecutiveErrors >= limits.maxConsecutiveErrors) {
      stop("STOPPED", `${consecutiveErrors} appels d'outils consécutifs en échec : exécution arrêtée pour éviter une boucle improductive.`);
      break;
    }
    if (toolCalls > limits.maxToolCalls + 3) {
      stop("STOPPED", `Limite de ${limits.maxToolCalls} appels d'outils atteinte.`);
      break;
    }
  }

  const final: RunOutcome = finish ? { runStatus: "SUCCEEDED", stopReason: "Compte rendu remis.", finished: true } : outcome!;
  await finalizeRun(db, { runId, missionId, outcome: final, finish, cost: costKnown ? cost : null });
  return final;
}

function sqlAdd(prev: number | undefined, delta: number) {
  return (prev ?? 0) + delta;
}

/** Closes a run: resets half-done steps, stores the report and derives the status. */
export async function finalizeRun(
  db: Db,
  p: {
    runId: string;
    missionId: string;
    outcome: RunOutcome;
    finish: { summary: string; remainingActions: string[]; limitations: string[] } | null;
    cost: number | null;
  },
) {
  // A step left "in progress" by THIS run was not finished: reopen it rather
  // than pretend. Scoped to this run's own steps (activeRunId), never a step
  // another, still-active run currently owns.
  await db
    .update(missionSteps)
    .set({ status: "PENDING", activeRunId: null })
    .where(and(eq(missionSteps.missionId, p.missionId), eq(missionSteps.status, "IN_PROGRESS"), eq(missionSteps.activeRunId, p.runId)));

  await db
    .update(missionRuns)
    .set({
      status: p.outcome.runStatus,
      stopReason: p.outcome.stopReason,
      finishedAt: new Date(),
      estimatedCostUsd: p.cost === null ? null : p.cost.toFixed(6),
    })
    .where(eq(missionRuns.id, p.runId));

  const steps = await db.select().from(missionSteps).where(eq(missionSteps.missionId, p.missionId)).orderBy(missionSteps.position);
  const artCount = await db.select({ id: artifacts.id }).from(artifacts).where(eq(artifacts.missionId, p.missionId));
  const srcCount = await db
    .select({ id: sources.id })
    .from(sources)
    .where(and(eq(sources.missionId, p.missionId), inArray(sources.origin, ["page", "search_result"])));

  const done = steps.filter((s) => s.status === "DONE");
  const factual = [
    `**Bilan vérifié par le système** : ${done.length}/${steps.length} étape(s) terminée(s)` +
      (done.some((s) => s.completedBy === "user") ? ` (dont ${done.filter((s) => s.completedBy === "user").length} déclarée(s) par vous)` : "") +
      `, ${artCount.length} livrable(s), ${srcCount.length} source(s) enregistrée(s).`,
  ];
  const open = steps.filter((s) => !["DONE", "SKIPPED"].includes(s.status));
  if (open.length) factual.push(`Étapes encore ouvertes : ${open.map((s) => `« ${s.title} »`).join(", ")}.`);

  const summaryLine = `Exécution du ${new Date().toLocaleString("fr-FR")} : ${p.outcome.stopReason} ${done.length}/${steps.length} étapes closes.`;
  const mission = await db.query.missions.findFirst({ where: eq(missions.id, p.missionId) });
  const contextSummary = [mission?.contextSummary, summaryLine].filter(Boolean).join("\n").slice(-4000);

  if (p.finish) {
    await db
      .update(missions)
      .set({
        report: p.finish.summary,
        remainingActions: p.finish.remainingActions,
        limitations: p.finish.limitations,
        contextSummary,
        lastError: null,
      })
      .where(eq(missions.id, p.missionId));
    await addMessage(db, p.missionId, "assistant", `${p.finish.summary}\n\n---\n${factual.join("\n\n")}`, {
      kind: "report",
      runId: p.runId,
      remainingActions: p.finish.remainingActions,
      limitations: p.finish.limitations,
    });
  } else {
    const next =
      p.outcome.runStatus === "CANCELLED"
        ? "Vous pouvez relancer l'exécution quand vous le souhaitez : le travail déjà fait est conservé."
        : "Le travail déjà réalisé est conservé. Vous pouvez relancer l'exécution, apporter une précision, ou traiter manuellement les étapes restantes.";
    await db
      .update(missions)
      .set({ contextSummary, lastError: p.outcome.runStatus === "CANCELLED" ? null : p.outcome.stopReason })
      .where(eq(missions.id, p.missionId));
    await addMessage(
      db,
      p.missionId,
      "event",
      `Exécution arrêtée : ${p.outcome.stopReason}\n\n${factual.join("\n\n")}\n\n${next}`,
      { kind: "run_stopped", runId: p.runId, runStatus: p.outcome.runStatus },
    );
  }
  await refreshMissionStatus(db, p.missionId, { lastRunFailed: p.outcome.runStatus === "FAILED" });
}

export { estimateCostUsd };
