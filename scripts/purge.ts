/**
 * Nightly maintenance (retention policy). Schedule it once a day with the same
 * environment as the application, e.g. at 03:00: `pnpm purge`.
 *   pnpm purge            apply the policy
 *   pnpm purge --dry-run  counts only, nothing is modified (mandatory before the first real run)
 * Exit code: 0 = done, 1 = needs attention (failed step, unverified volume,
 * stuck or blocked deletions, missing files), 2 = could not run.
 */
import "dotenv/config";
import { closeDb, getDb } from "../src/db";
import { LocalFileStorage, resolveMaintenanceStorageDir } from "../src/server/documents/storage";
import { runPurge } from "../src/server/maintenance/purge";
import { retentionSettings } from "../src/server/maintenance/retention";

const LABELS = {
  missions: "Missions inactives",
  accounts: "Comptes inactifs",
  sessions: "Sessions expirées",
  usage: "Registre d'usage",
  fileQueue: "File de suppression",
  orphans: "Fichiers orphelins",
} as const;

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const dir = resolveMaintenanceStorageDir();
  const settings = retentionSettings();
  const r = await runPurge(getDb(), new LocalFileStorage(dir), settings, { dryRun });
  await closeDb();
  if (r.locked) {
    console.error("Une autre purge est en cours (verrou actif) : rien n'a été fait.");
    process.exit(1);
  }
  console.log(`Purge ${dryRun ? "(simulation, rien n'est modifié) " : ""}— stockage ${dir} — volume ${r.volumeVerified ? "vérifié" : "NON VÉRIFIÉ"}`);
  for (const [k, s] of Object.entries(r.steps)) {
    const line = `[${s.status}] ${LABELS[k as keyof typeof LABELS]} : ${s.detail}`;
    if (s.status === "failed") console.error(line);
    else console.log(line);
  }
  if (r.needsAttention) console.error("ATTENTION : au moins un point nécessite une vérification.");
  process.exit(r.needsAttention ? 1 : 0);
}

main().catch(async (e) => {
  console.error(`Purge impossible : ${e instanceof Error ? e.message : String(e)}`);
  await closeDb().catch(() => undefined);
  process.exit(2);
});
