import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { getDb, type Db } from "@/db";
import { users } from "@/db/schema";
import type { AgentDeps } from "@/server/agent/runner";
import type { LlmProvider } from "@/server/llm/types";
import type { PageFetcher } from "@/server/search/fetch-page";
import type { SearchProvider, SearchResult } from "@/server/search/providers";
import type { FileStorage } from "@/server/documents/storage";

export const db: Db = getDb();

export async function resetDb() {
  await db.execute(
    sql`truncate table execution_logs, mission_runs, sources, artifacts, documents, messages, mission_steps, missions, sessions, users restart identity cascade`,
  );
}

export async function createTestUser(email = `u-${randomUUID().slice(0, 8)}@test.local`) {
  const [u] = await db.insert(users).values({ email, passwordHash: "x" }).returning();
  return u;
}

/** In-memory storage used by tests (no disk writes). */
export class MemoryStorage implements FileStorage {
  files = new Map<string, Buffer>();
  async put(userId: string, data: Buffer) {
    const key = `${userId}/${randomUUID()}`;
    this.files.set(key, data);
    return key;
  }
  async get(key: string) {
    const f = this.files.get(key);
    if (!f) throw new Error("missing");
    return f;
  }
  async delete(key: string) {
    this.files.delete(key);
  }
}

/** Fake search provider (test double). Records queries. */
export class FakeSearch implements SearchProvider {
  readonly name = "fake-search";
  queries: string[] = [];
  constructor(private readonly results: SearchResult[] | Error) {}
  async search(query: string) {
    this.queries.push(query);
    if (this.results instanceof Error) throw this.results;
    return this.results;
  }
}

export const noFetch: PageFetcher = async () => {
  throw new Error("fetch not expected in this test");
};

export function makeDeps(llm: LlmProvider | null, over: Partial<AgentDeps> = {}): AgentDeps {
  return {
    db,
    llm,
    search: null,
    fetchPage: noFetch,
    limits: {
      maxIterations: 30,
      maxToolCalls: 60,
      maxRunSeconds: 60,
      maxRunTokens: 10_000_000,
      maxIdenticalCalls: 2,
      maxConsecutiveErrors: 5,
      runsPerDay: 100,
      analysesPerDay: 100,
      staleRunSeconds: 180,
    },
    ...over,
  };
}
