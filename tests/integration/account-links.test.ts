/**
 * Password reset and address verification links: single use, expiring,
 * never revealing whether an address has an account.
 */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { authTokens, sessions, users } from "@/db/schema";
import { requestPasswordReset, resetPassword, sendVerificationEmail, verifyEmail } from "@/server/account-links";
import { createSession, createUser } from "@/server/auth";
import type { Mailer, MailMessage } from "@/server/mail/mailer";
import { db, resetDb } from "../helpers/db";

beforeEach(resetDb);

class FakeMailer implements Mailer {
  readonly name = "fake";
  sent: MailMessage[] = [];
  async send(msg: MailMessage) {
    this.sent.push(msg);
    return { id: String(this.sent.length) };
  }
}

const APP = "https://nimbrel.test";
const tokenFrom = (text: string, path: string) => new URL(text.match(new RegExp(`${APP}${path}\\?jeton=\\S+`))![0]).searchParams.get("jeton")!;

describe("password reset", () => {
  it("sends a link, sets the new password once, and signs out every session", async () => {
    const user = await createUser(db, { email: "reset@test.local", password: "ancien-mot-de-passe" });
    await createSession(db, user.id, 30);
    const mailer = new FakeMailer();

    await requestPasswordReset(db, mailer, APP, "reset@test.local");
    expect(mailer.sent).toHaveLength(1);
    const token = tokenFrom(mailer.sent[0].text, "/reinitialiser-mot-de-passe");

    await resetPassword(db, token, "nouveau-mot-de-passe");
    const after = await db.query.users.findFirst({ where: eq(users.id, user.id) });
    expect(await bcrypt.compare("nouveau-mot-de-passe", after!.passwordHash)).toBe(true);
    expect(after!.emailVerifiedAt).not.toBeNull();
    expect(await db.select().from(sessions).where(eq(sessions.userId, user.id))).toHaveLength(0);

    await expect(resetPassword(db, token, "encore-un-autre-mdp")).rejects.toThrow(/plus valable/);
  });

  it("stays silent for unknown addresses", async () => {
    const mailer = new FakeMailer();
    await requestPasswordReset(db, mailer, APP, "inconnu@test.local");
    expect(mailer.sent).toHaveLength(0);
  });

  it("refuses expired links and short passwords", async () => {
    await createUser(db, { email: "exp@test.local", password: "ancien-mot-de-passe" });
    const mailer = new FakeMailer();
    await requestPasswordReset(db, mailer, APP, "exp@test.local");
    const token = tokenFrom(mailer.sent[0].text, "/reinitialiser-mot-de-passe");

    await expect(resetPassword(db, token, "court")).rejects.toThrow(/10 caractères/);
    await db.update(authTokens).set({ expiresAt: new Date(Date.now() - 1000) });
    await expect(resetPassword(db, token, "nouveau-mot-de-passe")).rejects.toThrow(/plus valable/);
  });

  it("a new request invalidates the previous link", async () => {
    await createUser(db, { email: "two@test.local", password: "ancien-mot-de-passe" });
    const mailer = new FakeMailer();
    await requestPasswordReset(db, mailer, APP, "two@test.local");
    await requestPasswordReset(db, mailer, APP, "two@test.local");
    const first = tokenFrom(mailer.sent[0].text, "/reinitialiser-mot-de-passe");
    const second = tokenFrom(mailer.sent[1].text, "/reinitialiser-mot-de-passe");
    await expect(resetPassword(db, first, "nouveau-mot-de-passe")).rejects.toThrow(/plus valable/);
    await expect(resetPassword(db, second, "nouveau-mot-de-passe")).resolves.toBeTruthy();
  });
});

describe("address verification", () => {
  it("marks the address verified once, from the e-mailed link", async () => {
    const user = await createUser(db, { email: "verif@test.local", password: "un-mot-de-passe" });
    expect(user.emailVerifiedAt).toBeNull();
    const mailer = new FakeMailer();

    expect(await sendVerificationEmail(db, mailer, APP, user)).toBe(true);
    const token = tokenFrom(mailer.sent[0].text, "/verifier-email");
    expect((await verifyEmail(db, token))?.id).toBe(user.id);
    const after = await db.query.users.findFirst({ where: eq(users.id, user.id) });
    expect(after!.emailVerifiedAt).not.toBeNull();
    expect(await verifyEmail(db, token)).toBeNull();
  });

  it("reports when no mail service is configured", async () => {
    const user = await createUser(db, { email: "nomail@test.local", password: "un-mot-de-passe" });
    expect(await sendVerificationEmail(db, null, null, user)).toBe(false);
  });
});
