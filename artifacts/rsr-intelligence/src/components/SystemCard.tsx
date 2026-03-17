import React from "react";
import { Link } from "wouter";

interface SystemCardProps {
  name: string;
  role: string;
  status: string;
  items: number;
  description: string;
  large?: boolean;
}

export default function SystemCard({ name, role, status, items, description, large = false }: SystemCardProps) {
  const statusColor = (status: string) => {
    if (status === "LIVE") return "text-emerald-400";
    if (status === "CORE") return "text-cyan-400";
    if (status === "RESTRICTED") return "text-red-400";
    if (status === "TRACKING") return "text-amber-400";
    return "text-zinc-500";
  };

  const formattedItems = items.toString().padStart(2, '0');

  return (
    <div className={`group border border-zinc-900 bg-black/80 hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col ${large ? 'p-8 min-h-[240px]' : 'p-5'}`}>
      
      {/* Subtle background gradient on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.3)_0%,transparent_70%)] transition-opacity duration-500" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className="font-mono text-[11px] tracking-[0.35em] text-emerald-400 mb-1">{name}</div>
          <div className="text-[10px] text-zinc-500 font-mono tracking-[0.25em] uppercase">{role}</div>
        </div>
        <div className={`text-[10px] font-mono tracking-widest px-2 py-1 bg-zinc-900/50 border border-zinc-800 ${statusColor(status)}`}>
          {status}
        </div>
      </div>

      <p className={`text-zinc-400 leading-relaxed flex-1 relative z-10 ${large ? 'text-base mt-2' : 'text-sm mt-2'}`}>
        {description}
      </p>

      <div className="mt-6 border-t border-zinc-900 pt-4 flex justify-between items-end relative z-10">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono tracking-[0.3em] text-zinc-600 mb-1">ACTIVE ITEMS</span>
          <span className="text-[11px] font-mono tracking-widest text-emerald-300">{formattedItems}</span>
        </div>
        
        {large && (
          <Link href="/systems" className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 hover:text-emerald-400 flex items-center gap-2 group/link">
            ENTER SYSTEM 
            <span className="group-hover/link:translate-x-1 transition-transform">→</span>
          </Link>
        )}
      </div>

      {/* Bottom border glow line */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500/0 group-hover:bg-emerald-500/60 transition-colors duration-300" />
    </div>
  );
}
