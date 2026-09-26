/**
 * Pay-per-dossier billing, AI spend ceiling and user notifications. Stripe,
 * the mail service and the model are replaced by test doubles.
 */
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { executionLogs, messages, missions, missionSteps, users } from "@/db/schema";
import { analyzeMission } from "@/server/agent/analyze";
import { startAnalysis, startExecution } from "@/server/agent/runner";
import { applyStripeEvent, checkoutSchema, declareOutcome, startCheckout, startPaidMission, userResults } from "@/server/billing/service";
import { billingConfig, computeSuccessFee, signStripePayload, verifyStripeSignature, type BillingConfig } from "@/server/billing/stripe";
import { ScriptedProvider, textResult, toolCallsResult } from "@/server/llm/scripted";
import type { Mailer, MailMessage } from "@/server/mail/mailer";
import { notifyUser } from "@/server/mail/notify";
import { createMission } from "@/server/missions/service";
import { POST as webhookRoute } from "@/app/api/payments/stripe-webhook/route";
import { loadEconomics } from "@/server/admin/economics";
import { analysis, planFromBriefing, turn } from "../helpers/agent";
import { createTestUser, db, makeDeps, resetDb } from "../helpers/db";

beforeEach(resetDb);

const fee = { ratePct: 20, minCents: 500, maxCents: 3000, flatCents: 500 };
const cfg: BillingConfig = { mode: "upfront", fee, priceCents: 1200, currency: "eur", secretKey: "sk_test_x", webhookSecret: "whsec_test", appUrl: "https://atlas.example", termsVersion: "1" };
const legalEnv = {
  ATLAS_LEGAL_NAME: "Atlas EI",
  ATLAS_LEGAL_SIRET: "123 456 789 00010",
  ATLAS_LEGAL_ADDRESS: "1 rue de Paris, 75001 Paris",
  ATLAS_LEGAL_EMAIL: "contact@atlas.example",
  ATLAS_LEGAL_HOST: "Hébergeur SAS, Paris",
  ATLAS_LEGAL_MEDIATOR: "Médiateur X — mediateur.example",
};

class FakeMailer implements Mailer {
  readonly name = "fake";
  sent: MailMessage[] = [];
  async send(msg: MailMessage) {
    this.sent.push(msg);
    return { id: `m${this.sent.length}` };
  }
}

const plan = analysis({
  steps: [
    { key: "s1", title: "Organiser le dossier", description: "", kind: "planning", depends_on: [] },
    { key: "s2", title: "Envoyer la réclamation", description: "", kind: "user_action", depends_on: ["s1"] },
  ],
});

async function plannedMission() {
  const user = await createTestUser();
  const m = await createMission(db, user.id, "Réclamer 180 € de frais injustifiés");
  await analyzeMission({ db, llm: new ScriptedProvider(() => textResult(JSON.stringify(plan))), capabilities: { webSearch: false, searchProvider: null } }, m.id, null);
  return { user, mission: m };
}

const executor = () =>
  new ScriptedProvider((req) => {
    const ids = planFromBriefing(req);
    return turn(req) === 0
      ? toolCallsResult([{ name: "update_step", input: { step_id: ids.s1, status: "done", result: "Dossier organisé." } }])
      : toolCallsResult([{ name: "finish_mission", input: { summary_markdown: "Prêt.", remaining_actions: [], limitations: [] } }]);
  });

async function paidSession(missionId: string, userId: string) {
  let form: URLSearchParams | null = null;
  const fakeStripe = (async (_url: string, init: RequestInit) => {
    form = init.body as URLSearchParams;
    return new Response(JSON.stringify({ id: "cs_test_1", url: "https://checkout.stripe.com/c/cs_test_1" }), { status: 200 });
  }) as unknown as typeof fetch;
  const res = await startCheckout(db, cfg, userId, missionId, fakeStripe);
  return { res, form: form! as URLSearchParams };
}

