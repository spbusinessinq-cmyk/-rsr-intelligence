import { Link } from "wouter";
import Layout from "@/components/Layout";
import { dossiers, type DossierStatus } from "@/data/mockData";

function statusStyle(status: DossierStatus): string {
  if (status === "ACTIVE")     return "border-emerald-500/30 text-emerald-400";
  if (status === "MONITORING") return "border-amber-500/30 text-amber-400";
  return "border-zinc-800 text-zinc-600";
}

function statusDot(status: DossierStatus) {
  if (status === "ACTIVE")     return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />;
  if (status === "MONITORING") return <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />;
}

export default function Dossiers() {
  return (
    <Layout>
      <div className="flex flex-col gap-10">

        {/* Heading */}
        <section className="border-b border-zinc-900 pb-6">
          <div className="font-mono text-[11px] tracking-[0.4em] text-emerald-400 mb-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-emerald-400" />
            TARGETS & NETWORKS
          </div>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
              ENTITY DOSSIERS
            </h1>
            <div className="font-mono text-[11px] tracking-widest text-zinc-600 shrink-0">
              {dossiers.length} ENTITIES
            </div>
          </div>
        </section>

        {/* Search bar */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[11px] tracking-widest text-zinc-700 pointer-events-none">
            SEARCH:
          </span>
          <input
            type="text"
            placeholder="Entity name, ID, region, or network..."
            className="w-full bg-black border border-zinc-900 text-zinc-300 font-mono text-xs py-3 pl-20 pr-4 focus:outline-none focus:border-emerald-500/40 transition-colors placeholder:text-zinc-800"
          />
        </div>

        {/* Dossier grid — each card is a Link */}
        <div className="grid md:grid-cols-2 gap-3">
          {dossiers.map(entity => (
            <Link
              key={entity.id}
              href={`/dossiers/${entity.id}`}
              className="group border border-zinc-900 bg-black/60 p-5 hover:border-zinc-700 transition-all flex flex-col relative block"
            >
              {/* Demo record label */}
              <span className="absolute top-3 right-3 font-mono text-[9px] tracking-widest text-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
                DEMO RECORD
              </span>

              {/* Header row */}
              <div className="flex justify-between items-start mb-5 pb-4 border-b border-zinc-900">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="font-mono text-[10px] tracking-widest text-zinc-600">{entity.id}</span>
                    <span className="font-mono text-[10px] tracking-widest px-1.5 py-0.5 border border-zinc-800 bg-zinc-950 text-zinc-500 uppercase">
                      {entity.type}
                    </span>
                    <span className="font-mono text-[10px] tracking-widest text-zinc-700 uppercase">
                      {entity.classification}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusDot(entity.status)}
                    <h3 className="text-lg font-medium text-zinc-200 group-hover:text-emerald-300 transition-colors tracking-wide">
                      {entity.name}
                    </h3>
                  </div>
                </div>

                <span className={`font-mono text-[10px] tracking-widest px-2 py-1 border uppercase shrink-0 ${statusStyle(entity.status)}`}>
                  {entity.status}
                </span>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-700 mb-1">REGION</div>
                  <div className="font-mono text-[11px] tracking-widest text-zinc-400 uppercase">{entity.region}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-700 mb-1">NETWORK</div>
                  <div className="font-mono text-[11px] tracking-widest text-zinc-400 uppercase">{entity.network}</div>
                </div>
              </div>

              {/* Notes */}
              <div className="flex-1">
                <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-700 mb-2">ANALYST NOTES</div>
                <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors line-clamp-3">
                  {entity.notes}
                </p>
              </div>

              {/* Expand hint */}
              <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-end">
                <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-700 group-hover:text-emerald-500 transition-colors">
                  OPEN RECORD →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Relationship mapping teaser */}
        <div className="border border-dashed border-zinc-900 p-6 text-center">
          <div className="font-mono text-[11px] tracking-[0.3em] text-zinc-600 mb-2">
            RELATIONSHIP MAPPING — COMING NEXT CYCLE
          </div>
          <p className="text-xs text-zinc-700 max-w-md mx-auto leading-relaxed">
            Graph visualization of entity connections, capital flows, and shared principals is currently in development.
          </p>
        </div>

      </div>
    </Layout>
  );
}
