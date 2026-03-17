import Layout from "@/components/Layout";
import SystemCard from "@/components/SystemCard";
import SignalFeed from "@/components/SignalFeed";
import { systems, feedItems } from "@/data/mockData";
import { Link } from "wouter";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col gap-20">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="pt-4 pb-2 flex gap-8 lg:gap-16 items-center">

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-5 mb-10 font-mono text-[9px] tracking-[0.4em] text-zinc-700">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-zinc-600">NETWORK LIVE</span>
              </span>
              <span className="text-zinc-800">·</span>
              <span>THREAT INDEX <span className="text-red-400/80">HIGH</span></span>
              <span className="text-zinc-800">·</span>
              <span>106 SIGNALS ACTIVE</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight leading-[1.05]">
              Mapping power.<br />
              Tracking systems.<br />
              <span className="text-zinc-500">Exposing reality.</span>
            </h1>

            <p className="mt-10 text-zinc-500 max-w-lg text-sm leading-relaxed">
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
          </div>

          <div className="hidden lg:flex items-center justify-center shrink-0 pointer-events-none select-none">
            <img
              src="/logo.png"
              alt=""
              aria-hidden="true"
              className="h-72 w-auto object-contain animate-logo-reveal grayscale"
            />
          </div>
        </section>

        <div className="border-t border-zinc-900" />

        {/* ── SYSTEM PREVIEW ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-1.5">OVERVIEW</div>
              <h2 className="font-mono text-[10px] tracking-[0.4em] text-zinc-400">CORE SYSTEMS</h2>
            </div>
            <Link
              href="/systems"
              className="font-mono text-[10px] tracking-[0.25em] text-emerald-600 hover:text-emerald-400 transition-colors"
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
            <SignalFeed items={feedItems.slice(0, 7)} />
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 border-b border-zinc-900 pb-3 mb-5">
              NETWORK STATUS
            </div>
            <div className="border border-zinc-900 bg-black font-mono">
              {[
                { label: "NETWORK",      value: "STABLE",   color: "text-emerald-400" },
                { label: "SIGNAL LOAD",  value: "ELEVATED", color: "text-amber-400"   },
                { label: "THREAT INDEX", value: "HIGH",     color: "text-red-400"     },
                { label: "AUTH MODE",    value: "SECURE",   color: "text-zinc-300"    },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={`flex justify-between items-center px-5 py-4 ${i < arr.length - 1 ? "border-b border-zinc-900" : ""}`}
                >
                  <span className="text-[10px] tracking-widest text-zinc-600">{row.label}</span>
                  <span className={`text-[10px] tracking-widest ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Access node — evolved */}
            <div className="mt-5 border border-zinc-900 bg-zinc-950/50 p-5">
              <div className="font-mono text-[9px] tracking-[0.35em] text-zinc-700 mb-1">ACCESS NODE</div>
              <p className="text-xs text-zinc-700 leading-relaxed mb-4 mt-2">
                Partner, media, and institutional inquiries. Analyst access to Signal Room and Investigation Room.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/briefing"
                  className="w-full border border-emerald-500/25 bg-emerald-500/5 py-2.5 text-emerald-500/80 font-mono text-[9px] tracking-[0.3em] hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors text-left px-4 block"
                >
                  REQUEST BRIEFING →
                </Link>
                <Link
                  href="/signal-room"
                  className="w-full border border-zinc-800 py-2.5 text-zinc-500 font-mono text-[9px] tracking-[0.3em] hover:border-zinc-600 hover:text-zinc-300 transition-colors text-left px-4 block"
                >
                  ENTER SIGNAL ROOM →
                </Link>
                <Link
                  href="/investigation-room"
                  className="w-full border border-zinc-900 py-2.5 text-zinc-700 font-mono text-[9px] tracking-[0.3em] hover:border-zinc-700 hover:text-zinc-400 transition-colors text-left px-4 block"
                >
                  INVESTIGATION ROOM →
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
