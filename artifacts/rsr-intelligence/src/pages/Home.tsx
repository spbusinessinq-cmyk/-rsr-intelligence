import React from "react";
import Layout from "@/components/Layout";
import SystemCard from "@/components/SystemCard";
import SignalFeed from "@/components/SignalFeed";
import { systems, feedItems } from "@/data/mockData";
import { Link } from "wouter";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col gap-16">
        {/* Hero Section */}
        <section className="pt-8 pb-4">
          <div className="font-mono text-[10px] tracking-[0.4em] text-emerald-400 mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            NETWORK OVERVIEW
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight max-w-3xl leading-[1.1]">
            Mapping power. Tracking systems. Exposing reality.
          </h1>

          <p className="mt-8 text-zinc-400 max-w-2xl text-base md:text-lg leading-relaxed">
            RSR Intelligence Network is an independent system built to analyze structures of power, global activity, and information flow. We don't follow narratives — we map systems.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/systems" className="border border-emerald-500/40 bg-emerald-500/5 px-6 py-3 text-emerald-300 font-mono text-[11px] tracking-[0.3em] hover:bg-emerald-500/15 hover:border-emerald-500/60 transition-all shadow-[0_0_15px_rgba(16,185,129,0.05)]">
              ENTER SYSTEM
            </Link>
            <Link href="/files" className="border border-zinc-800 bg-black px-6 py-3 text-zinc-300 font-mono text-[11px] tracking-[0.3em] hover:border-zinc-500 hover:text-white transition-all">
              VIEW FILES
            </Link>
          </div>
        </section>

        {/* Core Systems Grid */}
        <section>
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
            <h2 className="font-mono text-[10px] tracking-[0.4em] text-zinc-500">CORE SYSTEMS</h2>
            <Link href="/systems" className="font-mono text-[10px] tracking-[0.2em] text-emerald-500/70 hover:text-emerald-400">VIEW ALL →</Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systems.slice(0, 3).map((system) => (
              <SystemCard key={system.name} {...system} />
            ))}
          </div>
        </section>

        {/* Two-col: Feed & Status */}
        <section className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 mb-6 border-b border-zinc-900 pb-4">LIVE SIGNAL FEED</div>
            <SignalFeed items={feedItems} />
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500 mb-6 border-b border-zinc-900 pb-4">NETWORK STATUS</div>
            <div className="border border-zinc-900 bg-black/50 p-6 font-mono space-y-5">
              <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3">
                <span className="text-[11px] tracking-widest text-zinc-500">NETWORK</span>
                <span className="text-[11px] tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1">STABLE</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3">
                <span className="text-[11px] tracking-widest text-zinc-500">SIGNAL LOAD</span>
                <span className="text-[11px] tracking-widest text-amber-400 bg-amber-400/10 px-2 py-1">ELEVATED</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-[11px] tracking-widest text-zinc-500">THREAT INDEX</span>
                <span className="text-[11px] tracking-widest text-red-400 bg-red-400/10 px-2 py-1 animate-pulse">HIGH</span>
              </div>
            </div>
          </div>
        </section>

        {/* Access Node */}
        <section className="border border-zinc-900 bg-zinc-950/30 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-400 mb-2">ACCESS NODE</div>
            <p className="text-zinc-500 text-sm">Restricted terminal. Authorization required for deeper system access.</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none border border-emerald-500/40 bg-emerald-500/5 px-6 py-3 text-emerald-300 font-mono text-[11px] tracking-[0.3em] hover:bg-emerald-500/10 transition-colors whitespace-nowrap">
              REQUEST ACCESS
            </button>
            <button className="flex-1 md:flex-none border border-zinc-800 bg-black px-6 py-3 text-zinc-300 font-mono text-[11px] tracking-[0.3em] hover:border-zinc-600 hover:text-white transition-colors whitespace-nowrap">
              LOGIN
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
