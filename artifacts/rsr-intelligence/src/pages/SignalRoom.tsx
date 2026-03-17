import Layout from "@/components/Layout";
import { Link } from "wouter";

interface SignalItem {
  id: string;
  category: "GEOPOLITICAL" | "MARKET" | "ENERGY" | "DEFENSE" | "POLICY" | "INTELLIGENCE";
  headline: string;
  summary: string;
  region: string;
  priority: "HIGH" | "NORMAL" | "LOW";
  timestamp: string;
  refs?: string[];
  source: string;
}

interface MarketWatch {
  label: string;
  value: string;
  delta?: string;
  direction?: "up" | "down" | "flat";
  note?: string;
}

const BREAKING: string[] = [
  "MIDDLE EAST — ENERGY CORRIDOR WATCH: LOGISTICS LANE 2 DISRUPTION CONFIRMED · STRAIT OF HORMUZ ADJACENT LANES UNDER ELEVATED MONITORING",
  "F-017 ALLIED MEDIA NETWORK — NEW FUNDING SOURCE CONFIRMED LINKED TO F-003 OFFSHORE CHAIN · SIX EU JURISDICTIONS AFFECTED",
  "EASTERN EUROPE — POSTURE ELEVATED · CAPITAL EXODUS INDICATORS RISING · INFLUENCE OPERATIONS ACTIVE ACROSS MEDIA AND POLICY LAYERS",
  "ASIA-PACIFIC — D-004 MERIDIAN CAPITAL NEW ACQUISITION NODE IDENTIFIED · ATLAS CROSS-REFERENCE IN PROGRESS",
  "NORTH AMERICA — F-019 LOBBYING MAP UPDATE · TWENTY-THREE RELATIONSHIPS FLAGGED · FOREIGN-INTEREST DISCLOSURE GAPS CONFIRMED",
];

