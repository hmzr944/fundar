import type { MissionStatus, MissionStep, StepKind, StepStatus } from "@/db/schema";

type StepLike = Pick<MissionStep, "status" | "kind" | "result" | "completedBy" | "evidence">;

const TERMINAL_OK: StepStatus[] = ["DONE", "SKIPPED"];

/**
 * Checks that a step marked DONE carries the proof expected for its kind.
 * Steps declared by the user are trusted as declarations (and labelled as
 * such in the UI) — Atlas never claims to have executed them.
 */
export function stepHasEvidence(step: StepLike): boolean {
  if (step.status !== "DONE") return false;
  if (step.completedBy === "user") return true;
  if (!step.result || !step.result.trim()) return false;
  const ev = step.evidence ?? {};
  switch (step.kind as StepKind) {
    case "research":
      return (ev.sourceIds?.length ?? 0) > 0;
    case "document_analysis":
      return (ev.documentIds?.length ?? 0) > 0;
    case "deliverable":
      return (ev.artifactIds?.length ?? 0) > 0;
    case "user_action":
      // Atlas cannot perform user actions; only a user declaration counts.
      return false;
    case "planning":
      return true;
  }
}

export type DeriveInput = {
  steps: StepLike[];
  hasBlockingMissingInfo: boolean;
  runActive?: boolean;
  /** Set when the last execution run ended abnormally (error, limit, cancel). */
  lastRunFailed?: boolean;
};

/**
 * Derives the mission status from observable facts only (step states and the
 * evidence attached to them). The model's own claims are never enough to reach
 * COMPLETED.
 */
export function deriveMissionStatus(input: DeriveInput): MissionStatus {
  const { steps } = input;
  if (input.runActive) return "IN_PROGRESS";
  if (input.hasBlockingMissingInfo) return "NEEDS_INPUT";
  if (steps.length === 0) return "DRAFT";

  const done = steps.filter((s) => s.status === "DONE");
  const allClosed = steps.every((s) => TERMINAL_OK.includes(s.status));

  if (allClosed) {
    const proven = done.length > 0 && done.every(stepHasEvidence);
    return proven ? "COMPLETED" : "PARTIALLY_COMPLETED";
  }

  const open = steps.filter((s) => !TERMINAL_OK.includes(s.status));
  const waitingOnUser = (s: StepLike) =>
    s.status === "WAITING_USER" || (s.kind === "user_action" && s.status === "PENDING");

  const started = steps.some((s) => s.status !== "PENDING");
  if (open.every(waitingOnUser) && (started || open.length === steps.length)) {
    return "WAITING_FOR_USER";
  }
  if (open.some((s) => s.status === "BLOCKED" || s.status === "FAILED")) {
    if (done.length > 0) return "PARTIALLY_COMPLETED";
    return open.some((s) => s.status === "FAILED") ? "FAILED" : "BLOCKED";
  }
  if (done.length > 0) return "PARTIALLY_COMPLETED";
  if (input.lastRunFailed) return "FAILED";
  return "PLANNED";
}

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  DRAFT: "Brouillon",
  NEEDS_INPUT: "Informations requises",
  PLANNED: "Plan établi",
  IN_PROGRESS: "En cours",
  WAITING_FOR_USER: "En attente de vous",
  BLOCKED: "Bloquée",
  PARTIALLY_COMPLETED: "Résultat partiel",
  COMPLETED: "Terminée",
  FAILED: "Échouée",
};

export const STEP_STATUS_LABELS: Record<StepStatus, string> = {
  PENDING: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
  WAITING_USER: "Action de votre part",
  BLOCKED: "Bloquée",
  FAILED: "Échouée",
  SKIPPED: "Ignorée",
};

export const STEP_KIND_LABELS: Record<StepKind, string> = {
  research: "Recherche",
  document_analysis: "Analyse de documents",
  deliverable: "Livrable",
  planning: "Organisation",
  user_action: "Action utilisateur",
};

/** Statuses meaning "the user should look at this mission". */
export const NEEDS_ACTION_STATUSES: MissionStatus[] = [
  "NEEDS_INPUT",
  "WAITING_FOR_USER",
  "BLOCKED",
  "PLANNED",
];
export const ACTIVE_STATUSES: MissionStatus[] = ["IN_PROGRESS", "PARTIALLY_COMPLETED"];
