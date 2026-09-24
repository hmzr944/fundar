import { and, count, eq } from "drizzle-orm";
import type { Db } from "@/db";
import { documents } from "@/db/schema";
import { AppError, badRequest, conflict, notFound } from "@/server/errors";
import { addMessage, getOwnedMission, hasActiveRun, uuidSchema } from "@/server/missions/service";
import { detectFormat, extractText, sanitizeFileName, UnsupportedFileError } from "./extract";
import { MissingFileError, type FileStorage } from "./storage";

export type UploadLimits = { maxBytes: number; maxPerMission: number };

export async function uploadDocument(
  db: Db,
  storage: FileStorage,
  userId: string,
  missionId: string,
  file: { name: string; data: Buffer },
  limits: UploadLimits,
) {
  await getOwnedMission(db, userId, missionId);
  if (file.data.length > limits.maxBytes) {
    throw new AppError(413, `Fichier trop volumineux (maximum ${Math.round(limits.maxBytes / 1024 / 1024)} Mo).`, "too_large");
  }
  const [{ n }] = await db.select({ n: count() }).from(documents).where(eq(documents.missionId, missionId));
  if (n >= limits.maxPerMission) throw badRequest(`Limite de ${limits.maxPerMission} documents par mission atteinte.`);

  const name = sanitizeFileName(file.name);
  let format;
  try {
    format = detectFormat(name, file.data);
  } catch (e) {
    if (e instanceof UnsupportedFileError) throw new AppError(415, e.message, "unsupported_format");
    throw e;
  }

  const storageKey = await storage.put(userId, file.data);
  const [doc] = await db
    .insert(documents)
    .values({ missionId, userId, name, mimeType: format.mime, sizeBytes: file.data.length, storageKey, status: "PROCESSING" })
    .returning();

  // Extraction happens synchronously: files are small (size-capped) and the
  // user immediately sees whether the document is usable.
  try {
    const text = await extractText(format.format, file.data);
    const [updated] = await db
      .update(documents)
      .set({ status: "READY", extractedText: text, extractedChars: text.length, error: null })
      .where(eq(documents.id, doc.id))
      .returning();
    await addMessage(db, missionId, "event", `Document importé : « ${name} » (${text.length.toLocaleString("fr-FR")} caractères extraits).`, {
      kind: "document_uploaded",
      documentId: doc.id,
    });
    return publicDocument(updated);
  } catch (e) {
    const message =
      e instanceof UnsupportedFileError ? e.message : "La lecture du document a échoué. Le fichier est peut-être corrompu ou protégé.";
    const [updated] = await db
      .update(documents)
      .set({ status: "FAILED", error: message })
      .where(eq(documents.id, doc.id))
      .returning();
    await addMessage(db, missionId, "event", `Échec de lecture du document « ${name} » : ${message}`, {
      kind: "document_failed",
      documentId: doc.id,
    });
    return publicDocument(updated);
  }
}

function publicDocument(d: typeof documents.$inferSelect) {
  return {
    id: d.id,
    name: d.name,
    mimeType: d.mimeType,
    sizeBytes: d.sizeBytes,
    status: d.status,
    extractedChars: d.extractedChars,
    error: d.error,
    createdAt: d.createdAt,
  };
}

/** Loads a document only if it belongs to the user (ownership checked on the row itself). */
export async function getOwnedDocument(db: Db, userId: string, documentId: string) {
  if (!uuidSchema.safeParse(documentId).success) throw notFound("Document");
  const doc = await db.query.documents.findFirst({
    where: and(eq(documents.id, documentId), eq(documents.userId, userId)),
  });
  if (!doc) throw notFound("Document");
  return doc;
}

export async function readDocumentFile(db: Db, storage: FileStorage, userId: string, documentId: string) {
  const doc = await getOwnedDocument(db, userId, documentId);
  try {
    return { doc, data: await storage.get(doc.storageKey) };
  } catch (e) {
    if (!(e instanceof MissingFileError)) throw e;
    // Operator-side signal (ids only, no file name): the storage lost a file.
    console.error(`[atlas] stored file missing for document ${doc.id} (${doc.storageKey})`);
    throw new AppError(
      410,
      "Le fichier d'origine n'est plus disponible sur le serveur. Le texte déjà extrait reste utilisé par Atlas ; réimportez le fichier si vous en avez besoin.",
      "file_missing",
    );
  }
}

export async function deleteDocument(db: Db, storage: FileStorage, userId: string, documentId: string) {
  const doc = await getOwnedDocument(db, userId, documentId);
  if (await hasActiveRun(db, doc.missionId)) throw conflict("Une exécution est en cours sur cette mission.");
  await db.delete(documents).where(eq(documents.id, doc.id));
  await storage.delete(doc.storageKey).catch(() => undefined);
  await addMessage(db, doc.missionId, "event", `Document supprimé : « ${doc.name} ».`, { kind: "document_deleted" });
}
