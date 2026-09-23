import "server-only";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { getDb } from "@/db";
import type { User } from "@/db/schema";
import { SESSION_COOKIE, validateSessionToken } from "@/server/auth";
import { AppError, badRequest, unauthorized } from "@/server/errors";

export async function currentUser(): Promise<User | null> {
  const store = await cookies();
  return validateSessionToken(getDb(), store.get(SESSION_COOKIE)?.value);
}

export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) throw unauthorized();
  return user;
}

/**
 * CSRF defence for cookie-authenticated mutations: the Origin (or Referer)
 * must match the host serving the request. SameSite=Lax cookies add a second layer.
 */
export async function assertSameOrigin(req: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const origin = h.get("origin") ?? h.get("referer");
  if (!origin || !host) throw new AppError(403, "Requête refusée (origine manquante).", "bad_origin");
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AppError(403, "Requête refusée (origine invalide).", "bad_origin");
  }
  if (originHost !== host) throw new AppError(403, "Requête refusée (origine différente).", "bad_origin");
}

export async function parseJson<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw badRequest("Corps de requête JSON invalide.");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Données invalides.");
  return parsed.data;
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Uniform error handling: known errors become JSON, unknown ones are logged and hidden. */
export function route<C>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      await assertSameOrigin(req);
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof AppError) {
        return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
      }
      if (e instanceof ZodError) {
        return NextResponse.json({ error: e.issues[0]?.message ?? "Données invalides.", code: "bad_request" }, { status: 400 });
      }
      console.error("[atlas] unhandled route error", e);
      return NextResponse.json({ error: "Erreur interne. Réessayez plus tard.", code: "internal" }, { status: 500 });
    }
  };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function clientKey(extra: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "local";
  return `${ip}:${extra}`;
}