describe("billing configuration", () => {
  it("never charges without the seller's legal identity", () => {
    const base = { ATLAS_PRICE_CENTS: "1200", STRIPE_SECRET_KEY: "sk", STRIPE_WEBHOOK_SECRET: "wh", ATLAS_APP_URL: "https://a.example/" };
    expect(billingConfig(base)).toBeNull();
    // Success fee by default: no upfront price needed.
    expect(billingConfig({ ...base, ...legalEnv })).toMatchObject({ mode: "success", fee, appUrl: "https://a.example" });
    expect(billingConfig({ ...base, ...legalEnv, ATLAS_PRICE_CENTS: "0" })).toMatchObject({ mode: "success" });
    expect(billingConfig({ ...base, ...legalEnv, ATLAS_BILLING_MODE: "upfront" })).toMatchObject({ mode: "upfront", priceCents: 1200 });
    expect(billingConfig({ ...base, ...legalEnv, ATLAS_BILLING_MODE: "upfront", ATLAS_PRICE_CENTS: "0" })).toBeNull();
    expect(billingConfig({ ...base, ...legalEnv, ATLAS_SUCCESS_FEE_PCT: "25", ATLAS_SUCCESS_FEE_FLAT_CENTS: "900" })?.fee).toEqual({ ...fee, ratePct: 25, flatCents: 900 });
  });
});

describe("Stripe signatures", () => {
  const body = JSON.stringify({ type: "checkout.session.completed" });
  it("accepts a genuine signature and rejects tampering, replays and missing headers", () => {
    expect(verifyStripeSignature(body, signStripePayload(body, "whsec_test"), "whsec_test")).toBe(true);
    expect(verifyStripeSignature(`${body} `, signStripePayload(body, "whsec_test"), "whsec_test")).toBe(false);
    expect(verifyStripeSignature(body, signStripePayload(body, "autre"), "whsec_test")).toBe(false);
    expect(verifyStripeSignature(body, signStripePayload(body, "whsec_test", Math.floor(Date.now() / 1000) - 3600), "whsec_test")).toBe(false);
    expect(verifyStripeSignature(body, null, "whsec_test")).toBe(false);
  });
});

