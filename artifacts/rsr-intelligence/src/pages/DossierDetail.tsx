import { Link } from "wouter";
import Layout from "@/components/Layout";
import { dossiers, type DossierStatus } from "@/data/mockData";
import { getDossierDetail } from "@/data/dossierDetails";

interface Props {
  params: { id: string };
}

function statusStyle(status: DossierStatus): string {
  if (status === "ACTIVE")     return "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
  if (status === "MONITORING") return "text-amber-400 border-amber-500/30 bg-amber-500/5";
  return "text-zinc-500 border-zinc-800 bg-zinc-900/30";
}

function StatusDot({ status }: { status: DossierStatus }) {
  if (status === "ACTIVE")     return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />;
  if (status === "MONITORING") return <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />;
}

function postureColor(posture: string) {
  if (posture === "ESCALATING") return "text-red-400";
  if (posture === "ELEVATED")   return "text-amber-400";
  return "text-emerald-400";
}

export default function DossierDetail({ params }: Props) {
  const entity = dossiers.find(d => d.id === params.id);
  const detail = getDossierDetail(params.id);

  if (!entity) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-700">DOSSIER NOT FOUND</div>
          <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-800">{params.id}</div>
          <Link href="/dossiers" className="font-mono text-[10px] tracking-[0.3em] text-emerald-600 hover:text-emerald-400 transition-colors mt-4">
            ← RETURN TO DOSSIERS
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-8">

        {/* ── BREADCRUMB ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-zinc-700">
          <Link href="/dossiers" className="hover:text-zinc-400 transition-colors">DOSSIERS</Link>
          <span>/</span>
          <span className="text-zinc-500">{entity.id}</span>
        </div>

        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <section className="border-b border-zinc-900 pb-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="font-mono text-[10px] tracking-widest px-2.5 py-1 border border-zinc-800 bg-zinc-900/50 text-zinc-400">
              {entity.id}
            </span>
            <span className="font-mono text-[10px] tracking-widest px-2.5 py-1 border border-zinc-800 bg-zinc-950 text-zinc-500 uppercase">
              {entity.type}
            </span>
            <span className={`font-mono text-[10px] tracking-widest px-2.5 py-1 border flex items-center gap-2 ${statusStyle(entity.status)}`}>
              <StatusDot status={entity.status} />
              {entity.status}
            </span>
            <span className="font-mono text-[10px] tracking-widest text-zinc-700 uppercase">
              {entity.classification}
            </span>
            {detail?.lastUpdated && (
              <span className="font-mono text-[9px] tracking-widest text-zinc-700">
                UPDATED {detail.lastUpdated}
              </span>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-2 uppercase">
                {entity.network} · {entity.region}
              </div>
              <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-4">
                {entity.name}
              </h1>
              {detail?.posture && (
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-[10px] tracking-[0.3em] ${postureColor(detail.posture)}`}>
                    POSTURE: {detail.posture}
                  </span>
                </div>
              )}
            </div>

            {/* Entity status panel */}
            <div className="border border-zinc-900 bg-black font-mono">
              {[
                { label: "ENTITY TYPE",     value: entity.type },
                { label: "NETWORK",         value: entity.network },
                { label: "REGION",          value: entity.region },
                { label: "CLASSIFICATION",  value: entity.classification },
                { label: "STATUS",          value: entity.status },
                ...(detail ? [{ label: "POSTURE", value: detail.posture }] : []),
              ].map((row, i, arr) => (
                <div key={row.label} className={`flex justify-between items-center px-4 py-3 ${i < arr.length - 1 ? "border-b border-zinc-900" : ""}`}>
                  <span className="text-[9px] tracking-widest text-zinc-700">{row.label}</span>
                  <span className={`text-[10px] tracking-widest ${
                    row.label === "POSTURE" ? postureColor(row.value) :
                    row.label === "STATUS" && row.value === "ACTIVE" ? "text-emerald-400" :
                    "text-zinc-400"
                  }`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BODY ─────────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-10 items-start">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">

            {/* Analyst notes */}
            <section>
              <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-600 mb-4 flex items-center gap-2">
                <span className="w-1 h-1 bg-zinc-700" />
                ANALYST NOTES
              </div>
              <p className="text-zinc-400 leading-relaxed text-sm mb-5">{entity.notes}</p>
              {detail?.expandedNotes && (
                <div className="space-y-4">
                  {detail.expandedNotes.split("\n\n").map((para, i) => (
                    <p key={i} className="text-sm text-zinc-500 leading-relaxed">{para}</p>
                  ))}
                </div>
              )}
            </section>

            {/* Activity summary */}
            {detail?.activitySummary && (
              <section>
                <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-600 mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 bg-emerald-600" />
                  CURRENT ACTIVITY
                </div>
                <div className="border border-zinc-900 bg-zinc-950/60 p-6">
                  <p className="text-sm text-zinc-400 leading-relaxed">{detail.activitySummary}</p>
                </div>
              </section>
            )}

            {/* Connected entities */}
            {detail?.relatedEntities && detail.relatedEntities.length > 0 && (
              <section>
                <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-600 mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 bg-zinc-700" />
                  CONNECTED ENTITIES
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {detail.relatedEntities.map(id => {
                    const related = dossiers.find(d => d.id === id);
                    return (
                      <Link
                        key={id}
                        href={`/dossiers/${id}`}
                        className="group flex items-center justify-between border border-zinc-900 bg-zinc-950/40 px-4 py-3 hover:border-zinc-700 transition-colors"
                      >
                        <div>
                          <div className="font-mono text-[9px] tracking-widest text-zinc-700 mb-1">{id}</div>
                          <div className="font-mono text-[10px] tracking-[0.15em] text-zinc-400 group-hover:text-emerald-300 transition-colors">
                            {related?.name ?? id}
                          </div>
                        </div>
                        <span className="font-mono text-[8px] tracking-widest text-zinc-800 group-hover:text-emerald-600 transition-colors ml-4">→</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sticky top-6">

            {/* Linked systems */}
            {detail?.linkedSystems && detail.linkedSystems.length > 0 && (
              <div className="border border-zinc-900 p-5">
                <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-4">SYSTEMS TRACKING</div>
                <div className="space-y-2">
                  {detail.linkedSystems.map(sys => (
                    <Link
                      key={sys}
                      href={`/systems/${sys.toLowerCase().replace(/ /g, "-")}`}
                      className="flex items-center gap-2 group"
                    >
                      <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 group-hover:text-emerald-400 transition-colors">
                        {sys}
                      </span>
                      <span className="font-mono text-[8px] text-zinc-800 group-hover:text-zinc-600 transition-colors">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Linked files */}
            {detail?.linkedFiles && detail.linkedFiles.length > 0 && (
              <div className="border border-zinc-900 p-5">
                <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-4">LINKED FILES</div>
                <div className="space-y-2">
                  {detail.linkedFiles.map(id => (
                    <Link
                      key={id}
                      href={`/files/${id}`}
                      className="flex items-center justify-between group border border-zinc-900 bg-zinc-950/40 px-3 py-2 hover:border-zinc-700 transition-colors"
                    >
                      <span className="font-mono text-[10px] tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">{id}</span>
                      <span className="font-mono text-[8px] tracking-widest text-zinc-700 group-hover:text-emerald-500 transition-colors">FILE →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── CTA STRIP ─────────────────────────────────────────────────── */}
        <div className="border-t border-zinc-900 pt-8 flex flex-wrap gap-3">
          <Link
            href="/dossiers"
            className="border border-zinc-800 px-5 py-2.5 text-zinc-500 font-mono text-[10px] tracking-[0.3em] hover:border-zinc-600 hover:text-zinc-300 transition-all"
          >
            ← ALL DOSSIERS
          </Link>
          <Link
            href="/files"
            className="border border-zinc-800 px-5 py-2.5 text-zinc-500 font-mono text-[10px] tracking-[0.3em] hover:border-zinc-600 hover:text-zinc-300 transition-all"
          >
            INTELLIGENCE FILES →
          </Link>
          <Link
            href="/investigation-room"
            className="border border-zinc-800 px-5 py-2.5 text-zinc-500 font-mono text-[10px] tracking-[0.3em] hover:border-zinc-600 hover:text-zinc-300 transition-all ml-auto"
          >
            INVESTIGATION ROOM →
          </Link>
        </div>

      </div>
    </Layout>
  );
}
