import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import type { Db } from "@/db";
import { appSettings } from "@/db/schema";

/**
 * Storage volume identity. A random id is written both in a marker file at the
 * root of the volume and in the database. Anything that deletes files first
 * checks that both match: a wrong mount, an empty volume or another directory
 * must never be "cleaned up" against this database.
 */
export const VOLUME_MARKER = ".atlas-volume";
const SETTING_KEY = "storage_volume_id";

export class VolumeIdentityError extends Error {}

async function readMarker(root: string): Promise<string | null> {
  try {
    return (await fs.readFile(path.join(root, VOLUME_MARKER), "utf8")).trim() || null;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

async function readSetting(db: Db): Promise<string | null> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.key, SETTING_KEY));
  return row?.value ?? null;
}

/**
 * Startup: creates the identity on a fresh installation (no marker, no database
 * value), otherwise requires both to match. A marker without a database value is
 * refused too: it means an existing volume attached to a new or different
 * database, where every file would look like an orphan.
 */
export async function ensureVolumeIdentity(db: Db, root: string): Promise<string> {
  const onDisk = await readMarker(root);
  const inDb = await readSetting(db);
  if (!onDisk && !inDb) {
    const id = randomUUID();
    // "wx": never overwrite a marker written concurrently by another instance.
    await fs.writeFile(path.join(root, VOLUME_MARKER), id, { mode: 0o600, flag: "wx" }).catch((e) => {
      if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
    });
    const written = await readMarker(root);
    await db.insert(appSettings).values({ key: SETTING_KEY, value: written! }).onConflictDoNothing();
    return verifyVolumeIdentity(db, root);
  }
  return verifyVolumeIdentity(db, root);
}

/** Maintenance scripts and health checks: never creates anything, only compares. */
export async function verifyVolumeIdentity(db: Db, root: string): Promise<string> {
  const onDisk = await readMarker(root);
  const inDb = await readSetting(db);
  if (!inDb && !onDisk) {
    throw new VolumeIdentityError("Identité du volume absente (ni fichier .atlas-volume ni valeur en base) : démarrez l'application une première fois.");
  }
  if (!onDisk) {
    throw new VolumeIdentityError(
      `Le fichier ${VOLUME_MARKER} est absent de ${root} : le volume attendu n'est probablement pas monté.`,
    );
  }
  if (!inDb) {
    throw new VolumeIdentityError(
      `Le volume ${root} porte une identité inconnue de cette base : volume d'une autre installation ou base neuve. Vérifiez la configuration.`,
    );
  }
  if (onDisk !== inDb) {
    throw new VolumeIdentityError(`Le volume ${root} n'est pas celui associé à cette base (identités différentes).`);
  }
  return inDb;
}
