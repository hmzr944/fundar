/**
 * Production storage safeguards: explicit absolute path, clear error when a
 * stored file is gone, and disk/database reconciliation.
 */
import { mkdtemp, mkdir, readdir, readFile, rm, stat, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { appSettings, documents } from "@/db/schema";
import { reconcileStorage } from "@/server/documents/reconcile";
import { readDocumentFile, uploadDocument } from "@/server/documents/service";
import { queueFileDeletions } from "@/server/documents/deletions";
import { createStorageHealthCheck, HEALTHCHECK_DIR } from "@/server/documents/health";
import {
  checkStorageDir,
  type FileStorage,
  LocalFileStorage,
  resolveMaintenanceStorageDir,
  resolveStorageDir,
  StorageConfigError,
} from "@/server/documents/storage";
import { ensureVolumeIdentity, verifyVolumeIdentity, VOLUME_MARKER, VolumeIdentityError } from "@/server/documents/volume";
import { createMission } from "@/server/missions/service";
import { createTestUser, db, resetDb } from "../helpers/db";

const limits = { maxBytes: 1024 * 1024, maxPerMission: 20 };
let root: string;
let storage: LocalFileStorage;

beforeEach(async () => {
  await resetDb();
  root = await mkdtemp(path.join(os.tmpdir(), "atlas-storage-"));
  storage = new LocalFileStorage(root);
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

async function upload(userId: string, missionId: string, name = "a.txt") {
  return uploadDocument(db, storage, userId, missionId, { name, data: Buffer.from("Contenu du document") }, limits);
}

describe("storage directory", () => {
  it("requires an explicit absolute path in production", () => {
    expect(() => resolveStorageDir({ NODE_ENV: "production" })).toThrow(StorageConfigError);
    expect(() => resolveStorageDir({ NODE_ENV: "production", ATLAS_STORAGE_DIR: "./storage" })).toThrow(/chemin absolu/);
    expect(resolveStorageDir({ NODE_ENV: "production", ATLAS_STORAGE_DIR: "/var/lib/atlas/storage" })).toBe("/var/lib/atlas/storage");
  });

  it("always requires an absolute path for maintenance scripts, whatever NODE_ENV is", () => {
    expect(() => resolveMaintenanceStorageDir({ NODE_ENV: "development" })).toThrow(StorageConfigError);
    expect(() => resolveMaintenanceStorageDir({ NODE_ENV: "production", ATLAS_STORAGE_DIR: "./storage" })).toThrow(/chemin absolu/);
    expect(resolveMaintenanceStorageDir({ NODE_ENV: "development", ATLAS_STORAGE_DIR: "/srv/atlas" })).toBe("/srv/atlas");
  });

  it("resolves the development default to an absolute path", () => {
    const dir = resolveStorageDir({ NODE_ENV: "development" });
    expect(path.isAbsolute(dir)).toBe(true);
    expect(dir).toBe(path.resolve("./storage"));
  });

  it("creates the directory at startup and refuses an unusable one", async () => {
    const dir = path.join(root, "nouveau");
    await checkStorageDir(dir);
    expect((await stat(dir)).isDirectory()).toBe(true);
    const file = path.join(root, "un-fichier");
    await writeFile(file, "x");
    await expect(checkStorageDir(file)).rejects.toThrow(StorageConfigError);
  });
});

describe("missing stored file", () => {
  it("returns an explicit 410 error instead of an internal error", async () => {
    const user = await createTestUser();
    const m = await createMission(db, user.id, "Mission avec document");
    const doc = await upload(user.id, m.id);
    const [file] = await storage.list();
    await rm(path.join(root, file.key));
    await expect(readDocumentFile(db, storage, user.id, doc.id)).rejects.toMatchObject({ status: 410, code: "file_missing" });
  });
});

describe("disk / database reconciliation", () => {
  async function orphan(userId: string, hoursOld: number) {
    const key = `${userId}/${randomUUID()}`;
    await mkdir(path.join(root, userId), { recursive: true });
    await writeFile(path.join(root, key), "orphelin");
    const t = new Date(Date.now() - hoursOld * 3_600_000);
    await utimes(path.join(root, key), t, t);
    return key;
  }

  it("reports orphans, missing files and empty directories without deleting anything by default", async () => {
    const user = await createTestUser();
    const m = await createMission(db, user.id, "Mission");
    await upload(user.id, m.id, "garde.txt");
    const lost = await upload(user.id, m.id, "perdu.txt");
    const [lostRow] = await db.select().from(documents).where(eq(documents.id, lost.id));
    await rm(path.join(root, lostRow.storageKey));
    const old = await orphan(user.id, 48);
    const emptyDir = randomUUID();
    await mkdir(path.join(root, emptyDir));

    const report = await reconcileStorage(db, storage);
    expect(report).toMatchObject({ filesOnDisk: 2, documentsInDb: 2, deletedOrphans: 0, removedDirs: 0, blocked: null });
    expect(report.orphans.map((o) => o.key)).toEqual([old]);
    expect(report.missing).toEqual([{ documentId: lost.id, key: lostRow.storageKey }]);
    expect(report.emptyUserDirs).toEqual([emptyDir]);
    expect((await storage.list()).length).toBe(2);
  });

  it("deletes only old, unreferenced orphans and empty directories", async () => {
    const user = await createTestUser();
    const m = await createMission(db, user.id, "Mission");
    const kept = await upload(user.id, m.id, "garde.txt");
    const old = await orphan(user.id, 48);
    const recent = await orphan(user.id, 1); // may belong to an upload in progress
    const emptyDir = randomUUID();
    await mkdir(path.join(root, emptyDir));

    const cleaned = await reconcileStorage(db, storage, { deleteOrphans: true });
    expect(cleaned).toMatchObject({ deletedOrphans: 1, removedDirs: 1, failures: [], blocked: null });
    const left = (await storage.list()).map((f) => f.key);
    expect(left).toContain(recent);
    expect(left).not.toContain(old);
    expect((await readDocumentFile(db, storage, user.id, kept.id)).data.toString()).toBe("Contenu du document");
  });

  it("does not treat files waiting in the deletion queue as unexplained orphans", async () => {
    const user = await createTestUser();
    const m = await createMission(db, user.id, "Mission");
    await upload(user.id, m.id, "garde.txt");
    const pending = await orphan(user.id, 48);
    await queueFileDeletions(db, [pending]);
    const r = await reconcileStorage(db, storage, { deleteOrphans: true });
    expect(r).toMatchObject({ orphans: [], queued: 1, deletedOrphans: 0 });
  });

  it("refuses to delete when too many documents are missing (suspect volume)", async () => {
    const user = await createTestUser();
    const m = await createMission(db, user.id, "Mission");
    const docs = [];
    for (let i = 0; i < 5; i++) docs.push(await upload(user.id, m.id, `d${i}.txt`));
    const [row] = await db.select().from(documents).where(eq(documents.id, docs[0].id));
    await rm(path.join(root, row.storageKey)); // 1 of 5 = 20 % > 10 %
    const old = await orphan(user.id, 48);
    const r = await reconcileStorage(db, storage, { deleteOrphans: true });
    expect(r.blocked).toMatch(/volume suspect/);
    expect(r.deletedOrphans).toBe(0);
    expect((await storage.list()).map((f) => f.key)).toContain(old);
  });

  it("refuses to delete when the database has no documents but the disk has files", async () => {
    const user = await createTestUser();
    const old = await orphan(user.id, 48);
    const r = await reconcileStorage(db, storage, { deleteOrphans: true });
    expect(r.blocked).toMatch(/aucun document en base/);
    expect((await storage.list()).map((f) => f.key)).toEqual([old]);
  });
});

describe("volume identity", () => {
  it("is created on a fresh installation, then required to match", async () => {
    const id = await ensureVolumeIdentity(db, root);
    expect(await readFile(path.join(root, VOLUME_MARKER), "utf8")).toBe(id);
    expect(await verifyVolumeIdentity(db, root)).toBe(id);
    expect(await ensureVolumeIdentity(db, root)).toBe(id); // restart: unchanged
  });

  it("refuses a missing marker, another volume, or a volume unknown to the database", async () => {
    await ensureVolumeIdentity(db, root);
    const other = await mkdtemp(path.join(os.tmpdir(), "atlas-other-"));
    try {
      // Volume not mounted: empty directory.
      await expect(verifyVolumeIdentity(db, other)).rejects.toThrow(/absent/);
      await expect(ensureVolumeIdentity(db, other)).rejects.toThrow(VolumeIdentityError);
      // Volume of another installation.
      await writeFile(path.join(other, VOLUME_MARKER), randomUUID());
      await expect(ensureVolumeIdentity(db, other)).rejects.toThrow(/identités différentes/);
      // Existing volume, new database: never adopted silently.
      await db.delete(appSettings);
      await expect(ensureVolumeIdentity(db, root)).rejects.toThrow(/identité inconnue/);
    } finally {
      await rm(other, { recursive: true, force: true });
    }
  });
});

describe("storage health and outages", () => {
  it("checks volume, write, read and delete with a probe file, and caches the result", async () => {
    await ensureVolumeIdentity(db, root);
    const check = createStorageHealthCheck(db, root, 60_000);
    const [a, b] = await Promise.all([check(), check()]);
    expect(a).toEqual({ ok: true, checks: { volume: true, write: true, read: true, delete: true } });
    expect(b).toEqual(a);
    // Probe files are cleaned up and never mixed with user files.
    expect(await readdir(path.join(root, HEALTHCHECK_DIR))).toEqual([]);
    expect(await storage.list()).toEqual([]);
  });

  it("reports an unusable volume (marker gone after startup)", async () => {
    await ensureVolumeIdentity(db, root);
    await rm(path.join(root, VOLUME_MARKER));
    const r = await createStorageHealthCheck(db, root)();
    expect(r.ok).toBe(false);
    expect(r.checks.volume).toBe(false);
  });

  it("answers 503 and records nothing when the volume fails during an upload", async () => {
    const user = await createTestUser();
    const m = await createMission(db, user.id, "Mission");
    const broken: FileStorage = {
      put: async () => {
        throw Object.assign(new Error("EIO: i/o error"), { code: "EIO" });
      },
      get: async () => {
        throw Object.assign(new Error("EIO: i/o error"), { code: "EIO" });
      },
      delete: async () => undefined,
    };
    await expect(upload2(broken, user.id, m.id)).rejects.toMatchObject({ status: 503, code: "storage_unavailable" });
    expect(await db.select().from(documents)).toHaveLength(0);
    // Reading a document while the volume fails: 503 too, not a generic 500.
    const doc = await upload(user.id, m.id);
    await expect(readDocumentFile(db, broken, user.id, doc.id)).rejects.toMatchObject({ status: 503 });
  });
});

function upload2(s: FileStorage, userId: string, missionId: string) {
  return uploadDocument(db, s, userId, missionId, { name: "a.txt", data: Buffer.from("x") }, limits);
}
