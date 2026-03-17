import React from "react";
import Layout from "@/components/Layout";
import SystemCard from "@/components/SystemCard";
import SignalFeed from "@/components/SignalFeed";
import { systems, feedItems } from "@/data/mockData";

export default function Systems() {
  return (
    <Layout>
      <div className="flex flex-col gap-10 h-full">
        {/* Header */}
        <section className="border-b border-zinc-900 pb-8">
          <div className="font-mono text-[10px] tracking-[0.4em] text-emerald-400 mb-4 flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-emerald-400"></span>
            SYSTEM ARCHITECTURE
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
              CORE SYSTEMS LAYER
            </h1>
            <div className="font-mono text-[11px] tracking-[0.3em] text-zinc-500 bg-zinc-900/40 px-4 py-2 border border-zinc-800">
              ACTIVE MODULES: <span className="text-emerald-400 ml-2">0{systems.length}</span>
            </div>
          </div>
        </section>

        {/* Layout: Main grid + Sidebar */}
        <div className="grid xl:grid-cols-4 gap-8 items-start">
          {/* Main Grid */}
          <div className="xl:col-span-3">
            <div className="grid md:grid-cols-2 gap-6">
              {systems.map((system) => (
                <SystemCard key={system.name} {...system} large />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-8 sticky top-6">
            <div>
              <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 mb-4 border-b border-zinc-900 pb-3">DIAGNOSTICS</div>
              <div className="border border-zinc-900 bg-black p-5 space-y-4">
                {[
                  { label: "UPTIME", value: "99.98%", color: "text-emerald-400" },
                  { label: "LATENCY", value: "24ms", color: "text-emerald-400" },
                  { label: "ENCRYPTION", value: "AES-256", color: "text-zinc-300" },
                  { label: "NODES", value: "1,492", color: "text-zinc-300" }
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-center font-mono text-[10px] tracking-widest">
                    <span className="text-zinc-600">{stat.label}</span>
                    <span className={stat.color}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 mb-4 border-b border-zinc-900 pb-3">SYSTEM LOGS</div>
              <SignalFeed items={feedItems.slice(0, 4)} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
