import { lookup as dnsLookup } from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import type { LookupFunction } from "node:net";

export type FetchedPage = { url: string; title: string | null; text: string; truncated: boolean };

export class FetchPageError extends Error {}

export type PageFetcher = (url: string, opts?: { signal?: AbortSignal }) => Promise<FetchedPage>;

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_TEXT = 60_000;
const TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 4;

/** True for addresses a server-side fetch must never reach (SSRF protection). */
export function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  if (v6 === "::" || v6 === "::1") return true;
  if (v6.startsWith("::ffff:")) return isPrivateAddress(v6.slice(7));
  return v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80") || v6.startsWith("ff");
}

/** DNS lookup that refuses private addresses at connection time (no TOCTOU gap). */
const guardedLookup: LookupFunction = (hostname, options, callback) => {
  dnsLookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, "", 0);
    const list = addresses as unknown as { address: string; family: number }[];
    const bad = list.find((a) => isPrivateAddress(a.address));
    if (bad || list.length === 0) {
      return callback(new FetchPageError("Adresse réseau interdite (réseau privé ou local)."), "", 0);
    }
    if ((options as { all?: boolean }).all) return (callback as unknown as (e: null, a: typeof list) => void)(null, list);
    callback(null, list[0].address, list[0].family);
  });
};

function decodeEntities(s: string) {
  const named: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", eacute: "é", egrave: "è", agrave: "à", ccedil: "ç", ecirc: "ê", ocirc: "ô", euro: "€" };
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => named[n.toLowerCase()] ?? m);
}

/** Readable text from HTML: drops scripts, styles, navigation and markup. */
export function htmlToText(html: string): { title: string | null; text: string } {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const body = html
    .replace(/<(script|style|noscript|svg|nav|footer|header|form|iframe|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section|\/article)[^>]*>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<t[dh][^>]*>/gi, " | ")
    .replace(/<[^>]+>/g, " ");
  const text = decodeEntities(body)
    .split("\n")
    .map((l) => l.replace(/[ \t ]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
  return { title: title ? decodeEntities(title).replace(/\s+/g, " ").trim() : null, text };
}

function requestOnce(url: URL, allowPrivate: boolean, signal?: AbortSignal) {
  return new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer; truncated: boolean }>((resolve, reject) => {
    const mod = url.protocol === "https:" ? https : http;
    const req = mod.request(
      url,
      {
        method: "GET",
        lookup: allowPrivate ? undefined : guardedLookup,
        headers: {
          "user-agent": "AtlasAgent/0.1 (+personal assistant; respects robots via provider)",
          accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
          "accept-language": "fr-FR,fr;q=0.9,en;q=0.6",
        },
        timeout: TIMEOUT_MS,
        signal,
      },
      (res) => {
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (c: Buffer) => {
          size += c.length;
          if (size > MAX_BYTES) {
            // Too large: stop downloading and flag the body as partial so the
            // caller never presents it as the complete page.
            req.destroy();
            resolve({ status: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(chunks), truncated: true });
            return;
          }
          chunks.push(c);
        });
        res.on("end", () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(chunks), truncated: false }));
        res.on("error", reject);
      },
    );
    req.on("timeout", () => req.destroy(new FetchPageError("Délai dépassé lors du chargement de la page.")));
    req.on("error", reject);
    req.end();
  });
}

/**
 * Fetches a public web page and returns its readable text. Only http(s) on
 * standard ports, private networks are refused, redirects are re-validated.
 */
export function createPageFetcher(opts: { allowPrivate?: boolean } = {}): PageFetcher {
  return async (rawUrl, { signal } = {}) => {
    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      throw new FetchPageError("URL invalide.");
    }
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new FetchPageError("Seules les URL http(s) sont autorisées.");
      if (url.username || url.password) throw new FetchPageError("Les URL avec identifiants sont refusées.");
      if (!opts.allowPrivate) {
        if (url.port && url.port !== "80" && url.port !== "443") throw new FetchPageError("Port non autorisé.");
        if (net.isIP(url.hostname.replace(/^\[|\]$/g, "")) && isPrivateAddress(url.hostname.replace(/^\[|\]$/g, ""))) {
          throw new FetchPageError("Adresse réseau interdite (réseau privé ou local).");
        }
        if (/^(localhost|.*\.local|.*\.internal)$/i.test(url.hostname)) throw new FetchPageError("Hôte interdit.");
      }
      let res;
      try {
        res = await requestOnce(url, Boolean(opts.allowPrivate), signal);
      } catch (e) {
        if (e instanceof FetchPageError) throw e;
        throw new FetchPageError(`Page inaccessible : ${(e as Error).message}`);
      }
      if (res.status >= 300 && res.status < 400 && res.headers.location) {
        url = new URL(res.headers.location, url);
        continue;
      }
      if (res.status >= 400) throw new FetchPageError(`La page a répondu avec le code ${res.status}.`);
      const type = String(res.headers["content-type"] ?? "");
      const raw = res.body.toString("utf-8");
      let title: string | null = null;
      let text: string;
      if (/html|xml/i.test(type) || /^\s*</.test(raw)) {
        ({ title, text } = htmlToText(raw));
      } else if (/^text\//i.test(type) || type === "") {
        text = raw;
      } else {
        throw new FetchPageError(`Type de contenu non pris en charge (${type.split(";")[0]}).`);
      }
      if (!text.trim()) throw new FetchPageError("La page ne contient pas de texte lisible (contenu probablement généré en JavaScript).");
      return { url: url.toString(), title, text: text.slice(0, MAX_TEXT), truncated: res.truncated || text.length > MAX_TEXT };
    }
    throw new FetchPageError("Trop de redirections.");
  };
}
