import { describe, expect, it } from "vitest";
import { buildReviewMessage, reviewDeliverable, ruleChecks, verdictOf } from "@/server/agent/review";
import { ScriptedProvider, textResult } from "@/server/llm/scripted";
import { LlmError } from "@/server/llm/types";

const input = (content: string) => ({
  type: "letter",
  title: "Réclamation",
  content,
  missionContext: "Objectif : obtenir le remboursement de 180 €",
  documents: [{ name: "facture.pdf", text: "Frais de résiliation : 180,00 €" }],
  sources: [],
});

describe("fixed review rules", () => {
  it("flags promises of results as blocking", () => {
    const issues = ruleChecks("Rassurez-vous, vous allez obtenir votre remboursement.");
    expect(issues).toEqual([expect.objectContaining({ severity: "blocking", category: "promise", origin: "rule" })]);
    expect(issues[0].excerpt).toContain("vous allez obtenir");
  });

  it("flags 'vous avez droit' as a personalised legal opinion to fix", () => {
    expect(ruleChecks("Vous avez droit à 250 €.")).toEqual([expect.objectContaining({ severity: "to_fix", category: "promise" })]);
  });

  it("flags requests for passwords or card codes", () => {
    expect(ruleChecks("Merci d'indiquer votre mot de passe.")).toEqual([
      expect.objectContaining({ severity: "blocking", category: "sensitive_data" }),
    ]);
  });

  it("counts [À COMPLÉTER] fields as a note, not a problem", () => {
    const issues = ruleChecks("Référence client : [À COMPLÉTER]\nDate : [À COMPLÉTER : date]");
    expect(issues).toEqual([expect.objectContaining({ severity: "note", category: "missing_info" })]);
    expect(issues[0].problem).toContain("2 champ(s)");
    expect(verdictOf(issues)).toBe("ok");
  });

  it("finds nothing in a neutral request", () => {
    expect(ruleChecks("Je vous demande de rembourser les frais de 180 € prélevés le 3 septembre.")).toEqual([]);
  });

  it("derives the verdict from the worst issue", () => {
    expect(verdictOf([])).toBe("ok");
    expect(verdictOf([{ severity: "to_fix", category: "tone", excerpt: null, problem: "x", suggestion: null, origin: "model" }])).toBe("to_fix");
    expect(
      verdictOf([
        { severity: "note", category: "other", excerpt: null, problem: "x", suggestion: null, origin: "rule" },
        { severity: "blocking", category: "inconsistency", excerpt: null, problem: "y", suggestion: null, origin: "model" },
      ]),
    ).toBe("blocking");
  });
});

describe("second-reader model", () => {
  it("sends the deliverable and the mission's documents as untrusted data", () => {
    const msg = buildReviewMessage(input("Je demande 180 €."));
    expect(msg).toContain('<document name="facture.pdf">');
    expect(msg).toContain("<untrusted_content>\nFrais de résiliation : 180,00 €");
    expect(msg).toMatch(/<livrable type="letter"[\s\S]*<untrusted_content>\nJe demande 180 €\./);
  });

  it("merges model findings with the fixed rules", async () => {
    const llm = new ScriptedProvider((req) => {
      expect(req.purpose).toBe("review");
      expect(req.jsonSchema).toBeDefined();
      return textResult(
        JSON.stringify({
          issues: [
            { severity: "blocking", category: "inconsistency", excerpt: "250 €", problem: "La facture indique 180 €, pas 250 €.", suggestion: "Demander 180 €." },
          ],
        }),
      );
    });
    const { review, usage } = await reviewDeliverable(llm, input("Je vous demande de rembourser 250 €. Vous avez droit à ce remboursement."));
    expect(review.status).toBe("done");
    expect(review.verdict).toBe("blocking");
    expect(review.issues.map((i) => [i.origin, i.category])).toEqual([
      ["rule", "promise"],
      ["model", "inconsistency"],
    ]);
    expect(usage).not.toBeNull();
  });

  it("degrades to the fixed rules when the model call fails, without throwing", async () => {
    const llm = new ScriptedProvider(() => {
      throw new LlmError("Le fournisseur de modèle est temporairement indisponible.", true, "overloaded");
    });
    const { review, usage } = await reviewDeliverable(llm, input("Vous allez gagner."));
    expect(review.status).toBe("partial");
    expect(review.verdict).toBe("blocking");
    expect(review.note).toContain("temporairement indisponible");
    expect(usage).toBeNull();
  });

  it("degrades to the fixed rules when the model answer is unreadable", async () => {
    const llm = new ScriptedProvider(() => textResult("pas du JSON"));
    const { review } = await reviewDeliverable(llm, input("Je demande 180 €."));
    expect(review).toMatchObject({ status: "partial", verdict: "ok", issues: [] });
    expect(review.note).toContain("illisible");
  });

  it("runs the rules alone when no model is configured", async () => {
    const { review } = await reviewDeliverable(null, input("Je demande 180 €."));
    expect(review).toMatchObject({ status: "partial", verdict: "ok", model: null });
  });
});
