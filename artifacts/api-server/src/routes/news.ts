import { Router } from "express";

const router = Router();

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

/* ── RSS source registry ─────────────────────────────────────────────── */

interface RssSource {
  url:      string;
  label:    string;
  category: NewsItem["category"];
  priority: NewsItem["priority"];
}

const RSS_SOURCES: RssSource[] = [
  // Geopolitical — world news
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml",              label: "bbc.co.uk",        category: "GEOPOLITICAL", priority: "HIGH"   },
  { url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",  label: "bbc.co.uk",        category: "GEOPOLITICAL", priority: "HIGH"   },
  { url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml",       label: "bbc.co.uk",        category: "GEOPOLITICAL", priority: "HIGH"   },
  { url: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",label: "bbc.co.uk",        category: "GEOPOLITICAL", priority: "NORMAL" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml",                 label: "aljazeera.com",    category: "GEOPOLITICAL", priority: "HIGH"   },
  { url: "https://www.theguardian.com/world/rss",                     label: "theguardian.com",  category: "GEOPOLITICAL", priority: "NORMAL" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",   label: "nytimes.com",      category: "GEOPOLITICAL", priority: "NORMAL" },
  // Defense
  { url: "https://www.defensenews.com/arc/outboundfeeds/rss/",       label: "defensenews.com",  category: "DEFENSE",      priority: "HIGH"   },
  { url: "https://breakingdefense.com/feed/",                         label: "breakingdefense.com", category: "DEFENSE",  priority: "HIGH"   },
  // Policy
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",label: "nytimes.com",      category: "POLICY",       priority: "NORMAL" },
  { url: "https://www.theguardian.com/politics/rss",                  label: "theguardian.com",  category: "POLICY",       priority: "NORMAL" },
];

/* ── RSS parser ──────────────────────────────────────────────────────── */

interface RawItem { title: string; url: string; pubDate: string }

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function parseRss(xml: string): RawItem[] {
  const items: RawItem[] = [];
  // Split on <item> boundaries
  const itemChunks = xml.split(/<item[\s>]/i).slice(1);
  for (const chunk of itemChunks) {
    const end = chunk.indexOf("</item>");
    const body = end >= 0 ? chunk.slice(0, end) : chunk;

    const titleMatch = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    // prefer <link> text content over atom:link href
    const linkMatch  = body.match(/<link[^>]*>(https?[^<]+)<\/link>/i)
                    || body.match(/<link[^>]+href="(https?[^"]+)"/i);
    const dateMatch  = body.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)
                    || body.match(/<published[^>]*>([\s\S]*?)<\/published>/i)
                    || body.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i);

    const title = titleMatch ? stripCdata(titleMatch[1]) : "";
    const url   = linkMatch  ? linkMatch[1].trim() : "";
    const date  = dateMatch  ? stripCdata(dateMatch[1]).trim() : "";

    if (title && url && url.startsWith("http")) {
      items.push({ title, url, pubDate: date });
    }
  }
  return items;
}

function parsePubDate(d: string): string {
  if (!d) return new Date().toISOString();
  try { return new Date(d).toISOString(); } catch { return new Date().toISOString(); }
}

/* ── Category & region inference ─────────────────────────────────────── */

const INTELLIGENCE_KW = /intelligenc|espionage|surveillance|spy|cia|mi6|mossad|fsb|intercept|covert|sanction|nuclear|cyber.attack|hack/i;
const ENERGY_KW       = /\boil\b|\bgas\b|pipeline|energy|crude|opec|petrol|lng|electricity grid|power station|fuel|renewabl/i;
const DEFENSE_KW      = /military|defence|defense|weapon|missile|drone|navy|army|air force|combat|warship|nuke|bomber|nato|pentagon/i;

function refineCategory(title: string, base: NewsItem["category"]): NewsItem["category"] {
  if (INTELLIGENCE_KW.test(title)) return "INTELLIGENCE";
  if (ENERGY_KW.test(title))       return "ENERGY";
  if (base !== "DEFENSE" && base !== "POLICY" && DEFENSE_KW.test(title)) return "DEFENSE";
  return base;
}

const HIGH_KW = /kill|attack|strike|war|conflict|bomb|explosion|offens|crisis|critical|urgent|breaking|frontline|invasion|ceasefire|hostage|assassination/i;

