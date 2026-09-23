/**
 * Regression: an unexpected extraction failure (library crash, not a
 * recognized bad-format case) was silently rewritten to a generic message
 * with nothing logged server-side, making it impossible to tell a corrupted
 * file apart from a library bug or an exploitation attempt from the logs.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMission } from "@/server/missions/service";
import { uploadDocument } from "@/server/documents/service";
import { UnsupportedFileError } from "@/server/documents/extract";
import { createTestUser, db, MemoryStorage, resetDb } from "../helpers/db";

vi.mock("@/server/documents/extract", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/documents/extract")>();
  return { ...actual, extractText: vi.fn() };
});

beforeEach(resetDb);

describe("document extraction failures", () => {
  it("logs the real error server-side for an unexpected extraction crash, but keeps the generic user-facing message", async () => {
    const { extractText } = await import("@/server/documents/extract");
    const crash = new Error("mammoth internal crash: unexpected end of zip");
    vi.mocked(extractText).mockRejectedValueOnce(crash);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const user = await createTestUser();
    const mission = await createMission(db, user.id, "Analyse ce contrat");
    const doc = await uploadDocument(
      db,
      new MemoryStorage(),
      user.id,
      mission.id,
      { name: "contrat.docx", data: Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]) },
      { maxBytes: 1e6, maxPerMission: 5 },
    );

    expect(doc.status).toBe("FAILED");
    expect(doc.error).toBe("La lecture du document a échoué. Le fichier est peut-être corrompu ou protégé.");
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const [logLine, loggedError] = errorSpy.mock.calls[0];
    expect(String(logLine)).toContain(doc.id);
    expect(loggedError).toBe(crash);
    errorSpy.mockRestore();
  });

  it("does not log a recognized bad-format case (UnsupportedFileError)", async () => {
    const { extractText } = await import("@/server/documents/extract");
    vi.mocked(extractText).mockRejectedValueOnce(new UnsupportedFileError("Le document ne contient aucun texte exploitable."));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const user = await createTestUser();
    const mission = await createMission(db, user.id, "Analyse ce contrat");
    const doc = await uploadDocument(
      db,
      new MemoryStorage(),
      user.id,
      mission.id,
      { name: "vide.docx", data: Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]) },
      { maxBytes: 1e6, maxPerMission: 5 },
    );

    expect(doc.status).toBe("FAILED");
    expect(doc.error).toBe("Le document ne contient aucun texte exploitable.");
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
