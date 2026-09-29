import { z } from "zod";
import { unavailable } from "@/server/errors";
import type { Mailer } from "@/server/mail/mailer";

export const CONTACT_TOPICS = {
  question: "Une question sur le service",
  dossier: "Un dossier en cours",
  paiement: "Un paiement ou une facture",
  donnees: "Mes données personnelles",
  autre: "Autre chose",
} as const;

export const contactSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide.").max(254),
  topic: z.enum(Object.keys(CONTACT_TOPICS) as [keyof typeof CONTACT_TOPICS, ...(keyof typeof CONTACT_TOPICS)[]]),
  message: z.string().trim().min(10, "Votre message est un peu court (10 caractères minimum).").max(4000, "Votre message est trop long (4 000 caractères maximum)."),
  /** Honeypot: hidden from people, filled by naive bots. */
  website: z.string().max(200).optional().default(""),
});
export type ContactInput = z.infer<typeof contactSchema>;

/**
 * Forwards a contact-form message to the operator's inbox, with Reply-To set
 * to the sender so answering is one click. Bot submissions are dropped
 * silently (they get the same success answer).
 */
export async function sendContactMessage(mailer: Mailer | null, inbox: string | null, input: ContactInput, accountEmail?: string | null) {
  if (input.website) return { sent: false as const };
  if (!mailer || !inbox) throw unavailable("Le formulaire n'est pas encore relié à une boîte mail. Écrivez-nous directement par e-mail.");
  const lines = [
    `De : ${input.name ? `${input.name} <${input.email}>` : input.email}`,
    accountEmail ? `Compte connecté : ${accountEmail}` : "Envoyé sans être connecté.",
    `Sujet : ${CONTACT_TOPICS[input.topic]}`,
    "",
    input.message,
  ];
  // Subject is built from fixed labels only: no user text in headers.
  await mailer.send({ to: inbox, subject: `[Contact Nimbrel] ${CONTACT_TOPICS[input.topic]}`, text: lines.join("\n"), replyTo: input.email });
  return { sent: true as const };
}
