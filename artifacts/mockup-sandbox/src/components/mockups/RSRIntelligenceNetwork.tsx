export default function RSRIntelligenceNetworkMockup() {
  const systems = [
    { name: "AXION", role: "Executive Briefs", status: "LIVE", items: "01", description: "Daily synthesis, signal triage, and priority brief generation." },
    { name: "ATLAS", role: "Entity Mapping", status: "CORE", items: "03", description: "Profiles, relationships, dossiers, and structured network mapping." },
    { name: "ORION", role: "World Monitor", status: "LIVE", items: "08", description: "Regional watch, global events, and location-based signal tracking." },
    { name: "BLACK DOG", role: "Restricted Review", status: "RESTRICTED", items: "02", description: "Anomalies, cyber incidents, and sensitive activity review." },
    { name: "WHITE WING", role: "Battlespace", status: "TRACKING", items: "05", description: "Conflict lanes, escalation markers, and tactical incident monitoring." },
  ];

  const statusColor = (status: string) => {
    if (status === "LIVE") return "text-emerald-400";
    if (status === "CORE") return "text-cyan-400";
    if (status === "RESTRICTED") return "text-red-400";
    if (status === "TRACKING") return "text-amber-400";
    return "text-zinc-500";
  };

  const feed = [
    "MULTI-SOURCE CONFIRMATION ACTIVE — 2 REGIONS ESCALATING",
    "ATLAS ENTITY GRAPH EXPANDED — NEW NODE LINKED",
    "BLACK DOG REVIEW QUEUE OPEN — RESTRICTED SIGNALS",
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 relative overflow-hidden">

      {/* GLOBAL SCANLINES */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay bg-[linear-gradient(transparent_95%,rgba(16,185,129,0.4)_100%)] bg-[length:100%_4px]"></div>

      <div className="mx-auto max-w-7xl px-6 py-6 relative z-10">

        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-emerald-500/10 pb-5">
          <div className="flex items-center gap-4">

            {/* LOGO */}
            <div className="h-16 w-16 rounded-full border border-emerald-500/20 bg-black flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <div className="h-10 w-10 rounded-full border border-emerald-500/40 flex items-center justify-center">
                <span className="font-mono text-[8px] tracking-[0.3em] text-emerald-400">RSR</span>
              </div>
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-[0.4em] text-emerald-400">RSR INTELLIGENCE NETWORK</div>
              <div className="text-sm text-zinc-500">INDEPENDENT ANALYSIS SYSTEM</div>
            </div>
          </div>

          <nav className="flex gap-2 font-mono text-[10px] tracking-[0.35em]">
            {["SYSTEMS", "FILES", "DOSSIERS", "WORLD"].map((item) => (
              <button key={item} className="px-3 py-2 border border-zinc-800 bg-black text-zinc-500 hover:text-emerald-300 hover:border-emerald-500/40 transition">
                {item}
              </button>
            ))}
          </nav>
        </header>

        {/* HERO */}
        <section className="py-16">
          <div className="font-mono text-[10px] tracking-[0.4em] text-emerald-400 mb-4">NETWORK OVERVIEW</div>

          <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight max-w-3xl">
            Mapping power. Tracking systems. Exposing reality.
          </h1>

          <p className="mt-6 text-zinc-400 max-w-2xl text-sm leading-7">
            RSR Intelligence Network is an independent system built to analyze structures of power, global activity, and information flow. We don't follow narratives — we map systems.
          </p>

          <div className="mt-8 flex gap-4">
            <button className="border border-emerald-500/40 px-5 py-2 text-emerald-300 font-mono text-[10px] tracking-[0.3em] hover:bg-emerald-500/10 transition">
              ENTER SYSTEM
            </button>
            <button className="border border-zinc-800 px-5 py-2 text-zinc-400 font-mono text-[10px] tracking-[0.3em] hover:border-zinc-600 transition">
              VIEW FILES
            </button>
          </div>
        </section>

        {/* SYSTEMS */}
        <section className="mb-10">
          <div className="font-mono text-[10px] tracking-[0.4em] text-emerald-400 mb-4">CORE SYSTEMS</div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {systems.map((system) => (
              <div key={system.name} className="group border border-zinc-900 bg-black/80 p-5 hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]">

                {/* hover scan */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-[linear-gradient(transparent_95%,rgba(16,185,129,0.4)_100%)] bg-[length:100%_6px]"></div>

                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono text-[11px] tracking-[0.35em] text-emerald-400">{system.name}</div>
                    <div className="mt-1 text-[10px] text-zinc-500 font-mono tracking-[0.25em]">{system.role}</div>
                  </div>
                  <div className={`text-[10px] font-mono ${statusColor(system.status)}`}>
                    {system.status}
                  </div>
                </div>

                <p className="mt-4 text-sm text-zinc-400 leading-6">{system.description}</p>

                <div className="mt-4 border-t border-zinc-900 pt-3 flex justify-between text-[10px] font-mono">
                  <span className="text-zinc-500">ACTIVE</span>
                  <span className="text-emerald-300">{system.items}</span>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500/0 group-hover:bg-emerald-500/40 transition"></div>
              </div>
            ))}
          </div>
        </section>

        {/* SIGNAL + STATUS */}
        <section className="grid md:grid-cols-3 gap-4 mb-10">

          <div className="md:col-span-2">
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 mb-3">LIVE SIGNAL FEED</div>
            <div className="space-y-2">
              {feed.map((item) => (
                <div key={item} className="border border-zinc-900 bg-black/60 px-4 py-3 text-sm text-zinc-300 font-mono tracking-[0.15em] transition hover:border-emerald-500/30">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 mb-3">NETWORK STATUS</div>
            <div className="border border-zinc-900 p-4 text-sm font-mono space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>NETWORK</span>
                <span className="text-emerald-400">STABLE</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>SIGNAL LOAD</span>
                <span className="text-amber-400">ELEVATED</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>THREAT INDEX</span>
                <span className="text-red-400">HIGH</span>
              </div>
            </div>
          </div>

        </section>

        {/* ACCESS */}
        <section className="border-t border-zinc-900 pt-6">
          <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-600 mb-3">ACCESS NODE</div>
          <div className="flex gap-3">
            <button className="border border-emerald-500/40 px-4 py-2 text-emerald-300 font-mono text-[10px] tracking-[0.3em] hover:bg-emerald-500/10 transition">
              REQUEST ACCESS
            </button>
            <button className="border border-zinc-800 px-4 py-2 text-zinc-400 font-mono text-[10px] tracking-[0.3em] hover:border-zinc-600 transition">
              LOGIN
            </button>
          </div>
        </section>

        <footer className="mt-10 border-t border-zinc-900 pt-4 text-[10px] font-mono tracking-[0.4em] text-zinc-600">
          RSR // INTELLIGENCE NETWORK
        </footer>
      </div>
    </div>
  );
}