const signals: SignalItem[] = [
  {
    id: "SIG-R001",
    category: "GEOPOLITICAL",
    headline: "MIDDLE EAST POSTURE ELEVATED TO CRITICAL",
    summary: "ORION monitor flagging sustained escalation across energy watch corridor. Strait of Hormuz adjacent logistics lanes reporting confirmed disruption across two supply routes. Signal count at 27, highest this cycle. Energy watch posture moved to CRITICAL. WHITE WING conflict lane tracking active.",
    region: "Middle East",
    priority: "HIGH",
    timestamp: "2026-03-17T19:22:00Z",
    source: "ORION",
    refs: ["F-016"],
  },
  {
    id: "SIG-R002",
    category: "INTELLIGENCE",
    headline: "F-017 FUNDING CONFIRMED — F-003 OFFSHORE CHAIN LINK ESTABLISHED",
    summary: "Allied Media Network Watch (F-017) now confirmed connected to F-003 Influence Architecture offshore intermediary chain. Editorial coordination pattern documented across six EU member jurisdictions. Capital routing mechanism confirmed. Network operating with state-adjacent backing across major EU media markets.",
    region: "European Union",
    priority: "HIGH",
    timestamp: "2026-03-17T19:11:00Z",
    source: "ATLAS",
    refs: ["F-017", "F-003", "D-006"],
  },
  {
    id: "SIG-R003",
    category: "DEFENSE",
    headline: "WHITE WING — CONFLICT LANE 3 MOVEMENT INDICATORS ELEVATED",
    summary: "WHITE WING battlespace system detecting unusual movement indicators in Conflict Lane 3. Not yet at escalation threshold. Trending data flagged for monitoring inclusion in next AXION brief cycle. Pattern consistent with preparatory repositioning rather than active engagement. Watch status: ELEVATED.",
    region: "Middle East",
    priority: "HIGH",
    timestamp: "2026-03-17T17:44:00Z",
    source: "WHITE WING",
  },
  {
    id: "SIG-R004",
    category: "MARKET",
    headline: "ASIA-PACIFIC CAPITAL FLOW DISRUPTION — D-004 NODE IDENTIFIED",
    summary: "ATLAS entity mapping confirms new acquisition node linked to D-004 Meridian Capital operating in Asia-Pacific. Cross-referenced against F-006 Meridian Finance Audit. Three state-adjacent investment vehicles now tracked in connection with active procurement bids across two jurisdictions. Capital structure review ongoing.",
    region: "Asia-Pacific",
    priority: "NORMAL",
    timestamp: "2026-03-17T18:44:00Z",
    source: "ATLAS",
    refs: ["D-004", "F-006"],
  },
  {
    id: "SIG-R005",
    category: "POLICY",
    headline: "WESTERN ADVOCACY NETWORK — COORDINATED LEGISLATIVE OUTREACH DOCUMENTED",
    summary: "D-010 Western Advocacy Network confirmed coordinated outreach across three Senate committees and two House oversight bodies. Twelve registered organizations involved. Shared messaging infrastructure active. Cross-reference with F-019 Cross-Border Lobbying Map now showing structural overlap. Pattern is systematic, not organic.",
    region: "North America",
    priority: "NORMAL",
    timestamp: "2026-03-17T17:30:00Z",
    source: "ATLAS",
    refs: ["D-010", "F-019"],
  },
  {
    id: "SIG-R006",
    category: "GEOPOLITICAL",
    headline: "EASTERN EUROPE — INFLUENCE OPERATIONS AND CAPITAL EXODUS ACTIVE",
    summary: "ORION elevated Eastern Europe posture to ELEVATED. F-010 influence mapping consistent with increased activity across media and policy advisory channels. Capital exodus signals rising since previous cycle. Regional Futures Fund (D-013) equity exposure in three media entities linked to capital and editorial direction overlap.",
    region: "Eastern Europe",
    priority: "HIGH",
    timestamp: "2026-03-17T18:10:00Z",
    source: "ORION",
    refs: ["F-010", "D-013"],
  },
  {
    id: "SIG-R007",
    category: "INTELLIGENCE",
    headline: "BLACK DOG QUEUE — 7 ANOMALOUS SIGNALS PENDING RESTRICTED REVIEW",
    summary: "BLACK DOG restricted review system holding seven anomalous signals pending analyst assessment. Nature of signals not available at this clearance level. Escalation request from F-016 Sovereign Fund Review and F-012 Defense Advisory Network active in queue. BLACK DOG escalation for tier-1 entity identification also pending from F-001 CLEARWATER review.",
    region: "Global",
    priority: "HIGH",
    timestamp: "2026-03-17T18:55:00Z",
    source: "BLACK DOG",
    refs: ["F-001", "F-016"],
  },
  {
    id: "SIG-R008",
    category: "ENERGY",
    headline: "ENERGY CORRIDOR — LOGISTICS DISRUPTION SPREADING ACROSS SUPPLY ROUTES",
    summary: "Two confirmed supply route disruptions now active in Middle East energy corridor. Strait of Hormuz adjacent lanes showing elevated movement. No formal escalation event declared but logistics disruption is operational in scope. Impact assessment ongoing. Watch status elevated for third lane. ORION signal count at 27 — cycle high.",
    region: "Middle East",
    priority: "HIGH",
    timestamp: "2026-03-17T19:05:00Z",
    source: "ORION",
  },
  {
    id: "SIG-R009",
    category: "POLICY",
    headline: "NORTH AMERICA PROCUREMENT WATCH — F-001 CLEARWATER ESCALATION UNDERWAY",
    summary: "Operation Clearwater (F-001) procurement chain now confirmed at five layers. Cormorant Group (D-001) positioned at tier-2, not tier-1 as previously documented. Tier-1 entity appears to be unregistered holding structure sharing registered agent with three F-005 entries. Risk attribution model requires revision. BLACK DOG escalation for tier-1 identification requested.",
    region: "North America",
    priority: "HIGH",
    timestamp: "2026-03-17T16:00:00Z",
    source: "AXION",
    refs: ["F-001", "D-001", "F-005"],
  },
  {
    id: "SIG-R010",
    category: "MARKET",
    headline: "NORTHERN GATEWAY — BENEFICIAL OWNERSHIP CONFIRMED ACROSS FOUR BIDS",
    summary: "F-009 Northern Gateway procurement review confirms shared beneficial ownership across four bid submissions. D-007 Northern Bridge Consortium: four entities, two jurisdictions. Ownership resolves to two individuals, one of whom appears in F-001 procurement network. Document authorship metadata match across all four submissions indicates pre-bid coordination. F-009 reclassification to RESTRICTED recommended.",
    region: "Canada",
    priority: "NORMAL",
    timestamp: "2026-03-17T17:10:00Z",
    source: "ATLAS",
    refs: ["F-009", "D-007"],
  },
];

const marketWatchItems: MarketWatch[] = [
  { label: "BRENT CRUDE", value: "$94.40", delta: "+2.1%", direction: "up", note: "Logistics disruption pressure" },
  { label: "WTI CRUDE",   value: "$90.85", delta: "+1.8%", direction: "up", note: "Corridor watch active" },
  { label: "GOLD",        value: "$2,384", delta: "+0.4%", direction: "up", note: "Safe haven flow" },
  { label: "USD INDEX",   value: "104.22", delta: "-0.2%", direction: "down", note: "Risk sentiment" },
  { label: "EUR/USD",     value: "1.0842", delta: "+0.3%", direction: "up", note: "Policy watch" },
  { label: "10Y UST",     value: "4.42%",  delta: "+6bps", direction: "up", note: "Pressure continuing" },
];

