import type { LlmProvider, LlmRequest, LlmResult, LlmToolCall } from "./types";

/**
 * TEST DOUBLE. Returns scripted answers instead of calling a real model. It is
 * used by automated tests only (and refused when NODE_ENV=production). It does
 * not understand anything: it follows fixed rules so that the orchestration,
 * persistence and UI can be tested deterministically.
 */
export type ScriptHandler = (req: LlmRequest, callIndex: number) => LlmResult | Promise<LlmResult>;

export class ScriptedProvider implements LlmProvider {
  readonly name = "scripted";
  readonly model = "scripted-test-double";
  readonly isTestDouble = true;
  calls: LlmRequest[] = [];

  constructor(private readonly handler: ScriptHandler) {}

  async complete(req: LlmRequest): Promise<LlmResult> {
    this.calls.push(req);
    if (req.signal?.aborted) {
      const { LlmError } = await import("./types");
      throw new LlmError("Appel interrompu.", false, "aborted");
    }
    return this.handler(req, this.calls.length - 1);
  }
}

let seq = 0;
const usage = { inputTokens: 100, outputTokens: 50, cacheReadTokens: 0, cacheWriteTokens: 0 };

export function textResult(text: string): LlmResult {
  return {
    text,
    toolCalls: [],
    stopReason: "end_turn",
    usage,
    model: "scripted-test-double",
    assistantContent: [{ type: "text", text }],
  };
}

export function toolCallsResult(calls: { name: string; input: unknown }[], text = ""): LlmResult {
  const toolCalls: LlmToolCall[] = calls.map((c) => ({ id: `toolu_${++seq}`, name: c.name, input: c.input }));
  return {
    text,
    toolCalls,
    stopReason: "tool_use",
    usage,
    model: "scripted-test-double",
    assistantContent: [
      ...(text ? [{ type: "text" as const, text }] : []),
      ...toolCalls.map((c) => ({ type: "tool_use" as const, id: c.id, name: c.name, input: c.input as Record<string, unknown> })),
    ],
  };
}

/** Parsed JSON payloads of the tool results in the last user turn. */
export function lastToolResults(req: LlmRequest): Record<string, unknown>[] {
  const last = req.messages[req.messages.length - 1];
  if (!last || typeof last.content === "string") return [];
  return last.content
    .filter((b) => b.type === "tool_result")
    .map((b) => {
      const c = (b as { content?: unknown }).content;
      try {
        return JSON.parse(typeof c === "string" ? c : "{}");
      } catch {
        return {};
      }
    });
}

const firstUserText = (req: LlmRequest) => {
  const m = req.messages[0];
  return typeof m?.content === "string" ? m.content : "";
};

// ─── Deterministic demo script used by the end-to-end tests ─────────────────

type PlanStep = { step_id: string; key: string; kind: string; title: string; status: string };
type Action = (prev: Record<string, unknown>[]) => { name: string; input: unknown }[];

function analyzeDemo(req: LlmRequest): LlmResult {
  const input = firstUserText(req);
  const request = input.match(/Demande initiale : ([\s\S]*?)\n/)?.[1] ?? "";
  const userTurns = (input.match(/\[Utilisateur\]/g) ?? []).length;
  const searchAvailable = /Recherche web : DISPONIBLE/.test(req.system);
  const hasDocs = /\(lisible\)/.test(input);
  const moving = /déménag/i.test(request);

  const missing =
    moving && userTurns < 2
      ? [
          { question: "Quelle est la ville de départ ?", reason: "Nécessaire pour comparer les transporteurs.", blocking: true },
          { question: "Quelle est la ville d'arrivée ?", reason: "Nécessaire pour estimer le trajet.", blocking: true },
          { question: "Quel est votre budget maximum ?", reason: "Permet de filtrer les offres.", blocking: false },
        ]
      : [];
  const steps = [
    { key: "s1", title: "Organiser les priorités", description: "Lister et ordonner les tâches.", kind: "planning", depends_on: [] },
    ...(searchAvailable && /compar|transport|offre/i.test(request)
      ? [{ key: "s2", title: "Rechercher les offres", description: "Recherche web des offres.", kind: "research", depends_on: ["s1"] }]
      : []),
    ...(hasDocs ? [{ key: "s3", title: "Analyser les documents", description: "Lire les documents importés.", kind: "document_analysis", depends_on: [] }] : []),
    { key: "s4", title: "Rédiger la checklist", description: "Produire une checklist exploitable.", kind: "deliverable", depends_on: ["s1"] },
    { key: "s5", title: "Valider et réaliser les démarches", description: "Actions à réaliser par vous.", kind: "user_action", depends_on: ["s4"] },
  ];
  const analysis = {
    title: (moving ? "Organiser le déménagement" : request.slice(0, 60)) || "Mission",
    objective: `Objectif : ${request.slice(0, 200)}`,
    reformulation: `Vous souhaitez : ${request.slice(0, 300)}`,
    constraints: [],
    missing_info: missing,
    capabilities_needed: ["planning", "deliverable"],
    unsupported: searchAvailable
      ? []
      : [{ request: "Recherche web", reason: "Aucun fournisseur de recherche configuré.", alternative: "Fournissez des liens ou des documents." }],
    steps,
    eligibility: {
      can_handle: missing.length === 0,
      reason: missing.length ? "Il faut d'abord répondre aux questions." : "[Test] Démarches écrites possibles.",
      what_atlas_will_do: missing.length ? "" : "[Test] Atlas prépare les courriers et suit le dossier.",
    },
    reply: missing.length
      ? `[Réponse scriptée de test] Il me manque quelques informations :\n${missing.map((m, i) => `${i + 1}. ${m.question}`).join("\n")}`
      : "[Réponse scriptée de test] Voici le plan proposé.",
  };
  return textResult(JSON.stringify(analysis));
}

