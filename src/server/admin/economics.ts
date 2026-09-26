import { and, gte, inArray, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { executionLogs, missionRuns, missions, type MissionOutcome, type MissionPayment } from "@/db/schema";

/**
 * The owner's economics dashboard. It exists because of what sank Homejoy
 * and Magic: each customer cost more than they brought in, and the
 * companies grew before noticing. Every figure comes from what Atlas
 * recorded; nothing is extrapolated.
 */

/** Rough conversion for AI costs, billed in dollars. An estimate, shown as such. */
export const USD_TO_EUR = 0.9;
/** Micro-entrepreneur social charges on services (to check against the owner's own rate). */
export const SOCIAL_CHARGES_RATE = 0.21;
/** Stripe fees for a European card: about 1.5 % + 0.25 €. */
export const stripeFeeCents = (amountCents: number) => Math.round(amountCents * 0.015 + 25);
/** A dossier finished this long ago and still not closed by its user counts as "never closed". */
export const UNCLOSED_AFTER_DAYS = 60;
/** Below this many closed dossiers, no rate is meaningful. */
export const MIN_SAMPLE = 20;

export type MissionFacts = {
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  analysed: boolean;
  canHandle: boolean;
  payment: MissionPayment | null;
  outcome: MissionOutcome | null;
  aiCostUsd: number;
  /** A run failed or was stopped, or the dossier ended on an error: someone may have to look at it. */
  troubled: boolean;
};

export type Economics = Figures & { alerts: Alert[] };
export type Figures = ReturnType<typeof computeFigures>;

const FINISHED = ["COMPLETED", "PARTIALLY_COMPLETED", "WAITING_FOR_USER"];

export function summarize(rows: MissionFacts[], now = new Date()): Economics {
  const figures = computeFigures(rows, now);
  return { ...figures, alerts: alertsFor(figures) };
}

function computeFigures(rows: MissionFacts[], now: Date) {
  const taken = rows.filter((r) => r.payment?.authorizedAt || r.payment?.paidAt);
  const notTaken = rows.filter((r) => !(r.payment?.authorizedAt || r.payment?.paidAt));
  const resolved = taken.filter((r) => r.outcome?.resolved);
  const failed = taken.filter((r) => r.outcome && !r.outcome.resolved);
  const closed = resolved.length + failed.length;
  const staleBefore = now.getTime() - UNCLOSED_AFTER_DAYS * 86_400_000;
  const neverClosed = taken.filter((r) => !r.outcome && FINISHED.includes(r.status) && r.updatedAt.getTime() < staleBefore);

  const revenueCents = taken.reduce((s, r) => s + (r.payment?.paidAt ? (r.payment.amountCents ?? 0) : 0), 0);
  const unpaidFeesCents = taken.reduce((s, r) => s + (r.payment?.feeDueCents && !r.payment.paidAt ? r.payment.feeDueCents : 0), 0);
  const stripeCents = taken.reduce((s, r) => s + (r.payment?.paidAt && r.payment.amountCents ? stripeFeeCents(r.payment.amountCents) : 0), 0);
  const aiTakenCents = Math.round(taken.reduce((s, r) => s + r.aiCostUsd, 0) * USD_TO_EUR * 100);
  // Free analyses that never became a dossier: what it costs to find customers.
  const aiFreeCents = Math.round(notTaken.reduce((s, r) => s + r.aiCostUsd, 0) * USD_TO_EUR * 100);
  const chargesCents = Math.round(revenueCents * SOCIAL_CHARGES_RATE);
  const marginCents = revenueCents - stripeCents - aiTakenCents - aiFreeCents - chargesCents;

  const takenUsers = new Map<string, number>();
  for (const r of taken) takenUsers.set(r.userId, (takenUsers.get(r.userId) ?? 0) + 1);
  const returning = [...takenUsers.values()].filter((n) => n >= 2).length;

  const rate = (n: number, d: number) => (d > 0 ? n / d : null);
  return {
    analysed: rows.filter((r) => r.analysed).length,
    eligible: rows.filter((r) => r.canHandle).length,
    taken: taken.length,
    resolved: resolved.length,
    failed: failed.length,
    open: taken.length - closed,
    neverClosed: neverClosed.length,
    recoveredCents: resolved.reduce((sum, r) => sum + (r.outcome?.recoveredCents ?? 0), 0),
    revenueCents,
    unpaidFeesCents,
    stripeCents,
    aiTakenCents,
    aiFreeCents,
    chargesCents,
    marginCents,
    marginPerTakenCents: taken.length ? Math.round(marginCents / taken.length) : null,
    successRate: rate(resolved.length, closed),
    takeRate: rate(taken.length, rows.filter((r) => r.canHandle).length),
    neverClosedRate: rate(neverClosed.length, taken.length),
    troubledRate: rate(taken.filter((r) => r.troubled).length, taken.length),
    customers: takenUsers.size,
    returning,
    returnRate: rate(returning, takenUsers.size),
    enoughData: closed >= MIN_SAMPLE,
  };
}

export type Alert = { level: "stop" | "watch" | "ok"; lesson: string; message: string };

/** Each alert is tied to a mistake another company made. */
export function alertsFor(s: Figures): Alert[] {
  const pct = (x: number) => `${Math.round(x * 100)} %`;
  const eur = (c: number) => `${(c / 100).toFixed(2).replace(".", ",")} €`;
  const alerts: Alert[] = [];

  if (!s.enoughData) {
    alerts.push({
      level: "watch",
      lesson: "Homejoy : grandir avant de savoir si chaque client est rentable",
      message: `Seulement ${s.resolved + s.failed} dossier(s) clôturé(s) sur les ${MIN_SAMPLE} nécessaires pour conclure. Pas de publicité payante d'ici là.`,
    });
  }
  if (s.enoughData && s.marginPerTakenCents !== null) {
    alerts.push(
      s.marginPerTakenCents <= 0
        ? {
            level: "stop",
            lesson: "Homejoy, Magic : chaque client coûte plus qu'il ne rapporte",
            message: `Un dossier pris en charge vous coûte ${eur(-s.marginPerTakenCents)} en moyenne. Arrêtez la publicité et corrigez avant de grandir (commission, types de dossiers acceptés, plafond IA).`,
          }
        : {
            level: "ok",
            lesson: "Homejoy, Magic : chaque client coûte plus qu'il ne rapporte",
            message: `Un dossier pris en charge vous rapporte ${eur(s.marginPerTakenCents)} en moyenne, après IA, Stripe et cotisations. N'achetez pas un client plus cher que ça.`,
          },
    );
  }
  if (s.enoughData && s.successRate !== null && s.successRate < 0.15) {
    alerts.push({
      level: "stop",
      lesson: "DoNotPay : promettre plus que ce qui est prouvé",
      message: `Seulement ${pct(s.successRate)} des dossiers clôturés sont réglés. En dessous de 15 %, le modèle perd de l'argent et la promesse « Règle ça pour moi » n'est pas tenue : resserrez les dossiers acceptés.`,
    });
  }
  if (s.taken > 0 && s.aiFreeCents > s.revenueCents && s.enoughData) {
    alerts.push({
      level: "stop",
      lesson: "Magic : beaucoup de demande, aucune rentabilité",
      message: `Les analyses gratuites non suivies coûtent ${eur(s.aiFreeCents)}, plus que tout ce que les commissions rapportent (${eur(s.revenueCents)}). Réduisez ATLAS_ANALYSES_PER_DAY ou le plafond IA.`,
    });
  }
  if (s.troubledRate !== null && s.taken >= 5 && s.troubledRate > 0.1) {
    alerts.push({
      level: "watch",
      lesson: "Facebook M : l'humain ne disparaît jamais",
      message: `${pct(s.troubledRate)} des dossiers ont connu un échec ou un arrêt : autant de dossiers où vous risquez de devoir intervenir. Regardez leur Journal et notez le temps que vous y passez.`,
    });
  }
  if (s.neverClosedRate !== null && s.taken >= 5 && s.neverClosedRate > 0.3) {
    alerts.push({
      level: "watch",
      lesson: "Magic : servir sans être payé",
      message: `${pct(s.neverClosedRate)} des dossiers terminés depuis plus de ${UNCLOSED_AFTER_DAYS} jours ne sont pas clôturés : aucune commission. Envisagez d'exiger la clôture d'un dossier avant d'en ouvrir un autre.`,
    });
  }
  if (s.customers >= 10) {
    alerts.push({
      level: s.returnRate !== null && s.returnRate > 0 ? "ok" : "watch",
      lesson: "Homejoy : des clients qui ne reviennent pas",
      message: `${s.returning} client(s) sur ${s.customers} ont confié plus d'un dossier. C'est le meilleur signe pour la vision d'Atlas. Ne les relancez pas pour gonfler ce chiffre.`,
    });
  }
  return alerts;
}

/** Loads the facts for every mission created in the last `days` days (all time when null). */
export async function loadEconomics(db: Db, days: number | null, now = new Date()) {
  const since = days === null ? null : new Date(now.getTime() - days * 86_400_000);
  const rows = await db
    .select({
      id: missions.id,
      userId: missions.userId,
      createdAt: missions.createdAt,
      updatedAt: missions.updatedAt,
      status: missions.status,
      eligibility: missions.eligibility,
      payment: missions.payment,
      outcome: missions.outcome,
      lastError: missions.lastError,
      analysed: sql<boolean>`${missions.eligibility} is not null or exists (select 1 from mission_steps s where s.mission_id = ${missions.id})`,
    })
    .from(missions)
    .where(since ? gte(missions.createdAt, since) : undefined);
  const ids = rows.map((r) => r.id);
  const costs = ids.length
    ? await db
        .select({ missionId: executionLogs.missionId, usd: sql<string>`coalesce(sum(${executionLogs.estimatedCostUsd}), 0)` })
        .from(executionLogs)
        .where(inArray(executionLogs.missionId, ids))
        .groupBy(executionLogs.missionId)
    : [];
  const troubled = ids.length
    ? await db
        .selectDistinct({ missionId: missionRuns.missionId })
        .from(missionRuns)
        .where(and(inArray(missionRuns.missionId, ids), inArray(missionRuns.status, ["FAILED", "STOPPED", "INTERRUPTED"])))
    : [];
  const costOf = new Map(costs.map((c) => [c.missionId, Number(c.usd)]));
  const troubledIds = new Set(troubled.map((t) => t.missionId));
  return summarize(
    rows.map((r) => ({
      userId: r.userId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      status: r.status,
      analysed: Boolean(r.analysed),
      canHandle: r.eligibility?.canHandle === true,
      payment: r.payment,
      outcome: r.outcome,
      aiCostUsd: costOf.get(r.id) ?? 0,
      troubled: troubledIds.has(r.id) || Boolean(r.lastError),
    })),
    now,
  );
}

/** The owner(s), from ATLAS_ADMIN_EMAILS (comma-separated). Nobody when unset. */
export function isAdmin(email: string, env: Record<string, string | undefined> = process.env) {
  const list = (env.ATLAS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}
