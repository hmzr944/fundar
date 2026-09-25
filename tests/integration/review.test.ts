/**
 * Automatic proofreading of deliverables. The writing model and the reviewer
 * are SCRIPTED TEST DOUBLES: these tests check the wiring (review after each
 * write, feedback to the model, revision, storage, costs), not review quality.
 */
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { artifacts, executionLogs } from "@/db/schema";
import { analyzeMission } from "@/server/agent/analyze";
import { startExecution } from "@/server/agent/runner";
import { MAX_REVISIONS } from "@/server/agent/tools";
import { reviewStoredArtifact } from "@/server/artifacts/review";
import { editArtifact } from "@/server/artifacts/service";
import { ScriptedProvider, lastToolResults, textResult, toolCallsResult } from "@/server/llm/scripted";
import type { LlmRequest } from "@/server/llm/types";
import { createMission, getMissionDetail } from "@/server/missions/service";
import { analysis, planFromBriefing, turn } from "../helpers/agent";
import { createTestUser, db, makeDeps, resetDb } from "../helpers/db";

beforeEach(resetDb);

const WRONG = "Je vous demande de rembourser 250 €. Vous allez obtenir gain de cause.";
const FIXED = "Je vous demande de rembourser les 180 € de frais de résiliation.";

async function deliverableMission() {
  const user = await createTestUser();
  const m = await createMission(db, user.id, "Réclamer les 180 € de frais de résiliation à mon opérateur");
  const planner = new ScriptedProvider(() =>
    textResult(JSON.stringify(analysis({ steps: [{ key: "s1", title: "Rédiger la réclamation", description: "", kind: "deliverable", depends_on: [] }] }))),
  );
  await analyzeMission({ db, llm: planner, capabilities: { webSearch: false, searchProvider: null } }, m.id, null);
  return { user, mission: m };
}

/** Reviewer double: flags 250 € as inconsistent, accepts anything else. */
function reviewAnswer(req: LlmRequest) {
  const text = typeof req.messages[0].content === "string" ? req.messages[0].content : "";
  const flagged = text.includes("250 €");
  return textResult(
    JSON.stringify({
      issues: flagged
        ? [{ severity: "blocking", category: "inconsistency", excerpt: "250 €", problem: "Le montant réclamé ne correspond pas à la demande (180 €).", suggestion: "Réclamer 180 €." }]
        : [],
    }),
  );
}