describe("paying for a dossier", () => {
  it("requires both consents", () => {
    expect(checkoutSchema.safeParse({ acceptTerms: true, immediateExecution: true }).success).toBe(true);
    expect(checkoutSchema.safeParse({ acceptTerms: true, immediateExecution: false }).success).toBe(false);
    expect(checkoutSchema.safeParse({}).success).toBe(false);
  });

  it("opens a checkout at the configured price for an analysed dossier and records the consent", async () => {
    const { user, mission } = await plannedMission();
    const { res, form } = await paidSession(mission.id, user.id);
    expect(res.url).toContain("checkout.stripe.com");
    expect(form.get("line_items[0][price_data][unit_amount]")).toBe("1200");
    expect(form.get("metadata[missionId]")).toBe(mission.id);
    expect(form.get("customer_email")).toBe(user.email);
    const [row] = await db.select().from(missions).where(eq(missions.id, mission.id));
    expect(row.payment).toMatchObject({ checkoutSessionId: "cs_test_1", termsVersion: "1", consentAt: expect.any(String) });
  });

  it("never takes money for a dossier Atlas said it cannot handle", async () => {
    const user = await createTestUser();
    const m = await createMission(db, user.id, "Organise ma semaine");
    const refused = analysis({ eligibility: { can_handle: false, reason: "Ce n'est pas un problème avec une organisation.", what_atlas_will_do: "" } });
    await analyzeMission({ db, llm: new ScriptedProvider(() => textResult(JSON.stringify(refused))), capabilities: { webSearch: false, searchProvider: null } }, m.id, null);
    await expect(paidSession(m.id, user.id)).rejects.toMatchObject({ status: 409, message: expect.stringContaining("pas un problème avec une organisation") });
    const [row] = await db.select().from(missions).where(eq(missions.id, m.id));
    expect(row.eligibility).toEqual({ canHandle: false, reason: "Ce n'est pas un problème avec une organisation.", whatAtlasWillDo: "" });
  });

  it("refuses to open a checkout before Atlas has said it can help", async () => {
    const user = await createTestUser();
    const m = await createMission(db, user.id, "Pas encore analysée");
    await expect(paidSession(m.id, user.id)).rejects.toMatchObject({ status: 409 });
  });

  it("marks the dossier paid only for its own session at the full price, once", async () => {
    const { user, mission } = await plannedMission();
    await paidSession(mission.id, user.id);
    const event = (over: Record<string, unknown> = {}) => ({
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_1", payment_status: "paid", amount_total: 1200, currency: "eur", metadata: { missionId: mission.id }, ...over } },
    });
    expect(await applyStripeEvent(db, cfg, event({ id: "cs_autre" }))).toBeNull();
    expect(await applyStripeEvent(db, cfg, event({ amount_total: 100 }))).toBeNull();
    expect(await applyStripeEvent(db, cfg, event({ payment_status: "unpaid" }))).toBeNull();
    expect(await applyStripeEvent(db, cfg, event())).toEqual({ missionId: mission.id, userId: user.id });
    expect(await applyStripeEvent(db, cfg, event())).toBeNull();
    const [row] = await db.select().from(missions).where(eq(missions.id, mission.id));
    expect(row.payment).toMatchObject({ paidAt: expect.any(String), amountCents: 1200, currency: "eur" });
  });

  it("does not let Atlas work on an unpaid dossier, and starts it right after payment", async () => {
    const { user, mission } = await plannedMission();
    const mailer = new FakeMailer();
    const deps = makeDeps(executor(), { requirePayment: true, mailer, appUrl: "https://atlas.example" });
    await expect(startExecution(deps, user.id, mission.id)).rejects.toMatchObject({ status: 402 });
    // The free analysis stays available.
    await expect(startAnalysis(makeDeps(new ScriptedProvider(() => textResult(JSON.stringify(plan))), { requirePayment: true }), user.id, mission.id).then((r) => r.done)).resolves.toBeUndefined();

    await paidSession(mission.id, user.id);
    await applyStripeEvent(db, cfg, {
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_1", payment_status: "paid", amount_total: 1200, currency: "eur", metadata: { missionId: mission.id } } },
    });
    await startPaidMission(deps, mission.id, user.id);

    const [row] = await db.select().from(missions).where(eq(missions.id, mission.id));
    expect(row.status).toBe("WAITING_FOR_USER");
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0]).toMatchObject({ to: user.email, subject: expect.stringContaining("Une action vous attend") });
    expect(mailer.sent[0].text).toContain(`https://atlas.example/app/missions/${mission.id}`);
    // The same situation is never notified twice.
    expect(await notifyUser(db, mailer, "https://atlas.example", mission.id)).toBeNull();
    expect(mailer.sent).toHaveLength(1);
  });

  it("rejects a webhook with a bad signature", async () => {
    const previous = { ...process.env };
    Object.assign(process.env, legalEnv, { ATLAS_PRICE_CENTS: "1200", STRIPE_SECRET_KEY: "sk", STRIPE_WEBHOOK_SECRET: "whsec_test", ATLAS_APP_URL: "https://a.example" });
    try {
      const body = JSON.stringify({ type: "checkout.session.completed", data: { object: {} } });
      const bad = await webhookRoute(new Request("http://localhost/api/payments/stripe-webhook", { method: "POST", body, headers: { "stripe-signature": "t=1,v1=00" } }));
      expect(bad.status).toBe(400);
      const good = await webhookRoute(
        new Request("http://localhost/api/payments/stripe-webhook", { method: "POST", body, headers: { "stripe-signature": signStripePayload(body, "whsec_test") } }),
      );
      expect(good.status).toBe(200);
    } finally {
      for (const k of Object.keys(process.env)) if (!(k in previous)) delete process.env[k];
      Object.assign(process.env, previous);
    }
  });
});

