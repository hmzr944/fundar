/**
 * Registered letters (LRAR): a paid add-on, independent of the success fee —
 * it costs money to send whatever the dispute's outcome, so it's charged
 * upfront. The real postal provider is untested here (no live credentials);
 * a scripted double stands in, same as the LLM and mailer elsewhere.
 */
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { artifacts, messages, postalLetters, users } from "@/db/schema";
import type { PostalLetterInput, PostalProvider, PostalSendResult } from "@/server/postal/provider";
import { postalConfig } from "@/server/postal/config";
import { applyLrarCheckout, postalAddressSchema, requestLrar, sendLetter, setPostalAddress } from "@/server/postal/service";
import type { BillingConfig } from "@/server/billing/stripe";
import type { Mailer, MailMessage } from "@/server/mail/mailer";
import { createMission } from "@/server/missions/service";
import { createTestUser, db, resetDb } from "../helpers/db";

beforeEach(resetDb);

const legalEnv = {
  ATLAS_LEGAL_NAME: "Atlas EI",
  ATLAS_LEGAL_SIRET: "123 456 789 00010",
  ATLAS_LEGAL_ADDRESS: "1 rue de Paris, 75001 Paris",
  ATLAS_LEGAL_EMAIL: "contact@atlas.example",
  ATLAS_LEGAL_HOST: "Hébergeur SAS, Paris",
  ATLAS_LEGAL_MEDIATOR: "Médiateur X — mediateur.example",
};

const cfg: BillingConfig = {
  mode: "upfront",
  fee: { ratePct: 20, minCents: 500, maxCents: 3000, flatCents: 500, tier2RatePct: 10, tier2CapCents: 15_000 },
  priceCents: 1200,
  currency: "eur",
  secretKey: "sk_test_x",
  webhookSecret: "whsec_test",
  appUrl: "https://atlas.example",
  termsVersion: "1",
  plus: null,
  referralCreditCents: 0,
};
const postal = { priceCents: 890 };

const senderAddress = { name: "Alice Dupont", address1: "1 rue de la Paix", postalCode: "75002", city: "Paris", country: "France" };
const recipientAddress = { name: "SAV Opérateur", address1: "10 avenue des Champs", postalCode: "75008", city: "Paris", country: "France" };

class FakeMailer implements Mailer {
  readonly name = "fake";
  sent: MailMessage[] = [];
  async send(msg: MailMessage) {
    this.sent.push(msg);
    return { id: `m${this.sent.length}` };
  }
}

class ScriptedPostalProvider implements PostalProvider {
  readonly name = "scripted";
  calls: PostalLetterInput[] = [];
  constructor(private readonly result: PostalSendResult | Error) {}
  async send(input: PostalLetterInput) {
    this.calls.push(input);
    if (this.result instanceof Error) throw this.result;
    return this.result;
  }
}

function fakeStripe(replies: Record<string, (form: URLSearchParams | null) => { status?: number; body: unknown }>) {
  const calls: { path: string; form: URLSearchParams | null }[] = [];
  const impl = (async (url: string, init: RequestInit) => {
    const path = url.replace("https://api.stripe.com/v1/", "");
    const form = (init.body as URLSearchParams | undefined) ?? null;
    calls.push({ path, form });
    const key = Object.keys(replies).find((k) => path.startsWith(k));
    if (!key) return new Response(JSON.stringify({ error: { message: `inattendu : ${path}` } }), { status: 400 });
    const r = replies[key](form);
    return new Response(JSON.stringify(r.body), { status: r.status ?? 200 });
  }) as unknown as typeof fetch;
  return { impl, calls };
}

async function readyArtifact(userId: string) {
  const mission = await createMission(db, userId, "Réclamation à l'opérateur");
  const [art] = await db
    .insert(artifacts)
    .values({
      missionId: mission.id,
      type: "letter",
      name: "Mise en demeure",
      content: "Corps du courrier, sans champ à compléter.",
      metadata: { review: { status: "done", verdict: "ok", issues: [] } },
    })
    .returning();
  return { mission, artifact: art };
}

