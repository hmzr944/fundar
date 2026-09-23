import "dotenv/config";
import { closeDb, getDb } from "../src/db";
import { purgeInactiveMissions } from "../src/server/account";
import { LocalFileStorage } from "../src/server/documents/storage";

async function main() {
  const days = Number(process.env.ATLAS_RETENTION_DAYS || 365);
  const res = await purgeInactiveMissions(getDb(), new LocalFileStorage(process.env.ATLAS_STORAGE_DIR || "./storage"), days);
  console.log(`Rétention ${days} j : ${res.missions} mission(s) et ${res.files} fichier(s) supprimés.`);
  await closeDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
