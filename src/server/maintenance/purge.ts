import { sql } from "drizzle-orm";
import type { Db } from "@/db";
import { usageRecords } from "@/db/schema";
import { deleteUserCompletely, inactiveAccountIds, inactiveMissionIds, purgeInactiveMissions } from "@/server/account";
import { processFileDeletions, STUCK_ATTEMPTS } from "@/server/documents/deletions";
import { reconcileStorage } from "@/server/documents/reconcile";
import type { LocalFileStorage } from "@/server/documents/storage";
import { verifyVolumeIdentity } from "@/server/documents/volume";
import type { RetentionSettings } from "./retention";

export type StepStatus = "ok" | "dry-run" | "skipped" | "failed";
export type StepReport = { status: StepStatus; detail: string };

export type PurgeReport = {
  locked: boolean;
  dryRun: boolean;
  volumeVerified: boolean;
  steps: Record<"missions" | "accounts" | "sessions" | "usage" | "fileQueue" | "orphans", StepReport>;
  /** True when something needs a human: failed step, unverified volume, stuck deletions, blocked or missing files. */
  needsAttention: boolean;
};

const LOCK_KEY = "purge_lock";
/** A lock older than this is considered left over by a crashed run. */
const LOCK_TTL = "6 hours";

async function acquireLock(db: Db): Promise<boolean> {
  const rows = await db.execute(sql`
    insert into app_settings (key, value, updated_at) values (${LOCK_KEY}, ${String(process.pid)}, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
      where app_settings.updated_at < now() - ${LOCK_TTL}::interval
    returning key`);
  return rows.rows.length > 0;
}

async function releaseLock(db: Db) {
  await db.execute(sql`delete from app_settings where key = ${LOCK_KEY}`);
}

/**
 * Nightly maintenance. Each step is independent: a failure is reported and the
 * next steps still run. Steps that erase files run only when the storage volume
 * identity is verified; otherwise files stay queued (never "cleaned up" on the
 * wrong volume). With `dryRun`, nothing is modified: counts only.
 */
