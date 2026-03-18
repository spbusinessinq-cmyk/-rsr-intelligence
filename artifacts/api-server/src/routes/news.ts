import { Router } from "express";

const router = Router();

interface GdeltArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

interface GdeltResponse {
  articles?: GdeltArticle[];
}

export interface NewsItem {
  id: string;
  title: string;
  domain: string;
  url: string;
  seendate: string;
  category: "GEOPOLITICAL" | "INTELLIGENCE" | "DEFENSE" | "ENERGY" | "POLICY";
  priority: "HIGH" | "NORMAL";
  region: string;
}

let cache: { data: NewsItem[]; timestamp: number } | null = null;
let fetching = false;
const CACHE_TTL = 10 * 60 * 1000;

const QUERIES: Array<{ q: string; category: NewsItem["category"]; priority: NewsItem["priority"] }> = [
  { q: "war conflict military strike ukraine russia israel iran nato",          category: "GEOPOLITICAL", priority: "HIGH" },
  { q: "intelligence surveillance espionage nuclear weapons sanctions coup",    category: "INTELLIGENCE", priority: "HIGH" },
  { q: "military defense weapons procurement army navy air force contractor",   category: "DEFENSE",      priority: "HIGH" },
  { q: "energy oil gas crisis pipeline geopolitics electricity grid",           category: "ENERGY",       priority: "NORMAL" },
  { q: "government policy legislation sanctions regulation congress parliament", category: "POLICY",       priority: "NORMAL" },
];

function inferRegion(article: GdeltArticle): string {
  const text = (article.title + " " + (article.sourcecountry ?? "")).toLowerCase();
  if (/israel|iran|iraq|syria|lebanon|yemen|saudi|qatar|gulf|hormuz|middle east|gaza|hamas|hezbollah/.test(text)) return "Middle East";
  if (/ukraine|russia|poland|nato|eastern europe|moldova|belarus|crimea|zaporizhzhia/.test(text)) return "Eastern Europe";
  if (/china|taiwan|japan|korea|asia|pacific|india|beijing|hong kong|xinjiang/.test(text)) return "Asia-Pacific";
  if (/europe|eu |germany|france|britain|uk |brussels|nato|spain|italy|paris/.test(text)) return "European Union";
  if (/canada|mexico|washington|congress|senate|white house| us |united states|pentagon/.test(text)) return "North America";
  if (/africa|nigeria|ethiopia|kenya|sahel|sudan|somalia|mali|libya/.test(text)) return "Africa";
  if (/brazil|venezuela|colombia|argentina|latin|south america/.test(text)) return "Latin America";
  return "Global";
}

function parseSeen(seendate: string): string {
  try {
    const y = seendate.slice(0, 4);
    const mo = seendate.slice(4, 6);
    const d = seendate.slice(6, 8);
    const h = seendate.slice(9, 11);
    const m = seendate.slice(11, 13);
    const s = seendate.slice(13, 15);
    return `${y}-${mo}-${d}T${h}:${m}:${s}Z`;
  } catch {
    return new Date().toISOString();
  }
}

async function fetchGdelt(query: string): Promise<GdeltArticle[]> {
  const url =
    `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}`
    + `&mode=artlist&maxrecords=15&format=json&timespan=48H`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return [];
    const text = await res.text();
    if (!text.startsWith("{") && !text.startsWith("[")) return [];
    const data = JSON.parse(text) as GdeltResponse;
    return (data.articles ?? []).filter(a => {
      const lang = (a.language ?? "").toLowerCase();
      return lang === "" || lang === "english";
    });
  } catch {
    return [];
  }
}

async function fetchAllNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    QUERIES.map(q => fetchGdelt(q.q).then(articles => ({ articles, meta: q })))
  );

  const all: NewsItem[] = [];
  const seen = new Set<string>();

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const { articles, meta } = result.value;
    for (const [j, a] of articles.entries()) {
      if (!seen.has(a.url)) {
        seen.add(a.url);
        all.push({
          id: `gdelt-${meta.category.toLowerCase()}-${j}-${Date.now()}`,
          title: a.title,
          domain: a.domain,
          url: a.url,
          seendate: parseSeen(a.seendate),
          category: meta.category,
          priority: meta.priority,
          region: inferRegion(a),
        });
      }
    }
  }

  return all.sort((a, b) => {
    if (a.priority === "HIGH" && b.priority !== "HIGH") return -1;
    if (a.priority !== "HIGH" && b.priority === "HIGH") return 1;
    return new Date(b.seendate).getTime() - new Date(a.seendate).getTime();
  });
}

async function refreshCache() {
  if (fetching) return;
  fetching = true;
  try {
    const articles = await fetchAllNews();
    if (articles.length > 0) {
      cache = { data: articles, timestamp: Date.now() };
    }
  } finally {
    fetching = false;
  }
}

setTimeout(() => refreshCache(), 2000);

router.get("/news", async (_req, res) => {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return res.json({
        articles: cache.data,
        cached: true,
        cachedAt: new Date(cache.timestamp).toISOString(),
        nextRefresh: new Date(cache.timestamp + CACHE_TTL).toISOString(),
      });
    }

    if (fetching) {
      return res.json({
        articles: [],
        cached: false,
        fetching: true,
        cachedAt: new Date().toISOString(),
        nextRefresh: new Date(Date.now() + 30000).toISOString(),
      });
    }

    await refreshCache();
    res.json({
      articles: cache?.data ?? [],
      cached: false,
      cachedAt: new Date().toISOString(),
      nextRefresh: new Date(Date.now() + CACHE_TTL).toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ articles: [], error: "GDELT fetch failed: " + msg });
  }
});

export default router;