describe("success fee", () => {
  const success: BillingConfig = { ...cfg, mode: "success", priceCents: 0 };

  /** A fake Stripe API: records every call, answers from `replies` by path. */
  function fakeStripe(replies: Record<string, (form: URLSearchParams | null) => { status?: number; body: unknown }>) {
    const calls: { method: string; path: string; form: URLSearchParams | null }[] = [];
    const impl = (async (url: string, init: RequestInit) => {
      const path = url.replace("https://api.stripe.com/v1/", "");
      const form = (init.body as URLSearchParams | undefined) ?? null;
      calls.push({ method: init.method ?? "GET", path, form });
      const key = Object.keys(replies).find((k) => path.startsWith(k));
      if (!key) return new Response(JSON.stringify({ error: { message: `inattendu : ${path}` } }), { status: 400 });
      const r = replies[key](form);
      return new Response(JSON.stringify(r.body), { status: r.status ?? 200 });
    }) as unknown as typeof fetch;
    return { impl, calls };
  }

  const stripeOk = () =>
    fakeStripe({
      customers: () => ({ body: { id: "cus_1" } }),
      "checkout/sessions": (f) => ({ body: { id: f?.get("mode") === "setup" ? "cs_setup_1" : "cs_fee_1", url: "https://checkout.stripe.com/c/x" } }),
      "setup_intents/seti_1": () => ({ body: { id: "seti_1", payment_method: "pm_1" } }),
      payment_intents: () => ({ body: { id: "pi_1", status: "succeeded" } }),
    });

  const setupDone = (missionId: string) => ({
    type: "checkout.session.completed",
    data: { object: { id: "cs_setup_1", mode: "setup", status: "complete", setup_intent: "seti_1", customer: "cus_1", metadata: { missionId } } },
  });

  async function authorizedMission(stripe = stripeOk()) {
    const { user, mission } = await plannedMission();
    await startCheckout(db, success, user.id, mission.id, stripe.impl);
    expect(await applyStripeEvent(db, success, setupDone(mission.id), stripe.impl)).toEqual({ missionId: mission.id, userId: user.id });
    return { user, mission, stripe };
  }

  it("is a share of what was recovered, within bounds, or a flat fee", () => {
    expect(computeSuccessFee(fee, 18_000)).toBe(3000);
    expect(computeSuccessFee(fee, 10_000)).toBe(2000);
    expect(computeSuccessFee(fee, 1_000)).toBe(500);
    expect(computeSuccessFee(fee, 1_000_000)).toBe(3000);
    expect(computeSuccessFee(fee, 0)).toBe(500);
  });

  it("saves a card without charging it, then lets Atlas start", async () => {
    const { user, mission, stripe } = await authorizedMission();
    expect(stripe.calls.map((c) => c.path)).toEqual(["customers", "checkout/sessions", "setup_intents/seti_1"]);
    expect(stripe.calls[1].form?.get("mode")).toBe("setup");
    expect(stripe.calls[1].form?.get("customer")).toBe("cus_1");
    expect(stripe.calls.some((c) => c.path.startsWith("payment_intents"))).toBe(false);
    const [u] = await db.select().from(users).where(eq(users.id, user.id));
    expect(u).toMatchObject({ stripeCustomerId: "cus_1", stripePaymentMethodId: "pm_1", cardSavedAt: expect.any(Date) });
    const [row] = await db.select().from(missions).where(eq(missions.id, mission.id));
    expect(row.payment).toMatchObject({ authorizedAt: expect.any(String) });
    expect(row.payment?.paidAt).toBeUndefined();
    // Replays and foreign sessions change nothing.
    expect(await applyStripeEvent(db, success, setupDone(mission.id), stripe.impl)).toBeNull();
    const deps = makeDeps(executor(), { requirePayment: true });
    await expect(startExecution(deps, user.id, mission.id).then((r) => r.done)).resolves.toBeUndefined();
  });

  it("ignores a setup session that is not the dossier's own", async () => {
    const stripe = stripeOk();
    const { user, mission } = await plannedMission();
    await startCheckout(db, success, user.id, mission.id, stripe.impl);
    const other = setupDone(mission.id);
    other.data.object.id = "cs_autre";
    expect(await applyStripeEvent(db, success, other, stripe.impl)).toBeNull();
    const deps = makeDeps(executor(), { requirePayment: true });
    await expect(startExecution(deps, user.id, mission.id)).rejects.toMatchObject({ status: 402 });
  });

  it("starts the next dossier right away with the card already saved", async () => {
    const { user, stripe } = await authorizedMission();
    const m2 = await createMission(db, user.id, "Deuxième problème");
    await analyzeMission({ db, llm: new ScriptedProvider(() => textResult(JSON.stringify(plan))), capabilities: { webSearch: false, searchProvider: null } }, m2.id, null);
    const before = stripe.calls.length;
    expect(await startCheckout(db, success, user.id, m2.id, stripe.impl)).toEqual({ url: null, started: true });
    expect(stripe.calls.length).toBe(before);
    const [row] = await db.select().from(missions).where(eq(missions.id, m2.id));
    expect(row.payment).toMatchObject({ authorizedAt: expect.any(String) });
  });

  it("charges the fee once, only when the problem is solved, and closes the dossier", async () => {
    const { user, mission, stripe } = await authorizedMission();
    const result = await declareOutcome(db, success, user.id, mission.id, { resolved: true, recoveredEuros: 180 }, stripe.impl);
    expect(result.charge).toEqual({ feeCents: 3000, status: "charged", payUrl: null });
    const charge = stripe.calls.find((c) => c.path === "payment_intents")!;
    expect(charge.form?.get("amount")).toBe("3000");
    expect(charge.form?.get("off_session")).toBe("true");
    expect(charge.form?.get("payment_method")).toBe("pm_1");
    const [row] = await db.select().from(missions).where(eq(missions.id, mission.id));
    expect(row.outcome).toMatchObject({ resolved: true, recoveredCents: 18_000 });
    expect(row.payment).toMatchObject({ paidAt: expect.any(String), amountCents: 3000, feeDueCents: 3000, paymentIntentId: "pi_1" });
    expect(row.nextFollowUpAt).toBeNull();
    const steps = await db.select().from(missionSteps).where(eq(missionSteps.missionId, mission.id));
    expect(steps.every((s) => s.status === "DONE" || s.status === "SKIPPED")).toBe(true);
    // Never twice.
    await expect(declareOutcome(db, success, user.id, mission.id, { resolved: true, recoveredEuros: 180 }, stripe.impl)).rejects.toMatchObject({ status: 409 });
    expect(stripe.calls.filter((c) => c.path === "payment_intents")).toHaveLength(1);
    expect(await userResults(db, user.id)).toEqual({ resolvedCount: 1, recoveredCents: 18_000 });

    // The owner sees what this dossier brought in, and what free analyses cost.
    await db.insert(executionLogs).values({ missionId: mission.id, kind: "llm:execute", status: "ok", durationMs: 1, estimatedCostUsd: "1.000000" });
    const other = await createMission(db, user.id, "Analyse gratuite restée sans suite");
    await db.insert(executionLogs).values({ missionId: other.id, kind: "llm:analyze", status: "ok", durationMs: 1, estimatedCostUsd: "0.100000" });
    const e = await loadEconomics(db, null);
    expect(e).toMatchObject({ taken: 1, resolved: 1, revenueCents: 3000, aiTakenCents: 90, aiFreeCents: 9, recoveredCents: 18_000 });
    expect(e.marginCents).toBe(3000 - 70 - 90 - 9 - 630);
    expect((await loadEconomics(db, 30)).taken).toBe(1);
  });

  it("charges nothing when the dossier is closed without success", async () => {
    const { user, mission, stripe } = await authorizedMission();
    const result = await declareOutcome(db, success, user.id, mission.id, { resolved: false, recoveredEuros: 500 }, stripe.impl);
    expect(result.charge.status).toBe("none");
    expect(stripe.calls.some((c) => c.path === "payment_intents")).toBe(false);
    const [row] = await db.select().from(missions).where(eq(missions.id, mission.id));
    expect(row.outcome).toMatchObject({ resolved: false, recoveredCents: 0 });
    expect(await userResults(db, user.id)).toEqual({ resolvedCount: 0, recoveredCents: 0 });
  });

  it("sends a payment page when the bank asks for authentication, and records its payment", async () => {
    const stripe = stripeOk();
    const { user, mission } = await authorizedMission(stripe);
    const declined = fakeStripe({
      payment_intents: () => ({ status: 402, body: { error: { code: "authentication_required", message: "auth", payment_intent: { id: "pi_2" } } } }),
      "checkout/sessions": () => ({ body: { id: "cs_fee_1", url: "https://checkout.stripe.com/c/fee" } }),
    });
    const result = await declareOutcome(db, success, user.id, mission.id, { resolved: true }, declined.impl);
    expect(result.charge).toEqual({ feeCents: 500, status: "payment_page", payUrl: "https://checkout.stripe.com/c/fee" });
    const page = declined.calls.find((c) => c.path === "checkout/sessions")!;
    expect(page.form?.get("mode")).toBe("payment");
    expect(page.form?.get("metadata[kind]")).toBe("success_fee");
    expect(page.form?.get("line_items[0][price_data][unit_amount]")).toBe("500");
    let [row] = await db.select().from(missions).where(eq(missions.id, mission.id));
    expect(row.payment).toMatchObject({ feeDueCents: 500, payLinkUrl: "https://checkout.stripe.com/c/fee", failure: expect.stringContaining("validation") });
    expect(row.payment?.paidAt).toBeUndefined();

    const mailer = new FakeMailer();
    const { notifyFeePage } = await import("@/server/mail/notify");
    await notifyFeePage(db, mailer, mission.id);
    expect(mailer.sent[0].text).toContain("https://checkout.stripe.com/c/fee");
    expect(mailer.sent[0].text).toContain("5,00 €");

    const paidEvent = (over: Record<string, unknown> = {}) => ({
      type: "checkout.session.completed",
      data: { object: { id: "cs_fee_1", mode: "payment", payment_status: "paid", amount_total: 500, currency: "eur", metadata: { missionId: mission.id, kind: "success_fee" }, ...over } },
    });
    expect(await applyStripeEvent(db, success, paidEvent({ amount_total: 100 }))).toBeNull();
    [row] = await db.select().from(missions).where(eq(missions.id, mission.id));
    expect(row.payment?.paidAt).toBeUndefined();
    // Paying the fee never restarts the dossier.
    expect(await applyStripeEvent(db, success, paidEvent())).toBeNull();
    [row] = await db.select().from(missions).where(eq(missions.id, mission.id));
    expect(row.payment).toMatchObject({ paidAt: expect.any(String), amountCents: 500 });
    expect(row.payment?.payLinkUrl).toBeUndefined();
  });

  it("keeps the outcome even when Stripe is unreachable", async () => {
    const { user, mission } = await authorizedMission();
    const down = (async () => {
      throw new Error("réseau");
    }) as unknown as typeof fetch;
    const result = await declareOutcome(db, success, user.id, mission.id, { resolved: true, recoveredEuros: 40 }, down);
    expect(result.charge.status).toBe("failed");
    const [row] = await db.select().from(missions).where(eq(missions.id, mission.id));
    expect(row.outcome).toMatchObject({ resolved: true, recoveredCents: 4000 });
    expect(row.payment).toMatchObject({ feeDueCents: 800, failure: expect.any(String) });
  });

  it("an upfront payment is never counted as a success-mode authorisation, and vice versa", async () => {
    const { user, mission } = await plannedMission();
    await paidSession(mission.id, user.id);
    const event = {
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_1", payment_status: "paid", amount_total: 1200, currency: "eur", metadata: { missionId: mission.id } } },
    };
    expect(await applyStripeEvent(db, success, event)).toBeNull();
  });
});

