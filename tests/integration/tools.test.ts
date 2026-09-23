import { beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { sources } from "@/db/schema";
import { executeTool } from "@/server/agent/tools";
import { addMessage, createMission } from "@/server/missions/service";
import type { PageFetcher } from "@/server/search/fetch-page";
import { createTestUser, db, resetDb } from "../helpers/db";

beforeEach(resetDb);

describe("fetch_page tool", () => {
  it("tells the model and the UI when a page was only partially read", async () => {
    const user = await createTestUser();
    const mission = await createMission(db, user.id, "Lire https://example.org/grande-page");
    await addMessage(db, mission.id, "user", "Voici le lien : https://example.org/grande-page");
    const partial: PageFetcher = async (url) => ({ url, title: "Grande page", text: "Début du contenu", truncated: true });
    const complete: PageFetcher = async (url) => ({ url, title: "Petite page", text: "Tout le contenu", truncated: false });
    const ctx = (fetchPage: PageFetcher) => ({ db, userId: user.id, missionId: mission.id, runId: "00000000-0000-0000-0000-000000000000", search: null, fetchPage, readDocumentIds: new Set<string>() });

    const cut = await executeTool(ctx(partial), "fetch_page", { url: "https://example.org/grande-page" });
    expect(cut.ok).toBe(true);
    expect(cut.content).toMatchObject({ truncated: true, truncation_notice: expect.stringContaining("INCOMPLET") });
    expect(cut.logDetails).toMatchObject({ truncated: true });
    const [src] = await db.select().from(sources).where(eq(sources.missionId, mission.id));
    expect(src.excerpt).toMatch(/^\[Page lue partiellement\] Début du contenu/);

    const full = await executeTool(ctx(complete), "fetch_page", { url: "https://example.org/grande-page" });
    expect(full.content).toMatchObject({ truncated: false });
    expect(full.content).not.toHaveProperty("truncation_notice");
  });
});
