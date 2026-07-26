import { createHash } from "node:crypto";

/** Hash SHA-256 hexadécimal d'un document, pour preuve d'intégrité (§ signature). */
export function sha256Hex(donnees: Uint8Array): string {
  return createHash("sha256").update(donnees).digest("hex");
}
