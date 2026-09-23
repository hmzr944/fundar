/**
 * LIVE tests against the real Claude API. Skipped unless ANTHROPIC_API_KEY is
 * set (they cost money and depend on the network). They check the quality of
 * the understanding phase on real requests, which scripted tests cannot do.
 *
 *   pnpm test:live   (reads ANTHROPIC_API_KEY and ATLAS_MODEL from the environment or .env)
 */
import "dotenv/config";
import { beforeEach, describe, expect, it } from "vitest";
import { analyzeMission } from "@/server/agent/analyze";
import { AnthropicProvider } from "@/server/llm/anthropic";
import { createMission } from "@/server/missions/service";
import { createTestUser, db, resetDb } from "../helpers/db";

const key = process.env.ANTHROPIC_API_KEY;
const model = process.env.ATLAS_MODEL || "claude-opus-5";

describe.skipIf(!key)("live understanding (real model)", () => {
  const llm = key
    ? new AnthropicProvider(model, key, { fallbacks: /^claude-(opus-5|fable-5)/.test(model), effort: "medium" })
    : (null as never);
  const caps = { webSearch: true, searchProvider: "tavily" };
  beforeEach(resetDb);

  async function analyze(request: string) {
    const u = await createTestUser();
    const m = await createMission(db, u.id, request);
    return (await analyzeMission({ db, llm, capabilities: caps }, m.id, null)).analysis;
  }

  it("simple request: plans without blocking questions", async () => {
    const a = await analyze("Rédige un e-mail à mon propriétaire pour lui dire que le chauffe-eau de l'appartement est en panne depuis hier.");
    expect(a.missing_info.filter((m) => m.blocking)).toHaveLength(0);
    expect(a.steps.some((s) => s.kind === "deliverable")).toBe(true);
  }, 180_000);

  it("request needing information: asks blocking questions", async () => {
    const a = await analyze("Je déménage le mois prochain. Aide-moi à organiser mon déménagement, comparer les solutions de transport et préparer les démarches.");
    expect(a.missing_info.some((m) => m.blocking)).toBe(true);
  }, 180_000);

  it("ambiguous request: asks questions", async () => {
    const a = await analyze("Aide-moi avec mes papiers.");
    expect(a.missing_info.length).toBeGreaterThan(0);
  }, 180_000);

  it("complex request: several typed steps", async () => {
    const a = await analyze(
      "Organise un week-end à Lisbonne pour 4 personnes fin octobre, budget 1200 € au total hors avion : compare 3 logements, propose un programme et prépare une checklist de départ.",
    );
    expect(a.steps.length).toBeGreaterThanOrEqual(3);
    expect(a.constraints.length).toBeGreaterThan(0);
  }, 180_000);

  it("impossible request: declares what cannot be done", async () => {
    const a = await analyze("Appelle ma banque demain à 9h et fais un virement de 300 € à mon frère.");
    expect(a.unsupported.length).toBeGreaterThan(0);
    expect(a.steps.some((s) => s.kind === "user_action")).toBe(true);
  }, 180_000);
});
