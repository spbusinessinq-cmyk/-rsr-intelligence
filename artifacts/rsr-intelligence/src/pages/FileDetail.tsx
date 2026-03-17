import { Link } from "wouter";
import Layout from "@/components/Layout";
import { files, type FileStatus } from "@/data/mockData";
import { getFileDetail } from "@/data/fileDetails";

interface Props {
  params: { id: string };
}

function statusStyle(status: FileStatus): string {
  if (status === "ACTIVE")     return "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
  if (status === "MONITORING") return "text-amber-400 border-amber-500/30 bg-amber-500/5";
  return "text-zinc-500 border-zinc-800 bg-zinc-900/30";
}

function StatusDot({ status }: { status: FileStatus }) {
  if (status === "ACTIVE")     return <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />;
  if (status === "MONITORING") return <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />;
}

function classColor(cls: string) {
  if (cls === "RESTRICTED") return "text-red-400/80";
  return "text-zinc-500";
}

export default function FileDetail({ params }: Props) {
  const file   = files.find(f => f.id === params.id);
  const detail = getFileDetail(params.id);

  if (!file) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-700">RECORD NOT FOUND</div>
          <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-800">{params.id}</div>
          <Link href="/files" className="font-mono text-[10px] tracking-[0.3em] text-emerald-600 hover:text-emerald-400 transition-colors mt-4">
            ← RETURN TO FILES
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
          <Link href="/files" className="hover:text-zinc-400 transition-colors">FILES</Link>
          <span>/</span>
          <span className="text-zinc-500">{file.id}</span>
        </div>

        {/* ── HEADER BLOCK ──────────────────────────────────────────────── */}
        <section className="border-b border-zinc-900 pb-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="font-mono text-[10px] tracking-widest px-2.5 py-1 border border-zinc-800 bg-zinc-900/50 text-zinc-400">
              {file.id}
            </span>
            <span className={`font-mono text-[10px] tracking-widest px-2.5 py-1 border flex items-center gap-2 ${statusStyle(file.status)}`}>
              <StatusDot status={file.status} />
              {file.status}
            </span>
            <span className={`font-mono text-[10px] tracking-widest ${classColor(file.classification)}`}>
              {file.classification}
            </span>
            <span className="font-mono text-[9px] tracking-widest text-zinc-700">
              UPDATED {file.updated}
            </span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-2 uppercase">
                {file.category} · {file.region}
              </div>
              <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-6">
                {file.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                {file.tags.map(tag => (
                  <span key={tag} className="font-mono text-[9px] tracking-widest text-zinc-600 bg-zinc-950 px-2 py-1 uppercase border border-zinc-900">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick-status panel */}
            <div className="border border-zinc-900 bg-black font-mono">
              {[
                { label: "CATEGORY",       value: file.category },
                { label: "REGION",         value: file.region },
                { label: "CLASSIFICATION", value: file.classification, colored: true },
                { label: "LAST UPDATED",   value: file.updated },
                { label: "PRIORITY",       value: file.priority },
              ].map((row, i, arr) => (
                <div key={row.label} className={`flex justify-between items-center px-4 py-3 ${i < arr.length - 1 ? "border-b border-zinc-900" : ""}`}>
                  <span className="text-[9px] tracking-widest text-zinc-700">{row.label}</span>
                  <span className={`text-[10px] tracking-widest ${row.colored ? classColor(file.classification) : "text-zinc-400"}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BODY ─────────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-10 items-start">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">

            {/* Summary */}
            <section>
              <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-600 mb-4 flex items-center gap-2">
                <span className="w-1 h-1 bg-zinc-700" />
                RECORD SUMMARY
              </div>
              <p className="text-zinc-400 leading-relaxed text-sm">{file.summary}</p>
            </section>

            {/* Key findings */}
            {detail?.findings && (
              <section>
                <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-600 mb-5 flex items-center gap-2">
                  <span className="w-1 h-1 bg-emerald-600" />
                  KEY FINDINGS
                </div>
                <div className="space-y-3">
                  {detail.findings.map((finding, i) => (
                    <div key={i} className="flex gap-4 border-l-2 border-zinc-900 pl-5 py-1">
                      <span className="font-mono text-[9px] tracking-widest text-zinc-700 shrink-0 mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="text-sm text-zinc-400 leading-relaxed">{finding}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Key observation */}
            {detail?.keyObservation && (
              <section>
                <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-600 mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 bg-emerald-500/60" />
                  ANALYST OBSERVATION
                </div>
                <div className="border border-zinc-900 bg-zinc-950/60 p-6">
                  <p className="text-sm text-zinc-400 leading-relaxed">{detail.keyObservation}</p>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sticky top-6">

            {/* Related systems */}
            {detail?.relatedSystems && detail.relatedSystems.length > 0 && (
              <div className="border border-zinc-900 p-5">
                <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-4">SYSTEMS INVOLVED</div>
                <div className="space-y-2">
                  {detail.relatedSystems.map(sys => (
                    <Link
                      key={sys}
                      href={`/systems/${sys.toLowerCase().replace(" ", "-")}`}
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

            {/* Linked dossiers */}
            {detail?.linkedDossiers && detail.linkedDossiers.length > 0 && (
              <div className="border border-zinc-900 p-5">
                <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-4">LINKED ENTITIES</div>
                <div className="space-y-2">
                  {detail.linkedDossiers.map(id => (
                    <Link
                      key={id}
                      href={`/dossiers/${id}`}
                      className="flex items-center justify-between group border border-zinc-900 bg-zinc-950/40 px-3 py-2 hover:border-zinc-700 transition-colors"
                    >
                      <span className="font-mono text-[10px] tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">{id}</span>
                      <span className="font-mono text-[8px] tracking-widest text-zinc-700 group-hover:text-emerald-500 transition-colors">DOSSIER →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related files */}
            {detail?.linkedFiles && detail.linkedFiles.length > 0 && (
              <div className="border border-zinc-900 p-5">
                <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-4">RELATED FILES</div>
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
            href="/files"
            className="border border-zinc-800 px-5 py-2.5 text-zinc-500 font-mono text-[10px] tracking-[0.3em] hover:border-zinc-600 hover:text-zinc-300 transition-all"
          >
            ← ALL FILES
          </Link>
          <Link
            href="/dossiers"
            className="border border-zinc-800 px-5 py-2.5 text-zinc-500 font-mono text-[10px] tracking-[0.3em] hover:border-zinc-600 hover:text-zinc-300 transition-all"
          >
            ENTITY DOSSIERS →
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
