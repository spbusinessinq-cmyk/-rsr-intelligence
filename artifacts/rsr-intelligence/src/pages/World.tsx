import React from "react";
import Layout from "@/components/Layout";
import SignalFeed from "@/components/SignalFeed";
import { regions, feedItems } from "@/data/mockData";

export default function World() {
  const getPostureColor = (posture: string) => {
    switch(posture) {
      case "CRITICAL": return "text-red-400 border-red-500/30 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
      case "ELEVATED": return "text-amber-400 border-amber-500/30 bg-amber-500/5";
      case "STABLE": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
      default: return "text-zinc-400 border-zinc-700 bg-zinc-900/50";
    }
  };

  const getPostureIndicator = (posture: string) => {
    switch(posture) {
      case "CRITICAL": return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse";
      case "ELEVATED": return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]";
      case "STABLE": return "bg-emerald-400";
      default: return "bg-zinc-500";
    }
  };

  const totalSignals = regions.reduce((acc, r) => acc + r.signals, 0);
  const criticalCount = regions.filter(r => r.posture === "CRITICAL").length;

  return (
    <Layout>
      <div className="flex flex-col gap-8 h-full">
        {/* Header */}
        <section>
          <div className="font-mono text-[10px] tracking-[0.4em] text-emerald-400 mb-4">GLOBAL POSTURE</div>
          <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-8">
            WORLD MONITOR
          </h1>

          {/* Global Summary Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-zinc-900 bg-black p-4 md:p-6">
            <div>
              <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 mb-2">OVERALL THREAT</div>
              <div className="font-mono text-lg text-amber-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                ELEVATED
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 mb-2">ACTIVE SIGNALS</div>
              <div className="font-mono text-lg text-white">{totalSignals}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 mb-2">CRITICAL ZONES</div>
              <div className="font-mono text-lg text-red-400">{criticalCount}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 mb-2">SYSTEM CLOCK</div>
              <div className="font-mono text-lg text-zinc-300">
                {new Date().toISOString().substring(11, 16)} UTC
              </div>
            </div>
          </div>
        </section>

        {/* Placeholder Map Banner */}
        <div className="border border-zinc-900 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(24,24,27,0.5)_10px,rgba(24,24,27,0.5)_20px)] h-32 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
          <div className="relative z-10 bg-black border border-zinc-800 px-6 py-3 text-center">
            <div className="font-mono text-[11px] tracking-[0.3em] text-zinc-400">
              GEOSPATIAL LAYER OFFLINE — REGIONAL ANALYSIS ACTIVE
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Regions Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 mb-2">REGIONAL POSTURE</div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {regions.map((region) => (
                <div key={region.region} className={`border p-5 relative overflow-hidden ${getPostureColor(region.posture)}`}>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-1">{region.region}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${getPostureIndicator(region.posture)}`}></span>
                        <span className="font-mono text-[10px] tracking-widest uppercase">{region.posture}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[24px] font-bold leading-none">{region.signals}</div>
                      <div className="font-mono text-[8px] tracking-[0.2em] opacity-70 mt-1">SIGNALS</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="font-mono text-[9px] tracking-[0.2em] opacity-60 mb-1.5">ACTIVITY LEVEL</div>
                      <div className="h-1 bg-black/50 w-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            region.activity === 'CRITICAL' ? 'w-full bg-red-400' :
                            region.activity === 'HIGH' ? 'w-3/4 bg-amber-400' :
                            region.activity === 'MODERATE' ? 'w-1/2 bg-emerald-400' :
                            'w-1/4 bg-zinc-500'
                          }`}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="font-mono text-[9px] tracking-[0.2em] opacity-60 mb-2">ACTIVE LANES</div>
                      <div className="flex flex-wrap gap-2">
                        {region.lanes.map(lane => (
                          <span key={lane} className="font-mono text-[9px] tracking-widest bg-black/40 px-2 py-1 uppercase border border-current/20">
                            {lane}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 mb-6">GLOBAL SIGNAL CLUSTER</div>
            <SignalFeed items={feedItems} />
            
            <div className="mt-8 border border-zinc-900 p-5">
              <div className="font-mono text-[10px] tracking-[0.3em] text-emerald-400 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400"></span>
                SATELLITE DOWNLINK
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                Receiving periodic bursts from low-orbit relays. 
                Next expected transmission window in T-14:22:00.
                Signal decryption nominal.
              </p>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
