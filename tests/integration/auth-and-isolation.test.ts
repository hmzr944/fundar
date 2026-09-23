import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { sessions, missionSteps, artifacts } from "@/db/schema";
import { changePassword, createSession, createUser, destroySession, validateSessionToken, verifyCredentials } from "@/server/auth";
import { deleteAccount, deleteAllUserData, purgeInactiveMissions } from "@/server/account";
import { editArtifact, exportArtifact, getOwnedArtifact } from "@/server/artifacts/service";
import { deleteDocument, getOwnedDocument, readDocumentFile, uploadDocument } from "@/server/documents/service";
import { executeTool } from "@/server/agent/tools";
import {
  createMission,
  deleteMission,
  getMissionDetail,
  listMissions,
  missionRequestSchema,
  updateStepByUser,
} from "@/server/missions/service";
import { AppError } from "@/server/errors";
import { createTestUser, db, MemoryStorage, noFetch, resetDb } from "../helpers/db";

const limits = { maxBytes: 1024 * 1024, maxPerMission: 3 };

beforeEach(resetDb);

describe("authentication", () => {
  it("creates an account, logs in, validates and destroys sessions", async () => {
    const user = await createUser(db, { email: "alice@test.local", password: "motdepasse-solide" });
    expect(user.passwordHash).not.toContain("motdepasse");
    await expect(createUser(db, { email: "alice@test.local", password: "autre-motdepasse" })).rejects.toMatchObject({ status: 409 });
    await expect(verifyCredentials(db, { email: "alice@test.local", password: "mauvais" })).rejects.toMatchObject({ status: 401 });
    await expect(verifyCredentials(db, { email: "inconnu@test.local", password: "x" })).rejects.toMatchObject({ status: 401 });

    const logged = await verifyCredentials(db, { email: "alice@test.local", password: "motdepasse-solide" });
    const { token } = await createSession(db, logged.id, 30);
    expect((await validateSessionToken(db, token))?.id).toBe(user.id);
    // Only a hash of the token is stored.
    const stored = await db.select().from(sessions);
    expect(stored[0].id).not.toBe(token);

    await destroySession(db, token);
    expect(await validateSessionToken(db, token)).toBeNull();
    expect(await validateSessionToken(db, "forged-token")).toBeNull();
    expect(await validateSessionToken(db, undefined)).toBeNull();
  });

  it("rejects expired sessions and revokes sessions on password change", async () => {
    const user = await createUser(db, { email: "bob@test.local", password: "motdepasse-solide" });
    const { token } = await createSession(db, user.id, 30);
    await db.update(sessions).set({ expiresAt: new Date(Date.now() - 1000) });
    expect(await validateSessionToken(db, token)).toBeNull();

    const s2 = await createSession(db, user.id, 30);
    await expect(changePassword(db, user.id, "faux", "nouveau-motdepasse")).rejects.toMatchObject({ status: 400 });
    await expect(changePassword(db, user.id, "motdepasse-solide", "court")).rejects.toMatchObject({ status: 400 });
    await changePassword(db, user.id, "motdepasse-solide", "nouveau-motdepasse");
    expect(await validateSessionToken(db, s2.token)).toBeNull();
    await verifyCredentials(db, { email: "bob@test.local", password: "nouveau-motdepasse" });
  });
});

describe("input validation", () => {
  it("validates mission requests", () => {
    expect(missionRequestSchema.safeParse({ request: "  " }).success).toBe(false);
    expect(missionRequestSchema.safeParse({ request: "x".repeat(8001) }).success).toBe(false);
    expect(missionRequestSchema.safeParse({ request: 42 }).success).toBe(false);
    expect(missionRequestSchema.safeParse({ request: "Organiser mon déménagement" }).success).toBe(true);
  });
  it("treats malformed identifiers as not found", async () => {
    const u = await createTestUser();
    await expect(getMissionDetail(db, u.id, "not-a-uuid")).rejects.toMatchObject({ status: 404 });
    await expect(getMissionDetail(db, u.id, "' or 1=1 --")).rejects.toMatchObject({ status: 404 });
  });
});

describe("data isolation between users", () => {
  it("prevents any access to another user's mission, steps, documents and deliverables", async () => {
    const alice = await createTestUser();
    const eve = await createTestUser();
    const storage = new MemoryStorage();
    const mission = await createMission(db, alice.id, "Préparer ma déclaration d'impôts");
    const [step] = await db.insert(missionSteps).values({ missionId: mission.id, key: "s1", title: "t", kind: "planning", position: 0 }).returning();
    const doc = await uploadDocument(db, storage, alice.id, mission.id, { name: "avis.txt", data: Buffer.from("Revenu fiscal 30000") }, limits);
    const [art] = await db.insert(artifacts).values({ missionId: mission.id, type: "summary", name: "Synthèse", content: "secret" }).returning();

    // Eve sees nothing and gets 404s (existence is not revealed).
    expect(await listMissions(db, eve.id)).toHaveLength(0);
    const denied = [
      () => getMissionDetail(db, eve.id, mission.id),
      () => updateStepByUser(db, eve.id, mission.id, step.id, { status: "DONE" }),
      () => deleteMission(db, storage, eve.id, mission.id),
      () => getOwnedDocument(db, eve.id, doc.id),
      () => readDocumentFile(db, storage, eve.id, doc.id),
      () => deleteDocument(db, storage, eve.id, doc.id),
      () => getOwnedArtifact(db, eve.id, art.id),
      () => editArtifact(db, eve.id, art.id, { content: "pwned" }),
      () => exportArtifact(db, eve.id, art.id, "md"),
      () => uploadDocument(db, storage, eve.id, mission.id, { name: "x.txt", data: Buffer.from("x") }, limits),
    ];
    for (const call of denied) await expect(call()).rejects.toMatchObject({ status: 404 });

    // Agent tools are scoped to the mission owner too.
    const evesMission = await createMission(db, eve.id, "Autre mission");
    const ctx = { db, userId: eve.id, missionId: evesMission.id, search: null, fetchPage: noFetch, readDocumentIds: new Set<string>() };
    const read = await executeTool(ctx, "read_document", { document_id: doc.id });
    expect(read.ok).toBe(false);
    const upd = await executeTool(ctx, "update_step", { step_id: step.id, status: "in_progress" });
    expect(upd.ok).toBe(false);
    const history = await executeTool(ctx, "list_history", {});
    expect(JSON.stringify(history.content)).not.toContain(mission.id);

    // Alice still has everything.
    const detail = await getMissionDetail(db, alice.id, mission.id);
    expect(detail.documents).toHaveLength(1);
    expect((await getOwnedArtifact(db, alice.id, art.id)).content).toBe("secret");
  });
});

