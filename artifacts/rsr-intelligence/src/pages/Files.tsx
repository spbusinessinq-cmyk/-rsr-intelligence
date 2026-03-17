import Layout from "@/components/Layout";
import { files, type FileStatus } from "@/data/mockData";

function statusStyle(status: FileStatus): string {
  if (status === "ACTIVE")     return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  if (status === "MONITORING") return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-zinc-500 bg-zinc-900/40 border-zinc-800";
}

function priorityDot(priority: string) {
  if (priority === "HIGH")   return <span className="w-1.5 h-1.5 rounded-full bg-red-400/80 animate-pulse" />;
  if (priority === "NORMAL") return <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />;
}

export default function Files() {
  const featured  = files.find(f => f.status === "ACTIVE" && f.priority === "HIGH") ?? files[0];
  const remaining = files.filter(f => f.id !== featured.id);

  return (
    <Layout>
      <div className="flex flex-col gap-10">

        {/* Page heading */}
        <section className="border-b border-zinc-900 pb-6">
          <div className="font-mono text-[10px] tracking-[0.4em] text-emerald-400 mb-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-emerald-400" />
            RECORDS & INVESTIGATIONS
          </div>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
              INTELLIGENCE FILES
            </h1>
            <div className="font-mono text-[10px] tracking-widest text-zinc-600 shrink-0">
              {files.length} RECORDS
            </div>
          </div>
        </section>

        {/* Featured investigation */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500">PRIORITY INVESTIGATION</div>
            <div className="font-mono text-[9px] tracking-widest text-zinc-700 border border-zinc-900 px-2 py-0.5">SAMPLE FILE</div>
          </div>

          <div className="border border-emerald-500/25 bg-black/80 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 font-mono text-[100px] leading-none text-zinc-950 font-bold select-none">
              {featured.id.split("-")[1]}
            </div>

            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="font-mono text-[10px] tracking-widest px-2 py-1 bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {featured.id}
                </span>
                <span className={`font-mono text-[10px] tracking-widest px-2 py-1 border ${statusStyle(featured.status)}`}>
                  {featured.status}
                </span>
                <span className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
                  {featured.classification}
                </span>
                <span className="font-mono text-[10px] tracking-widest text-zinc-600">
                  UPDATED {featured.updated}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-medium text-white mb-2">{featured.title}</h2>
              <div className="font-mono text-[10px] tracking-[0.25em] text-emerald-400/70 mb-6 uppercase">
                {featured.region} · {featured.category}
              </div>

              <p className="text-zinc-400 leading-relaxed max-w-3xl mb-7 text-sm">{featured.summary}</p>

              <div className="flex flex-wrap gap-2 mb-8">
                {featured.tags.map(tag => (
                  <span key={tag} className="font-mono text-[9px] tracking-widest text-zinc-600 bg-zinc-950 px-2 py-1 uppercase border border-zinc-900">
                    #{tag}
                  </span>
                ))}
              </div>

              <button className="border border-emerald-500/40 bg-emerald-500/5 px-6 py-2.5 text-emerald-300 font-mono text-[10px] tracking-[0.3em] hover:bg-emerald-500/10 transition-colors">
                OPEN RECORD
              </button>
            </div>
          </div>
        </section>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-900 pb-4">
          <span className="font-mono text-[10px] tracking-[0.3em] text-zinc-700">FILTER:</span>
          {["ALL", "ACTIVE", "MONITORING", "CLOSED", "CORRUPTION", "INFLUENCE", "CONTRACTORS"].map((f, i) => (
            <button
              key={f}
              className={`font-mono text-[10px] tracking-[0.2em] px-2.5 py-1 border transition-colors ${
                i === 0
                  ? "border-zinc-700 text-zinc-300 bg-zinc-900/50"
                  : "border-transparent text-zinc-600 hover:text-zinc-300 hover:border-zinc-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* File list */}
        <section className="space-y-2">
          {remaining.map(file => (
            <div
              key={file.id}
              className="group flex flex-col md:flex-row gap-4 md:items-center justify-between border border-zinc-900 bg-black/40 px-5 py-4 hover:border-zinc-700 transition-colors cursor-pointer relative"
            >
              {/* sample label — subtle, top-right */}
              <span className="absolute top-2 right-3 font-mono text-[8px] tracking-widest text-zinc-800 hidden group-hover:inline">
                SAMPLE FILE
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  {priorityDot(file.priority)}
                  <span className="font-mono text-[10px] tracking-widest text-zinc-600 shrink-0">{file.id}</span>
                  <span className={`font-mono text-[9px] tracking-widest px-1.5 py-0.5 border uppercase ${statusStyle(file.status)}`}>
                    {file.status}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-600 uppercase truncate">
                    {file.category} · {file.region}
                  </span>
                </div>
                <h3 className="text-base text-zinc-200 group-hover:text-emerald-300 transition-colors">{file.title}</h3>
                <p className="text-sm text-zinc-600 mt-1 line-clamp-1 group-hover:text-zinc-500 transition-colors">{file.summary}</p>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between shrink-0 border-t md:border-t-0 border-zinc-900 pt-3 md:pt-0 mt-2 md:mt-0 gap-3">
                <div className="text-right">
                  <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-700 mb-0.5">UPDATED</div>
                  <div className="font-mono text-[10px] tracking-widest text-zinc-500">{file.updated}</div>
                </div>
                <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-700 group-hover:text-emerald-400 transition-colors">
                  VIEW →
                </span>
              </div>
            </div>
          ))}
        </section>

      </div>
    </Layout>
  );
}
