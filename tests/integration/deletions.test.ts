/**
 * Deletion queue: data becomes inaccessible immediately, files are erased when
 * the queue is processed, and failures stay visible until they succeed.
 */
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { documents, fileDeletions } from "@/db/schema";
import { deleteAllUserData } from "@/server/account";
import { processFileDeletions, queueFileDeletions, STUCK_ATTEMPTS } from "@/server/documents/deletions";
import { deleteDocument, readDocumentFile, uploadDocument } from "@/server/documents/service";
import { createMission, deleteMission } from "@/server/missions/service";
import { createTestUser, db, MemoryStorage, resetDb } from "../helpers/db";

beforeEach(resetDb);

const limits = { maxBytes: 1024 * 1024, maxPerMission: 20 };

/** Storage whose deletions fail until `healthy` is set back to true. */
class FlakyStorage extends MemoryStorage {
  healthy = false;
  override async delete(key: string) {
    if (!this.healthy) throw new Error("EIO: i/o error");
    return super.delete(key);
  }
}

async function setup(storage: MemoryStorage) {
  const user = await createTestUser();
  const m = await createMission(db, user.id, "Mission");
  const doc = await uploadDocument(db, storage, user.id, m.id, { name: "a.txt", data: Buffer.from("secret") }, limits);
  return { user, m, doc };
}

const queue = () => db.select().from(fileDeletions);

describe("deletion queue", () => {
  it("erases the file immediately when storage works, leaving nothing queued", async () => {
    const storage = new MemoryStorage();
    const { user, doc } = await setup(storage);
    await deleteDocument(db, storage, user.id, doc.id);
    expect(storage.files.size).toBe(0);
    expect(await queue()).toEqual([]);
  });

  it("keeps a failed erasure queued with its error, makes the data inaccessible, and retries later", async () => {
    const storage = new FlakyStorage();
    const { user, doc } = await setup(storage);
    await deleteDocument(db, storage, user.id, doc.id);

    // Inaccessible right away…
    await expect(readDocumentFile(db, storage, user.id, doc.id)).rejects.toMatchObject({ status: 404 });
    expect(await db.select().from(documents)).toHaveLength(0);
    // …but the file is still there and the failure is recorded, not hidden.
    expect(storage.files.size).toBe(1);
    const [item] = await queue();
    expect(item).toMatchObject({ attempts: 1, lastError: "EIO: i/o error" });

    // Next processing, storage still failing: attempts increase.
    expect(await processFileDeletions(db, storage)).toMatchObject({ deleted: 0, failed: 1, pending: 1 });
    expect((await queue())[0].attempts).toBe(2);

    storage.healthy = true;
    expect(await processFileDeletions(db, storage)).toMatchObject({ deleted: 1, failed: 0, pending: 0 });
    expect(storage.files.size).toBe(0);
  });

  it("reports pending files when deleting all data, and for a mission deletion", async () => {
    const storage = new FlakyStorage();
    const { user, m } = await setup(storage);
    await uploadDocument(db, storage, user.id, m.id, { name: "b.txt", data: Buffer.from("b") }, limits);
    const m2 = await createMission(db, user.id, "Autre");
    await uploadDocument(db, storage, user.id, m2.id, { name: "c.txt", data: Buffer.from("c") }, limits);

    await deleteMission(db, storage, user.id, m2.id);
    expect(await queue()).toHaveLength(1);

    expect(await deleteAllUserData(db, storage, user.id)).toEqual({ deletedFiles: 0, pendingFiles: 2 });
    expect(await queue()).toHaveLength(3);
  });

  it("counts an already absent file as erased", async () => {
    const storage = new MemoryStorage();
    await queueFileDeletions(db, [`${crypto.randomUUID()}/${crypto.randomUUID()}`]);
    expect(await processFileDeletions(db, storage)).toMatchObject({ deleted: 1, failed: 0, pending: 0 });
  });

  it("never erases a file that a document references", async () => {
    const storage = new MemoryStorage();
    const { doc } = await setup(storage);
    const [row] = await db.select().from(documents).where(eq(documents.id, doc.id));
    await queueFileDeletions(db, [row.storageKey]);
    await processFileDeletions(db, storage);
    expect(storage.files.has(row.storageKey)).toBe(true);
    expect(await queue()).toEqual([]);
  });

  it("reports entries stuck after repeated failures", async () => {
    const storage = new FlakyStorage();
    const { user, doc } = await setup(storage);
    await deleteDocument(db, storage, user.id, doc.id);
    await db.update(fileDeletions).set({ attempts: STUCK_ATTEMPTS - 1 });
    expect(await processFileDeletions(db, storage)).toMatchObject({ failed: 1, pending: 1, stuck: 1 });
  });
});
