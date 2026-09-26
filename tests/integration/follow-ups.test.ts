/**
 * "The user sends in one click, Atlas does the rest": sending metadata,
 * confirmation of sending, scheduled follow-ups and their automatic pick-up.
 * The model is a SCRIPTED TEST DOUBLE.
 */
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { messages, missionRuns, missions, missionSteps } from "@/db/schema";
import { analyzeMission } from "@/server/agent/analyze";
import { claimDueFollowUps, runFollowUps } from "@/server/agent/follow-ups";
import { startExecution } from "@/server/agent/runner";
import { executeTool } from "@/server/agent/tools";
import { markArtifactSent } from "@/server/artifacts/service";
import { ScriptedProvider, lastToolResults, textResult, toolCallsResult } from "@/server/llm/scripted";
import { addMessage, createMission, getMissionDetail } from "@/server/missions/service";
import { POST as followUpsRoute } from "@/app/api/internal/follow-ups/route";
import { analysis, planFromBriefing, stepsOf, turn } from "../helpers/agent";
import { createTestUser, db, makeDeps, noFetch, resetDb } from "../helpers/db";

beforeEach(resetDb);

const LETTER = "Je vous demande de rembourser les 180 € de frais de résiliation.";
const steps = analysis({
  steps: [
    { key: "s1", title: "Rédiger la réclamation", description: "", kind: "deliverable", depends_on: [] },
    { key: "s2", title: "Envoyer la réclamation", description: "", kind: "user_action", depends_on: ["s1"] },
  ],
});

async function claimMission(request = "Réclamer les 180 € de frais de résiliation. L'adresse du service client est reclamations@operateur.example") {
  const user = await createTestUser();
  const m = await createMission(db, user.id, request);
  await analyzeMission({ db, llm: new ScriptedProvider(() => textResult(JSON.stringify(steps))), capabilities: { webSearch: false, searchProvider: null } }, m.id, null);
  const ids = Object.fromEntries((await stepsOf(m.id)).map((s) => [s.key, s.id]));
  return { user, mission: m, ids };
}

const ctx = (userId: string, missionId: string) => ({
  db,
  userId,
  missionId,
  runId: "00000000-0000-0000-0000-000000000000",
  search: null,
  fetchPage: noFetch,
  readDocumentIds: new Set<string>(),
});

describe("preparing a message the user sends in one click", () => {
  it("stores the recipient, and flags an address the user never gave", async () => {
    const { user, mission, ids } = await claimMission();
    const known = await executeTool(ctx(user.id, mission.id), "create_deliverable", {
      type: "email",
      title: "Réclamation",
      content_markdown: LETTER,
      step_id: ids.s1,
      send_to: "reclamations@operateur.example",
      subject: "Réclamation — frais de résiliation",
      follow_up_days_after_sending: 15,
    });
    expect(known.ok).toBe(true);
    expect(known.content).not.toHaveProperty("send_warning");
    const invented = await executeTool(ctx(user.id, mission.id), "create_deliverable", {
      type: "letter",
      title: "Autre courrier",
      content_markdown: LETTER,
      send_to: "contact@inconnu.example",
    });
    expect(invented.content).toMatchObject({ send_warning: expect.stringContaining("à vérifier") });

    const detail = await getMissionDetail(db, user.id, mission.id);
    const byName = Object.fromEntries(detail.artifacts.map((a) => [a.name, a]));
    expect(byName["Réclamation"].send).toEqual({
      to: "reclamations@operateur.example",
      subject: "Réclamation — frais de résiliation",
      confirmed: true,
      followUpDays: 15,
    });
    expect(byName["Autre courrier"].send).toMatchObject({ confirmed: false, subject: "Autre courrier" });
    expect(byName["Réclamation"].sentAt).toBeNull();
  });

  it("rejects an invalid recipient address", async () => {
    const { user, mission } = await claimMission();
    const res = await executeTool(ctx(user.id, mission.id), "create_deliverable", {
      type: "email",
      title: "x",
      content_markdown: LETTER,
      send_to: "pas une adresse",
    });
    expect(res.error?.code).toBe("invalid_input");
  });
});

