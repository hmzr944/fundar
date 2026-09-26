/**
 * E-mails to Atlas' own users (notifications about their dossier). Atlas
 * never e-mails third parties: the user sends those messages themselves.
 */
export type MailMessage = { to: string; subject: string; text: string };

export interface Mailer {
  readonly name: string;
  send(msg: MailMessage): Promise<{ id: string | null }>;
}

export class MailError extends Error {}

/** Resend (https://resend.com) over its HTTPS API. */
export class ResendMailer implements Mailer {
  readonly name = "resend";
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async send(msg: MailMessage) {
    let res: Response;
    try {
      res = await this.fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${this.apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({ from: this.from, to: [msg.to], subject: msg.subject, text: msg.text }),
      });
    } catch {
      throw new MailError("Service d'e-mail injoignable.");
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) throw new MailError(`Envoi refusé par le service d'e-mail${data.message ? ` : ${data.message}` : "."}`);
    return { id: data.id ?? null };
  }
}

export function mailerFromEnv(env: Record<string, string | undefined> = process.env): Mailer | null {
  const key = env.RESEND_API_KEY?.trim();
  const from = env.ATLAS_MAIL_FROM?.trim();
  return key && from ? new ResendMailer(key, from) : null;
}
