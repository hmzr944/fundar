import { getDb } from "@/db";
import { checkStorageDir, resolveStorageDir } from "./documents/storage";
import { ensureVolumeIdentity, VolumeIdentityError } from "./documents/volume";

/**
 * Startup checks (Node.js runtime only). On failure the process exits with an
 * error code: otherwise Next.js keeps a server alive that answers 500 to every
 * request, which a host can mistake for a successful deployment.
 */
export async function runStartupChecks() {
  try {
    const dir = resolveStorageDir();
    await checkStorageDir(dir);
    // Refuses a volume that belongs to another installation, or a missing mount.
    await ensureVolumeIdentity(getDb(), dir).catch((e) => {
      if (e instanceof VolumeIdentityError) throw e;
      throw new Error(
        `impossible de vérifier l'identité du volume en base (base inaccessible ou migrations non appliquées : lancez « pnpm db:migrate ») — ${e instanceof Error ? e.message.split("\n")[0] : String(e)}`,
      );
    });
    console.log(`[atlas] stockage des fichiers : ${dir}`);
  } catch (e) {
    console.error(`[atlas] démarrage impossible : ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}