function refinePriority(title: string, base: NewsItem["priority"]): NewsItem["priority"] {
  if (HIGH_KW.test(title)) return "HIGH";
  return base;
}

function inferRegion(title: string): string {
  const t = title.toLowerCase();
  if (/israel|iran|iraq|syria|lebanon|yemen|saudi|qatar|gulf|middle east|gaza|hamas|hezbollah|hormuz/.test(t)) return "Middle East";
  if (/ukraine|russia|poland|nato|eastern europe|moldova|belarus|crimea|zaporizhzhia|kyiv|moscow/.test(t)) return "Eastern Europe";
  if (/china|taiwan|japan|korea|asia|pacific|india|beijing|hong kong|xinjiang|vietnam|myanmar/.test(t)) return "Asia-Pacific";
  if (/europe|eu |germany|france|britain|uk |brussels|spain|italy|paris|berlin|london/.test(t)) return "European Union";
  if (/canada|mexico|washington|congress|senate|white house| us |united states|pentagon|american|trump|biden|harris/.test(t)) return "North America";
  if (/africa|nigeria|ethiopia|kenya|sahel|sudan|somalia|mali|libya|egypt/.test(t)) return "Africa";
  if (/brazil|venezuela|colombia|argentina|latin|south america/.test(t)) return "Latin America";
  return "Global";
}

/* ── Fetch one RSS feed ───────────────────────────────────────────────── */

async function fetchRss(src: RssSource): Promise<NewsItem[]> {
  try {
    const res = await fetch(src.url, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "RSR-Intelligence-Monitor/1.0" },
    });
    if (!res.ok) {
      console.log(`[news] ${src.label} (${src.category}) HTTP ${res.status}`);
      return [];
    }
    const xml  = await res.text();
    const raw  = parseRss(xml);
    console.log(`[news] ${src.label} (${src.category}): ${raw.length} items parsed from ${xml.length} bytes`);
    return raw.map((r, i) => ({
      id:       `rss-${src.category.toLowerCase()}-${Date.now()}-${i}`,
      title:    r.title,
      domain:   src.label,
      url:      r.url,
      seendate: parsePubDate(r.pubDate),
      category: refineCategory(r.title, src.category),
      priority: refinePriority(r.title, src.priority),
      region:   inferRegion(r.title),
    }));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`[news] ${src.label} ERROR: ${msg.slice(0, 60)}`);
    return [];
  }
}

/* ── Cache state ─────────────────────────────────────────────────────── */

let cache:       { data: NewsItem[]; timestamp: number } | null = null;
let backupCache: { data: NewsItem[]; timestamp: number } | null = null;
let rollingPool: NewsItem[] = [];   // accumulated distinct valid items across cycles
let fetching = false;

const CACHE_TTL    = 12 * 60  * 1000;   // 12 min active cache
const BACKUP_TTL   = 24 * 3600 * 1000;  // 24 hr backup
const MIN_GOOD     = 8;                  // threshold for "healthy" result set
const ROLLING_MAX  = 120;               // max items to keep in rolling pool

function sortArticles(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => {
    if (a.priority === "HIGH" && b.priority !== "HIGH") return -1;
    if (a.priority !== "HIGH" && b.priority === "HIGH") return  1;
    return new Date(b.seendate).getTime() - new Date(a.seendate).getTime();
  });
}

function dedupe(items: NewsItem[]): NewsItem[] {
  const seenUrl   = new Set<string>();
  const seenTitle = new Set<string>();
  const out: NewsItem[] = [];
  for (const item of items) {
    // Normalize URL: strip query params for dedup but keep original for link
    const urlKey   = item.url.split("?")[0].toLowerCase().replace(/\/+$/, "");
    // Only dedupe on EXACT title (first 100 chars) — NOT similarity
    const titleKey = item.title.trim().toLowerCase().slice(0, 100);
    if (!seenUrl.has(urlKey) && !seenTitle.has(titleKey)) {
      seenUrl.add(urlKey);
      seenTitle.add(titleKey);
      out.push(item);
    }
  }
  return out;
}