describe("AI spend ceiling per dossier", () => {
  it("refuses new work once the dossier's budget is spent", async () => {
    const { user, mission } = await plannedMission();
    await db.insert(executionLogs).values({ missionId: mission.id, kind: "llm:execute", status: "ok", durationMs: 1, estimatedCostUsd: "3.100000" });
    const deps = makeDeps(executor(), { limits: { ...makeDeps(null).limits, maxMissionCostUsd: 3 } });
    await expect(startExecution(deps, user.id, mission.id)).rejects.toMatchObject({ status: 429 });
    await expect(startAnalysis(deps, user.id, mission.id)).rejects.toMatchObject({ status: 429 });
  });

  it("stops a run before it exceeds the budget", async () => {
    const { user, mission } = await plannedMission();
    let calls = 0;
    // Each call is priced like a real model: 100k input tokens at $5/M = $0.50.
    const pricey = new ScriptedProvider((req) => {
      calls++;
      const ids = planFromBriefing(req);
      const res = toolCallsResult([{ name: "update_step", input: { step_id: ids.s1, status: "in_progress" } }]);
      return { ...res, model: "claude-opus-5", usage: { inputTokens: 100_000, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 } };
    });
    const deps = makeDeps(pricey, { limits: { ...makeDeps(null).limits, maxMissionCostUsd: 1 } });
    await (await startExecution(deps, user.id, mission.id)).done;
    expect(calls).toBe(2);
    const events = await db.select().from(messages).where(eq(messages.missionId, mission.id));
    expect(events.some((m) => m.content.includes("Budget de traitement du dossier atteint"))).toBe(true);
  });
});