describe("the user confirms they sent it", () => {
  it("records it, tells Atlas, closes the 'send' step and schedules Atlas' follow-up", async () => {
    const { user, mission, ids } = await claimMission();
    const created = await executeTool(ctx(user.id, mission.id), "create_deliverable", {
      type: "email",
      title: "Réclamation",
      content_markdown: LETTER,
      step_id: ids.s1,
      send_to: "reclamations@operateur.example",
      subject: "Réclamation",
      follow_up_days_after_sending: 15,
    });
    const artifactId = (created.content as { artifact_id: string }).artifact_id;
    const now = new Date(2026, 8, 26, 14, 0);

    const res = await markArtifactSent(db, user.id, artifactId, now);
    expect(res.closedStepId).toBe(ids.s2);
    expect(new Date(res.followUpAt!).toDateString()).toBe(new Date(2026, 9, 11).toDateString());

    const [step] = await db.select().from(missionSteps).where(eq(missionSteps.id, ids.s2));
    expect(step).toMatchObject({ status: "DONE", completedBy: "user" });
    const msgs = await db.select().from(messages).where(eq(messages.missionId, mission.id));
    expect(msgs.some((m) => m.role === "user" && m.content.includes("J'ai envoyé « Réclamation » à reclamations@operateur.example"))).toBe(true);
    const [row] = await db.select().from(missions).where(eq(missions.id, mission.id));
    expect(row.followUpReason).toContain("Réclamation");

    // Twice is refused; another user cannot even see it.
    await expect(markArtifactSent(db, user.id, artifactId)).rejects.toMatchObject({ status: 409 });
    const other = await createTestUser();
    await expect(markArtifactSent(db, other.id, artifactId)).rejects.toMatchObject({ status: 404 });
  });
});

