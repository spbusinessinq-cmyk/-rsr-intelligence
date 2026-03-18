import Layout from "@/components/Layout";
import SystemCard from "@/components/SystemCard";
import SignalFeed from "@/components/SignalFeed";
import { systems, feedItems } from "@/data/mockData";

// Session uptime — static for now; replace with a useEffect timer for live uptime
const SESSION_START = "T-04:17:22";

const diagnostics = [
  { label: "UPTIME",     value: "99.98%",  color: "text-emerald-400" },
  { label: "LATENCY",    value: "24ms",    color: "text-emerald-400" },
  { label: "ENCRYPTION", value: "AES-256", color: "text-zinc-400"    },
  { label: "NODES",      value: "1,492",   color: "text-zinc-400"    },
  { label: "INTEGRITY",  value: "NOMINAL", color: "text-emerald-400" },
];

export default function Systems() {
  return (
    <Layout>
      <div className="flex flex-col gap-10">

        {/* ── SESSION BAR — makes this page feel like an active OS shell ─── */}
        <div className="border border-zinc-900 bg-zinc-950 px-5 py-3 flex flex-wrap items-center gap-6 font-mono text-[10px] tracking-[0.3em]">
          <span className="flex items-center gap-2 text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SESSION ACTIVE
          </span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-600">ELAPSED {SESSION_START}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-600">MODULES: <span className="text-zinc-400">{systems.length} LOADED</span></span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-600">CLASSIFICATION: <span className="text-amber-400/80">RESTRICTED</span></span>
        </div>

        {/* ── PAGE HEADER ───────────────────────────────────────────────── */}
        <section className="border-b border-zinc-900 pb-8">
          <div className="font-mono text-[10px] tracking-[0.45em] text-emerald-400 mb-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-emerald-400" />
            SYSTEM ARCHITECTURE
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
              CORE SYSTEMS LAYER
            </h1>
            <div className="font-mono text-[11px] tracking-[0.3em] text-zinc-500 bg-zinc-950 px-4 py-2 border border-zinc-900 shrink-0">
              ACTIVE MODULES: <span className="text-emerald-400 ml-2">0{systems.length}</span>
            </div>
          </div>
        </section>

        {/* ── MAIN LAYOUT: modules + sidebar ────────────────────────────── */}
        <div className="grid xl:grid-cols-4 gap-8 items-start">

          {/* Module grid */}
          <div className="xl:col-span-3">
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-700 mb-5">DEPLOYED MODULES</div>
            <div className="grid md:grid-cols-2 gap-4">
              {systems.map((system) => (
                <SystemCard key={system.name} {...system} large />
              ))}
            </div>
          </div>

          {/* Sidebar — diagnostics + system logs */}
          <div className="xl:col-span-1 space-y-8 sticky top-6">

            {/* Diagnostics */}
            <div>
              <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-600 mb-4 border-b border-zinc-900 pb-3">
                DIAGNOSTICS
              </div>
              <div className="border border-zinc-900 bg-black divide-y divide-zinc-900">
                {diagnostics.map(stat => (
                  <div key={stat.label} className="flex justify-between items-center px-4 py-3 font-mono text-[11px] tracking-widest">
                    <span className="text-zinc-700">{stat.label}</span>
                    <span className={stat.color}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture note */}
            <div className="border border-zinc-900 p-4">
              <div className="font-mono text-[10px] tracking-[0.3em] text-zinc-600 mb-3">ARCHITECTURE</div>
              <p className="text-[11px] text-zinc-700 leading-relaxed font-mono">
                Modular analytic stack. Each system operates independently with
                shared signal routing. Expand any module for sub-layer access.
              </p>
            </div>

            {/* System logs feed */}
            <div>
              <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-600 mb-4 border-b border-zinc-900 pb-3">
                SYSTEM LOGS
              </div>
              <SignalFeed items={feedItems.slice(0, 4)} />
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
}
