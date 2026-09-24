import { eq } from "drizzle-orm";
import type { Db } from "@/db";
import { documents } from "@/db/schema";
import { queuedKeys } from "./deletions";
import type { LocalFileStorage } from "./storage";

export type ReconcileReport = {
  filesOnDisk: number;
  documentsInDb: number;
  /** Files on disk that no document references (excluding files already queued for erasure). */
  orphans: { key: string; ageHours: number }[];
  /** Files on disk waiting in the deletion queue (handled by the queue, not here). */
  queued: number;
  /** Documents whose file is missing from disk (data loss to investigate). */
  missing: { documentId: string; key: string }[];
  emptyUserDirs: string[];
  deletedOrphans: number;
  removedDirs: number;
  /** Deletions that failed: reported, never silently ignored. */
  failures: string[];
  /** Why orphan deletion was refused (fail-safe), if it was. */
  blocked: string | null;
};

/** Above this share of documents missing from disk, the volume is suspect: nothing is deleted. */
export const MISSING_RATIO_LIMIT = 0.1;

/**
 * Compares the files on disk with the documents in the database. Only reports
 * by default; with `deleteOrphans`, removes orphan files older than
 * `orphanMinAgeMs` (a younger file may belong to an upload in progress: the file
 * is written just before its row) and empty per-user directories.
 * Never outputs file names or contents: only storage keys and document ids.
 */
export async function reconcileStorage(
  db: Db,
  storage: LocalFileStorage,
  opts: { deleteOrphans?: boolean; orphanMinAgeMs?: number; now?: Date } = {},
): Promise<ReconcileReport> {
  const now = opts.now ?? new Date();
  const minAge = opts.orphanMinAgeMs ?? 24 * 3_600_000;
  const onDisk = await storage.list();
  const rows = await db.select({ id: documents.id, key: documents.storageKey }).from(documents);
  const referenced = new Set(rows.map((r) => r.key));
  const present = new Set(onDisk.map((f) => f.key));
  const inQueue = await queuedKeys(db);
  const unreferenced = onDisk.filter((f) => !referenced.has(f.key) && !inQueue.has(f.key));

  const report: ReconcileReport = {
    filesOnDisk: onDisk.length,
    documentsInDb: rows.length,
    orphans: unreferenced.map((f) => ({ key: f.key, ageHours: Math.floor((now.getTime() - f.modifiedAt.getTime()) / 3_600_000) })),
    missing: rows.filter((r) => !present.has(r.key)).map((r) => ({ documentId: r.id, key: r.key })),
    queued: onDisk.filter((f) => inQueue.has(f.key)).length,
    emptyUserDirs: [],
    deletedOrphans: 0,
    removedDirs: 0,
    failures: [],
    blocked: null,
  };

  // Fail-safe: when in doubt about the volume, delete nothing.
  if (opts.deleteOrphans) {
    if (rows.length === 0 && onDisk.length > 0) {
      report.blocked = "aucun document en base alors que le disque contient des fichiers (mauvaise base ou mauvais volume ?)";
    } else if (rows.length > 0 && report.missing.length / rows.length > MISSING_RATIO_LIMIT) {
      report.blocked = `${report.missing.length} document(s) sur ${rows.length} introuvable(s) sur le disque (plus de ${MISSING_RATIO_LIMIT * 100} %) : volume suspect`;
    }
  }
  const deleting = Boolean(opts.deleteOrphans && !report.blocked);

  if (deleting) {
    for (const o of unreferenced.filter((f) => now.getTime() - f.modifiedAt.getTime() >= minAge)) {
      // Re-check right before deleting: a document may have been created since the listing.
      const [stillReferenced] = await db.select({ id: documents.id }).from(documents).where(eq(documents.storageKey, o.key)).limit(1);
      if (stillReferenced) continue;
      try {
        await storage.delete(o.key);
        report.deletedOrphans++;
      } catch (e) {
        report.failures.push(`${o.key} : ${(e as Error).message}`);
      }
    }
  }

  report.emptyUserDirs = await storage.emptyUserDirs();
  if (deleting) {
    for (const dir of report.emptyUserDirs) {
      try {
        await storage.removeEmptyUserDir(dir);
        report.removedDirs++;
      } catch (e) {
        report.failures.push(`${dir}/ : ${(e as Error).message}`);
      }
    }
  }
  return report;
}
