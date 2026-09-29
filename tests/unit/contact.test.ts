import { describe, expect, it } from "vitest";
import { contactSchema, sendContactMessage } from "@/server/contact";
import type { Mailer, MailMessage } from "@/server/mail/mailer";

class FakeMailer implements Mailer {
  readonly name = "fake";
  sent: MailMessage[] = [];
  async send(msg: MailMessage) {
    this.sent.push(msg);
    return { id: "1" };
  }
}

const valid = { email: "Client@Test.local", topic: "paiement", message: "Bonjour, une question sur ma facture." };

describe("contact form", () => {
  it("forwards to the inbox with Reply-To set to the sender and no user text in the subject", async () => {
    const mailer = new FakeMailer();
    await sendContactMessage(mailer, "hello@nimbrel.test", contactSchema.parse({ ...valid, name: "Inès" }), "compte@test.local");
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0]).toMatchObject({ to: "hello@nimbrel.test", replyTo: "client@test.local", subject: "[Contact Nimbrel] Un paiement ou une facture" });
    expect(mailer.sent[0].text).toContain("Compte connecté : compte@test.local");
  });

  it("drops honeypot submissions silently", async () => {
    const mailer = new FakeMailer();
    expect(await sendContactMessage(mailer, "hello@nimbrel.test", contactSchema.parse({ ...valid, website: "http://spam" }))).toEqual({ sent: false });
    expect(mailer.sent).toHaveLength(0);
  });

  it("refuses unknown topics, short messages, and says when no inbox is configured", async () => {
    expect(contactSchema.safeParse({ ...valid, topic: "x" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, message: "court" }).success).toBe(false);
    await expect(sendContactMessage(null, "hello@nimbrel.test", contactSchema.parse(valid))).rejects.toThrow(/pas encore relié/);
  });
});
