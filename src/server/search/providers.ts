export type SearchResult = {
  url: string;
  title: string;
  snippet: string;
  publishedAt?: string | null;
};

export interface SearchProvider {
  readonly name: string;
  search(query: string, opts: { maxResults: number; signal?: AbortSignal }): Promise<SearchResult[]>;
}

export class SearchError extends Error {
  constructor(message: string, public readonly retryable: boolean) {
    super(message);
  }
}

async function httpError(res: Response, provider: string): Promise<never> {
  if (res.status === 401) throw new SearchError(`Clé ${provider} invalide ou refusée.`, false);
  // A 403 can also come from a proxy or firewall in front of the service: do not blame the key.
  if (res.status === 403) {
    throw new SearchError(`Accès à ${provider} refusé (clé sans droits, ou réseau/proxy qui bloque le service).`, false);
  }
  if (res.status === 429) throw new SearchError(`Quota ou limite de débit ${provider} atteint.`, true);
  throw new SearchError(`Le service de recherche ${provider} a répondu ${res.status}.`, res.status >= 500);
}

/** https://docs.tavily.com — POST /search */
export class TavilySearch implements SearchProvider {
  readonly name = "tavily";
  constructor(private readonly apiKey: string) {}

  async search(query: string, opts: { maxResults: number; signal?: AbortSignal }): Promise<SearchResult[]> {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ query, max_results: opts.maxResults, search_depth: "basic", include_answer: false }),
      signal: opts.signal ?? AbortSignal.timeout(20_000),
    });
    if (!res.ok) await httpError(res, "Tavily");
    const json = (await res.json()) as {
      results?: { url: string; title?: string; content?: string; published_date?: string }[];
    };
    return (json.results ?? []).map((r) => ({
      url: r.url,
      title: r.title ?? r.url,
      snippet: r.content ?? "",
      publishedAt: r.published_date ?? null,
    }));
  }
}

/** https://api-dashboard.search.brave.com — GET /res/v1/web/search */
export class BraveSearch implements SearchProvider {
  readonly name = "brave";
  constructor(private readonly apiKey: string) {}

  async search(query: string, opts: { maxResults: number; signal?: AbortSignal }): Promise<SearchResult[]> {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query);
    url.searchParams.set("count", String(Math.min(opts.maxResults, 20)));
    url.searchParams.set("search_lang", "fr");
    const res = await fetch(url, {
      headers: { accept: "application/json", "x-subscription-token": this.apiKey },
      signal: opts.signal ?? AbortSignal.timeout(20_000),
    });
    if (!res.ok) await httpError(res, "Brave Search");
    const json = (await res.json()) as {
      web?: { results?: { url: string; title?: string; description?: string; page_age?: string; age?: string }[] };
    };
    return (json.web?.results ?? []).map((r) => ({
      url: r.url,
      title: r.title ?? r.url,
      snippet: (r.description ?? "").replace(/<[^>]+>/g, ""),
      publishedAt: r.page_age ?? r.age ?? null,
    }));
  }
}