const watchItems = [
  { label: "STRAIT OF HORMUZ", status: "WATCH ACTIVE", level: "HIGH" },
  { label: "EASTERN EUROPE POSTURE", status: "ELEVATED", level: "HIGH" },
  { label: "EU MEDIA INFLUENCE", status: "ACTIVE MAPPING", level: "HIGH" },
  { label: "ASIA-PAC CAPITAL FLOWS", status: "MONITORING", level: "NORMAL" },
  { label: "NORTH AMERICA LOBBYING", status: "ACTIVE REVIEW", level: "NORMAL" },
  { label: "WHITE WING LANE 3", status: "TRENDING UP", level: "HIGH" },
];

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}Z`;
}

const catColor: Record<SignalItem["category"], string> = {
  GEOPOLITICAL: "text-red-400 border-red-500/20",
  MARKET: "text-amber-400 border-amber-500/20",
  ENERGY: "text-orange-400 border-orange-500/20",
  DEFENSE: "text-red-300 border-red-400/20",
  POLICY: "text-blue-400 border-blue-500/20",
  INTELLIGENCE: "text-emerald-400 border-emerald-500/20",
};

export default function SignalRoom() {
  const sorted = [...signals].sort((a, b) => {
    if (a.priority === "HIGH" && b.priority !== "HIGH") return -1;
    if (a.priority !== "HIGH" && b.priority === "HIGH") return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  const highCount = signals.filter(s => s.priority === "HIGH").length;

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
                {BREAKING.concat(BREAKING).map((item, i) => (
                  <span key={i} className="font-mono text-[10px] tracking-[0.08em] text-zinc-500 shrink-0">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="shrink-0 font-mono text-[9px] tracking-[0.3em] text-zinc-700 border-l border-zinc-900 px-4 py-3">
              INDICATIVE
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
                Monitored intelligence signal layer. Breaking geopolitical developments, market watch items,
                energy corridor tracking, and policy signals sourced from active RSR case files and ORION monitoring.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 font-mono text-[9px] tracking-[0.3em]">
              <span className="flex items-center gap-2 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                FEED ACTIVE
              </span>
              <span className="text-zinc-700">·</span>
              <span className="text-red-400">{highCount} HIGH PRIORITY</span>
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-600">MARCH 2026 CYCLE</span>
            </div>
          </div>
        </section>

        {/* ── MARKET STRIP ────────────────────────────────────────────── */}
        <div className="border border-zinc-900 bg-zinc-950/40 mb-6">
          <div className="border-b border-zinc-900 px-5 py-2.5 flex items-center justify-between">
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500">MARKET WATCH</div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-zinc-700">INDICATIVE — NOT LIVE DATA</div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-zinc-900">
            {marketWatchItems.map(m => (
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
              <span className="text-zinc-600">ACTIVE WATCH:</span>
              <span className="text-zinc-400">MIDDLE EAST · EU INFLUENCE · ASIA-PAC FLOWS · N. AMERICA POLICY</span>
              <span className="ml-auto text-zinc-600">{signals.length} SIGNALS — HIGH PRIORITY FIRST</span>
            </div>

            {/* Signal entries */}
            <div className="border border-zinc-900 border-t-0">
              {sorted.map((sig, i) => (
                <div
                  key={sig.id}
                  className={`px-5 py-5 ${i < sorted.length - 1 ? "border-b border-zinc-900" : ""} ${
                    sig.priority === "HIGH" ? "bg-zinc-950/40" : "bg-black"
                  } hover:bg-zinc-950/60 transition-colors`}
                >
                  <div className="flex items-start gap-4">
                    {/* Priority indicator */}
                    <div className="mt-2 shrink-0">
                      {sig.priority === "HIGH" ? (
                        <span className="w-2 h-2 rounded-full bg-red-400/80 block animate-pulse" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-zinc-700 block" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header row */}
                      <div className="flex items-center gap-3 mb-2.5 flex-wrap">
                        <span className={`font-mono text-[9px] tracking-[0.25em] border px-2 py-0.5 ${catColor[sig.category]}`}>
                          {sig.category}
                        </span>
                        <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-500">
                          {sig.source}
                        </span>
                        <span className="font-mono text-[9px] tracking-widest text-zinc-600">
                          {sig.region}
                        </span>
                        <span className="ml-auto font-mono text-[10px] tracking-widest text-zinc-600">
                          {formatTime(sig.timestamp)}
                        </span>
                        {sig.priority === "HIGH" && (
                          <span className="font-mono text-[9px] tracking-widest text-red-400/80 border border-red-900/30 px-2 py-0.5">
                            PRIORITY
                          </span>
                        )}
                      </div>

                      {/* Headline */}
                      <div className="font-mono text-xs tracking-[0.08em] text-zinc-100 mb-2.5 font-medium">
                        {sig.headline}
                      </div>

                      {/* Summary */}
                      <p className="text-[13px] text-zinc-500 leading-relaxed mb-3 font-mono tracking-[0.02em]">
                        {sig.summary}
                      </p>

                      {/* Ref links */}
                      {sig.refs && sig.refs.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {sig.refs.map(ref => (
                            <Link
                              key={ref}
                              href={ref.startsWith("F") ? `/files/${ref}` : `/dossiers/${ref}`}
                              className="font-mono text-[9px] tracking-widest text-zinc-600 hover:text-emerald-400 border border-zinc-800 hover:border-emerald-900/40 px-2 py-0.5 transition-colors"
                            >
                              {ref} →
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border border-zinc-900 border-t-0 bg-zinc-950 px-5 py-3 flex items-center gap-4">
              <div className="flex-1 font-mono text-[9px] tracking-[0.3em] text-zinc-700">
                OBSERVATION MODE — SIGNAL ROOM IS A MONITORED PUBLIC INTELLIGENCE LAYER
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

            {/* Watch board */}
            <div className="border border-zinc-900 p-4">
              <div className="font-mono text-[10px] tracking-[0.35em] text-zinc-500 mb-3">CURRENT WATCH</div>
              <div className="space-y-3">
                {watchItems.map(w => (
                  <div key={w.label} className="flex items-start justify-between gap-2 border-b border-zinc-900/50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <div className="font-mono text-[10px] tracking-[0.1em] text-zinc-300">{w.label}</div>
                      <div className="font-mono text-[9px] tracking-[0.15em] text-zinc-600 mt-0.5">{w.status}</div>
                    </div>
                    <span className={`font-mono text-[8px] tracking-[0.2em] border px-1.5 py-0.5 shrink-0 mt-0.5 ${
                      w.level === "HIGH" ? "text-red-400 border-red-500/20" : "text-zinc-600 border-zinc-800"
                    }`}>
                      {w.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional postures */}
            <div className="border border-zinc-900 p-4">
              <div className="font-mono text-[10px] tracking-[0.35em] text-zinc-500 mb-3">REGIONAL POSTURES</div>
              <div className="space-y-2.5">
                {[
                  { region: "Middle East",    posture: "CRITICAL", signals: 27 },
                  { region: "Eastern Europe", posture: "ELEVATED", signals: 16 },
                  { region: "Asia-Pacific",   posture: "ELEVATED", signals: 19 },
                  { region: "North America",  posture: "ELEVATED", signals: 22 },
                  { region: "Eur. Union",     posture: "STABLE",   signals: 14 },
                  { region: "Africa",         posture: "STABLE",   signals: 8 },
                ].map(r => (
                  <div key={r.region} className="flex items-center justify-between font-mono">
                    <span className="text-[10px] tracking-[0.08em] text-zinc-400">{r.region}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-700 text-[9px]">{r.signals}</span>
                      <span className={`text-[9px] tracking-[0.15em] ${
                        r.posture === "CRITICAL" ? "text-red-400" :
                        r.posture === "ELEVATED" ? "text-amber-400" : "text-zinc-600"
                      }`}>{r.posture}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-900">
                <Link href="/world" className="font-mono text-[9px] tracking-[0.2em] text-zinc-600 hover:text-emerald-500 transition-colors">
                  → WORLD MONITOR
                </Link>
              </div>
            </div>

            {/* Referenced records */}
            <div className="border border-zinc-900 p-4">
              <div className="font-mono text-[10px] tracking-[0.35em] text-zinc-500 mb-3">REFERENCED THIS CYCLE</div>
              <div className="space-y-1.5">
                {["F-001", "F-003", "F-006", "F-009", "F-010", "F-016", "F-017", "F-019"].map(ref => (
                  <Link key={ref} href={`/files/${ref}`} className="flex items-center gap-2 group">
                    <span className="font-mono text-[10px] tracking-widest text-zinc-600 group-hover:text-emerald-500 transition-colors">{ref}</span>
                    <span className="font-mono text-[9px] text-zinc-800 group-hover:text-zinc-600">→ FILE</span>
                  </Link>
                ))}
                {["D-001", "D-004", "D-007", "D-010", "D-013"].map(ref => (
                  <Link key={ref} href={`/dossiers/${ref}`} className="flex items-center gap-2 group">
                    <span className="font-mono text-[10px] tracking-widest text-zinc-600 group-hover:text-emerald-500 transition-colors">{ref}</span>
                    <span className="font-mono text-[9px] text-zinc-800 group-hover:text-zinc-600">→ DOSSIER</span>
                  </Link>
                ))}
              </div>
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
