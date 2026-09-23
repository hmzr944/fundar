import type Anthropic from "@anthropic-ai/sdk";

export type LlmMessage = Anthropic.Beta.BetaMessageParam;
export type LlmTool = {
  name: string;
  description: string;
  input_schema: Record<string, unknown> & { type: "object" };
};

export type LlmRequest = {
  system: string;
  messages: LlmMessage[];
  tools?: LlmTool[];
  /** When set, the model must answer with JSON matching this schema (no tools). */
  jsonSchema?: Record<string, unknown>;
  maxTokens?: number;
  signal?: AbortSignal;
  /** Free-form label used by test providers to pick a script. */
  purpose: "analyze" | "execute";
};

export type LlmToolCall = { id: string; name: string; input: unknown };

export type LlmUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
};

export type LlmResult = {
  text: string;
  toolCalls: LlmToolCall[];
  stopReason: string;
  usage: LlmUsage;
  model: string;
  /** Content to append verbatim as the assistant turn (keeps thinking blocks intact). */
  assistantContent: LlmMessage["content"];
};

export class LlmError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean,
    public readonly kind: "rate_limit" | "overloaded" | "network" | "auth" | "invalid_request" | "refusal" | "aborted" | "unknown",
  ) {
    super(message);
  }
}

export interface LlmProvider {
  readonly name: string;
  readonly model: string;
  /** True for providers that are not a real model (tests). Shown in the UI. */
  readonly isTestDouble: boolean;
  complete(req: LlmRequest): Promise<LlmResult>;
}

/**
 * Public list prices in USD per million tokens, used for *estimates* only.
 * Unknown models yield `null` rather than a made-up number.
 */
const PRICES: { prefix: string; input: number; output: number }[] = [
  { prefix: "claude-fable-5", input: 10, output: 50 },
  { prefix: "claude-opus-5-5", input: 4, output: 20 },
  { prefix: "claude-opus-5", input: 5, output: 25 },
  { prefix: "claude-opus-4", input: 5, output: 25 },
  { prefix: "claude-sonnet-5", input: 2, output: 10 },
  { prefix: "claude-sonnet-4", input: 3, output: 15 },
  { prefix: "claude-haiku-4", input: 1, output: 5 },
];

export function estimateCostUsd(model: string, u: LlmUsage): number | null {
  const p = PRICES.find((x) => model.startsWith(x.prefix));
  if (!p) return null;
  const perTok = (usd: number) => usd / 1_000_000;
  return (
    u.inputTokens * perTok(p.input) +
    u.cacheWriteTokens * perTok(p.input) * 1.25 +
    u.cacheReadTokens * perTok(p.input) * 0.1 +
    u.outputTokens * perTok(p.output)
  );
}
