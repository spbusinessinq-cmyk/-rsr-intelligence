// cloud-functions/api/news.js
// EdgeOne Node Function — route: /api/news
// Fetches live geopolitical news from GDELT in parallel,
// returns the same JSON contract as the Express api-server.

const QUERIES = [
  { q: "war conflict military strike ukraine russia israel iran nato",          category: "GEOPOLITICAL", priority: "HIGH" },
  { q: "intelligence surveillance espionage nuclear weapons sanctions coup",    category: "INTELLIGENCE", priority: "HIGH" },
  { q: "military defense weapons procurement army navy air force contractor",   category: "DEFENSE",      priority: "HIGH" },
  { q: "energy oil gas crisis pipeline geopolitics electricity grid",           category: "ENERGY",       priority: "NORMAL" },
  { q: "government policy legislation sanctions regulation congress parliament", category: "POLICY",       priority: "NORMAL" },
];

function inferRegion(article) {
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

function parseSeen(seendate) {
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

async function fetchGdelt(query) {
  const url =
    `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}` +
    `&mode=artlist&maxrecords=15&format=json&timespan=48H`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return [];
    const text = await res.text();
    if (!text.startsWith("{") && !text.startsWith("[")) return [];
    const data = JSON.parse(text);
    return (data.articles ?? []).filter(a => {
      const lang = (a.language ?? "").toLowerCase();
      return lang === "" || lang === "english";
    });
  } catch {
    return [];
  }
}

export const onRequestGet = async () => {
  try {
    const results = await Promise.allSettled(
      QUERIES.map(q => fetchGdelt(q.q).then(articles => ({ articles, meta: q })))
    );

    const all  = [];
    const seen = new Set();

    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      const { articles, meta } = result.value;
      for (const [j, a] of articles.entries()) {
        if (!seen.has(a.url)) {
          seen.add(a.url);
          all.push({
            id:       `gdelt-${meta.category.toLowerCase()}-${j}-${Date.now()}`,
            title:    a.title,
            domain:   a.domain,
            url:      a.url,
            seendate: parseSeen(a.seendate),
            category: meta.category,
            priority: meta.priority,
            region:   inferRegion(a),
          });
        }
      }
    }

    all.sort((a, b) => {
      if (a.priority === "HIGH" && b.priority !== "HIGH") return -1;
      if (a.priority !== "HIGH" && b.priority === "HIGH") return 1;
      return new Date(b.seendate).getTime() - new Date(a.seendate).getTime();
    });

    const now = new Date().toISOString();

    return new Response(
      JSON.stringify({
        articles:    all,
        cached:      false,
        cachedAt:    now,
        nextRefresh: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type":                "application/json",
          "Cache-Control":               "public, max-age=300, s-maxage=600",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({
        articles:    [],
        error:       "GDELT fetch failed: " + msg,
        cached:      false,
        cachedAt:    new Date().toISOString(),
        nextRefresh: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type":                "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};

export default onRequestGet;
