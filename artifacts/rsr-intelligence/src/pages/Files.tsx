import React from "react";
import Layout from "@/components/Layout";
import { files } from "@/data/mockData";

export default function Files() {
  const getStatusColor = (status: string) => {
    switch(status) {
      case "ACTIVE": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "MONITORING": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "CLOSED": return "text-zinc-400 bg-zinc-800/30 border-zinc-700/50";
      default: return "text-zinc-500 bg-zinc-900/50 border-zinc-800";
    }
  };

  const featuredFile = files.find(f => f.status === "ACTIVE") || files[0];
  const regularFiles = files.filter(f => f.id !== featuredFile.id);

  return (
    <Layout>
      <div className="flex flex-col gap-10">
        <section className="border-b border-zinc-900 pb-6">
          <div className="font-mono text-[10px] tracking-[0.4em] text-emerald-400 mb-4">RECORDS & INVESTIGATIONS</div>
          <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
            INTELLIGENCE FILES
          </h1>
        </section>

        {/* Featured File */}
        <section>
          <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 mb-4">PRIORITY INVESTIGATION</div>
          <div className="border border-emerald-500/30 bg-black/80 p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 font-mono text-[80px] leading-none text-zinc-900/30 font-bold select-none z-0">
              {featuredFile.id.split('-')[1]}
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="font-mono text-[10px] tracking-widest px-2 py-1 bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {featuredFile.id}
                  </span>
                  <span className={`font-mono text-[10px] tracking-widest px-2 py-1 border ${getStatusColor(featuredFile.status)}`}>
                    {featuredFile.status}
                  </span>
                  <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                    UPDATED: {featuredFile.updated}
                  </span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-medium text-white mb-2">{featuredFile.title}</h2>
                <div className="font-mono text-[11px] tracking-[0.2em] text-emerald-400/80 mb-6 uppercase">
                  REGION: {featuredFile.region} // CATEGORY: {featuredFile.category}
                </div>
                
                <p className="text-zinc-400 leading-relaxed max-w-3xl mb-8">
                  {featuredFile.summary}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {featuredFile.tags.map(tag => (
                    <span key={tag} className="font-mono text-[9px] tracking-widest text-zinc-500 bg-zinc-900 px-2 py-1 uppercase border border-zinc-800/50">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button className="border border-emerald-500/40 bg-emerald-500/5 px-6 py-2.5 text-emerald-300 font-mono text-[10px] tracking-[0.3em] hover:bg-emerald-500/15 transition-colors">
                  OPEN SECURE DOSSIER
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 border-b border-zinc-900 pb-4 pt-4">
          <span className="font-mono text-[10px] tracking-[0.3em] text-zinc-600">FILTER:</span>
          {["ALL", "ACTIVE", "MONITORING", "CLOSED", "PROCUREMENT", "INFLUENCE"].map((filter, i) => (
            <button key={filter} className={`font-mono text-[10px] tracking-[0.2em] px-3 py-1.5 border transition-colors ${i === 0 ? 'border-zinc-700 text-zinc-300 bg-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
              {filter}
            </button>
          ))}
        </div>

        {/* Files List */}
        <section className="space-y-3">
          {regularFiles.map(file => (
            <div key={file.id} className="group flex flex-col md:flex-row gap-4 md:items-center justify-between border border-zinc-900 bg-black/40 p-5 hover:border-zinc-700 transition-colors cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-[10px] tracking-widest text-zinc-500 w-12 shrink-0">{file.id}</span>
                  <span className={`font-mono text-[9px] tracking-widest px-1.5 py-0.5 border uppercase ${getStatusColor(file.status)}`}>
                    {file.status}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-emerald-500/70 truncate uppercase">
                    {file.category}
                  </span>
                </div>
                <h3 className="text-lg text-zinc-200 group-hover:text-emerald-300 transition-colors truncate">{file.title}</h3>
                <p className="text-sm text-zinc-500 mt-1 line-clamp-1 group-hover:text-zinc-400 transition-colors">{file.summary}</p>
              </div>
              
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 border-t md:border-t-0 border-zinc-900 pt-3 md:pt-0 mt-3 md:mt-0 gap-4">
                <div className="text-right">
                  <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-600 mb-1">LAST UPDATE</div>
                  <div className="font-mono text-[11px] tracking-widest text-zinc-400">{file.updated}</div>
                </div>
                <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-600 group-hover:text-emerald-400 transition-colors hidden md:block">
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
