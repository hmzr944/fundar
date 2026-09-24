import { eq, inArray, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { documents, fileDeletions } from "@/db/schema";
import type { FileStorage } from "./storage";

type Executor = Pick<Db, "insert">;

/** After this many failed attempts a queued deletion is reported as stuck. */
export const STUCK_ATTEMPTS = 7;

/** Queues files for erasure. Call in the transaction that deletes the rows referencing them. */
export async function queueFileDeletions(db: Executor, keys: string[]) {
  if (!keys.length) return;
  await db
    .insert(fileDeletions)
    .values(keys.map((storageKey) => ({ storageKey })))
    .onConflictDoNothing();
}

export type DeletionResult = { deleted: number; failed: number; pending: number; stuck: number };

/**
 * Erases queued files (all of them, or only `keys`). A file already absent
 * counts as erased. A failure keeps the entry with its error and attempt count,
 * and is logged: the deletion is never reported as complete when it is not.
 */
export async function processFileDeletions(db: Db, storage: FileStorage, keys?: string[]): Promise<DeletionResult> {
  if (keys && !keys.length) return { deleted: 0, failed: 0, ...(await queueState(db)) };
  const queued = await db
    .select()
    .from(fileDeletions)
    .where(keys ? inArray(fileDeletions.storageKey, keys) : undefined);
  let deleted = 0;
  let failed = 0;
  for (const item of queued) {
    // Safety net: never erase a file that a document references again.
    const [inUse] = await db.select({ id: documents.id }).from(documents).where(eq(documents.storageKey, item.storageKey)).limit(1);
    if (inUse) {
      await db.delete(fileDeletions).where(eq(fileDeletions.id, item.id));
      continue;
    }
    try {
      await storage.delete(item.storageKey);
      await db.delete(fileDeletions).where(eq(fileDeletions.id, item.id));
      deleted++;
    } catch (e) {
      failed++;
      const message = (e instanceof Error ? e.message : String(e)).slice(0, 500);
      console.error(`[atlas] file deletion failed (${item.storageKey}, attempt ${item.attempts + 1}): ${message}`);
      await db
        .update(fileDeletions)
        .set({ attempts: sql`${fileDeletions.attempts} + 1`, lastAttemptAt: new Date(), lastError: message })
        .where(eq(fileDeletions.id, item.id));
    }
  }
  return { deleted, failed, ...(await queueState(db)) };
}

async function queueState(db: Db) {
  const [row] = await db
    .select({
      pending: sql<number>`count(*)::int`,
      stuck: sql<number>`(count(*) filter (where ${fileDeletions.attempts} >= ${STUCK_ATTEMPTS}))::int`,
    })
    .from(fileDeletions);
  return { pending: row.pending, stuck: row.stuck };
}

/** Keys waiting for erasure (reconciliation must not report them as unexplained orphans). */
export async function queuedKeys(db: Db): Promise<Set<string>> {
  const rows = await db.select({ key: fileDeletions.storageKey }).from(fileDeletions);
  return new Set(rows.map((r) => r.key));
}
