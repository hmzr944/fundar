import bcrypt from "bcryptjs";
import { and, eq, inArray, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { documents, missionRuns, missions, users } from "@/db/schema";
import { badRequest, conflict } from "./errors";
import { processFileDeletions, queueFileDeletions } from "./documents/deletions";
import type { FileStorage } from "./documents/storage";
import { anonymizeUsage, closeUsageForMissions } from "./usage";

/**
 * `eraseFiles: false` only queues the files (maintenance with an unverified
 * volume): the queue is processed later, once the volume is confirmed.
 */
type EraseOptions = { eraseFiles?: boolean };

async function assertNoRunning(db: Db, userId: string) {
  const running = await db.query.missionRuns.findFirst({
    where: and(eq(missionRuns.userId, userId), eq(missionRuns.status, "RUNNING")),
  });
  if (running) throw conflict("Une exécution est en cours. Interrompez-la avant de supprimer vos données.");
}

/** Deletes missions (rows now, files queued in the same transaction), closing their usage rows first. */
async function deleteMissions(db: Db, storage: FileStorage, missionIds: string[], opts: EraseOptions = {}) {
  if (!missionIds.length) return { deletedFiles: 0, pendingFiles: 0 };
  const docs = await db.select({ key: documents.storageKey }).from(documents).where(inArray(documents.missionId, missionIds));
  await closeUsageForMissions(db, missionIds);
  const keys = docs.map((d) => d.key);
  await db.transaction(async (tx) => {
    await queueFileDeletions(tx, keys);
    await tx.delete(missions).where(inArray(missions.id, missionIds));
  });
  if (opts.eraseFiles === false) return { deletedFiles: 0, pendingFiles: keys.length };
  const res = await processFileDeletions(db, storage, keys);
  // Files still queued (storage failure) are retried by the nightly purge.
  return { deletedFiles: res.deleted, pendingFiles: keys.length - res.deleted };
}

/** Deletes every mission (and its files, messages, logs…) of the user. */
export async function deleteAllUserData(db: Db, storage: FileStorage, userId: string, opts: EraseOptions = {}) {
  await assertNoRunning(db, userId);
  const owned = await db.select({ id: missions.id }).from(missions).where(eq(missions.userId, userId));
  return deleteMissions(
    db,
    storage,
    owned.map((m) => m.id),
    opts,
  );
}

/**
 * Deletes an account completely: data, files, then usage anonymization, then
 * the user. The single path used both on request and by the retention policy.
 */
export async function deleteUserCompletely(
  db: Db,
  storage: FileStorage,
  userId: string,
  opts: EraseOptions & { retention?: boolean } = {},
) {
  // On request, any run marked RUNNING blocks. For the retention policy the
  // candidates already exclude active runs; a stale one (dead process) must not block.
  if (!opts.retention) await assertNoRunning(db, userId);
  const owned = await db.select({ id: missions.id }).from(missions).where(eq(missions.userId, userId));
  const res = await deleteMissions(
    db,
    storage,
    owned.map((m) => m.id),
    opts,
  );
  // Before deleting the user: afterwards the foreign key would only null user_id, leaving the rest identifiable.
  await anonymizeUsage(db, userId);
  await db.delete(users).where(eq(users.id, userId));
  return res;
}

/** Deletes the account itself after password confirmation. */
export async function deleteAccount(db: Db, storage: FileStorage, userId: string, password: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw badRequest("Mot de passe incorrect.");
  return deleteUserCompletely(db, storage, userId);
}

/** SQL condition: no run of this mission is actively running (a stale run does not protect it). */
const noActiveRun = (staleRunSeconds: number) => sql`not exists (
  select 1 from mission_runs r where r.mission_id = ${missions.id} and r.status = 'RUNNING'
  and r.heartbeat_at > now() - make_interval(secs => ${staleRunSeconds})
)`;

/** Missions without activity (content change or opening) for `days` days and not being worked on. */
export async function inactiveMissionIds(db: Db, days: number, staleRunSeconds = 180) {
  const rows = await db
    .select({ id: missions.id })
    .from(missions)
    .where(
      and(
        sql`greatest(${missions.updatedAt}, ${missions.lastActivityAt}) < now() - make_interval(days => ${days})`,
        noActiveRun(staleRunSeconds),
      ),
    );
  return rows.map((r) => r.id);
}

/** Retention policy: deletes missions inactive for `days` days (all users). */
export async function purgeInactiveMissions(db: Db, storage: FileStorage, days: number, opts: EraseOptions & { staleRunSeconds?: number } = {}) {
  const ids = await inactiveMissionIds(db, days, opts.staleRunSeconds);
  const res = await deleteMissions(db, storage, ids, opts);
  return { missions: ids.length, files: res.deletedFiles + res.pendingFiles, pendingFiles: res.pendingFiles };
}

/** Accounts without authenticated activity for `days` days and with no run in progress. */
export async function inactiveAccountIds(db: Db, days: number, staleRunSeconds = 180) {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        sql`${users.lastSeenAt} < now() - make_interval(days => ${days})`,
        sql`not exists (select 1 from mission_runs r where r.user_id = ${users.id} and r.status = 'RUNNING'
          and r.heartbeat_at > now() - make_interval(secs => ${staleRunSeconds}))`,
      ),
    );
  return rows.map((r) => r.id);
}