function executeDemo(req: LlmRequest): LlmResult {
  const briefing = firstUserText(req);
  const plan: PlanStep[] = JSON.parse(briefing.match(/<plan_json>\n([\s\S]*?)\n<\/plan_json>/)?.[1] ?? "[]");
  const docId = briefing.match(/document_id=([0-9a-f-]{36})/)?.[1];
  const actions: Action[] = [];
  for (const s of plan.filter((p) => !["DONE", "SKIPPED"].includes(p.status))) {
    if (s.kind === "user_action") {
      actions.push(() => [
        { name: "update_step", input: { step_id: s.step_id, status: "waiting_user", result: "À réaliser par vous : suivez la checklist." } },
      ]);
      continue;
    }
    actions.push(() => [{ name: "update_step", input: { step_id: s.step_id, status: "in_progress" } }]);
    if (s.kind === "planning") {
      actions.push(() => [{ name: "update_step", input: { step_id: s.step_id, status: "done", result: "Priorités établies (test)." } }]);
    } else if (s.kind === "research") {
      actions.push(() => [{ name: "web_search", input: { query: s.title, max_results: 3 } }]);
      actions.push((prev) => {
        const results = (prev[0]?.results as { source_id: string }[] | undefined) ?? [];
        return results.length
          ? [{ name: "update_step", input: { step_id: s.step_id, status: "done", result: "Offres trouvées (test).", source_ids: results.map((r) => r.source_id) } }]
          : [{ name: "update_step", input: { step_id: s.step_id, status: "blocked", error: "Recherche sans résultat." } }];
      });
    } else if (s.kind === "document_analysis") {
      if (!docId) {
        actions.push(() => [{ name: "update_step", input: { step_id: s.step_id, status: "blocked", error: "Aucun document lisible." } }]);
      } else {
        actions.push(() => [{ name: "read_document", input: { document_id: docId } }]);
        actions.push((prev) =>
          prev[0]?.ok
            ? [{ name: "update_step", input: { step_id: s.step_id, status: "done", result: "Document lu (test).", document_ids: [docId] } }]
            : [{ name: "update_step", input: { step_id: s.step_id, status: "failed", error: "Lecture impossible." } }],
        );
      }
    } else if (s.kind === "deliverable") {
      actions.push(() => [
        {
          name: "create_deliverable",
          input: {
            type: "checklist",
            title: `Checklist — ${s.title}`,
            content_markdown: "- [ ] Première action\n- [ ] Deuxième action\n\n| Option | Prix |\n|---|---|\n| A | 10 € |\n| B | 12 € |",
            step_id: s.step_id,
          },
        },
      ]);
      actions.push((prev) => [
        { name: "update_step", input: { step_id: s.step_id, status: "done", result: "Checklist rédigée (test).", artifact_ids: [prev[0]?.artifact_id] } },
      ]);
    }
  }
  actions.push(() => [
    {
      name: "finish_mission",
      input: {
        summary_markdown: "[Compte rendu scripté de test] Les étapes exécutables ont été traitées.",
        remaining_actions: plan.filter((p) => p.kind === "user_action").map((p) => p.title),
        limitations: ["Réponses générées par un script de test, pas par un modèle."],
      },
    },
  ]);
  const index = req.messages.filter((m) => m.role === "assistant").length;
  const action = actions[Math.min(index, actions.length - 1)];
  return toolCallsResult(action(lastToolResults(req)));
}

export function createDemoScriptProvider() {
  return new ScriptedProvider((req) =>
    req.purpose === "analyze" ? analyzeDemo(req) : req.purpose === "review" ? textResult(JSON.stringify({ issues: [] })) : executeDemo(req),
  );
}
