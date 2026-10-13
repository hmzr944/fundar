/**
 * Deadlines and amounts for money blocked on construction sites, computed
 * deterministically (never left to the language model). Shared by the public
 * simulator and the app.
 *
 * Rules (France, to re-check on Légifrance before each release):
 * - Retenue de garantie: at most 5 % of the works (loi n° 71-584, art. 1),
 *   released one year after reception unless the client has filed a
 *   reasoned objection (art. 2).
 * - Public contracts: global payment deadline of 30 days (50 for public
 *   hospitals, 60 for public companies); late-payment interest is owed
 *   automatically at the ECB rate + 8 points, plus a 40 € flat indemnity
 *   (code de la commande publique, R2192-10 s., D2192-35).
 * - Subcontractors (loi n° 75-1334, art. 12): direct action against the
 *   project owner once a formal notice to the main contractor has gone
 *   unanswered for one month.
 * - Late B2B invoices: 40 € flat indemnity per invoice (C. com. L441-10).
 */

export const RETENUE_MAX_RATE = 0.05;
/** 40 € flat recovery indemnity, per invoice, in cents. */
export const FLAT_INDEMNITY_CENTS = 4000;
/**
 * Indicative public late-payment interest rate (ECB rate + 8 points), in %.
 * Sources disagree for 2026 (10.15 or 10.40): always shown as an estimate.
 */
export const PUBLIC_LATE_RATE_PCT = 10.15;

export const PUBLIC_PAYMENT_DAYS = { etat: 30, hopital: 50, entreprisePublique: 60 } as const;
export type PublicBuyer = keyof typeof PUBLIC_PAYMENT_DAYS;

const DAY = 86_400_000;

/** Calendar date at midnight UTC, so day counts never drift with time zones. */
export function day(d: Date | string) {
  const x = typeof d === "string" ? new Date(d) : d;
  return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
}

export function addDays(d: Date, n: number) {
  return new Date(day(d).getTime() + n * DAY);
}

/** Same day n months later, clamped to the month's last day (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(d: Date, n: number) {
  const x = day(d);
  const target = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + n, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(x.getUTCDate(), last));
  return target;
}

export function daysBetween(from: Date, to: Date) {
  return Math.round((day(to).getTime() - day(from).getTime()) / DAY);
}

export type Retenue = {
  releaseDate: Date;
  /** Upper bound: the retenue is at most 5 % of the works. */
  maxAmountCents: number;
  /** Days until release (negative once it can be claimed). */
  daysLeft: number;
  claimable: boolean;
};

export function retenueDeGarantie(p: { receptionDate: Date; worksCents: number; today?: Date }): Retenue {
  const releaseDate = addMonths(p.receptionDate, 12);
  const daysLeft = daysBetween(p.today ?? new Date(), releaseDate);
  return {
    releaseDate,
    maxAmountCents: Math.round(p.worksCents * RETENUE_MAX_RATE),
    daysLeft,
    claimable: daysLeft <= 0,
  };
}

export type PublicLatePayment = {
  dueDate: Date;
  daysLate: number;
  interestCents: number;
  indemnityCents: number;
};

/**
 * Interest owed by a public buyer on one invoice, counted from the end of the
 * payment deadline to the payment date (or today if still unpaid).
 */
export function interetsMoratoires(p: {
  receivedDate: Date;
  amountCents: number;
  buyer?: PublicBuyer;
  paidDate?: Date | null;
  today?: Date;
  ratePct?: number;
}): PublicLatePayment {
  const dueDate = addDays(p.receivedDate, PUBLIC_PAYMENT_DAYS[p.buyer ?? "etat"]);
  const end = p.paidDate ?? p.today ?? new Date();
  const daysLate = Math.max(0, daysBetween(dueDate, end));
  const rate = (p.ratePct ?? PUBLIC_LATE_RATE_PCT) / 100;
  return {
    dueDate,
    daysLate,
    interestCents: Math.round((p.amountCents * rate * daysLate) / 365),
    indemnityCents: daysLate > 0 ? FLAT_INDEMNITY_CENTS : 0,
  };
}

/** Earliest date a subcontractor can turn to the project owner. */
export function actionDirecte(p: { noticeDate: Date; today?: Date }) {
  const openDate = addMonths(p.noticeDate, 1);
  const daysLeft = daysBetween(p.today ?? new Date(), openDate);
  return { openDate, daysLeft, open: daysLeft <= 0 };
}

export function factureImpayee(p: { dueDate: Date; amountCents: number; today?: Date }) {
  const daysLate = Math.max(0, daysBetween(p.dueDate, p.today ?? new Date()));
  return { daysLate, indemnityCents: daysLate > 0 ? FLAT_INDEMNITY_CENTS : 0 };
}

export const euros = (cents: number, decimals = false) =>
  `${(cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: decimals ? 2 : 0, maximumFractionDigits: decimals ? 2 : 0 })} €`;

export const frDate = (d: Date, withYear = true) =>
  d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" });