describe("registered letters (LRAR)", () => {
  it("is off unless a provider, a price and the seller's legal identity are all set", () => {
    const base = { ATLAS_LRAR_PRICE_CENTS: "890" };
    expect(postalConfig(base)).toBeNull();
    expect(postalConfig({ ...base, ...legalEnv })).toBeNull(); // no provider credentials
    const withProvider = { ...base, ...legalEnv, MERCIFACTEUR_SERVICE_ID: "s1", MERCIFACTEUR_SECRET: "sec", MERCIFACTEUR_AUTHORIZED_IP: "1.2.3.4" };
    expect(postalConfig(withProvider)).toEqual({ priceCents: 890 });
    expect(postalConfig({ ...withProvider, ATLAS_LRAR_PRICE_CENTS: "0" })).toBeNull();
  });

  it("validates a postal address and saves it as the sender's return address", async () => {
    const user = await createTestUser();
    expect(postalAddressSchema.safeParse({ ...senderAddress, postalCode: "" }).success).toBe(false);
    await setPostalAddress(db, user.id, senderAddress);
    const [row] = await db.select().from(users).where(eq(users.id, user.id));
    expect(row.postalAddress).toEqual(senderAddress);
  });

  it("refuses a letter for a deliverable that isn't ready to send, or a sender with no address on file", async () => {
    const user = await createTestUser();
    const mission = await createMission(db, user.id, "Un problème");
    const [notReady] = await db.insert(artifacts).values({ missionId: mission.id, type: "letter", name: "Brouillon", content: "…" }).returning();
    await setPostalAddress(db, user.id, senderAddress);
    await expect(requestLrar(db, cfg, postal, user.id, notReady.id, recipientAddress)).rejects.toMatchObject({ status: 409 });

    const { artifact } = await readyArtifact(user.id);
    const other = await createTestUser();
    await expect(requestLrar(db, cfg, postal, other.id, artifact.id, recipientAddress)).rejects.toMatchObject({ status: 404 }); // not their artifact... but no address either
  });

  it("requires a sender address before opening checkout", async () => {
    const user = await createTestUser();
    const { artifact } = await readyArtifact(user.id);
    await expect(requestLrar(db, cfg, postal, user.id, artifact.id, recipientAddress)).rejects.toMatchObject({ status: 409, code: "postal_address_missing" });
  });

  it("opens a checkout at the configured price, then charges and sends only once paid", async () => {
    const user = await createTestUser();
    await setPostalAddress(db, user.id, senderAddress);
    const { mission, artifact } = await readyArtifact(user.id);
    const stripe = fakeStripe({ "checkout/sessions": () => ({ body: { id: "cs_lrar_1", url: "https://checkout.stripe.com/c/lrar" } }) });

    const { url } = await requestLrar(db, cfg, postal, user.id, artifact.id, recipientAddress, stripe.impl);
    expect(url).toBe("https://checkout.stripe.com/c/lrar");
    expect(stripe.calls[0].form?.get("line_items[0][price_data][unit_amount]")).toBe("890");
    expect(stripe.calls[0].form?.get("metadata[kind]")).toBe("lrar");
    let [row] = await db.select().from(postalLetters).where(eq(postalLetters.artifactId, artifact.id));
    expect(row).toMatchObject({ status: "PENDING_PAYMENT", checkoutSessionId: "cs_lrar_1", priceCents: 890 });

    // A second request is refused while one is already in flight.
    await expect(requestLrar(db, cfg, postal, user.id, artifact.id, recipientAddress, stripe.impl)).rejects.toMatchObject({ status: 409 });

    const session = { id: "cs_lrar_1", payment_status: "paid", amount_total: 890, currency: "eur", metadata: { kind: "lrar" } };
    // Wrong amount or a foreign event changes nothing.
    expect(await applyLrarCheckout(db, cfg, { ...session, amount_total: 100 })).toBeNull();
    expect(await applyLrarCheckout(db, cfg, { ...session, id: "cs_autre" })).toBeNull();
    const letterId = await applyLrarCheckout(db, cfg, session);
    expect(letterId).toBe(row.id);
    expect(await applyLrarCheckout(db, cfg, session)).toBeNull(); // idempotent
    [row] = await db.select().from(postalLetters).where(eq(postalLetters.id, row.id));
    expect(row).toMatchObject({ status: "PAID", paidAt: expect.any(Date) });

    const provider = new ScriptedPostalProvider({ providerId: "mf-1", trackingUrl: "https://track.example/mf-1" });
    const mailer = new FakeMailer();
    await sendLetter(db, provider, mailer, letterId!);
    [row] = await db.select().from(postalLetters).where(eq(postalLetters.id, row.id));
    expect(row).toMatchObject({ status: "SENT", providerId: "mf-1", trackingUrl: "https://track.example/mf-1" });
    expect(provider.calls[0]).toMatchObject({ sender: senderAddress, recipient: recipientAddress, mode: "lrar" });
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0]).toMatchObject({ to: user.email, subject: expect.stringContaining("envoyée") });
    const evts = await db.select().from(messages).where(eq(messages.missionId, mission.id));
    expect(evts.some((m) => m.metadata?.kind === "lrar_sent")).toBe(true);
  });

  it("records a failure without losing the client's money, and never sends without a provider configured", async () => {
    const user = await createTestUser();
    await setPostalAddress(db, user.id, senderAddress);
    const { mission, artifact } = await readyArtifact(user.id);
    const [letter] = await db
      .insert(postalLetters)
      .values({ missionId: mission.id, artifactId: artifact.id, userId: user.id, recipientAddress, priceCents: 890, status: "PAID" })
      .returning();

    await sendLetter(db, null, null, letter.id);
    let [row] = await db.select().from(postalLetters).where(eq(postalLetters.id, letter.id));
    expect(row).toMatchObject({ status: "FAILED", failure: expect.stringContaining("prestataire") });

    await db.update(postalLetters).set({ status: "PAID", failure: null }).where(eq(postalLetters.id, letter.id));
    const failing = new ScriptedPostalProvider(new Error("La Poste indisponible"));
    await sendLetter(db, failing, null, letter.id);
    [row] = await db.select().from(postalLetters).where(eq(postalLetters.id, letter.id));
    expect(row).toMatchObject({ status: "FAILED", failure: "La Poste indisponible" });
    const evts = await db.select().from(messages).where(eq(messages.missionId, mission.id));
    expect(evts.some((m) => m.metadata?.kind === "lrar_failed")).toBe(true);
  });
});
