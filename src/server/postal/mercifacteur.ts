import { createHmac } from "node:crypto";
import type { PostalAddress } from "@/db/schema";
import type { PostalLetterInput, PostalProvider, PostalSendResult } from "./provider";

/**
 * Merci Facteur ("Merci-facteur-API" on GitHub) sends physical mail, LRAR
 * included, through La Poste. Built from their public documentation
 * (github.com/MerciFacteur/Merci-facteur-API, merci-facteur.com/api/1.2/doc.php),
 * fetched during this session — **not tried against a real account**: no
 * credentials were available to test it. Before relying on it, send one real
 * letter to yourself and read the response Merci Facteur actually returns;
 * the exact string signed for `ww-service-signature` in particular could not
 * be confirmed and may need adjusting (their support can confirm it).
 */
export class MerciFacteurProvider implements PostalProvider {
  readonly name = "mercifacteur";
  private readonly baseUrl = "https://www.merci-facteur.com/api/1.2/prod/service";

  constructor(
    private readonly serviceId: string,
    private readonly secret: string,
    private readonly authorizedIp: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  private async getToken(): Promise<string> {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = createHmac("sha256", this.secret).update(`${this.serviceId}${timestamp}`).digest("hex");
    const res = await this.fetchImpl(`${this.baseUrl}/getToken`, {
      method: "POST",
      headers: {
        "ww-service-id": this.serviceId,
        "ww-service-signature": signature,
        "ww-timestamp": timestamp,
        "ww-authorized-ip": this.authorizedIp,
      },
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean; token?: string; error?: string };
    if (!res.ok || !data.success || !data.token) throw new Error(`Merci Facteur (jeton) : ${data.error ?? res.statusText}`);
    return data.token;
  }

  private static formatAddress(a: PostalAddress) {
    return { nom: a.name, adresse1: a.address1, adresse2: a.address2 ?? "", cp: a.postalCode, ville: a.city, pays: a.country };
  }

  async send(input: PostalLetterInput): Promise<PostalSendResult> {
    const token = await this.getToken();
    const body = new URLSearchParams({
      data: JSON.stringify({
        adress: { exp: MerciFacteurProvider.formatAddress(input.sender), dest: [MerciFacteurProvider.formatAddress(input.recipient)] },
        content: { texte: `${input.subject}\n\n${input.bodyText}` },
        mode_envoi: input.mode, // "lrar": recommandé papier avec accusé de réception
      }),
    });
    const res = await this.fetchImpl(`${this.baseUrl}/sendCourrier`, {
      method: "POST",
      headers: { "ww-service-id": this.serviceId, "ww-access-token": token, "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean; id?: string; error?: string; tracking_url?: string };
    if (!res.ok || !data.success) throw new Error(`Merci Facteur (envoi) : ${data.error ?? res.statusText}`);
    return { providerId: data.id ?? "inconnu", trackingUrl: data.tracking_url };
  }
}
