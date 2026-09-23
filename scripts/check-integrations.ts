/**
 * Smoke test of the REAL external integrations (one minimal call each).
 * Costs a few cents at most. Usage: pnpm check:integrations
 */
import "dotenv/config";
import { AnthropicProvider } from "../src/server/llm/anthropic";
import { estimateCostUsd } from "../src/server/llm/types";
import { createPageFetcher } from "../src/server/search/fetch-page";
import { BraveSearch, TavilySearch, type SearchProvider } from "../src/server/search/providers";

type Status = "OK" | "ÉCHEC" | "IGNORÉ";
const results: { name: string; status: Status; detail: string }[] = [];
const record = (name: string, status: Status, detail: string) => {
  results.push({ name, status, detail });
  console.log(`[${status}] ${name} — ${detail}`);
};

async function checkClaude() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return record("Claude", "IGNORÉ", "ANTHROPIC_API_KEY absente");
  const model = process.env.ATLAS_MODEL || "claude-opus-5";
  const llm = new AnthropicProvider(model, key, {
    fallbacks: process.env.ATLAS_LLM_FALLBACKS === "off" ? false : /^claude-(opus-5|fable-5)/.test(model),
    effort: /haiku/.test(model) ? null : "low",
  });
  try {
    // 1. Structured output (used by the analysis phase).
    const a = await llm.complete({
      purpose: "analyze",
      system: "Réponds uniquement avec l'objet JSON demandé.",
      messages: [{ role: "user", content: "Donne la capitale de la France." }],
      jsonSchema: {
        type: "object",
        additionalProperties: false,
        required: ["capitale"],
        properties: { capitale: { type: "string" } },
      },
      maxTokens: 2000,
    });
    const parsed = JSON.parse(a.text) as { capitale?: string };
    if (!parsed.capitale) throw new Error(`sortie structurée inattendue : ${a.text.slice(0, 200)}`);
    // 2. Tool calling (used by the execution phase).
    const t = await llm.complete({
      purpose: "execute",
      system: "Utilise l'outil fourni pour répondre.",
      messages: [{ role: "user", content: "Note l'étape s1 comme terminée avec le résultat « ok »." }],
      tools: [
        {
          name: "update_step",
          description: "Met à jour une étape.",
          input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["step_id", "status", "result"],
            properties: { step_id: { type: "string" }, status: { type: "string" }, result: { type: "string" } },
          },
        },
      ],
      maxTokens: 2000,
    });
    if (!t.toolCalls.length) throw new Error("le modèle n'a pas appelé l'outil");
    const usage = {
      inputTokens: a.usage.inputTokens + t.usage.inputTokens,
      outputTokens: a.usage.outputTokens + t.usage.outputTokens,
      cacheReadTokens: a.usage.cacheReadTokens + t.usage.cacheReadTokens,
      cacheWriteTokens: a.usage.cacheWriteTokens + t.usage.cacheWriteTokens,
    };
    const cost = estimateCostUsd(t.model, usage);
    record(
      "Claude",
      "OK",
      `modèle ${t.model}, JSON structuré ✓, appel d'outil ✓ (${t.toolCalls[0].name}), ${usage.inputTokens}+${usage.outputTokens} tokens, coût estimé ${cost === null ? "n/d" : `${cost.toFixed(4)} $`}`,
    );
  } catch (e) {
    record("Claude", "ÉCHEC", (e as Error).message);
  }
}

async function checkSearch(): Promise<string | null> {
  let provider: SearchProvider | null = null;
  const forced = process.env.ATLAS_SEARCH_PROVIDER;
  if ((forced === "tavily" || !forced) && process.env.TAVILY_API_KEY) provider = new TavilySearch(process.env.TAVILY_API_KEY);
  else if ((forced === "brave" || !forced) && process.env.BRAVE_SEARCH_API_KEY) provider = new BraveSearch(process.env.BRAVE_SEARCH_API_KEY);
  if (!provider) {
    record("Recherche web", "IGNORÉ", "aucune clé TAVILY_API_KEY / BRAVE_SEARCH_API_KEY");
    return null;
  }
  try {
    const res = await provider.search("changement d'adresse démarches service-public", { maxResults: 5 });
    if (!res.length) throw new Error("aucun résultat");
    record("Recherche web", "OK", `${provider.name} : ${res.length} résultats, ex. « ${res[0].title} » ${res[0].url}`);
    return res[0].url;
  } catch (e) {
    record("Recherche web", "ÉCHEC", `${provider.name} : ${(e as Error).message}`);
    return null;
  }
}

async function checkFetch(url: string | null) {
  const target = url ?? "https://www.service-public.fr/";
  try {
    const page = await createPageFetcher()(target);
    record("Lecture de page", "OK", `${page.url} : ${page.text.length} caractères, titre « ${page.title ?? "—"} »`);
  } catch (e) {
    record("Lecture de page", "ÉCHEC", `${target} : ${(e as Error).message}`);
  }
}

async function main() {
  await checkClaude();
  const firstUrl = await checkSearch();
  await checkFetch(firstUrl);
  const failed = results.some((r) => r.status === "ÉCHEC");
  console.log(failed ? "\nAu moins une intégration configurée a échoué." : "\nToutes les intégrations configurées répondent.");
  process.exit(failed ? 1 : 0);
}

main();
