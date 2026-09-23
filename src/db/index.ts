import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __atlasPool?: Pool; __atlasDb?: Db };

export function getDb(): Db {
  if (!globalForDb.__atlasDb) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL n'est pas défini.");
    globalForDb.__atlasPool = new Pool({ connectionString: url, max: 10 });
    globalForDb.__atlasDb = drizzle(globalForDb.__atlasPool, { schema });
  }
  return globalForDb.__atlasDb;
}

export async function closeDb() {
  await globalForDb.__atlasPool?.end();
  globalForDb.__atlasPool = undefined;
  globalForDb.__atlasDb = undefined;
}

export { schema };