describe("scheduled follow-ups", () => {
  it("lets Atlas schedule its own follow-up, within sane dates, and shows the mission as scheduled", async () => {
    const { user, mission, ids } = await claimMission();
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    let results: Record<string, unknown>[] = [];
    const llm = new ScriptedProvider((req) => {
      const plan = planFromBriefing(req);
      switch (turn(req)) {
        case 0:
          return toolCallsResult([
            { name: "schedule_follow_up", input: { date: "2020-01-01", reason: "trop tôt" } },
            { name: "schedule_follow_up", input: { date: "2099-01-01", reason: "trop tard" } },
            { name: "schedule_follow_up", input: { date: tomorrow, reason: "Vérifier le remboursement promis." } },
          ]);
        case 1:
          results = lastToolResults(req);
          return toolCallsResult([
            { name: "create_deliverable", input: { type: "email", title: "Réclamation", content_markdown: LETTER, step_id: plan.s1 } },
          ]);
        case 2:
          return toolCallsResult([
            { name: "update_step", input: { step_id: plan.s1, status: "done", result: "Rédigée.", artifact_ids: [lastToolResults(req)[0].artifact_id] } },
          ]);
        default:
          return toolCallsResult([{ name: "finish_mission", input: { summary_markdown: "Prêt.", remaining_actions: [], limitations: [] } }]);
      }
    });
    await (await startExecution(makeDeps(llm), user.id, mission.id)).done;
    expect(ids.s1).toBeDefined();
    expect(results.map((r) => (r.error as { code?: string } | undefined)?.code ?? "ok")).toEqual(["date_in_past", "date_too_far", "ok"]);
    const [row] = await db.select().from(missions).where(eq(missions.id, mission.id));
    expect(row.followUpReason).toBe("Vérifier le remboursement promis.");
    // The only open step is the user's; with a follow-up set, the mission reads as scheduled.
    expect(row.status).toBe("SCHEDULED");
  });

  it("picks due missions up once, re-analyses them and executes the new plan without anyone clicking", async () => {
    const { mission } = await claimMission();
    const other = await claimMission();
    await db.update(missions).set({ nextFollowUpAt: new Date(Date.now() - 60_000), followUpReason: "Vérifier la réponse de l'opérateur." }).where(eq(missions.id, mission.id));
    await db.update(missions).set({ nextFollowUpAt: new Date(Date.now() + 86_400_000), followUpReason: "Plus tard." }).where(eq(missions.id, other.mission.id));

    const deps = makeDeps(null);
    const claimed = await claimDueFollowUps(deps);
    expect(claimed.map((c) => c.id)).toEqual([mission.id]);
    expect(await claimDueFollowUps(deps)).toEqual([]);

    let analysisInput = "";
    const followUpPlan = analysis({
      steps: [
        { key: "s1", title: "Rédiger la réclamation", description: "", kind: "deliverable", depends_on: [] },
        { key: "s2", title: "Envoyer la réclamation", description: "", kind: "user_action", depends_on: ["s1"] },
        { key: "s3", title: "Préparer la relance", description: "", kind: "planning", depends_on: [] },
      ],
    });
    const llm = new ScriptedProvider((req) => {
      if (req.purpose === "analyze") {
        analysisInput = typeof req.messages[0].content === "string" ? req.messages[0].content : "";
        return textResult(JSON.stringify(followUpPlan));
      }
      const plan = planFromBriefing(req);
      return turn(req) === 0
        ? toolCallsResult([{ name: "update_step", input: { step_id: plan.s3, status: "done", result: "Relance prévue." } }])
        : toolCallsResult([{ name: "finish_mission", input: { summary_markdown: "Relance préparée.", remaining_actions: [], limitations: [] } }]);
    });
    const results = await runFollowUps(makeDeps(llm), claimed);

    expect(results).toEqual([{ missionId: mission.id, outcome: "executed" }]);
    expect(analysisInput).toContain("Reprise programmée du dossier : Vérifier la réponse de l'opérateur.");
    const runs = await db.select().from(missionRuns).where(eq(missionRuns.missionId, mission.id));
    // One analysis then one execution, both started by the follow-up itself.
    expect(runs.map((r) => [r.kind, r.status]).sort()).toEqual([
      ["analysis", "SUCCEEDED"],
      ["execution", "SUCCEEDED"],
    ]);
    const [untouched] = await db.select().from(missions).where(eq(missions.id, other.mission.id));
    expect(untouched.followUpReason).toBe("Plus tard.");
  });

  it("stops at the user's questions instead of executing when information is missing", async () => {
    const { user, mission } = await claimMission();
    await addMessage(db, mission.id, "user", "Toujours rien reçu.");
    const needs = analysis({
      missing_info: [{ question: "Avez-vous reçu une réponse écrite ?", reason: "Pour choisir entre relance et médiation.", blocking: true }],
    });
    const llm = new ScriptedProvider(() => textResult(JSON.stringify(needs)));
    const results = await runFollowUps(makeDeps(llm), [{ id: mission.id, userId: user.id, reason: "Vérifier" }]);
    expect(results[0].outcome).toBe("needs_input");
    const [row] = await db.select().from(missions).where(eq(missions.id, mission.id));
    expect(row.status).toBe("NEEDS_INPUT");
  });
});

describe("follow-up trigger endpoint", () => {
  const call = (auth?: string) =>
    followUpsRoute(new Request("http://localhost/api/internal/follow-ups", { method: "POST", headers: auth ? { authorization: auth } : {} }));

  it("is disabled without a strong secret and refuses a wrong one", async () => {
    const previous = process.env.ATLAS_CRON_SECRET;
    try {
      delete process.env.ATLAS_CRON_SECRET;
      expect((await call("Bearer x")).status).toBe(503);
      process.env.ATLAS_CRON_SECRET = "s".repeat(32);
      expect((await call()).status).toBe(401);
      expect((await call(`Bearer ${"t".repeat(32)}`)).status).toBe(401);
      const ok = await call(`Bearer ${"s".repeat(32)}`);
      expect(ok.status).toBe(202);
      expect(await ok.json()).toEqual({ started: [] });
    } finally {
      if (previous === undefined) delete process.env.ATLAS_CRON_SECRET;
      else process.env.ATLAS_CRON_SECRET = previous;
    }
  });
});

