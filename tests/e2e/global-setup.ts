import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { rm } from "node:fs/promises";
import { Pool } from "pg";

export default async function setup() {
  const url = process.env.E2E_DATABASE_URL ?? "postgres://atlas:atlas@localhost:5432/atlas_e2e";
  const pool = new Pool({ connectionString: url });
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  await pool.query(
    "truncate table app_settings, usage_records, execution_logs, mission_runs, sources, artifacts, documents, messages, mission_steps, missions, sessions, users restart identity cascade",
  );
  // Fresh storage volume identity for every run (the marker and the database value go together).
  await rm("./test-storage/e2e/.atlas-volume", { force: true });
  await pool.end();
}
