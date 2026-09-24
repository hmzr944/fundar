import { checkStorageDir, resolveStorageDir } from "./documents/storage";

/**
 * Startup checks (Node.js runtime only). On failure the process exits with an
 * error code: otherwise Next.js keeps a server alive that answers 500 to every
 * request, which a host can mistake for a successful deployment.
 */
export async function runStartupChecks() {
  try {
    const dir = resolveStorageDir();
    await checkStorageDir(dir);
    console.log(`[atlas] stockage des fichiers : ${dir}`);
  } catch (e) {
    console.error(`[atlas] démarrage impossible : ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}
