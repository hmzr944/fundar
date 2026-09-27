import { legalIdentity } from "@/server/billing/stripe";
import { MerciFacteurProvider } from "./mercifacteur";
import type { PostalProvider } from "./provider";

export type PostalConfig = { priceCents: number };

/** LRAR is active only when a provider's credentials, a price and the seller's legal identity are all present. */
export function postalConfig(env: Record<string, string | undefined> = process.env): PostalConfig | null {
  const priceCents = Number(env.ATLAS_LRAR_PRICE_CENTS ?? 0);
  if (!Number.isInteger(priceCents) || priceCents <= 0) return null;
  if (!buildPostalProvider(env)) return null;
  if (!legalIdentity(env).complete) return null;
  return { priceCents };
}

/** The configured provider, or null (LRAR then stays off, whatever the price setting). */
export function buildPostalProvider(env: Record<string, string | undefined> = process.env): PostalProvider | null {
  const serviceId = env.MERCIFACTEUR_SERVICE_ID?.trim();
  const secret = env.MERCIFACTEUR_SECRET?.trim();
  const ip = env.MERCIFACTEUR_AUTHORIZED_IP?.trim();
  if (serviceId && secret && ip) return new MerciFacteurProvider(serviceId, secret, ip);
  return null;
}
