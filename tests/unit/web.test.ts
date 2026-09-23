import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPageFetcher, htmlToText, isPrivateAddress } from "@/server/search/fetch-page";
import { markdownTableToCsv, markdownToDocx } from "@/server/artifacts/render";

describe("isPrivateAddress (SSRF guard)", () => {
  it.each(["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.10", "169.254.169.254", "0.0.0.0", "::1", "fd00::1", "::ffff:127.0.0.1", "100.64.0.1"])(
    "blocks %s",
    (ip) => expect(isPrivateAddress(ip)).toBe(true),
  );
  it.each(["8.8.8.8", "151.101.1.69", "2a00:1450:4007::64"])("allows %s", (ip) => expect(isPrivateAddress(ip)).toBe(false));
});

describe("htmlToText", () => {
  it("keeps readable content and drops scripts, styles and navigation", () => {
    const { title, text } = htmlToText(
      `<html><head><title>Tarifs &amp; offres</title><style>.a{}</style></head><body><nav>Menu</nav><h1>Déménageurs</h1><script>alert(1)</script><p>Prix : 450&nbsp;€</p><ul><li>Option A</li></ul></body></html>`,
    );
    expect(title).toBe("Tarifs & offres");
    expect(text).toContain("Déménageurs");
    expect(text).toContain("Prix : 450 €");
    expect(text).toContain("- Option A");
    expect(text).not.toContain("alert");
    expect(text).not.toContain("Menu");
  });
});

describe("createPageFetcher", () => {
  let server: http.Server;
  let base: string;
  beforeAll(async () => {
    server = http.createServer((req, res) => {
      if (req.url === "/redirect") {
        res.writeHead(302, { location: "/page" });
        return res.end();
      }
      if (req.url === "/binary") {
        res.writeHead(200, { "content-type": "image/png" });
        return res.end("x");
      }
      if (req.url === "/huge") {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        // ~3 MB of mostly whitespace: above the 2 MB download cap, but the
        // readable text stays far below the 60 000-character text cap, so
        // only the byte cap can mark this page as truncated.
        res.write("<title>Grande page</title><p>Début du contenu</p>");
        for (let i = 0; i < 3000; i++) res.write(" ".repeat(1000));
        return res.end("<p>Fin du contenu</p>");
      }
      if (req.url === "/page") {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        return res.end("<title>Test</title><p>Contenu réel</p>");
      }
      res.writeHead(404);
      res.end();
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(() => server.close());

  it("refuses private and local targets by default", async () => {
    const fetchPage = createPageFetcher();
    await expect(fetchPage(`${base}/page`)).rejects.toThrow(/Port non autorisé|interdite/);
    await expect(fetchPage("http://127.0.0.1/")).rejects.toThrow(/interdite/);
    await expect(fetchPage("http://localhost/")).rejects.toThrow(/interdit/);
    await expect(fetchPage("http://169.254.169.254/latest/meta-data")).rejects.toThrow(/interdite/);
    await expect(fetchPage("file:///etc/passwd")).rejects.toThrow(/http/);
    await expect(fetchPage("http://user:pw@example.com/")).rejects.toThrow(/identifiants/);
  });

  it("fetches real pages, follows redirects and rejects non-text content (local server)", async () => {
    const fetchPage = createPageFetcher({ allowPrivate: true });
    const page = await fetchPage(`${base}/redirect`);
    expect(page.url).toBe(`${base}/page`);
    expect(page.title).toBe("Test");
    expect(page.text).toContain("Contenu réel");
    await expect(fetchPage(`${base}/binary`)).rejects.toThrow(/non pris en charge/);
    await expect(fetchPage(`${base}/missing`)).rejects.toThrow(/404/);
    expect(page.truncated).toBe(false);
  });

  it("flags pages cut at the download cap as truncated instead of returning them as complete", async () => {
    const page = await createPageFetcher({ allowPrivate: true })(`${base}/huge`);
    expect(page.truncated).toBe(true);
    expect(page.text).toContain("Début du contenu");
    expect(page.text).not.toContain("Fin du contenu");
    expect(page.text.length).toBeLessThan(1000);
  });
});

describe("artifact rendering", () => {
  it("renders a real DOCX (zip) file", async () => {
    const buf = await markdownToDocx("Courrier", "# Objet\n\nMadame, Monsieur,\n\n- [ ] point\n\n| A | B |\n|---|---|\n| 1 | 2 |");
    expect(buf.subarray(0, 2).toString()).toBe("PK");
    expect(buf.length).toBeGreaterThan(1000);
  });
  it("exports the first markdown table as CSV and neutralises formulas", () => {
    const csv = markdownTableToCsv("Intro\n\n| Offre | Prix |\n|---|---|\n| **A** | 10 € |\n| =cmd() | 1;2 |\n");
    expect(csv).toBe(`Offre,Prix\nA,10 €\n'=cmd(),"1;2"\n`);
    expect(markdownTableToCsv("pas de tableau")).toBeNull();
  });
});
