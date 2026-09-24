/** Retention policy settings (shared by the app and the maintenance scripts). */

function int(env: NodeJS.ProcessEnv, name: string, fallback: number): number {
  const n = Number.parseInt(env[name] ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function retentionSettings(env: NodeJS.ProcessEnv = process.env) {
  return {
    /** Missions without activity (opening included) for this many days are deleted. */
    missionDays: int(env, "ATLAS_RETENTION_DAYS", 180),
    /** Accounts without authenticated activity for this many days… */
    accountInactiveDays: int(env, "ATLAS_ACCOUNT_INACTIVE_DAYS", 365),
    /** …are only deleted when explicitly enabled (off until a notice procedure exists). */
    accountPurge: (env.ATLAS_ACCOUNT_PURGE ?? "off").toLowerCase() === "on",
    usageRetentionMonths: int(env, "ATLAS_USAGE_RETENTION_MONTHS", 24),
    orphanMinAgeHours: int(env, "ATLAS_ORPHAN_MIN_AGE_HOURS", 24),
    staleRunSeconds: int(env, "ATLAS_STALE_RUN_SECONDS", 180),
  };
}

export type RetentionSettings = ReturnType<typeof retentionSettings>;
