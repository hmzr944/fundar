/** How the user will send a deliverable addressed to a third party (stored in artifact metadata). */
export type SendInfo = { to: string; subject: string; confirmed: boolean; followUpDays?: number };

export function sendInfoOf(metadata: Record<string, unknown>): SendInfo | null {
  const s = metadata.send as Partial<SendInfo> | undefined;
  if (!s || typeof s.to !== "string" || typeof s.subject !== "string") return null;
  return { to: s.to, subject: s.subject, confirmed: s.confirmed === true, ...(typeof s.followUpDays === "number" ? { followUpDays: s.followUpDays } : {}) };
}
