import "server-only";
import { getDb } from "@/db";
import { config, llmProviderName, searchProviderName } from "@/lib/config";
import type { AgentDeps } from "@/server/agent/runner";
import { AnthropicProvider } from "@/server/llm/anthropic";
import { createDemoScriptProvider } from "@/server/llm/scripted";
import type { LlmProvider } from "@/server/llm/types";
import { createPageFetcher } from "@/server/search/fetch-page";
import { BraveSearch, TavilySearch, type SearchProvider } from "@/server/search/providers";

const g = globalThis as unknown as { __atlasLlm?: LlmProvider | null; __atlasSearch?: SearchProvider | null };

function buildLlm(): LlmProvider | null {
  switch (llmProviderName()) {
    case "anthropic": {
      const model = config.model;
      const supportsFallbacks = /^claude-(opus-5|fable-5)/.test(model);
      const supportsEffort = !/haiku/.test(model);
      return new AnthropicProvider(model, process.env.ANTHROPIC_API_KEY!, {
        fallbacks: process.env.ATLAS_LLM_FALLBACKS === "off" ? false : supportsFallbacks,
        effort: supportsEffort ? "medium" : null,
      });
    }
    case "scripted":
      return createDemoScriptProvider();
    default:
      return null;
  }
}

function buildSearch(): SearchProvider | null {
  switch (searchProviderName()) {
    case "tavily":
      return new TavilySearch(process.env.TAVILY_API_KEY!);
    case "brave":
      return new BraveSearch(process.env.BRAVE_SEARCH_API_KEY!);
    default:
      return null;
  }
}

export function getAgentDeps(): AgentDeps {
  if (g.__atlasLlm === undefined) g.__atlasLlm = buildLlm();
  if (g.__atlasSearch === undefined) g.__atlasSearch = buildSearch();
  const l = config.limits;
  return {
    db: getDb(),
    llm: g.__atlasLlm,
    search: g.__atlasSearch,
    fetchPage: createPageFetcher(),
    limits: {
      maxIterations: l.maxIterations,
      maxToolCalls: l.maxToolCalls,
      maxRunSeconds: l.maxRunSeconds,
      maxRunTokens: l.maxRunTokens,
      maxIdenticalCalls: l.maxIdenticalCalls,
      maxConsecutiveErrors: l.maxConsecutiveErrors,
      runsPerDay: l.runsPerDay,
      analysesPerDay: l.analysesPerDay,
      staleRunSeconds: l.staleRunSeconds,
    },
  };
}

/** What the UI may say about the configured integrations (never secrets). */
export function integrationStatus() {
  const deps = getAgentDeps();
  return {
    llm: deps.llm ? { available: true, provider: deps.llm.name, model: deps.llm.model, testDouble: deps.llm.isTestDouble } : { available: false as const },
    search: deps.search ? { available: true, provider: deps.search.name } : { available: false as const },
  };
}
