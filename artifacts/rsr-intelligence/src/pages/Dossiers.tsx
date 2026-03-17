import React from "react";
import Layout from "@/components/Layout";
import { dossiers } from "@/data/mockData";

export default function Dossiers() {
  return (
    <Layout>
      <div className="flex flex-col gap-10">
        <section className="border-b border-zinc-900 pb-6">
          <div className="font-mono text-[10px] tracking-[0.4em] text-emerald-400 mb-4">TARGETS & NETWORKS</div>
          <div className="flex justify-between items-end">
            <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
              ENTITY DOSSIERS
            </h1>
            <button className="border border-zinc-800 bg-zinc-900/30 px-4 py-2 text-zinc-400 font-mono text-[10px] tracking-[0.2em] hover:text-white hover:border-zinc-600 transition-colors">
              + NEW ENTITY
            </button>
          </div>
        </section>

        {/* Search / Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-zinc-600">SEARCH:</div>
            <input 
              type="text" 
              placeholder="Enter entity name, ID, or network..." 
              className="w-full bg-black border border-zinc-800 text-zinc-300 font-mono text-xs p-3 pl-16 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Dossiers Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {dossiers.map(entity => (
            <div key={entity.id} className="group border border-zinc-900 bg-black/60 p-5 hover:border-zinc-700 transition-all flex flex-col relative cursor-pointer">
              
              <div className="flex justify-between items-start mb-6 border-b border-zinc-800/50 pb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-[10px] tracking-widest text-zinc-500">{entity.id}</span>
                    <span className="font-mono text-[9px] tracking-widest px-1.5 py-0.5 border border-zinc-800 bg-zinc-900 text-zinc-400 uppercase">
                      {entity.type}
                    </span>
                  </div>
                  <h3 className="text-xl text-zinc-200 group-hover:text-emerald-300 transition-colors">{entity.name}</h3>
                </div>
                
                <div className={`font-mono text-[9px] tracking-widest px-2 py-1 border uppercase ${
                  entity.status === 'ACTIVE' ? 'border-emerald-500/30 text-emerald-400' :
                  entity.status === 'MONITORING' ? 'border-amber-500/30 text-amber-400' :
                  'border-zinc-700 text-zinc-500'
                }`}>
                  {entity.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-600 mb-1">REGION</div>
                  <div className="font-mono text-xs text-zinc-300 uppercase">{entity.region}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-600 mb-1">NETWORK</div>
                  <div className="font-mono text-xs text-zinc-300 uppercase">{entity.network}</div>
                </div>
              </div>

              <div className="mt-auto pt-4 flex-1">
                <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-600 mb-2">ANALYST NOTES</div>
                <p className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {entity.notes}
                </p>
              </div>

              <div className="absolute bottom-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-mono text-[10px] tracking-[0.2em] text-emerald-400 bg-black px-2 py-1">
                  EXPAND RECORD →
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border border-zinc-800 border-dashed bg-zinc-950 p-6 text-center">
          <div className="font-mono text-[10px] tracking-[0.3em] text-zinc-500 mb-2 animate-pulse">
            RELATIONSHIP MAPPING — COMING NEXT CYCLE
          </div>
          <p className="text-xs text-zinc-600">
            Graph visualization of entity connections, capital flows, and shared directors is currently compiling.
          </p>
        </div>
      </div>
    </Layout>
  );
}
