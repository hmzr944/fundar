import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, lt } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/db";
import { sessions, users, type User } from "@/db/schema";
import { AppError, badRequest } from "./errors";

export const SESSION_COOKIE = "atlas_session";

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide.").max(254),
  password: z
    .string()
    .min(10, "Le mot de passe doit contenir au moins 10 caractères.")
    .max(200, "Mot de passe trop long."),
  name: z.string().trim().max(80).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide.").max(254),
  password: z.string().min(1, "Mot de passe requis.").max(200),
});

export type PublicUser = Pick<User, "id" | "email" | "name" | "createdAt">;

export function toPublicUser(u: User): PublicUser {
  return { id: u.id, email: u.email, name: u.name, createdAt: u.createdAt };
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createUser(db: Db, input: z.infer<typeof signupSchema>): Promise<User> {
  const existing = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  if (existing) throw new AppError(409, "Un compte existe déjà avec cette adresse.", "email_taken");
  const passwordHash = await bcrypt.hash(input.password, 12);
  const [user] = await db
    .insert(users)
    .values({ email: input.email, name: input.name || null, passwordHash })
    .returning();
  return user;
}

// Pre-computed hash so that unknown e-mails take as long as wrong passwords.
const DUMMY_HASH = bcrypt.hashSync("atlas-dummy-password", 12);

export async function verifyCredentials(db: Db, input: z.infer<typeof loginSchema>): Promise<User> {
  const user = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  const ok = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw new AppError(401, "E-mail ou mot de passe incorrect.", "invalid_credentials");
  return user;
}

export async function createSession(db: Db, userId: string, days: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + days * 86_400_000);
  await db.insert(sessions).values({ id: hashToken(token), userId, expiresAt });
  // Opportunistic cleanup of this user's expired sessions.
  await db.delete(sessions).where(and(eq(sessions.userId, userId), lt(sessions.expiresAt, new Date())));
  return { token, expiresAt };
}

export async function validateSessionToken(db: Db, token: string | undefined | null): Promise<User | null> {
  if (!token || token.length > 200) return null;
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.user ?? null;
}

export async function destroySession(db: Db, token: string | undefined | null) {
  if (!token) return;
  await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
}

export async function changePassword(db: Db, userId: string, current: string, next: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
    throw badRequest("Mot de passe actuel incorrect.");
  }
  const parsed = signupSchema.shape.password.safeParse(next);
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  await db.update(users).set({ passwordHash: await bcrypt.hash(next, 12) }).where(eq(users.id, userId));
  // Invalidate every other session.
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/** Tiny in-memory limiter for authentication attempts (per process). */
const attempts = new Map<string, { count: number; resetAt: number }>();
export function checkAuthRateLimit(key: string, max = 10, windowMs = 15 * 60_000) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  entry.count += 1;
  if (entry.count > max) {
    throw new AppError(429, "Trop de tentatives. Réessayez dans quelques minutes.", "rate_limited");
  }
}
