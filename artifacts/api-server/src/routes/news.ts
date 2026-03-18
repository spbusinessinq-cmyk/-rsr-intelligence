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

let cache:       { data: NewsItem[]; timestamp: number } | null = null;
let backupCache: { data: NewsItem[]; timestamp: number } | null = null;
let fetching = false;

const CACHE_TTL    = 10 * 60  * 1000;    // 10 min active cache
const BACKUP_TTL   = 24 * 3600 * 1000;   // 24 hr backup — padded when live feed is thin
const MIN_GOOD     = 8;                   // threshold for "healthy" result set

// Broader queries + 168H timespan (7 days) → much more coverage than 72H
const QUERIES: Array<{ q: string; category: NewsItem["category"]; priority: NewsItem["priority"] }> = [
  { q: "war conflict military strike attack explosion frontline combat sourcelang:english",                 category: "GEOPOLITICAL", priority: "HIGH" },
  { q: "ukraine russia israel iran nato offensive ceasefire missile airstrikes sourcelang:english",         category: "GEOPOLITICAL", priority: "HIGH" },
  { q: "intelligence espionage surveillance nuclear sanctions diplomatic coup sourcelang:english",          category: "INTELLIGENCE", priority: "HIGH" },
  { q: "military defense weapons army navy air force procurement contractor security sourcelang:english",   category: "DEFENSE",      priority: "HIGH" },
  { q: "energy oil gas pipeline electricity grid crisis geopolitics supply sourcelang:english",            category: "ENERGY",       priority: "NORMAL" },
  { q: "government policy legislation sanctions regulation parliament elections sourcelang:english",        category: "POLICY",       priority: "NORMAL" },
];

function inferRegion(article: GdeltArticle): string {
  const text = (article.title + " " + (article.sourcecountry ?? "")).toLowerCase();
  if (/israel|iran|iraq|syria|lebanon|yemen|saudi|qatar|gulf|hormuz|middle east|gaza|hamas|hezbollah/.test(text)) return "Middle East";
  if (/ukraine|russia|poland|nato|eastern europe|moldova|belarus|crimea|zaporizhzhia/.test(text)) return "Eastern Europe";
  if (/china|taiwan|japan|korea|asia|pacific|india|beijing|hong kong|xinjiang/.test(text)) return "Asia-Pacific";
  if (/europe|eu |germany|france|britain|uk |brussels|spain|italy|paris/.test(text)) return "European Union";
  if (/canada|mexico|washington|congress|senate|white house| us |united states|pentagon/.test(text)) return "North America";
  if (/africa|nigeria|ethiopia|kenya|sahel|sudan|somalia|mali|libya/.test(text)) return "Africa";
  if (/brazil|venezuela|colombia|argentina|latin|south america/.test(text)) return "Latin America";
  return "Global";
}

function parseSeen(seendate: string): string {
  try {
    const y  = seendate.slice(0, 4);
    const mo = seendate.slice(4, 6);
    const d  = seendate.slice(6, 8);
    const h  = seendate.slice(9, 11);
    const m  = seendate.slice(11, 13);
    const s  = seendate.slice(13, 15);
    return `${y}-${mo}-${d}T${h}:${m}:${s}Z`;
  } catch {
    return new Date().toISOString();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchGdelt(query: string): Promise<GdeltArticle[]> {
  const url =
    `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}`
    + `&mode=artlist&maxrecords=25&format=json&timespan=168H`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return [];
    const text = await res.text();
    if (!text.startsWith("{") && !text.startsWith("[")) return [];
    const data = JSON.parse(text) as GdeltResponse;
    return data.articles ?? [];
  } catch {
    return [];
  }
}

function sortArticles(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => {
    if (a.priority === "HIGH" && b.priority !== "HIGH") return -1;
    if (a.priority !== "HIGH" && b.priority === "HIGH") return  1;
    return new Date(b.seendate).getTime() - new Date(a.seendate).getTime();
  });
}

async function refreshCache() {
  if (fetching) return;
  fetching = true;
  const all: NewsItem[]  = [];
  const seenUrl          = new Set<string>();
  const seenTitle        = new Set<string>();

  try {
    for (let i = 0; i < QUERIES.length; i++) {
      if (i > 0) await sleep(5500);   // GDELT rate limit: 1 req / 5 s
      const q = QUERIES[i];
      try {
        const articles = await fetchGdelt(q.q);
        for (const [j, a] of articles.entries()) {
          const titleKey = a.title?.trim().toLowerCase().slice(0, 80);
          if (!seenUrl.has(a.url) && (!titleKey || !seenTitle.has(titleKey))) {
            seenUrl.add(a.url);
            if (titleKey) seenTitle.add(titleKey);
            all.push({
              id:       `gdelt-${q.category.toLowerCase()}-${j}-${Date.now()}`,
              title:    a.title,
              domain:   a.domain,
              url:      a.url,
              seendate: parseSeen(a.seendate),
              category: q.category,
              priority: q.priority,
              region:   inferRegion(a),
            });
          }
        }
      } catch { /* continue on individual query failure */ }

      // Update cache incrementally after every query so partial results are served immediately
      if (all.length > 0) {
        cache = { data: sortArticles(all), timestamp: Date.now() };
      }
    }

    // If this cycle produced a good result set, update the long-term backup
    if (all.length >= MIN_GOOD) {
      backupCache = { data: sortArticles(all), timestamp: Date.now() };
    } else if (all.length > 0 && backupCache && Date.now() - backupCache.timestamp < BACKUP_TTL) {
      // Pad thin live result with stale backup items (deduplicated)
      const padded = [...all];
      for (const item of backupCache.data) {
        if (padded.length >= 30) break;
        if (!seenUrl.has(item.url)) {
          seenUrl.add(item.url);
          padded.push({ ...item, id: item.id + "-stale" });
        }
      }
      cache = { data: sortArticles(padded), timestamp: Date.now() };
    } else if (all.length === 0 && backupCache && Date.now() - backupCache.timestamp < BACKUP_TTL) {
      // No live results at all — serve backup cache
      cache = { data: backupCache.data, timestamp: backupCache.timestamp };
    }
  } finally {
    fetching = false;
  }
}

setTimeout(() => refreshCache(), 1000);

router.get("/news", async (_req, res) => {
  try {
    // Serve valid cached data immediately (full or partial)
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return res.json({
        articles:    cache.data,
        cached:      true,
        fetching,
        cachedAt:    new Date(cache.timestamp).toISOString(),
        nextRefresh: new Date(cache.timestamp + CACHE_TTL).toISOString(),
      });
    }

    // No cache yet — kick off background refresh and wait up to 14 s for first query
    if (!fetching) refreshCache();
    for (let i = 0; i < 14; i++) {
      await sleep(1000);
      if (cache && cache.data.length > 0) break;
    }

    res.json({
      articles:    cache?.data ?? [],
      cached:      false,
      fetching,
      cachedAt:    new Date().toISOString(),
      nextRefresh: new Date(Date.now() + CACHE_TTL).toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ articles: [], error: "GDELT fetch failed: " + msg });
  }
});

export default router;
