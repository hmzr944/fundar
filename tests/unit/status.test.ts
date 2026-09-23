import { describe, expect, it } from "vitest";
import { deriveMissionStatus, stepHasEvidence } from "@/server/missions/status";
import type { MissionStep } from "@/db/schema";

type S = Pick<MissionStep, "status" | "kind" | "result" | "completedBy" | "evidence">;
const step = (over: Partial<S>): S => ({ status: "PENDING", kind: "planning", result: null, completedBy: null, evidence: {}, ...over });

describe("stepHasEvidence", () => {
  it("requires sources for a research step done by Atlas", () => {
    expect(stepHasEvidence(step({ kind: "research", status: "DONE", result: "ok", completedBy: "atlas" }))).toBe(false);
    expect(
      stepHasEvidence(step({ kind: "research", status: "DONE", result: "ok", completedBy: "atlas", evidence: { sourceIds: ["a"] } })),
    ).toBe(true);
  });
  it("requires an artifact for a deliverable step", () => {
    expect(stepHasEvidence(step({ kind: "deliverable", status: "DONE", result: "ok", completedBy: "atlas" }))).toBe(false);
    expect(
      stepHasEvidence(step({ kind: "deliverable", status: "DONE", result: "ok", completedBy: "atlas", evidence: { artifactIds: ["x"] } })),
    ).toBe(true);
  });
  it("never accepts a user_action completed by Atlas, but accepts a user declaration", () => {
    expect(stepHasEvidence(step({ kind: "user_action", status: "DONE", result: "ok", completedBy: "atlas" }))).toBe(false);
    expect(stepHasEvidence(step({ kind: "user_action", status: "DONE", completedBy: "user" }))).toBe(true);
  });
  it("does not accept a user declaration as proof for a step kind Atlas itself can verify", () => {
    // Regression: a user declaring a research/document_analysis/deliverable/planning
    // step done, with no source/document/artifact, must not count as proven —
    // only user_action is exempt (the user is the only one who can know it happened).
    for (const kind of ["research", "document_analysis", "deliverable", "planning"] as const) {
      expect(stepHasEvidence(step({ kind, status: "DONE", completedBy: "user", evidence: {} }))).toBe(false);
    }
  });
  it("rejects an empty result", () => {
    expect(stepHasEvidence(step({ kind: "planning", status: "DONE", result: "  ", completedBy: "atlas" }))).toBe(false);
  });
});

describe("deriveMissionStatus", () => {
  it("is DRAFT without plan and NEEDS_INPUT with blocking questions", () => {
    expect(deriveMissionStatus({ steps: [], hasBlockingMissingInfo: false })).toBe("DRAFT");
    expect(deriveMissionStatus({ steps: [step({})], hasBlockingMissingInfo: true })).toBe("NEEDS_INPUT");
  });
  it("is IN_PROGRESS while a run is active", () => {
    expect(deriveMissionStatus({ steps: [step({})], hasBlockingMissingInfo: false, runActive: true })).toBe("IN_PROGRESS");
  });
  it("is PLANNED when nothing has started", () => {
    expect(deriveMissionStatus({ steps: [step({}), step({ kind: "research" })], hasBlockingMissingInfo: false })).toBe("PLANNED");
  });
  it("is COMPLETED only when every step is closed with evidence", () => {
    const proven = step({ status: "DONE", result: "r", completedBy: "atlas" });
    expect(deriveMissionStatus({ steps: [proven, step({ status: "SKIPPED" })], hasBlockingMissingInfo: false })).toBe("COMPLETED");
    const unproven = step({ kind: "deliverable", status: "DONE", result: "r", completedBy: "atlas" });
    expect(deriveMissionStatus({ steps: [proven, unproven], hasBlockingMissingInfo: false })).toBe("PARTIALLY_COMPLETED");
  });
  it("never reaches COMPLETED when all steps are skipped", () => {
    expect(deriveMissionStatus({ steps: [step({ status: "SKIPPED" })], hasBlockingMissingInfo: false })).toBe("PARTIALLY_COMPLETED");
  });
  it("is WAITING_FOR_USER when only user actions remain", () => {
    const done = step({ status: "DONE", result: "r", completedBy: "atlas" });
    expect(deriveMissionStatus({ steps: [done, step({ kind: "user_action" })], hasBlockingMissingInfo: false })).toBe("WAITING_FOR_USER");
    expect(deriveMissionStatus({ steps: [done, step({ status: "WAITING_USER" })], hasBlockingMissingInfo: false })).toBe("WAITING_FOR_USER");
  });
  it("distinguishes BLOCKED, FAILED and partial results", () => {
    expect(deriveMissionStatus({ steps: [step({ status: "BLOCKED" })], hasBlockingMissingInfo: false })).toBe("BLOCKED");
    expect(deriveMissionStatus({ steps: [step({ status: "FAILED" })], hasBlockingMissingInfo: false })).toBe("FAILED");
    const done = step({ status: "DONE", result: "r", completedBy: "atlas" });
    expect(deriveMissionStatus({ steps: [done, step({ status: "BLOCKED" })], hasBlockingMissingInfo: false })).toBe("PARTIALLY_COMPLETED");
  });
  it("marks a mission FAILED when the last run failed with no progress", () => {
    expect(deriveMissionStatus({ steps: [step({})], hasBlockingMissingInfo: false, lastRunFailed: true })).toBe("FAILED");
  });
});
