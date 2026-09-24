/**
 * Compares stored files with the documents in the database.
 *   pnpm storage:check                    report only
 *   pnpm storage:check --delete-orphans   also deletes orphan files older than 24 h and empty user directories
 * Exit code: 0 = consistent, 1 = anomalies found (orphans, missing files or failed deletions), 2 = error.
 */
import "dotenv/config";
import { closeDb, getDb } from "../src/db";
import { reconcileStorage } from "../src/server/documents/reconcile";
import { LocalFileStorage, resolveMaintenanceStorageDir } from "../src/server/documents/storage";
import { verifyVolumeIdentity } from "../src/server/documents/volume";

async function main() {
  const wantDelete = process.argv.includes("--delete-orphans");
  const dir = resolveMaintenanceStorageDir();
  console.log(`Stockage : ${dir}`);
  let identityOk = true;
  try {
    await verifyVolumeIdentity(getDb(), dir);
  } catch (e) {
    identityOk = false;
    console.error(`IDENTITÉ DU VOLUME NON VÉRIFIÉE : ${(e as Error).message}`);
    if (wantDelete) console.error("Aucune suppression ne sera effectuée.");
  }
  const deleteOrphans = wantDelete && identityOk;
  const r = await reconcileStorage(getDb(), new LocalFileStorage(dir), { deleteOrphans });
  console.log(`Fichiers sur disque : ${r.filesOnDisk} — documents en base : ${r.documentsInDb}`);
  console.log(`Fichiers orphelins : ${r.orphans.length}${deleteOrphans ? ` (supprimés : ${r.deletedOrphans}, les plus récents que 24 h sont conservés)` : ""}`);
  for (const o of r.orphans) console.log(`  - ${o.key} (${o.ageHours} h)`);
  console.log(`Fichiers manquants (document en base, fichier absent) : ${r.missing.length}`);
  for (const m of r.missing) console.log(`  - document ${m.documentId} → ${m.key}`);
  console.log(`Répertoires utilisateurs vides : ${r.emptyUserDirs.length}${deleteOrphans ? ` (supprimés : ${r.removedDirs})` : ""}`);
  for (const f of r.failures) console.error(`ÉCHEC de suppression : ${f}`);
  await closeDb();
  const remainingOrphans = r.orphans.length - r.deletedOrphans;
  if (r.blocked) console.error(`Suppression des orphelins bloquée : ${r.blocked}`);
  process.exit(!identityOk || r.blocked || r.missing.length || r.failures.length || remainingOrphans ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e instanceof Error ? e.message : e);
  await closeDb().catch(() => undefined);
  process.exit(2);
});
