import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import type { Db } from "@/db";
import { authTokens, sessions, users, type User } from "@/db/schema";
import type { Mailer } from "@/server/mail/mailer";
import { signupSchema } from "./auth";
import { badRequest } from "./errors";

type Purpose = "reset_password" | "verify_email";

const TTL_MS: Record<Purpose, number> = {
  reset_password: 60 * 60_000,
  verify_email: 48 * 60 * 60_000,
};

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

/** Issues a fresh single-use link token; earlier unused tokens of the same purpose stop working. */
async function issueToken(db: Db, userId: string, purpose: Purpose) {
  await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(authTokens.userId, userId), eq(authTokens.purpose, purpose), isNull(authTokens.usedAt)));
  const token = randomBytes(32).toString("base64url");
  await db.insert(authTokens).values({ id: hash(token), userId, purpose, expiresAt: new Date(Date.now() + TTL_MS[purpose]) });
  return token;
}

/** Marks a token used and returns its user, or null when unknown, expired or already used. */
async function consumeToken(db: Db, token: string, purpose: Purpose): Promise<User | null> {
  if (!token || token.length > 200) return null;
  const [row] = await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(authTokens.id, hash(token)), eq(authTokens.purpose, purpose), isNull(authTokens.usedAt), gt(authTokens.expiresAt, new Date())))
    .returning({ userId: authTokens.userId });
  if (!row) return null;
  return (await db.query.users.findFirst({ where: eq(users.id, row.userId) })) ?? null;
}

/**
 * Sends a reset link if the address has an account. Always resolves the same
 * way so the form never reveals which addresses are registered.
 */
export async function requestPasswordReset(db: Db, mailer: Mailer | null, appUrl: string | null, email: string) {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) return;
  const token = await issueToken(db, user.id, "reset_password");
  const link = `${appUrl ?? ""}/reinitialiser-mot-de-passe?jeton=${token}`;
  if (!mailer || !appUrl) {
    // No mail service configured: locally, print the link so the flow can be tested; never in production logs.
    if (process.env.NODE_ENV !== "production") console.info(`[nimbrel] lien de réinitialisation pour ${email} : ${link}`);
    return;
  }
  await mailer.send({
    to: user.email,
    subject: "Réinitialiser votre mot de passe Nimbrel",
    text: `Bonjour,\n\nPour choisir un nouveau mot de passe, ouvrez ce lien (valable une heure, une seule fois) :\n\n${link}\n\nSi vous n'avez rien demandé, ignorez ce message : votre mot de passe reste inchangé.\n\n— Nimbrel`,
  });
}

/** Sets a new password from a reset link and signs out every existing session. */
export async function resetPassword(db: Db, token: string, password: string) {
  const parsed = signupSchema.shape.password.safeParse(password);
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  const user = await consumeToken(db, token, "reset_password");
  if (!user) throw badRequest("Ce lien n'est plus valable. Demandez-en un nouveau.");
  // Receiving the link proves the address, so it counts as verified too.
  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(password, 12), emailVerifiedAt: user.emailVerifiedAt ?? new Date() })
    .where(eq(users.id, user.id));
  await db.delete(sessions).where(eq(sessions.userId, user.id));
  return user;
}

/** Sends (or re-sends) the address verification link. Returns false when no mail service is configured. */
export async function sendVerificationEmail(db: Db, mailer: Mailer | null, appUrl: string | null, user: User) {
  if (user.emailVerifiedAt) return true;
  const token = await issueToken(db, user.id, "verify_email");
  const link = `${appUrl ?? ""}/verifier-email?jeton=${token}`;
  if (!mailer || !appUrl) {
    if (process.env.NODE_ENV !== "production") console.info(`[nimbrel] lien de vérification pour ${user.email} : ${link}`);
    return false;
  }
  await mailer.send({
    to: user.email,
    subject: "Confirmez votre adresse e-mail",
    text: `Bienvenue sur Nimbrel.\n\nConfirmez votre adresse pour recevoir les nouvelles de vos dossiers (courrier prêt, réponse attendue, relance) :\n\n${link}\n\nCe lien est valable 48 heures.\n\n— Nimbrel`,
  });
  return true;
}

export async function verifyEmail(db: Db, token: string) {
  const user = await consumeToken(db, token, "verify_email");
  if (!user) return null;
  if (!user.emailVerifiedAt) await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, user.id));
  return user;
}
