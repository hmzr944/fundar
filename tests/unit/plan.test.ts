import { describe, expect, it } from "vitest";
import { mergePlan, type PlannedStep } from "@/server/missions/plan";
import type { MissionStep } from "@/db/schema";

const existing = (key: string, status: MissionStep["status"], position: number): MissionStep => ({
  id: `id-${key}`,
  missionId: "m",
  key,
  title: `old ${key}`,
  description: "",
  kind: "planning",
  position,
  dependsOn: [],
  status,
  result: status === "DONE" ? "résultat" : null,
  error: status === "BLOCKED" ? "bloqué" : null,
  completedBy: status === "DONE" ? "atlas" : null,
  evidence: {},
  activeRunId: status === "IN_PROGRESS" ? "run-1" : null,
  createdAt: new Date(),
  updatedAt: new Date(),
});
const planned = (key: string, deps: string[] = []): PlannedStep => ({ key, title: `new ${key}`, description: "d", kind: "planning", depends_on: deps });

describe("mergePlan", () => {
  it("inserts every step of a first plan in order", () => {
    const m = mergePlan([], [planned("s1"), planned("s2", ["s1"])]);
    expect(m.insert.map((s) => [s.key, s.position])).toEqual([
      ["s1", 0],
      ["s2", 1],
    ]);
    expect(m.insert[1].depends_on).toEqual(["s1"]);
    expect(m.remove).toEqual([]);
  });

  it("keeps completed steps untouched and reopens blocked ones", () => {
    const m = mergePlan([existing("s1", "DONE", 0), existing("s2", "BLOCKED", 1)], [planned("s1"), planned("s2"), planned("s3")]);
    const s1 = m.update.find((u) => u.id === "id-s1")!;
    expect(s1.patch).toEqual({ position: 0 });
    const s2 = m.update.find((u) => u.id === "id-s2")!;
    expect(s2.patch.status).toBe("PENDING");
    expect(s2.patch.error).toBeNull();
    expect(s2.patch.title).toBe("new s2");
    expect(m.insert.map((s) => s.key)).toEqual(["s3"]);
  });

  it("drops open steps absent from the revision but keeps finished work", () => {
    const m = mergePlan([existing("s1", "DONE", 0), existing("s2", "PENDING", 1)], [planned("s9")]);
    expect(m.remove).toEqual(["id-s2"]);
    expect(m.update).toEqual([{ id: "id-s1", patch: { position: 0 } }]);
    expect(m.insert[0]).toMatchObject({ key: "s9", position: 1 });
  });

  it("sanitises and de-duplicates keys and removes unknown dependencies", () => {
    const m = mergePlan([], [planned("a b"), planned("a b"), planned("c", ["zz", "c"])]);
    const keys = m.insert.map((s) => s.key);
    expect(new Set(keys).size).toBe(3);
    expect(keys[0]).toBe("ab");
    expect(m.insert[2].depends_on).toEqual([]);
  });
});

describe("mission titles", () => {
  it("cuts a long first line on a word boundary", async () => {
    const { shortTitle } = await import("@/server/missions/service");
    const long = "Mon colis Colissimo (commande Boulanger n°48213, 89 €) est indiqué livré le 12/09/2026 mais je ne l'ai jamais reçu.";
    const t = shortTitle(long);
    expect(t.length).toBeLessThanOrEqual(81);
    expect(t.endsWith("…")).toBe(true);
    expect(long.startsWith(t.slice(0, -1))).toBe(true);
    expect(long.charAt(t.length - 1)).toBe(" ");
    expect(shortTitle("Court")).toBe("Court");
  });
});
