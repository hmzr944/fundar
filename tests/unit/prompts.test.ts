import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeSystemPrompt, calendarBlock, executeSystemPrompt } from "@/server/agent/prompts";
import { stripToolMarkup, toolDefinitions } from "@/server/agent/tools";
import { TavilySearch } from "@/server/search/providers";

const caps = { webSearch: true, searchProvider: "tavily" };

describe("prompts", () => {
  it("gives the real weekday of the upcoming dates (a week does not start today)", () => {
    const cal = calendarBlock(new Date(2026, 8, 23), 5); // Wednesday 23 September 2026
    expect(cal).toContain("mercredi 23/09/2026");
    expect(cal).toContain("vendredi 25/09/2026");
    expect(cal).toContain("dimanche 27/09/2026");
    expect(cal).not.toContain("28/09/2026");
  });

  it("includes the calendar in both phases", () => {
    expect(analyzeSystemPrompt(caps)).toContain("Calendrier des 14 prochains jours");
    expect(executeSystemPrompt(caps)).toContain("Calendrier des 14 prochains jours");
  });

  it("drops 'provide the document' steps once documents are imported and plans updates of stale deliverables", () => {
    const p = analyzeSystemPrompt(caps);
    expect(p).toContain("Si des documents lisibles sont déjà importés, ne garde aucune étape demandant à l'utilisateur de les fournir.");
    expect(p).toContain("ajoute une nouvelle étape (nouvelle clé) pour les mettre à jour");
  });

  it("states that 'done' always needs a result, in the prompt and in the tool description", () => {
    expect(executeSystemPrompt(caps)).toContain("fournis toujours un \"result\" concret");
    const updateStep = toolDefinitions({ webSearch: true }).find((t) => t.name === "update_step");
    expect(updateStep?.description).toContain("'done' exige TOUJOURS un 'result' concret");
  });

  it("frames unpaid-invoice work: amounts from the documents, B2B-only penalties, payment only when confirmed", () => {
    const p = executeSystemPrompt(caps);
    expect(p).toContain("ne complète jamais un montant, un numéro ou une date absents");
    expect(p).toContain("ne s'appliquent qu'aux professionnels");
    expect(p).toContain("jamais considérée comme payée sans confirmation de l'utilisateur");
  });

  it("forbids asking for sensitive data such as an IBAN", () => {
    expect(analyzeSystemPrompt(caps)).toMatch(/Ne demande jamais de donnée sensible \(IBAN/);
  });
});

describe("stripToolMarkup", () => {
  it("removes tool-call markup leaked at the end of a deliverable", () => {
    expect(stripToolMarkup("Bonjour.\n\nCordialement\n</content_markdown>\n</invoke>")).toBe("Bonjour.\n\nCordialement");
    expect(stripToolMarkup("Texte</parameter>\n")).toBe("Texte");
  });

  it("leaves legitimate content untouched", () => {
    const md = "Utilisez la balise `</invoke>` au milieu.\n\n- [ ] Fin";
    expect(stripToolMarkup(md)).toBe(md);
  });
});

describe("search provider errors", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("does not blame the key for a 403 (proxy or firewall), but does for a 401", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 403 })));
    await expect(new TavilySearch("k").search("q", { maxResults: 1 })).rejects.toThrow(/refusé.*réseau\/proxy/);
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 401 })));
    await expect(new TavilySearch("k").search("q", { maxResults: 1 })).rejects.toThrow("Clé Tavily invalide ou refusée.");
  });
});