async function refreshCache() {
  if (fetching) return;
  fetching = true;
  console.log("[news] Starting RSS refresh from", RSS_SOURCES.length, "sources");

  try {
    // Fetch all RSS feeds in parallel (no rate limit like GDELT)
    const results = await Promise.allSettled(RSS_SOURCES.map(fetchRss));
    const all: NewsItem[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") all.push(...r.value);
    }

    console.log(`[news] Raw total before dedupe: ${all.length} items`);
    const deduped = dedupe(sortArticles(all));
    console.log(`[news] After dedupe: ${deduped.length} items`);

    // Update rolling pool — add new items, keep only the most recent ROLLING_MAX
    const poolUrls = new Set(rollingPool.map(i => i.url.split("?")[0].toLowerCase().replace(/\/+$/, "")));
    for (const item of deduped) {
      const urlKey = item.url.split("?")[0].toLowerCase().replace(/\/+$/, "");
      if (!poolUrls.has(urlKey)) {
        rollingPool.push(item);
        poolUrls.add(urlKey);
      }
    }
    // Trim rolling pool to ROLLING_MAX most recent
    if (rollingPool.length > ROLLING_MAX) {
      rollingPool = sortArticles(rollingPool).slice(0, ROLLING_MAX);
    }

    // Update backup cache only if this cycle is good (don't downgrade)
    if (deduped.length >= MIN_GOOD) {
      backupCache = { data: deduped, timestamp: Date.now() };
      console.log(`[news] Backup cache updated: ${deduped.length} items`);
    }

    // Set live cache — always set it with the best available data
    const liveData = deduped.length >= MIN_GOOD
      ? deduped
      : padWithPool(deduped);

    cache = { data: liveData, timestamp: Date.now() };
    console.log(`[news] Live cache set: ${liveData.length} items`);
  } finally {
    fetching = false;
  }
}

/* ── Pad helpers ─────────────────────────────────────────────────────── */

/** Pad live results with rolling pool items when below floor */
function padWithPool(live: NewsItem[]): NewsItem[] {
  if (live.length >= MIN_GOOD) return live;

  // Collect candidates from: backup cache first, then rolling pool
  const candidates: NewsItem[] = [
    ...(backupCache?.data ?? []),
    ...rollingPool,
  ];

  const seenUrls  = new Set(live.map(i => i.url.split("?")[0].toLowerCase().replace(/\/+$/, "")));
  const padded    = [...live];

  for (const item of candidates) {
    if (padded.length >= 30) break;
    const urlKey = item.url.split("?")[0].toLowerCase().replace(/\/+$/, "");
    if (!seenUrls.has(urlKey)) {
      seenUrls.add(urlKey);
      padded.push({ ...item, id: item.id.includes("-pad") ? item.id : item.id + "-pad" });
    }
  }

  console.log(`[news] padWithPool: ${live.length} live → ${padded.length} padded`);
  return sortArticles(padded);
}

// Start initial fetch
setTimeout(() => refreshCache(), 500);

/* ── GET /news ───────────────────────────────────────────────────────── */

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

router.get("/news", async (_req, res) => {
  try {
    // Serve valid cached data immediately
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      const articles = cache.data.length < MIN_GOOD ? padWithPool(cache.data) : cache.data;
      console.log(`[news] Serving cached response: ${articles.length} items`);
      return res.json({
        articles,
        cached:      true,
        fetching,
        cachedAt:    new Date(cache.timestamp).toISOString(),
        nextRefresh: new Date(cache.timestamp + CACHE_TTL).toISOString(),
      });
    }

    // Cache expired or missing — trigger refresh, wait up to 15s
    if (!fetching) refreshCache();
    for (let i = 0; i < 15; i++) {
      await sleep(1000);
      if (cache && cache.data.length >= MIN_GOOD) break;
    }

    const liveData = cache?.data ?? [];
    const articles = liveData.length >= MIN_GOOD ? liveData : padWithPool(liveData);
    console.log(`[news] Serving fresh response: ${articles.length} items`);

    res.json({
      articles,
      cached:      false,
      fetching,
      cachedAt:    new Date().toISOString(),
      nextRefresh: new Date(Date.now() + CACHE_TTL).toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[news] GET handler error:", msg);
    // Serve rolling pool or backup on error — never serve empty
    const fallback = padWithPool([]);
    res.status(fallback.length > 0 ? 200 : 500).json({
      articles: fallback,
      error:    fallback.length > 0 ? undefined : "News fetch failed: " + msg,
    });
  }
});

export default router;
