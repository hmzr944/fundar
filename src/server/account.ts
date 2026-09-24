import bcrypt from "bcryptjs";
import { and, eq, lt, inArray } from "drizzle-orm";
import type { Db } from "@/db";
import { documents, missionRuns, missions, users } from "@/db/schema";
import { badRequest, conflict } from "./errors";
import { processFileDeletions, queueFileDeletions } from "./documents/deletions";
import type { FileStorage } from "./documents/storage";
import { anonymizeUsage, closeUsageForMissions } from "./usage";

async function assertNoRunning(db: Db, userId: string) {
  const running = await db.query.missionRuns.findFirst({
    where: and(eq(missionRuns.userId, userId), eq(missionRuns.status, "RUNNING")),
  });
  if (running) throw conflict("Une exécution est en cours. Interrompez-la avant de supprimer vos données.");
}

/** Deletes every mission (and its files, messages, logs…) of the user. */
export async function deleteAllUserData(db: Db, storage: FileStorage, userId: string) {
  await assertNoRunning(db, userId);
  const docs = await db.select({ key: documents.storageKey }).from(documents).where(eq(documents.userId, userId));
  const owned = await db.select({ id: missions.id }).from(missions).where(eq(missions.userId, userId));
  await closeUsageForMissions(
    db,
    owned.map((m) => m.id),
  );
  const keys = docs.map((d) => d.key);
  await db.transaction(async (tx) => {
    await queueFileDeletions(tx, keys);
    await tx.delete(missions).where(eq(missions.userId, userId));
  });
  const res = await processFileDeletions(db, storage, keys);
  // Files still queued (storage failure) are retried by the nightly purge.
  return { deletedFiles: res.deleted, pendingFiles: keys.length - res.deleted };
}

/** Deletes the account itself after password confirmation. */
export async function deleteAccount(db: Db, storage: FileStorage, userId: string, password: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw badRequest("Mot de passe incorrect.");
  await deleteAllUserData(db, storage, userId);
  // Before deleting the user: afterwards the foreign key would only null user_id, leaving the rest identifiable.
  await anonymizeUsage(db, userId);
  await db.delete(users).where(eq(users.id, userId));
}

/** Retention policy: deletes missions not updated for `days` days (all users). */
export async function purgeInactiveMissions(db: Db, storage: FileStorage, days: number) {
  const threshold = new Date(Date.now() - days * 86_400_000);
  const old = await db.select({ id: missions.id }).from(missions).where(lt(missions.updatedAt, threshold));
  if (!old.length) return { missions: 0, files: 0 };
  const ids = old.map((m) => m.id);
  const docs = await db.select({ key: documents.storageKey }).from(documents).where(inArray(documents.missionId, ids));
  await closeUsageForMissions(db, ids);
  const keys = docs.map((d) => d.key);
  await db.transaction(async (tx) => {
    await queueFileDeletions(tx, keys);
    await tx.delete(missions).where(inArray(missions.id, ids));
  });
  await processFileDeletions(db, storage, keys);
  return { missions: ids.length, files: docs.length };
}