describe("automatic review of deliverables", () => {
  it("reviews each deliverable as it is written, lets Atlas fix it, and stores the final review", async () => {
    const { user, mission } = await deliverableMission();
    const reviewed: string[] = [];
    let createResult: Record<string, unknown> = {};
    let reviseResult: Record<string, unknown> = {};
    const llm = new ScriptedProvider((req) => {
      if (req.purpose === "review") {
        reviewed.push(typeof req.messages[0].content === "string" ? req.messages[0].content : "");
        return reviewAnswer(req);
      }
      const ids = planFromBriefing(req);
      switch (turn(req)) {
        case 0:
          expect(req.system).toContain("Relecture automatique");
          expect(req.tools?.map((t) => t.name)).toContain("revise_deliverable");
          return toolCallsResult([{ name: "create_deliverable", input: { type: "letter", title: "Réclamation", content_markdown: WRONG, step_id: ids.s1 } }]);
        case 1:
          createResult = lastToolResults(req)[0];
          return toolCallsResult([
            { name: "revise_deliverable", input: { artifact_id: createResult.artifact_id, content_markdown: FIXED, change_note: "Montant corrigé à 180 €, promesse retirée." } },
          ]);
        case 2:
          reviseResult = lastToolResults(req)[0];
          return toolCallsResult([
            { name: "update_step", input: { step_id: ids.s1, status: "done", result: "Réclamation rédigée et relue.", artifact_ids: [createResult.artifact_id] } },
          ]);
        default:
          return toolCallsResult([{ name: "finish_mission", input: { summary_markdown: "Fait.", remaining_actions: [], limitations: [] } }]);
      }
    });

    await (await startExecution(makeDeps(llm, { reviewDeliverables: true }), user.id, mission.id)).done;

    // The first draft was reviewed and its problems were handed back to the writer.
    expect(reviewed).toHaveLength(2);
    expect(reviewed[0]).toContain(WRONG);
    expect(createResult).toMatchObject({
      review: {
        verdict: "blocking",
        issues: expect.arrayContaining([
          expect.objectContaining({ category: "promise" }),
          expect.objectContaining({ category: "inconsistency" }),
        ]),
      },
      review_instructions: expect.stringContaining("revise_deliverable"),
    });
    // The revision was reviewed in turn and came back clean.
    expect(reviewed[1]).toContain(FIXED);
    expect(reviseResult).toMatchObject({ revision: 1, review: { verdict: "ok" } });

    const [art] = await db.select().from(artifacts).where(eq(artifacts.missionId, mission.id));
    expect(art.content).toBe(FIXED);
    expect(art.metadata).toMatchObject({ revisions: 1, revisionNotes: ["Montant corrigé à 180 €, promesse retirée."], review: { verdict: "ok", status: "done" } });

    // Review calls are logged and counted in the mission's usage.
    const logs = await db.select().from(executionLogs).where(eq(executionLogs.missionId, mission.id));
    expect(logs.filter((l) => l.kind === "llm:review")).toHaveLength(2);

    // The workspace exposes the review, not the raw metadata.
    const detail = await getMissionDetail(db, user.id, mission.id);
    expect(detail.artifacts[0]).toMatchObject({ review: { verdict: "ok" } });
    expect(detail.artifacts[0]).not.toHaveProperty("metadata");
  });

  it("caps the number of revisions per deliverable", async () => {
    const { user, mission } = await deliverableMission();
    const results: Record<string, unknown>[] = [];
    let artifactId = "";
    const llm = new ScriptedProvider((req) => {
      if (req.purpose === "review") return reviewAnswer(req);
      const ids = planFromBriefing(req);
      const t = turn(req);
      if (t > 0) results.push(lastToolResults(req)[0]);
      if (t === 0) return toolCallsResult([{ name: "create_deliverable", input: { type: "letter", title: "Réclamation", content_markdown: WRONG, step_id: ids.s1 } }]);
      if (t === 1) artifactId = String(results[0].artifact_id);
      if (t <= MAX_REVISIONS + 1) {
        // Each attempt keeps the wrong amount (distinct text to avoid the identical-call guard).
        return toolCallsResult([{ name: "revise_deliverable", input: { artifact_id: artifactId, content_markdown: `${WRONG} (${t})`, change_note: `essai ${t}` } }]);
      }
      return toolCallsResult([{ name: "finish_mission", input: { summary_markdown: "Problème restant signalé.", remaining_actions: [], limitations: [] } }]);
    });

    await (await startExecution(makeDeps(llm, { reviewDeliverables: true }), user.id, mission.id)).done;

    expect(results[MAX_REVISIONS + 1]).toMatchObject({ ok: false, error: { code: "revision_limit" } });
    const [art] = await db.select().from(artifacts).where(eq(artifacts.missionId, mission.id));
    expect(art.metadata).toMatchObject({ revisions: MAX_REVISIONS, review: { verdict: "blocking" } });
  });

  it("never overwrites a deliverable the user edited, and marks its review as outdated", async () => {
    const { user, mission } = await deliverableMission();
    let artifactId = "";
    let reviseResult: Record<string, unknown> = {};
    const llm = new ScriptedProvider(async (req) => {
      if (req.purpose === "review") return reviewAnswer(req);
      const ids = planFromBriefing(req);
      switch (turn(req)) {
        case 0:
          return toolCallsResult([{ name: "create_deliverable", input: { type: "letter", title: "Réclamation", content_markdown: WRONG, step_id: ids.s1 } }]);
        case 1:
          artifactId = String(lastToolResults(req)[0].artifact_id);
          // The user edits the letter while the run is going on.
          await editArtifact(db, user.id, artifactId, { content: "Ma propre version, 180 €." });
          return toolCallsResult([{ name: "revise_deliverable", input: { artifact_id: artifactId, content_markdown: FIXED, change_note: "correction" } }]);
        case 2:
          reviseResult = lastToolResults(req)[0];
          return toolCallsResult([{ name: "finish_mission", input: { summary_markdown: "Fait.", remaining_actions: [], limitations: [] } }]);
        default:
          return toolCallsResult([{ name: "finish_mission", input: { summary_markdown: "Fait.", remaining_actions: [], limitations: [] } }]);
      }
    });

    await (await startExecution(makeDeps(llm, { reviewDeliverables: true }), user.id, mission.id)).done;

    expect(reviseResult).toMatchObject({ ok: false, error: { code: "edited_by_user" } });
    const [art] = await db.select().from(artifacts).where(eq(artifacts.id, artifactId));
    expect(art.content).toBe("Ma propre version, 180 €.");
    expect(art.metadata).toMatchObject({ review: { verdict: "blocking", stale: true } });
  });

  it("reviews the current text on demand, e.g. after a manual edit", async () => {
    const { user, mission } = await deliverableMission();
    const [art] = await db
      .insert(artifacts)
      .values({ missionId: mission.id, type: "letter", name: "Réclamation", content: WRONG, metadata: {} })
      .returning();
    const review = await reviewStoredArtifact(db, new ScriptedProvider(reviewAnswer), user.id, art.id);
    expect(review.verdict).toBe("blocking");
    const [stored] = await db.select().from(artifacts).where(eq(artifacts.id, art.id));
    expect(stored.metadata).toMatchObject({ review: { verdict: "blocking" } });

    // Another user cannot review (or even see) this deliverable.
    const other = await createTestUser();
    await expect(reviewStoredArtifact(db, new ScriptedProvider(reviewAnswer), other.id, art.id)).rejects.toMatchObject({ status: 404 });
    // On-demand reviews are paid model calls: they are capped per day.
    await expect(reviewStoredArtifact(db, new ScriptedProvider(reviewAnswer), user.id, art.id, { maxPerDay: 1 })).rejects.toMatchObject({ status: 429 });
    // Without a model, the endpoint says so instead of pretending.
    await expect(reviewStoredArtifact(db, null, user.id, art.id)).rejects.toMatchObject({ status: 503 });
  });

  it("does not review or offer revisions when the feature is off", async () => {
    const { user, mission } = await deliverableMission();
    let createResult: Record<string, unknown> = {};
    const llm = new ScriptedProvider((req) => {
      expect(req.purpose).not.toBe("review");
      const ids = planFromBriefing(req);
      if (turn(req) === 0) {
        expect(req.tools?.map((t) => t.name)).not.toContain("revise_deliverable");
        return toolCallsResult([{ name: "create_deliverable", input: { type: "letter", title: "Réclamation", content_markdown: FIXED, step_id: ids.s1 } }]);
      }
      createResult = lastToolResults(req)[0];
      return toolCallsResult([{ name: "finish_mission", input: { summary_markdown: "Fait.", remaining_actions: [], limitations: [] } }]);
    });
    await (await startExecution(makeDeps(llm), user.id, mission.id)).done;
    expect(createResult).not.toHaveProperty("review");
  });
});
