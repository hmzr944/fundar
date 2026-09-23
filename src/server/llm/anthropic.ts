import Anthropic from "@anthropic-ai/sdk";
import { LlmError, type LlmProvider, type LlmRequest, type LlmResult } from "./types";

/** Real provider backed by the Claude API (Messages API + client-side tools). */
export class AnthropicProvider implements LlmProvider {
  readonly name = "anthropic";
  readonly isTestDouble = false;
  private client: Anthropic;

  constructor(
    readonly model: string,
    apiKey: string,
    private readonly opts: { fallbacks: boolean; effort: "low" | "medium" | "high" | null },
  ) {
    this.client = new Anthropic({ apiKey, maxRetries: 2, timeout: 5 * 60_000 });
  }

  async complete(req: LlmRequest): Promise<LlmResult> {
    const params: Anthropic.Beta.MessageCreateParamsNonStreaming = {
      model: this.model,
      max_tokens: req.maxTokens ?? 16000,
      // The system prompt is stable across calls, so it is cached.
      system: [{ type: "text", text: req.system, cache_control: { type: "ephemeral" } }],
      messages: req.messages,
    };
    if (req.tools?.length) {
      params.tools = req.tools.map((t) => ({ ...t, input_schema: t.input_schema as Anthropic.Beta.BetaTool.InputSchema }));
    }
    const outputConfig: Anthropic.Beta.BetaOutputConfig = {};
    if (this.opts.effort) outputConfig.effort = this.opts.effort;
    if (req.jsonSchema) outputConfig.format = { type: "json_schema", schema: req.jsonSchema };
    if (Object.keys(outputConfig).length) params.output_config = outputConfig;
    if (this.opts.fallbacks) {
      // Server-side refusal fallback: a policy decline is re-run on the model
      // Anthropic recommends instead of failing the mission.
      params.betas = ["server-side-fallback-2026-07-01"];
      params.fallbacks = "default";
    }

    let res: Anthropic.Beta.BetaMessage;
    try {
      res = await this.client.beta.messages.create(params, { signal: req.signal });
    } catch (e) {
      throw mapError(e);
    }

    if (res.stop_reason === "refusal") {
      throw new LlmError("Le modèle a refusé de traiter cette demande.", false, "refusal");
    }

    const text = res.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    const toolCalls = res.content
      .filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use")
      .map((b) => ({ id: b.id, name: b.name, input: b.input }));
    return {
      text,
      toolCalls,
      stopReason: res.stop_reason ?? "unknown",
      model: res.model,
      usage: {
        inputTokens: res.usage.input_tokens ?? 0,
        outputTokens: res.usage.output_tokens ?? 0,
        cacheReadTokens: res.usage.cache_read_input_tokens ?? 0,
        cacheWriteTokens: res.usage.cache_creation_input_tokens ?? 0,
      },
      assistantContent: res.content as unknown as Anthropic.Beta.BetaContentBlockParam[],
    };
  }
}

function mapError(e: unknown): LlmError {
  if (e instanceof Anthropic.APIUserAbortError) return new LlmError("Appel interrompu.", false, "aborted");
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) {
    return new LlmError("La clé du fournisseur de modèle est invalide ou n'a pas les droits nécessaires.", false, "auth");
  }
  if (e instanceof Anthropic.RateLimitError) {
    return new LlmError("Limite de débit du fournisseur de modèle atteinte. Réessayez dans quelques instants.", true, "rate_limit");
  }
  if (e instanceof Anthropic.BadRequestError || e instanceof Anthropic.NotFoundError) {
    return new LlmError(`Requête refusée par le fournisseur de modèle : ${e.message}`, false, "invalid_request");
  }
  if (e instanceof Anthropic.InternalServerError) {
    return new LlmError("Le fournisseur de modèle est temporairement indisponible.", true, "overloaded");
  }
  if (e instanceof Anthropic.APIConnectionError) {
    return new LlmError("Impossible de joindre le fournisseur de modèle (réseau).", true, "network");
  }
  if (e instanceof Anthropic.APIError) return new LlmError(`Erreur du fournisseur de modèle : ${e.message}`, true, "unknown");
  return new LlmError(e instanceof Error ? e.message : "Erreur inconnue du fournisseur de modèle.", false, "unknown");
}
