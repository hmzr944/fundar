/**
 * Retention policy (nightly purge). Data is aged artificially in the database.
 */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { eq, isNull, sql } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fileDeletions, missionRuns, missions, sessions, usageRecords, users } from "@/db/schema";
import { createSession, createUser, validateSessionToken } from "@/server/auth";
import { queueFileDeletions } from "@/server/documents/deletions";
import { uploadDocument } from "@/server/documents/service";
import { LocalFileStorage } from "@/server/documents/storage";
import { ensureVolumeIdentity, VOLUME_MARKER } from "@/server/documents/volume";
import { runPurge } from "@/server/maintenance/purge";
import { retentionSettings } from "@/server/maintenance/retention";
import { createMission, listMissions, touchMissionActivity } from "@/server/missions/service";
import { createTestUser, db, resetDb } from "../helpers/db";

const limits = { maxBytes: 1024 * 1024, maxPerMission: 20 };
let root: string;
let storage: LocalFileStorage;

beforeEach(async () => {
  await resetDb();
  root = await mkdtemp(path.join(os.tmpdir(), "atlas-purge-"));
  storage = new LocalFileStorage(root);
  await ensureVolumeIdentity(db, root);
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const settings = (over: Record<string, string> = {}) => retentionSettings({ NODE_ENV: "test", ...over });
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000);

async function age(missionId: string, days: number) {
  await db.execute(sql`update missions set updated_at = ${daysAgo(days)}, last_activity_at = ${daysAgo(days)} where id = ${missionId}`);
}
const missionIds = async () => (await db.select({ id: missions.id }).from(missions)).map((m) => m.id);

describe("missions", () => {
  it("deletes missions inactive for 180 days with their files, and keeps recent ones", async () => {
    const u = await createTestUser();
    const old = await createMission(db, u.id, "Ancienne");
    const recent = await createMission(db, u.id, "Récente");
    await uploadDocument(db, storage, u.id, old.id, { name: "a.txt", data: Buffer.from("a") }, limits);
    await age(old.id, 181);
    await age(recent.id, 179);

    const r = await runPurge(db, storage, settings());
    expect(r.steps.missions).toMatchObject({ status: "ok" });
    expect(await missionIds()).toEqual([recent.id]);
    expect(await storage.list()).toEqual([]);
    expect(r.needsAttention).toBe(false);
  });

  it("counts opening a mission as activity, without changing the list order", async () => {
    const u = await createTestUser();
    const a = await createMission(db, u.id, "A");
    const b = await createMission(db, u.id, "B");
    await age(a.id, 200);
    await age(b.id, 100);
    const [before] = await db.select().from(missions).where(eq(missions.id, a.id));

    await touchMissionActivity(db, a.id); // the user opens A
    const [after] = await db.select().from(missions).where(eq(missions.id, a.id));
    expect(after.updatedAt).toEqual(before.updatedAt);
    expect(after.lastActivityAt.getTime()).toBeGreaterThan(Date.now() - 60_000);
    expect((await listMissions(db, u.id)).map((m) => m.title)).toEqual(["B", "A"]);

    await runPurge(db, storage, settings());
    expect((await missionIds()).sort()).toEqual([a.id, b.id].sort());
  });

  it("writes the opening activity at most once per hour", async () => {
    const u = await createTestUser();
    const m = await createMission(db, u.id, "M");
    const t = new Date(Date.now() - 30 * 60_000);
    await db.execute(sql`update missions set last_activity_at = ${t} where id = ${m.id}`);
    await touchMissionActivity(db, m.id);
    const [row] = await db.select().from(missions).where(eq(missions.id, m.id));
    expect(row.lastActivityAt.getTime()).toBe(t.getTime());
  });

  it("skips a mission Atlas is working on, but not one whose run is stale (dead process)", async () => {
    const u = await createTestUser();
    const busy = await createMission(db, u.id, "En cours");
    const stale = await createMission(db, u.id, "Bloquée");
    await age(busy.id, 400);
    await age(stale.id, 400);
    await db.insert(missionRuns).values({ userId: u.id, missionId: busy.id, kind: "execution", status: "RUNNING", heartbeatAt: new Date() });
    await db.insert(missionRuns).values({ userId: u.id, missionId: stale.id, kind: "execution", status: "RUNNING", heartbeatAt: daysAgo(1) });
    await runPurge(db, storage, settings());
    expect(await missionIds()).toEqual([busy.id]);
  });
});

describe("accounts", () => {
  async function inactiveUser(days: number) {
    const u = await createUser(db, { email: `${randomUUID().slice(0, 8)}@test.local`, password: "motdepasse-solide" });
    await db.execute(sql`update users set last_seen_at = ${daysAgo(days)} where id = ${u.id}`);
    return u;
  }

  it("does not delete inactive accounts while ATLAS_ACCOUNT_PURGE is off (default), but reports them", async () => {
    await inactiveUser(400);
    const r = await runPurge(db, storage, settings());
    expect(r.steps.accounts.status).toBe("skipped");
    expect(r.steps.accounts.detail).toMatch(/1 compte\(s\) inactif/);
    expect(await db.select().from(users)).toHaveLength(1);
  });

  it("when enabled, deletes accounts inactive for 12 months through the complete path (usage anonymized)", async () => {
    const gone = await inactiveUser(400);
    const kept = await inactiveUser(300);
    const m = await createMission(db, gone.id, "Mission");
    await db.insert(usageRecords).values({ userId: gone.id, missionRef: randomUUID(), kind: "execution", estimatedCostUsd: "0.5", endedAt: new Date() });
    const r = await runPurge(db, storage, settings({ ATLAS_ACCOUNT_PURGE: "on" }));
    expect(r.steps.accounts).toMatchObject({ status: "ok" });
    expect((await db.select().from(users)).map((u) => u.id)).toEqual([kept.id]);
    expect(await db.select().from(missions).where(eq(missions.id, m.id))).toHaveLength(0);
    const anon = await db.select().from(usageRecords).where(isNull(usageRecords.userId));
    expect(anon).toHaveLength(1);
    expect(anon[0]).toMatchObject({ runId: null, estimatedCostUsd: "0.500000" });
  });

  it("keeps an account used through a long session even without a recent login", async () => {
    const u = await inactiveUser(400);
    const { token } = await createSession(db, u.id, 30);
    // Login refreshes last_seen; simulate an old login and a session still in use.
    await db.execute(sql`update users set last_seen_at = ${daysAgo(400)} where id = ${u.id}`);
    expect(await validateSessionToken(db, token)).not.toBeNull();
    const [row] = await db.select().from(users).where(eq(users.id, u.id));
    expect(row.lastSeenAt.getTime()).toBeGreaterThan(Date.now() - 60_000);
    await runPurge(db, storage, settings({ ATLAS_ACCOUNT_PURGE: "on" }));
    expect(await db.select().from(users)).toHaveLength(1);
  });
});

describe("sessions, usage ledger", () => {
  it("removes expired sessions and keeps valid ones", async () => {
    const u = await createTestUser();
    await createSession(db, u.id, 30);
    await db.insert(sessions).values({ id: randomUUID(), userId: u.id, expiresAt: daysAgo(1) });
    await runPurge(db, storage, settings());
    const left = await db.select().from(sessions);
    expect(left).toHaveLength(1);
    expect(left[0].expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("removes usage rows older than 24 months only", async () => {
    const at = (months: number) => sql`now() - make_interval(months => ${months})`;
    for (const months of [23, 25]) {
      await db.execute(sql`insert into usage_records (mission_ref, kind, started_at) values (${randomUUID()}, 'execution', ${at(months)})`);
    }
    await runPurge(db, storage, settings());
    const rows = await db.select().from(usageRecords);
    expect(rows).toHaveLength(1);
    expect(rows[0].startedAt.getTime()).toBeGreaterThan(Date.now() - 24 * 31 * 86_400_000);
  });
});

describe("files, safety and robustness", () => {
  it("retries the deletion queue and erases pending files", async () => {
    const u = await createTestUser();
    const key = `${u.id}/${randomUUID()}`;
    await storage.put(u.id, Buffer.from("x")); // unrelated file stays (recent orphan)
    await writeFile(path.join(root, u.id, key.split("/")[1]), "à effacer");
    await queueFileDeletions(db, [key]);
    const r = await runPurge(db, storage, settings());
    expect(r.steps.fileQueue.status).toBe("ok");
    expect(await db.select().from(fileDeletions)).toEqual([]);
    expect((await storage.list()).map((f) => f.key)).not.toContain(key);
  });

  it("with an unverified volume, still deletes rows but queues files instead of erasing them, and asks for attention", async () => {
    const u = await createTestUser();
    const m = await createMission(db, u.id, "Ancienne");
    await uploadDocument(db, storage, u.id, m.id, { name: "a.txt", data: Buffer.from("a") }, limits);
    await age(m.id, 400);
    await rm(path.join(root, VOLUME_MARKER));

    const r = await runPurge(db, storage, settings());
    expect(r.volumeVerified).toBe(false);
    expect(r.needsAttention).toBe(true);
    expect(await missionIds()).toEqual([]);
    expect(await db.select().from(fileDeletions)).toHaveLength(1);
    expect(await storage.list()).toHaveLength(1); // nothing erased on a doubtful volume
    expect(r.steps.orphans.status).toBe("skipped");
  });

  it("--dry-run modifies nothing", async () => {
    const u = await createUser(db, { email: "dry@test.local", password: "motdepasse-solide" });
    const m = await createMission(db, u.id, "Ancienne");
    await uploadDocument(db, storage, u.id, m.id, { name: "a.txt", data: Buffer.from("a") }, limits);
    await age(m.id, 400);
    await db.execute(sql`update users set last_seen_at = ${daysAgo(400)}`);
    await db.insert(sessions).values({ id: randomUUID(), userId: u.id, expiresAt: daysAgo(1) });
    const snapshot = async () => ({
      missions: await db.select().from(missions),
      users: await db.select().from(users),
      sessions: await db.select().from(sessions),
      files: await storage.list(),
    });
    const before = await snapshot();
    const r = await runPurge(db, storage, settings({ ATLAS_ACCOUNT_PURGE: "on" }), { dryRun: true });
    expect(r.steps.missions).toMatchObject({ status: "dry-run", detail: expect.stringMatching(/^1 mission/) });
    expect(r.steps.accounts).toMatchObject({ status: "dry-run", detail: expect.stringMatching(/^1 compte/) });
    expect(await snapshot()).toEqual(before);
  });

  it("does not run while another purge holds the lock, and recovers a lock left by a crash", async () => {
    const u = await createTestUser();
    await db.insert(sessions).values({ id: randomUUID(), userId: u.id, expiresAt: daysAgo(1) });
    await db.execute(sql`insert into app_settings (key, value) values ('purge_lock', 'autre')`);
    const blocked = await runPurge(db, storage, settings());
    expect(blocked.locked).toBe(true);
    expect(await db.select().from(sessions)).toHaveLength(1); // nothing done

    // A lock older than 6 hours was left by a crashed run: it is taken over.
    await db.execute(sql`update app_settings set updated_at = now() - interval '7 hours' where key = 'purge_lock'`);
    const r = await runPurge(db, storage, settings());
    expect(r.locked).toBe(false);
    expect(await db.select().from(sessions)).toEqual([]);
    // Released at the end.
    const lock = await db.execute(sql`select 1 from app_settings where key = 'purge_lock'`);
    expect(lock.rows).toEqual([]);
  });

  it("a failing step does not prevent the others and is reported", async () => {
    class BrokenListing extends LocalFileStorage {
      override async list(): Promise<never> {
        throw new Error("EIO: lecture du répertoire impossible");
      }
    }
    const u = await createTestUser();
    await db.insert(sessions).values({ id: randomUUID(), userId: u.id, expiresAt: daysAgo(1) });
    const r = await runPurge(db, new BrokenListing(root), settings());
    expect(r.steps.orphans).toMatchObject({ status: "failed", detail: expect.stringMatching(/EIO/) });
    expect(r.steps.sessions.status).toBe("ok");
    expect(await db.select().from(sessions)).toEqual([]);
    expect(r.needsAttention).toBe(true);
  });
});
