import Layout from "@/components/Layout";
import SystemCard from "@/components/SystemCard";
import SignalFeed from "@/components/SignalFeed";
import { systems, feedItems } from "@/data/mockData";
import { Link } from "wouter";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col gap-20">

        {/* ── HERO — arrival / front door ─────────────────────────────── */}
        <section className="pt-6 pb-2">

          {/* Network status micro-label */}
          <div className="flex items-center gap-6 mb-10 font-mono text-[9px] tracking-[0.4em] text-zinc-700">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-600">NETWORK LIVE</span>
            </span>
            <span className="text-zinc-800">·</span>
            <span className="text-zinc-700">THREAT INDEX <span className="text-red-400/80">HIGH</span></span>
            <span className="text-zinc-800">·</span>
            <span className="text-zinc-700">55 SIGNALS ACTIVE</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight leading-[1.05] max-w-4xl">
            Mapping power.<br />
            Tracking systems.<br />
            <span className="text-zinc-500">Exposing reality.</span>
          </h1>

          <p className="mt-10 text-zinc-500 max-w-xl text-sm md:text-base leading-relaxed">
            RSR Intelligence Network is an independent analytic system built to map
            structures of power, track global activity, and surface information flows
            that institutional media ignores. We don't follow narratives — we map systems.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/systems"
              className="border border-emerald-500/40 bg-emerald-500/5 px-7 py-3 text-emerald-300 font-mono text-[11px] tracking-[0.35em] hover:bg-emerald-500/10 hover:border-emerald-500/60 transition-all"
            >
              ENTER SYSTEM
            </Link>
            <Link
              href="/files"
              className="border border-zinc-800 px-7 py-3 text-zinc-400 font-mono text-[11px] tracking-[0.35em] hover:border-zinc-600 hover:text-white transition-all"
            >
              VIEW FILES
            </Link>
          </div>
        </section>

        {/* ── DIVIDER — subtle visual break before content ─────────────── */}
        <div className="border-t border-zinc-900" />

        {/* ── SYSTEM PREVIEW — 3 of 5 systems, clearly a preview ───────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-1.5">OVERVIEW</div>
              <h2 className="font-mono text-[10px] tracking-[0.4em] text-zinc-400">CORE SYSTEMS</h2>
            </div>
            <Link
              href="/systems"
              className="font-mono text-[10px] tracking-[0.25em] text-emerald-600 hover:text-emerald-400 transition-colors flex items-center gap-2"
            >
              VIEW ALL SYSTEMS →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systems.slice(0, 3).map((system) => (
              <SystemCard key={system.name} {...system} />
            ))}
          </div>

          <div className="mt-4 text-right font-mono text-[9px] tracking-widest text-zinc-800">
            {systems.length - 3} ADDITIONAL MODULES IN SYSTEM LAYER
          </div>
        </section>

        {/* ── LIVE SIGNAL FEED + NETWORK STATUS ────────────────────────── */}
        <section className="grid lg:grid-cols-3 gap-8 items-start">

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-5">
              <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-pulse" />
                LIVE SIGNAL FEED
              </div>
              <Link href="/world" className="font-mono text-[9px] tracking-[0.2em] text-zinc-700 hover:text-zinc-400 transition-colors">
                WORLD MONITOR →
              </Link>
            </div>
            <SignalFeed items={feedItems} />
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 border-b border-zinc-900 pb-3 mb-5">
              NETWORK STATUS
            </div>
            <div className="border border-zinc-900 bg-black font-mono space-y-0">
              {[
                { label: "NETWORK",      value: "STABLE",   color: "text-emerald-400", bg: "bg-emerald-400/8" },
                { label: "SIGNAL LOAD",  value: "ELEVATED", color: "text-amber-400",   bg: "bg-amber-400/8"   },
                { label: "THREAT INDEX", value: "HIGH",     color: "text-red-400",     bg: "bg-red-400/8"     },
                { label: "AUTH MODE",    value: "SECURE",   color: "text-zinc-300",    bg: ""                 },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={`flex justify-between items-center px-5 py-4 ${i < arr.length - 1 ? "border-b border-zinc-900" : ""}`}
                >
                  <span className="text-[10px] tracking-widest text-zinc-600">{row.label}</span>
                  <span className={`text-[10px] tracking-widest px-2 py-1 ${row.color} ${row.bg}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Access node */}
            <div className="mt-5 border border-zinc-900 bg-zinc-950/50 p-5">
              <div className="font-mono text-[9px] tracking-[0.35em] text-zinc-700 mb-3">ACCESS NODE</div>
              <p className="text-xs text-zinc-700 leading-relaxed mb-4">
                Deeper system access requires authorization.
              </p>
              <div className="flex gap-2">
                <button className="flex-1 border border-emerald-500/30 bg-emerald-500/5 py-2 text-emerald-400 font-mono text-[9px] tracking-[0.3em] hover:bg-emerald-500/10 transition-colors">
                  REQUEST ACCESS
                </button>
                <button className="flex-1 border border-zinc-800 py-2 text-zinc-500 font-mono text-[9px] tracking-[0.3em] hover:border-zinc-600 hover:text-zinc-300 transition-colors">
                  LOGIN
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
