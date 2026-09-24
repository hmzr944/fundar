import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Db } from "@/db";
import { verifyVolumeIdentity } from "./volume";

/** Probe files live here, outside the per-user directories: user files are never touched. */
export const HEALTHCHECK_DIR = ".healthcheck";

export type StorageHealth = { ok: boolean; checks: { volume: boolean; write: boolean; read: boolean; delete: boolean } };

/**
 * Checks that the storage volume is the expected one and still usable (write,
 * read back, delete a uniquely named probe file). Results are cached for 30 s
 * and concurrent calls share one probe, so frequent health checks create
 * neither load nor concurrent writes.
 */
export function createStorageHealthCheck(db: Db, root: string, ttlMs = 30_000) {
  let cached: { at: number; result: StorageHealth } | null = null;
  let inFlight: Promise<StorageHealth> | null = null;

  async function probe(): Promise<StorageHealth> {
    const checks = { volume: false, write: false, read: false, delete: false };
    try {
      await verifyVolumeIdentity(db, root);
      checks.volume = true;
      const dir = path.join(root, HEALTHCHECK_DIR);
      await fs.mkdir(dir, { recursive: true, mode: 0o700 });
      const file = path.join(dir, randomUUID());
      const token = randomUUID();
      await fs.writeFile(file, token, { mode: 0o600 });
      checks.write = true;
      checks.read = (await fs.readFile(file, "utf8")) === token;
      await fs.rm(file);
      checks.delete = true;
    } catch (e) {
      console.error(`[atlas] storage health check failed: ${e instanceof Error ? e.message : String(e)}`);
    }
    return { ok: Object.values(checks).every(Boolean), checks };
  }

  return async function check(): Promise<StorageHealth> {
    if (cached && Date.now() - cached.at < ttlMs) return cached.result;
    inFlight ??= probe().finally(() => {
      inFlight = null;
    });
    const result = await inFlight;
    cached = { at: Date.now(), result };
    return result;
  };
}
