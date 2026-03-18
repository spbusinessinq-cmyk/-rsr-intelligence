import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Link } from "wouter";

/* ── Types ──────────────────────────────────────────────────────────── */

interface NewsItem {
  id: string;
  title: string;
  domain: string;
  url: string;
  seendate: string;
  category: "GEOPOLITICAL" | "INTELLIGENCE" | "DEFENSE" | "ENERGY" | "POLICY";
  priority: "HIGH" | "NORMAL";
  region: string;
}

interface NewsResponse {
  articles: NewsItem[];
  cached: boolean;
  fetching?: boolean;
  cachedAt: string;
  nextRefresh: string;
  error?: string;
}

interface MarketWatch {
  label: string;
  value: string;
  delta?: string;
  direction?: "up" | "down" | "flat";
}

const MARKET_WATCH: MarketWatch[] = [
  { label: "BRENT CRUDE", value: "$94.40", delta: "+2.1%", direction: "up" },
  { label: "WTI CRUDE",   value: "$90.85", delta: "+1.8%", direction: "up" },
  { label: "GOLD",        value: "$2,384", delta: "+0.4%", direction: "up" },
  { label: "USD INDEX",   value: "104.22", delta: "-0.2%", direction: "down" },
  { label: "EUR/USD",     value: "1.0842", delta: "+0.3%", direction: "up" },
  { label: "10Y UST",     value: "4.42%",  delta: "+6bps", direction: "up" },
];

const catColor: Record<NewsItem["category"], string> = {
  GEOPOLITICAL: "text-red-400 border-red-500/20",
  DEFENSE:      "text-red-300 border-red-400/20",
  INTELLIGENCE: "text-emerald-400 border-emerald-500/20",
  ENERGY:       "text-orange-400 border-orange-500/20",
  POLICY:       "text-blue-400 border-blue-500/20",
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const h = d.getUTCHours().toString().padStart(2, "0");
    const m = d.getUTCMinutes().toString().padStart(2, "0");
    return `${h}:${m}Z`;
  } catch {
    return "—";
  }
}

function formatCachedAge(cachedAt: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(cachedAt).getTime()) / 60000);
    if (diff < 1) return "< 1 MIN AGO";
    if (diff === 1) return "1 MIN AGO";
    if (diff < 60) return `${diff} MIN AGO`;
    return `${Math.floor(diff / 60)}H AGO`;
  } catch {
    return "RECENT";
  }
}

/* ── Signal Room ─────────────────────────────────────────────────────── */

