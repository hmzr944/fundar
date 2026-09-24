/**
 * Production storage safeguards: explicit absolute path, clear error when a
 * stored file is gone, and disk/database reconciliation.
 */
import { mkdtemp, mkdir, rm, stat, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { documents } from "@/db/schema";
import { reconcileStorage } from "@/server/documents/reconcile";
import { readDocumentFile, uploadDocument } from "@/server/documents/service";
import { checkStorageDir, LocalFileStorage, resolveStorageDir, StorageConfigError } from "@/server/documents/storage";
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
  it("reports orphans, missing files and empty directories, and only deletes old orphans when asked", async () => {
    const user = await createTestUser();
    const m = await createMission(db, user.id, "Mission");
    const kept = await upload(user.id, m.id, "garde.txt");
    const lost = await upload(user.id, m.id, "perdu.txt");
    // Remove the file of the second document from disk → "missing".
    const [lostRow] = await db.select().from(documents).where(eq(documents.id, lost.id));
    await rm(path.join(root, lostRow.storageKey));

    // An old orphan, a recent orphan (upload in progress) and an empty user directory.
    const oldOrphan = `${user.id}/${randomUUID()}`;
    const recentOrphan = `${user.id}/${randomUUID()}`;
    await writeFile(path.join(root, oldOrphan), "ancien");
    await writeFile(path.join(root, recentOrphan), "récent");
    const twoDaysAgo = new Date(Date.now() - 48 * 3_600_000);
    await utimes(path.join(root, oldOrphan), twoDaysAgo, twoDaysAgo);
    const emptyDir = randomUUID();
    await mkdir(path.join(root, emptyDir));

    const report = await reconcileStorage(db, storage);
    expect(report.filesOnDisk).toBe(3);
    expect(report.documentsInDb).toBe(2);
    expect(report.orphans.map((o) => o.key).sort()).toEqual([oldOrphan, recentOrphan].sort());
    expect(report.missing).toEqual([{ documentId: lost.id, key: lostRow.storageKey }]);
    expect(report.emptyUserDirs).toEqual([emptyDir]);
    expect(report.deletedOrphans).toBe(0);
    // Report only: nothing was touched.
    expect((await storage.list()).length).toBe(3);

    const cleaned = await reconcileStorage(db, storage, { deleteOrphans: true });
    expect(cleaned.deletedOrphans).toBe(1);
    expect(cleaned.removedDirs).toBe(1);
    expect(cleaned.failures).toEqual([]);
    const left = (await storage.list()).map((f) => f.key);
    expect(left).toContain(recentOrphan);
    expect(left).not.toContain(oldOrphan);
    expect(left).toHaveLength(2);
    // The referenced file is never touched.
    expect((await readDocumentFile(db, storage, user.id, kept.id)).data.toString()).toBe("Contenu du document");
  });
});
