import { Link } from "wouter";
import Layout from "@/components/Layout";
import { nameToSlug, slugToSystemDetail } from "@/data/systemDetails";
import type { SystemDetailData } from "@/data/systemDetails";

interface SystemDetailProps {
  params: { slug: string };
}

function statusStyle(status: string) {
  if (status === "PRIMARY")    return "text-emerald-300 border-emerald-500/40 bg-emerald-500/10";
  if (status === "LIVE")       return "text-emerald-400 border-emerald-500/30 bg-emerald-500/8";
  if (status === "CORE")       return "text-cyan-400 border-cyan-500/30 bg-cyan-500/8";
  if (status === "RESTRICTED") return "text-red-400 border-red-500/30 bg-red-500/8";
  if (status === "TRACKING")   return "text-amber-400 border-amber-500/30 bg-amber-500/8";
  return "text-zinc-400 border-zinc-700 bg-zinc-900";
}

function StatusDot({ status }: { status: string }) {
  if (status === "PRIMARY")    return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />;
  if (status === "LIVE")       return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />;
  if (status === "RESTRICTED") return <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />;
  if (status === "TRACKING")   return <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />;
}

export default function SystemDetail({ params }: SystemDetailProps) {
  const system = slugToSystemDetail(params.slug);

  if (!system) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32 gap-4 font-mono">
          <div className="text-[11px] tracking-[0.4em] text-zinc-600">SYSTEM NOT FOUND</div>
          <div className="text-2xl text-white">{params.slug.toUpperCase()}</div>
          <Link href="/systems" className="mt-6 border border-zinc-800 px-5 py-2 text-zinc-500 text-[11px] tracking-[0.3em] hover:text-white hover:border-zinc-600 transition-colors">
            ← BACK TO SYSTEMS
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-12">

        {/* ── BREADCRUMB ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.35em] text-zinc-700">
          <Link href="/systems" className="hover:text-zinc-400 transition-colors">← SYSTEMS</Link>
          <span>/</span>
          <span className="text-zinc-500">{system.name}</span>
        </div>

        {/* ── HEADER BLOCK ───────────────────────────────────────────────── */}
        <section className="border-b border-zinc-900 pb-10">
          <div className="flex flex-wrap items-center gap-3 mb-6 font-mono text-[10px] tracking-[0.4em]">
            <span className="text-zinc-700">{system.layer}</span>
            <span className="text-zinc-800">·</span>
            <span className="text-zinc-700">{system.category}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <StatusDot status={system.status} />
                <span className={`font-mono text-[11px] tracking-widest px-2.5 py-1 border ${statusStyle(system.status)}`}>
                  {system.status}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight mb-3">
                {system.name}
              </h1>
              <div className="font-mono text-[11px] tracking-[0.3em] text-emerald-400/70 uppercase">
                {system.role}
              </div>
              {system.identity && (
                <div className="mt-2 font-mono text-[10px] tracking-[0.2em] text-zinc-600">
                  {system.identity}
                </div>
              )}
            </div>

            <div className="font-mono text-sm text-zinc-500 max-w-md text-right hidden md:block leading-relaxed">
              {system.tagline}
            </div>
          </div>

          <p className="mt-6 font-mono text-sm text-zinc-500 md:hidden leading-relaxed">
            {system.tagline}
          </p>
        </section>

        {/* ── OVERVIEW ───────────────────────────────────────────────────── */}
        <section className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-3">
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-700 mb-4">SYSTEM OVERVIEW</div>
            <h2 className="text-xl md:text-2xl text-white font-medium mb-6 leading-snug">
              {system.overview.headline}
            </h2>
            <div className="space-y-4">
              {system.overview.body.map((para, i) => (
                <p key={i} className="text-zinc-500 text-sm leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
            {system.externalUrl && (
              <div className="mt-6">
                <a
                  href={system.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center border border-emerald-500/40 bg-emerald-500/5 px-5 py-2.5 text-emerald-400 font-mono text-[11px] tracking-[0.3em] hover:border-emerald-500/70 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
                >
                  VISIT {system.name} ↗
                </a>
              </div>
            )}
          </div>

          {/* Operational command panel */}
          <div className="md:col-span-2">
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-700 mb-4">OPERATIONAL STATUS</div>
            <div className="border border-zinc-900 bg-black divide-y divide-zinc-900">
              {system.operationalStats.map((stat) => (
                <div key={stat.label} className="flex justify-between items-center px-5 py-3 font-mono">
                  <span className="text-[10px] tracking-widest text-zinc-700">{stat.label}</span>
                  <span className={`text-[11px] tracking-widest ${stat.color ?? "text-zinc-400"}`}>{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Related systems */}
            {system.relatedSystems.length > 0 && (
              <div className="mt-6">
                <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-700 mb-3">RELATED SYSTEMS</div>
                <div className="flex flex-wrap gap-2">
                  {system.relatedSystems.map((slug) => (
                    <Link
                      key={slug}
                      href={`/systems/${slug}`}
                      className="font-mono text-[10px] tracking-widest px-3 py-1.5 border border-zinc-800 text-zinc-600 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors uppercase"
                    >
                      {slug.replace("-", " ")}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── CAPABILITIES ──────────────────────────────────────────────── */}
        <section>
          <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-700 mb-6 border-b border-zinc-900 pb-3">
            CAPABILITIES & FUNCTIONS
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {system.capabilities.map((cap) => (
              <div
                key={cap.label}
                className="group border border-zinc-900 bg-black/60 p-5 hover:border-zinc-700 transition-colors"
              >
                <div className="font-mono text-[10px] tracking-[0.35em] text-zinc-700 mb-2">{cap.label}</div>
                <div className="font-mono text-[11px] tracking-[0.15em] text-emerald-400/80 uppercase mb-3">{cap.title}</div>
                <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                  {cap.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── MISSION APPLICATIONS ──────────────────────────────────────── */}
        <section>
          <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-700 mb-6 border-b border-zinc-900 pb-3">
            MISSION APPLICATIONS
          </div>
          <div className="space-y-0 border border-zinc-900">
            {system.missionApplications.map((app, i, arr) => (
              <div
                key={i}
                className={`grid md:grid-cols-3 gap-4 px-6 py-5 ${i < arr.length - 1 ? "border-b border-zinc-900" : ""}`}
              >
                <div className="font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase self-start md:pt-0.5">
                  {app.context}
                </div>
                <div className="md:col-span-2 text-sm text-zinc-500 leading-relaxed">
                  {app.use}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── DOCTRINE ──────────────────────────────────────────────────── */}
        {system.doctrine && (
          <section className="border-l-2 border-emerald-500/30 pl-6 py-1">
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-700 mb-2">DOCTRINE</div>
            <p className="font-mono text-sm text-zinc-400 leading-relaxed tracking-[0.05em]">
              {system.doctrine}
            </p>
          </section>
        )}

        {/* ── RELATED INTELLIGENCE ──────────────────────────────────────── */}
        {(system.relatedFiles.length > 0 || system.relatedDossiers.length > 0) && (
          <section>
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-700 mb-5 border-b border-zinc-900 pb-3">
              RELATED INTELLIGENCE
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {system.relatedFiles.length > 0 && (
                <div>
                  <div className="font-mono text-[10px] tracking-[0.3em] text-zinc-700 mb-3 flex items-center gap-2">
                    <span className="w-1 h-1 bg-zinc-700" />
                    ACTIVE FILES
                  </div>
                  <div className="space-y-2">
                    {system.relatedFiles.map(id => (
                      <Link
                        key={id}
                        href={`/files/${id}`}
                        className="flex items-center justify-between group border border-zinc-900 bg-zinc-950/40 px-4 py-3 hover:border-zinc-700 transition-colors"
                      >
                        <span className="font-mono text-[11px] tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">{id}</span>
                        <span className="font-mono text-[9px] tracking-widest text-zinc-800 group-hover:text-emerald-500 transition-colors">FILE →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {system.relatedDossiers.length > 0 && (
                <div>
                  <div className="font-mono text-[10px] tracking-[0.3em] text-zinc-700 mb-3 flex items-center gap-2">
                    <span className="w-1 h-1 bg-zinc-700" />
                    LINKED ENTITIES
                  </div>
                  <div className="space-y-2">
                    {system.relatedDossiers.map(id => (
                      <Link
                        key={id}
                        href={`/dossiers/${id}`}
                        className="flex items-center justify-between group border border-zinc-900 bg-zinc-950/40 px-4 py-3 hover:border-zinc-700 transition-colors"
                      >
                        <span className="font-mono text-[11px] tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">{id}</span>
                        <span className="font-mono text-[9px] tracking-widest text-zinc-800 group-hover:text-emerald-500 transition-colors">DOSSIER →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── INTERFACE PREVIEW STRIP ───────────────────────────────────── */}
        <section>
          <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-700 mb-4">INTERFACE LAYER</div>
          <div className="border border-zinc-900 bg-zinc-950 relative overflow-hidden">
            {/* Mock terminal header */}
            <div className="border-b border-zinc-900 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 font-mono text-[10px] tracking-widest text-zinc-600">
                <StatusDot status={system.status} />
                <span>{system.name} // SYSTEM INTERFACE</span>
              </div>
              <span className="font-mono text-[10px] tracking-widest text-zinc-800">PREVIEW ONLY</span>
            </div>

            {/* Mock terminal content */}
            <div className="p-6 font-mono text-[11px] tracking-[0.1em] space-y-2">
              <div className="text-zinc-700">&gt; SYSTEM: {system.name}</div>
              <div className="text-zinc-700">&gt; STATUS: <span className={statusStyle(system.status).split(" ")[0]}>{system.status}</span></div>
              <div className="text-zinc-700">&gt; LAYER:  {system.layer}</div>
              <div className="text-zinc-700">&gt; ─────────────────────────────────────────────</div>
              {system.operationalStats.slice(0, 4).map(stat => (
                <div key={stat.label} className="text-zinc-700">
                  &gt; {stat.label.padEnd(18)}<span className={stat.color ?? "text-zinc-500"}>{stat.value}</span>
                </div>
              ))}
              <div className="text-zinc-700">&gt; ─────────────────────────────────────────────</div>
              <div className="text-emerald-700/60 animate-pulse">&gt; INTERFACE ACTIVE. FULL ACCESS REQUIRES AUTHORIZATION.</div>
            </div>
          </div>
        </section>

        {/* ── CTA / ROUTING ─────────────────────────────────────────────── */}
        <section className="border-t border-zinc-900 pt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/systems"
            className="border border-zinc-800 px-5 py-2.5 text-zinc-500 font-mono text-[11px] tracking-[0.3em] hover:border-zinc-600 hover:text-zinc-300 transition-colors"
          >
            ← BACK TO SYSTEMS
          </Link>
          <Link
            href="/files"
            className="border border-zinc-800 px-5 py-2.5 text-zinc-500 font-mono text-[11px] tracking-[0.3em] hover:border-zinc-600 hover:text-zinc-300 transition-colors"
          >
            VIEW FILES
          </Link>
          <Link
            href="/dossiers"
            className="border border-zinc-800 px-5 py-2.5 text-zinc-500 font-mono text-[11px] tracking-[0.3em] hover:border-zinc-600 hover:text-zinc-300 transition-colors"
          >
            VIEW DOSSIERS
          </Link>
          <Link
            href="/world"
            className="border border-zinc-800 px-5 py-2.5 text-zinc-500 font-mono text-[11px] tracking-[0.3em] hover:border-zinc-600 hover:text-zinc-300 transition-colors"
          >
            WORLD MONITOR
          </Link>
          {system.externalUrl && (
            <a
              href={system.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-emerald-500/40 bg-emerald-500/5 px-5 py-2.5 text-emerald-400 font-mono text-[11px] tracking-[0.3em] hover:border-emerald-500/70 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors ml-auto"
            >
              VISIT {system.name} ↗
            </a>
          )}
        </section>

      </div>
    </Layout>
  );
}
