/**
 * Runs once when a server instance starts, before it accepts requests.
 * A misconfigured storage directory stops the server here instead of losing
 * uploaded files later (e.g. a relative path landing on an ephemeral disk).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { runStartupChecks } = await import("./server/startup");
  await runStartupChecks();
}
