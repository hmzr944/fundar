import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

/** Applies migrations to the test database once, before any test file. */
export default async function setup() {
  const url = process.env.TEST_DATABASE_URL ?? "postgres://atlas:atlas@localhost:5432/atlas_test";
  const pool = new Pool({ connectionString: url });
  try {
    await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  } catch (e) {
    throw new Error(`Base de test inaccessible (${url}). Voir README > Tests. ${(e as Error).message}`);
  } finally {
    await pool.end();
  }
}