describe("documents", () => {
  it("stores, extracts and deletes a supported file", async () => {
    const u = await createTestUser();
    const storage = new MemoryStorage();
    const m = await createMission(db, u.id, "Analyser mon bail");
    const doc = await uploadDocument(db, storage, u.id, m.id, { name: "bail.md", data: Buffer.from("# Bail\nLoyer 850 €") }, limits);
    expect(doc.status).toBe("READY");
    expect(doc.extractedChars).toBeGreaterThan(5);
    expect(storage.files.size).toBe(1);
    const { data } = await readDocumentFile(db, storage, u.id, doc.id);
    expect(data.toString()).toContain("Loyer");
    await deleteDocument(db, storage, u.id, doc.id);
    expect(storage.files.size).toBe(0);
    await expect(getOwnedDocument(db, u.id, doc.id)).rejects.toMatchObject({ status: 404 });
  });

  it("rejects unsupported, oversized and spoofed files, and caps the count", async () => {
    const u = await createTestUser();
    const storage = new MemoryStorage();
    const m = await createMission(db, u.id, "Analyser des documents");
    await expect(uploadDocument(db, storage, u.id, m.id, { name: "a.exe", data: Buffer.from("MZ") }, limits)).rejects.toMatchObject({ status: 415 });
    await expect(uploadDocument(db, storage, u.id, m.id, { name: "a.pdf", data: Buffer.from("nope") }, limits)).rejects.toMatchObject({ status: 415 });
    await expect(
      uploadDocument(db, storage, u.id, m.id, { name: "big.txt", data: Buffer.alloc(limits.maxBytes + 1, 65) }, limits),
    ).rejects.toMatchObject({ status: 413 });
    expect(storage.files.size).toBe(0);
    for (let i = 0; i < 3; i++) await uploadDocument(db, storage, u.id, m.id, { name: `n${i}.txt`, data: Buffer.from("ok") }, limits);
    await expect(uploadDocument(db, storage, u.id, m.id, { name: "n4.txt", data: Buffer.from("ok") }, limits)).rejects.toBeInstanceOf(AppError);
  });

  it("records extraction failures instead of pretending the file was read", async () => {
    const u = await createTestUser();
    const m = await createMission(db, u.id, "Lire un document vide");
    const doc = await uploadDocument(db, new MemoryStorage(), u.id, m.id, { name: "vide.txt", data: Buffer.from("   ") }, limits);
    expect(doc.status).toBe("FAILED");
    expect(doc.error).toMatch(/aucun texte/i);
    const detail = await getMissionDetail(db, u.id, m.id);
    expect(detail.messages.some((x) => x.metadata.kind === "document_failed")).toBe(true);
  });
});

describe("data deletion", () => {
  it("deletes a mission with its files, all user data, the account, and applies retention", async () => {
    const u = await createUser(db, { email: "del@test.local", password: "motdepasse-solide" });
    const storage = new MemoryStorage();
    const m1 = await createMission(db, u.id, "Mission une");
    const m2 = await createMission(db, u.id, "Mission deux");
    await uploadDocument(db, storage, u.id, m1.id, { name: "a.txt", data: Buffer.from("a") }, limits);
    await uploadDocument(db, storage, u.id, m2.id, { name: "b.txt", data: Buffer.from("b") }, limits);

    await deleteMission(db, storage, u.id, m1.id);
    expect(storage.files.size).toBe(1);
    expect(await listMissions(db, u.id)).toHaveLength(1);

    await deleteAllUserData(db, storage, u.id);
    expect(storage.files.size).toBe(0);
    expect(await listMissions(db, u.id)).toHaveLength(0);

    await expect(deleteAccount(db, storage, u.id, "faux")).rejects.toMatchObject({ status: 400 });
    await deleteAccount(db, storage, u.id, "motdepasse-solide");
    await expect(verifyCredentials(db, { email: "del@test.local", password: "motdepasse-solide" })).rejects.toMatchObject({ status: 401 });

    const v = await createTestUser();
    const old = await createMission(db, v.id, "Ancienne mission");
    await createMission(db, v.id, "Mission récente");
    await db.execute(`update missions set updated_at = now() - interval '400 days' where id = '${old.id}'`);
    const purged = await purgeInactiveMissions(db, storage, 365);
    expect(purged.missions).toBe(1);
    const left = await listMissions(db, v.id);
    expect(left.map((x) => x.title)).toEqual(["Mission récente"]);
    expect(await db.select().from(missionSteps).where(eq(missionSteps.missionId, old.id))).toHaveLength(0);
  });
});