export default function SignalRoom() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  async function fetchNews(retryOnFetching = true) {
    try {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as NewsResponse;
      if (data.fetching && retryOnFetching) {
        setTimeout(() => fetchNews(false), 20000);
        return;
      }
      if (data.error && data.articles.length === 0) {
        setError("GDELT feed unavailable — retrying next cycle");
      } else {
        setError(null);
        if (data.articles.length > 0) {
          setArticles(data.articles);
          setCachedAt(data.cachedAt);
          setIsCached(data.cached);
        } else if (retryOnFetching) {
          setTimeout(() => fetchNews(false), 20000);
          return;
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "FEED UNAVAILABLE");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const highPriority = articles.filter(a => a.priority === "HIGH");
  const breakingTicker = highPriority.slice(0, 5).map(a => a.title.toUpperCase());

  const topSix = articles.slice(0, 6);

  const byRegion: Record<string, NewsItem[]> = {};
  for (const a of articles) {
    if (!byRegion[a.region]) byRegion[a.region] = [];
    byRegion[a.region].push(a);
  }
  const topRegions = Object.entries(byRegion)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5);

  const feedLabel = loading
    ? "LOADING..."
    : error
    ? "FEED ERROR"
    : isCached
    ? `CACHED FEED — ${cachedAt ? formatCachedAge(cachedAt) : ""}`
    : "RECENT MONITORED FEED — GDELT";

  return (
    <Layout>
      <div className="flex flex-col gap-0">

        {/* ── BREAKING STRIP ──────────────────────────────────────────── */}
        <div className="border border-zinc-900 bg-zinc-950 mb-6 overflow-hidden">
          <div className="flex items-center">
            <div className="shrink-0 font-mono text-[9px] tracking-[0.35em] text-red-400 bg-red-900/20 border-r border-zinc-900 px-4 py-3">
              BREAKING
            </div>
            <div className="overflow-hidden flex-1">
              <div className="animate-marquee flex gap-16 whitespace-nowrap py-3 px-4">
                {(breakingTicker.length > 0 ? breakingTicker : ["MONITORING ACTIVE — FEED LOADING..."]).concat(
                  breakingTicker.length > 0 ? breakingTicker : ["MONITORING ACTIVE — FEED LOADING..."]
                ).map((item, i) => (
                  <span key={i} className="font-mono text-[10px] tracking-[0.08em] text-zinc-500 shrink-0">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="shrink-0 font-mono text-[9px] tracking-[0.3em] text-zinc-700 border-l border-zinc-900 px-4 py-3">
              LIVE FEED
            </div>
          </div>
        </div>

        {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
        <section className="border-b border-zinc-900 pb-6 mb-6">
          <div className="font-mono text-[9px] tracking-[0.45em] text-emerald-400 mb-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-emerald-400 animate-pulse" />
            RSR INTELLIGENCE NETWORK // SIGNAL ROOM
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight leading-none">
                SIGNAL ROOM
              </h1>
              <p className="mt-3 text-zinc-600 text-sm leading-relaxed max-w-xl">
                Monitored breaking-news intelligence layer. Geopolitical developments, defense,
                energy, and policy signals — sourced from live monitored open-source feeds.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 font-mono text-[9px] tracking-[0.3em]">
              {loading ? (
                <span className="flex items-center gap-2 text-zinc-700 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  LOADING FEED...
                </span>
              ) : error ? (
                <span className="flex items-center gap-2 text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  FEED DEGRADED
                </span>
              ) : (
                <span className="flex items-center gap-2 text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  FEED ACTIVE
                </span>
              )}
              {!loading && articles.length > 0 && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span className="text-red-400">{highPriority.length} HIGH PRIORITY</span>
                  <span className="text-zinc-700">·</span>
                  <span className="text-zinc-600">{articles.length} ITEMS</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── MARKET STRIP ────────────────────────────────────────────── */}
        <div className="border border-zinc-900 bg-zinc-950/40 mb-6">
          <div className="border-b border-zinc-900 px-5 py-2.5 flex items-center justify-between">
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500">MARKET WATCH</div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-zinc-700">DELAYED INDICATIVE DATA — NOT LIVE</div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-zinc-900">
            {MARKET_WATCH.map(m => (
              <div key={m.label} className="px-4 py-3.5">
                <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-600 mb-1">{m.label}</div>
                <div className="font-mono text-sm text-white">{m.value}</div>
                {m.delta && (
                  <div className={`font-mono text-[10px] tracking-[0.1em] ${
                    m.direction === "up" ? "text-emerald-500" :
                    m.direction === "down" ? "text-red-400" : "text-zinc-600"
                  }`}>{m.delta}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN LAYOUT ─────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-4 gap-6 items-start">

          {/* Signal feed — 3/4 */}
          <div className="lg:col-span-3 flex flex-col gap-0">

            {/* Filter bar */}
            <div className="border border-zinc-900 bg-zinc-950 px-5 py-3 mb-0 flex flex-wrap items-center gap-4 font-mono text-[10px] tracking-[0.25em]">
              <span className="text-zinc-600">SOURCE:</span>
              <span className="text-zinc-400">GDELT OPEN-SOURCE MONITOR — GEOPOLITICAL · DEFENSE · INTELLIGENCE · ENERGY · POLICY</span>
              <span className="ml-auto text-zinc-600">{feedLabel}</span>
            </div>

            {/* Signal entries */}
            <div className="border border-zinc-900 border-t-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
                  <div className="font-mono text-[10px] tracking-[0.3em] text-zinc-700 animate-pulse">
                    LOADING MONITORED FEED...
                  </div>
                </div>
              ) : error && articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="font-mono text-[10px] tracking-[0.3em] text-amber-700">{error}</div>
                  <button
                    onClick={() => { setLoading(true); fetchNews(); }}
                    className="font-mono text-[9px] tracking-[0.25em] text-zinc-600 hover:text-zinc-400 border border-zinc-800 px-4 py-2 transition-colors"
                  >
                    RETRY
                  </button>
                </div>
              ) : articles.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                  <div className="font-mono text-[10px] tracking-[0.3em] text-zinc-700">NO ITEMS IN CURRENT FEED CYCLE</div>
                </div>
              ) : (
                articles.map((item, i) => (
                  <div
                    key={item.id}
                    className={`px-5 py-5 ${i < articles.length - 1 ? "border-b border-zinc-900" : ""} ${
                      item.priority === "HIGH" ? "bg-zinc-950/40" : "bg-black"
                    } hover:bg-zinc-950/60 transition-colors`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-2 shrink-0">
                        {item.priority === "HIGH" ? (
                          <span className="w-2 h-2 rounded-full bg-red-400/80 block animate-pulse" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-zinc-700 block" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2.5 flex-wrap">
                          <span className={`font-mono text-[9px] tracking-[0.25em] border px-2 py-0.5 ${catColor[item.category]}`}>
                            {item.category}
                          </span>
                          <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-600">
                            {item.domain}
                          </span>
                          <span className="font-mono text-[9px] tracking-widest text-zinc-700">
                            {item.region}
                          </span>
                          <span className="ml-auto font-mono text-[10px] tracking-widest text-zinc-600">
                            {formatTime(item.seendate)}
                          </span>
                          {item.priority === "HIGH" && (
                            <span className="font-mono text-[9px] tracking-widest text-red-400/80 border border-red-900/30 px-2 py-0.5">
                              PRIORITY
                            </span>
                          )}
                        </div>

                        <div className="font-mono text-xs tracking-[0.06em] text-zinc-200 mb-2.5 font-medium leading-snug">
                          {item.title}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[9px] tracking-[0.15em] text-zinc-700">
                            MONITORED OPEN-SOURCE SIGNAL
                          </span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[9px] tracking-widest text-zinc-600 hover:text-emerald-400 border border-zinc-900 hover:border-emerald-900/40 px-2 py-0.5 transition-colors"
                          >
                            SOURCE →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border border-zinc-900 border-t-0 bg-zinc-950 px-5 py-3 flex items-center gap-4">
              <div className="flex-1 font-mono text-[9px] tracking-[0.3em] text-zinc-700">
                OPEN-SOURCE MONITORED FEED — GDELT PROJECT — REFRESHES EVERY 10 MINUTES
              </div>
              <Link href="/investigation-room">
                <span className="font-mono text-[9px] tracking-widest text-zinc-700 hover:text-emerald-500 transition-colors cursor-pointer">
                  INVESTIGATION ROOM →
                </span>
              </Link>
            </div>
          </div>

          {/* Sidebar — 1/4 */}
          <div className="lg:col-span-1 space-y-4 sticky top-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">

            {/* Current watch — top 6 breaking items */}
            <div className="border border-zinc-900 p-4">
              <div className="font-mono text-[10px] tracking-[0.35em] text-zinc-500 mb-3">CURRENT WATCH</div>
              {loading ? (
                <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-800 animate-pulse">LOADING...</div>
              ) : topSix.length === 0 ? (
                <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-800">NO ITEMS</div>
              ) : (
                <div className="space-y-3">
                  {topSix.map(item => (
                    <div key={item.id} className="border-b border-zinc-900/50 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] tracking-[0.06em] text-zinc-300 hover:text-emerald-400 transition-colors leading-snug line-clamp-2"
                        >
                          {item.title}
                        </a>
                        <span className={`font-mono text-[8px] tracking-[0.2em] border px-1.5 py-0.5 shrink-0 mt-0.5 ${
                          item.priority === "HIGH" ? "text-red-400 border-red-500/20" : "text-zinc-600 border-zinc-800"
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="font-mono text-[8px] tracking-[0.15em] text-zinc-700">
                        {item.domain} · {item.region}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Regional postures — top 5 regions by item count */}
            <div className="border border-zinc-900 p-4">
              <div className="font-mono text-[10px] tracking-[0.35em] text-zinc-500 mb-3">TOP DEVELOPMENTS BY REGION</div>
              {loading ? (
                <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-800 animate-pulse">LOADING...</div>
              ) : topRegions.length === 0 ? (
                <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-800">NO DATA</div>
              ) : (
                <div className="space-y-3">
                  {topRegions.map(([region, items]) => {
                    const topItem = items[0];
                    const hasHigh = items.some(i => i.priority === "HIGH");
                    return (
                      <div key={region} className="border-b border-zinc-900/50 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[9px] tracking-[0.12em] text-zinc-400">{region}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[8px] text-zinc-700">{items.length}</span>
                            <span className={`font-mono text-[8px] tracking-[0.15em] ${hasHigh ? "text-red-400" : "text-zinc-600"}`}>
                              {hasHigh ? "ACTIVE" : "MONITORING"}
                            </span>
                          </div>
                        </div>
                        {topItem && (
                          <a
                            href={topItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[9px] tracking-[0.04em] text-zinc-600 hover:text-zinc-400 transition-colors leading-snug line-clamp-2 block"
                          >
                            {topItem.title}
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-zinc-900">
                <Link href="/world" className="font-mono text-[9px] tracking-[0.2em] text-zinc-600 hover:text-emerald-500 transition-colors">
                  → WORLD MONITOR
                </Link>
              </div>
            </div>

            {/* Topic watch — live category counts */}
            <div className="border border-zinc-900 p-4">
              <div className="font-mono text-[10px] tracking-[0.35em] text-zinc-500 mb-3">TOPIC WATCH</div>
              {loading ? (
                <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-800 animate-pulse">LOADING...</div>
              ) : (
                <div className="space-y-2">
                  {(["GEOPOLITICAL", "DEFENSE", "INTELLIGENCE", "ENERGY", "POLICY"] as const).map(cat => {
                    const count = articles.filter(a => a.category === cat).length;
                    const active = count > 0;
                    const labelCls = active ? catColor[cat].split(" ")[0] : "text-zinc-800";
                    return (
                      <div key={cat} className="flex items-center justify-between">
                        <span className={`font-mono text-[9px] tracking-[0.12em] ${labelCls}`}>{cat}</span>
                        <div className="flex items-center gap-2">
                          {active && <span className="w-1 h-1 rounded-full bg-current opacity-50 inline-block" style={{ color: "inherit" }} />}
                          <span className={`font-mono text-[9px] ${active ? "text-zinc-500" : "text-zinc-800"}`}>
                            {active ? `${count} signal${count > 1 ? "s" : ""}` : "—"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {articles.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-900 space-y-1">
                  <div className="font-mono text-[8px] tracking-[0.2em] text-zinc-700 mb-1.5">MONITORED SOURCES</div>
                  {[...new Set(articles.map(a => a.domain))].slice(0, 5).map(domain => (
                    <div key={domain} className="font-mono text-[8px] tracking-[0.06em] text-zinc-700">
                      {domain}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inner layer navigation */}
            <div className="border border-zinc-900 p-4">
              <div className="font-mono text-[10px] tracking-[0.35em] text-zinc-500 mb-3">INNER LAYER</div>
              <div className="space-y-2.5">
                {[
                  { label: "INVESTIGATION ROOM", href: "/investigation-room" },
                  { label: "ENTITY DOSSIERS",    href: "/dossiers" },
                  { label: "WORLD MONITOR",      href: "/world" },
                  { label: "ACTIVE FILES",        href: "/files" },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="flex items-center justify-between group">
                    <span className="font-mono text-[10px] tracking-widest text-zinc-500 group-hover:text-zinc-200 transition-colors">{l.label}</span>
                    <span className="font-mono text-[9px] text-zinc-800 group-hover:text-emerald-600 transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
