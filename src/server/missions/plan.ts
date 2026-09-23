import type { MissionStep, StepKind } from "@/db/schema";

export type PlannedStep = {
  key: string;
  title: string;
  description: string;
  kind: StepKind;
  depends_on: string[];
};

export type PlanMerge = {
  insert: (PlannedStep & { position: number })[];
  update: { id: string; patch: Partial<MissionStep> }[];
  remove: string[];
};

const clean = (s: string, max: number) => s.trim().slice(0, max);

/**
 * Merges a revised plan into the existing steps without losing work:
 * - completed / skipped steps keep their status, result and evidence;
 * - open steps matching a key are updated and reopened (new information may
 *   unblock them);
 * - open steps missing from the revision are dropped;
 * - completed steps missing from the revision are kept, first in order.
 */
export function mergePlan(existing: MissionStep[], revised: PlannedStep[]): PlanMerge {
  const byKey = new Map(existing.map((s) => [s.key, s]));
  const seen = new Set<string>();
  const result: PlanMerge = { insert: [], update: [], remove: [] };

  // De-duplicate keys proposed by the model and sanitise them.
  const incoming: PlannedStep[] = [];
  for (const step of revised) {
    let key = clean(step.key, 40).replace(/[^\w-]/g, "") || `s${incoming.length + 1}`;
    while (seen.has(key)) key = `${key}_`;
    seen.add(key);
    incoming.push({
      ...step,
      key,
      title: clean(step.title, 140),
      description: clean(step.description, 800),
      depends_on: step.depends_on.slice(0, 10),
    });
  }
  const incomingKeys = new Set(incoming.map((s) => s.key));

  const keptClosed = existing
    .filter((s) => !incomingKeys.has(s.key) && (s.status === "DONE" || s.status === "SKIPPED"))
    .sort((a, b) => a.position - b.position);

  let position = 0;
  for (const s of keptClosed) {
    result.update.push({ id: s.id, patch: { position: position++ } });
  }

  for (const step of incoming) {
    const prev = byKey.get(step.key);
    const deps = step.depends_on.filter((d) => d !== step.key && (incomingKeys.has(d) || byKey.has(d)));
    if (!prev) {
      result.insert.push({ ...step, depends_on: deps, position: position++ });
      continue;
    }
    if (prev.status === "DONE" || prev.status === "SKIPPED") {
      result.update.push({ id: prev.id, patch: { position: position++ } });
      continue;
    }
    result.update.push({
      id: prev.id,
      patch: {
        title: step.title,
        description: step.description,
        kind: step.kind,
        dependsOn: deps,
        position: position++,
        status: "PENDING",
        error: null,
        completedBy: null,
      },
    });
  }

  for (const s of existing) {
    if (!incomingKeys.has(s.key) && s.status !== "DONE" && s.status !== "SKIPPED") {
      result.remove.push(s.id);
    }
  }
  return result;
}
