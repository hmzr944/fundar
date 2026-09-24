import type { Db } from "@/db";
import { documents } from "@/db/schema";
import type { LocalFileStorage } from "./storage";

export type ReconcileReport = {
  filesOnDisk: number;
  documentsInDb: number;
  /** Files on disk that no document references. */
  orphans: { key: string; ageHours: number }[];
  /** Documents whose file is missing from disk (data loss to investigate). */
  missing: { documentId: string; key: string }[];
  emptyUserDirs: string[];
  deletedOrphans: number;
  removedDirs: number;
  /** Deletions that failed: reported, never silently ignored. */
  failures: string[];
};

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

  const report: ReconcileReport = {
    filesOnDisk: onDisk.length,
    documentsInDb: rows.length,
    orphans: onDisk
      .filter((f) => !referenced.has(f.key))
      .map((f) => ({ key: f.key, ageHours: Math.floor((now.getTime() - f.modifiedAt.getTime()) / 3_600_000) })),
    missing: rows.filter((r) => !present.has(r.key)).map((r) => ({ documentId: r.id, key: r.key })),
    emptyUserDirs: [],
    deletedOrphans: 0,
    removedDirs: 0,
    failures: [],
  };

  if (opts.deleteOrphans) {
    for (const o of onDisk.filter((f) => !referenced.has(f.key) && now.getTime() - f.modifiedAt.getTime() >= minAge)) {
      try {
        await storage.delete(o.key);
        report.deletedOrphans++;
      } catch (e) {
        report.failures.push(`${o.key} : ${(e as Error).message}`);
      }
    }
  }

  report.emptyUserDirs = await storage.emptyUserDirs();
  if (opts.deleteOrphans) {
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
