import type { PostalAddress } from "@/db/schema";

export type PostalLetterInput = {
  sender: PostalAddress;
  recipient: PostalAddress;
  subject: string;
  /** Plain text; the provider is responsible for laying it out on the page. */
  bodyText: string;
  /** "lrar": paper registered letter with acknowledgement of receipt (the only mode Atlas offers today). */
  mode: "lrar";
};

export type PostalSendResult = { providerId: string; trackingUrl?: string };

/** A registered-mail provider, so a real one can be swapped in without touching the billing or UI logic. */
export interface PostalProvider {
  readonly name: string;
  send(input: PostalLetterInput): Promise<PostalSendResult>;
}
