import { useState, useEffect } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import SignalFeed from "@/components/SignalFeed";
import { regions, feedItems, type RegionPosture } from "@/data/mockData";

const regionLinks: Record<string, { files: string[]; dossiers: string[]; system: string }> = {
  "Middle East":    { files: ["F-016", "F-018"], dossiers: ["D-009"],        system: "white-wing" },
  "Eastern Europe": { files: ["F-010", "F-017"], dossiers: ["D-006", "D-013"], system: "orion" },
  "North America":  { files: ["F-001", "F-009"], dossiers: ["D-001", "D-007"], system: "atlas" },
  "European Union": { files: ["F-003", "F-007"], dossiers: ["D-002", "D-008"], system: "atlas" },
  "Asia-Pacific":   { files: ["F-006", "F-013"], dossiers: ["D-004", "D-011"], system: "atlas" },
};

function postureColor(posture: RegionPosture): string {
  if (posture === "CRITICAL") return "text-red-400 border-red-500/20 bg-red-500/5";
  if (posture === "ELEVATED") return "text-amber-400 border-amber-500/20 bg-amber-500/5";
  return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
}

function postureIndicator(posture: RegionPosture): string {
  if (posture === "CRITICAL") return "bg-red-500 animate-pulse";
  if (posture === "ELEVATED") return "bg-amber-400";
  return "bg-emerald-400";
}

function activityBar(activity: string): string {
  if (activity === "CRITICAL") return "w-full bg-red-400";
  if (activity === "HIGH")     return "w-3/4 bg-amber-400";
  if (activity === "MODERATE") return "w-1/2 bg-emerald-400";
  return "w-1/4 bg-zinc-600";
}

function formatLastUpdated(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000 / 60);
  if (diff < 60)   return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function World() {
  const totalSignals  = regions.reduce((acc, r) => acc + r.signals, 0);
  const criticalCount = regions.filter(r => r.posture === "CRITICAL").length;

  return (
    <Layout>
      <div className="flex flex-col gap-8">

        {/* ── PAGE HEADER ───────────────────────────────────────────────── */}
        <section className="border-b border-zinc-900 pb-6">
          <div className="font-mono text-[10px] tracking-[0.45em] text-emerald-400 mb-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-emerald-400" />
            GLOBAL POSTURE
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
            WORLD MONITOR
          </h1>
        </section>

        {/* ── GLOBAL SUMMARY BAR ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 border border-zinc-900 bg-black divide-x divide-zinc-900">
          <div className="p-5">
            <div className="font-mono text-[10px] tracking-[0.25em] text-zinc-700 mb-3">OVERALL THREAT</div>
            <div className="font-mono text-base text-amber-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              ELEVATED
            </div>
          </div>
          <div className="p-5">
            <div className="font-mono text-[10px] tracking-[0.25em] text-zinc-700 mb-3">ACTIVE SIGNALS</div>
            <div className="font-mono text-base text-white">{totalSignals}</div>
          </div>
          <div className="p-5">
            <div className="font-mono text-[10px] tracking-[0.25em] text-zinc-700 mb-3">CRITICAL ZONES</div>
            <div className="font-mono text-base text-red-400">{criticalCount}</div>
          </div>
          <div className="p-5">
            <div className="font-mono text-[10px] tracking-[0.25em] text-zinc-700 mb-3">SYSTEM CLOCK</div>
            {/* Live clock — reuse UTCClock's tick logic inline */}
            <LiveSystemClock />
          </div>
        </div>

        {/* ── GEOSPATIAL LAYER PLACEHOLDER ─────────────────────────────── */}
        <div className="border border-zinc-900 bg-zinc-950 h-28 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(24,24,27,0.4)_12px,rgba(24,24,27,0.4)_13px)]" />
          <div className="relative z-10 border border-zinc-800 bg-black px-6 py-3 text-center">
            <div className="font-mono text-[11px] tracking-[0.35em] text-zinc-600">
              GEOSPATIAL LAYER OFFLINE — REGIONAL ANALYSIS ACTIVE
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT: regions + sidebar ───────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* Regions grid */}
          <div className="lg:col-span-2">
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-600 mb-4">REGIONAL POSTURE</div>
            <div className="grid md:grid-cols-2 gap-4">
              {regions.map((region) => (
                <div
                  key={region.region}
                  className={`border p-5 relative overflow-hidden hover:brightness-110 transition-all ${postureColor(region.posture)}`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="text-base font-medium text-white mb-1.5">{region.region}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${postureIndicator(region.posture)}`} />
                        <span className="font-mono text-[10px] tracking-widest uppercase">{region.posture}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[28px] font-bold leading-none">{region.signals}</div>
                      <div className="font-mono text-[9px] tracking-[0.2em] opacity-50 mt-1">SIGNALS</div>
                    </div>
                  </div>

                  {/* Activity bar */}
                  <div className="mb-4">
                    <div className="font-mono text-[9px] tracking-[0.2em] opacity-50 mb-1.5">ACTIVITY</div>
                    <div className="h-[2px] bg-black/40 w-full">
                      <div className={`h-full ${activityBar(region.activity)}`} />
                    </div>
                  </div>

                  {/* Active lanes */}
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.2em] opacity-50 mb-2">ACTIVE LANES</div>
                    <div className="flex flex-wrap gap-1.5">
                      {region.lanes.map(lane => (
                        <span key={lane} className="font-mono text-[9px] tracking-widest bg-black/40 px-2 py-1 uppercase border border-current/15">
                          {lane}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Last updated */}
                  <div className="mt-4 font-mono text-[9px] tracking-widest opacity-40">
                    UPDATED {formatLastUpdated(region.lastUpdated)}
                  </div>

                  {/* Cross-links */}
                  {regionLinks[region.region] && (
                    <div className="mt-4 pt-3 border-t border-current/10">
                      <div className="font-mono text-[9px] tracking-[0.2em] opacity-40 mb-2">RELATED RECORDS</div>
                      <div className="flex flex-wrap gap-1.5">
                        {regionLinks[region.region].files.map(id => (
                          <Link
                            key={id}
                            href={`/files/${id}`}
                            className="font-mono text-[9px] tracking-widest bg-black/60 px-2 py-1 border border-current/15 hover:border-current/40 transition-colors"
                            onClick={e => e.stopPropagation()}
                          >
                            {id}
                          </Link>
                        ))}
                        {regionLinks[region.region].dossiers.map(id => (
                          <Link
                            key={id}
                            href={`/dossiers/${id}`}
                            className="font-mono text-[9px] tracking-widest bg-black/60 px-2 py-1 border border-current/15 hover:border-current/40 transition-colors opacity-70"
                            onClick={e => e.stopPropagation()}
                          >
                            {id}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div>
              <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-600 mb-4 border-b border-zinc-900 pb-3">
                GLOBAL SIGNAL CLUSTER
              </div>
              <SignalFeed items={feedItems} />
            </div>

            <div className="border border-zinc-900 p-5">
              <div className="font-mono text-[10px] tracking-[0.3em] text-emerald-400/70 mb-3 flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-400/70" />
                SATELLITE DOWNLINK
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed font-mono">
                Receiving periodic bursts from low-orbit relays.
                Next expected transmission window in T-14:22:00.
                Signal decryption nominal.
              </p>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

// Inline live clock component — simpler than importing and styling UTCClock
function LiveSystemClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <div className="font-mono text-base text-zinc-300">
      {pad(time.getUTCHours())}:{pad(time.getUTCMinutes())} UTC
    </div>
  );
}