export async function runPurge(db: Db, storage: LocalFileStorage, settings: RetentionSettings, opts: { dryRun?: boolean } = {}) {
  const dryRun = Boolean(opts.dryRun);
  const skipped: StepReport = { status: "skipped", detail: "non exécuté" };
  const report: PurgeReport = {
    locked: false,
    dryRun,
    volumeVerified: false,
    steps: { missions: skipped, accounts: skipped, sessions: skipped, usage: skipped, fileQueue: skipped, orphans: skipped },
    needsAttention: false,
  };
  if (!(await acquireLock(db))) {
    report.locked = true;
    return report;
  }
  const step = async (name: keyof PurgeReport["steps"], fn: () => Promise<StepReport>) => {
    try {
      report.steps[name] = await fn();
    } catch (e) {
      report.steps[name] = { status: "failed", detail: e instanceof Error ? e.message.split("\n")[0] : String(e) };
    }
  };

  try {
    let volumeError = "";
    try {
      await verifyVolumeIdentity(db, storage.root);
      report.volumeVerified = true;
    } catch (e) {
      volumeError = (e as Error).message;
    }
    const eraseFiles = report.volumeVerified && !dryRun;

    await step("missions", async () => {
      if (dryRun) {
        const ids = await inactiveMissionIds(db, settings.missionDays, settings.staleRunSeconds);
        return { status: "dry-run", detail: `${ids.length} mission(s) seraient supprimées (inactives depuis ${settings.missionDays} j)` };
      }
      const r = await purgeInactiveMissions(db, storage, settings.missionDays, { eraseFiles, staleRunSeconds: settings.staleRunSeconds });
      return { status: "ok", detail: `${r.missions} mission(s) supprimée(s), ${r.files} fichier(s) dont ${r.pendingFiles} en file d'attente` };
    });

    await step("accounts", async () => {
      const ids = await inactiveAccountIds(db, settings.accountInactiveDays, settings.staleRunSeconds);
      if (!settings.accountPurge) {
        return { status: "skipped", detail: `désactivé (ATLAS_ACCOUNT_PURGE=off) — ${ids.length} compte(s) inactif(s) depuis ${settings.accountInactiveDays} j, non supprimé(s)` };
      }
      if (dryRun) return { status: "dry-run", detail: `${ids.length} compte(s) seraient supprimés` };
      let done = 0;
      const failures: string[] = [];
      for (const id of ids) {
        try {
          await deleteUserCompletely(db, storage, id, { eraseFiles, retention: true });
          done++;
        } catch (e) {
          failures.push(`${id} : ${(e as Error).message}`);
        }
      }
      if (failures.length) throw new Error(`${done} compte(s) supprimé(s), ${failures.length} échec(s) : ${failures.join(" ; ")}`);
      return { status: "ok", detail: `${done} compte(s) supprimé(s) (registre d'usage anonymisé)` };
    });

    await step("sessions", async () => {
      if (dryRun) {
        const r = await db.execute(sql`select count(*)::int as n from sessions where expires_at < now()`);
        return { status: "dry-run", detail: `${(r.rows[0] as { n: number }).n} session(s) expirée(s) seraient supprimées` };
      }
      const r = await db.execute(sql`delete from sessions where expires_at < now()`);
      return { status: "ok", detail: `${r.rowCount ?? 0} session(s) expirée(s) supprimée(s)` };
    });

    await step("usage", async () => {
      const cutoff = sql`now() - make_interval(months => ${settings.usageRetentionMonths})`;
      if (dryRun) {
        const r = await db.execute(sql`select count(*)::int as n from ${usageRecords} where started_at < ${cutoff}`);
        return { status: "dry-run", detail: `${(r.rows[0] as { n: number }).n} ligne(s) du registre seraient supprimées (> ${settings.usageRetentionMonths} mois)` };
      }
      const r = await db.execute(sql`delete from ${usageRecords} where started_at < ${cutoff}`);
      return { status: "ok", detail: `${r.rowCount ?? 0} ligne(s) du registre supprimée(s) (> ${settings.usageRetentionMonths} mois)` };
    });

    await step("fileQueue", async () => {
      if (!eraseFiles) {
        const r = await db.execute(sql`select count(*)::int as n, (count(*) filter (where attempts >= ${STUCK_ATTEMPTS}))::int as stuck from file_deletions`);
        const { n, stuck } = r.rows[0] as { n: number; stuck: number };
        if (stuck) report.needsAttention = true;
        return {
          status: dryRun ? "dry-run" : "skipped",
          detail: `${n} fichier(s) en attente${stuck ? `, dont ${stuck} bloqué(s)` : ""}${report.volumeVerified ? "" : ` — non traité : ${volumeError}`}`,
        };
      }
      const r = await processFileDeletions(db, storage);
      if (r.failed || r.stuck) report.needsAttention = true;
      return {
        status: r.failed ? "failed" : "ok",
        detail: `${r.deleted} fichier(s) effacé(s), ${r.failed} échec(s), ${r.pending} restant(s)${r.stuck ? `, dont ${r.stuck} bloqué(s) après ${STUCK_ATTEMPTS} tentatives` : ""}`,
      };
    });

    await step("orphans", async () => {
      if (!report.volumeVerified) return { status: "skipped", detail: `non traité : ${volumeError}` };
      const r = await reconcileStorage(db, storage, { deleteOrphans: !dryRun, orphanMinAgeMs: settings.orphanMinAgeHours * 3_600_000 });
      if (r.blocked || r.missing.length || r.failures.length) report.needsAttention = true;
      const base = `${r.orphans.length} orphelin(s), ${r.missing.length} fichier(s) manquant(s), ${r.queued} en file d'attente`;
      if (r.blocked) return { status: "failed", detail: `${base} — suppression bloquée : ${r.blocked}` };
      if (dryRun) return { status: "dry-run", detail: base };
      return {
        status: r.failures.length ? "failed" : "ok",
        detail: `${base} ; ${r.deletedOrphans} orphelin(s) de plus de ${settings.orphanMinAgeHours} h et ${r.removedDirs} dossier(s) vide(s) supprimé(s)${r.failures.length ? ` ; échecs : ${r.failures.join(" ; ")}` : ""}`,
      };
    });

    if (!report.volumeVerified) report.needsAttention = true;
    if (Object.values(report.steps).some((s) => s.status === "failed")) report.needsAttention = true;
    return report;
  } finally {
    await releaseLock(db);
  }
}
