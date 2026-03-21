import { Link } from "wouter";
import { nameToSlug } from "@/data/systemDetails";

interface SystemCardProps {
  name: string;
  role: string;
  status: string;
  items: number;
  description: string;
  large?: boolean;
}

function statusColor(status: string): string {
  if (status === "PRIMARY")    return "text-emerald-300";
  if (status === "LIVE")       return "text-emerald-400";
  if (status === "CORE")       return "text-cyan-400";
  if (status === "RESTRICTED") return "text-red-400";
  if (status === "TRACKING")   return "text-amber-400";
  return "text-zinc-500";
}

function statusDot(status: string): string {
  if (status === "PRIMARY")    return "bg-emerald-400 animate-pulse";
  if (status === "LIVE")       return "bg-emerald-400 animate-pulse";
  if (status === "CORE")       return "bg-cyan-400";
  if (status === "RESTRICTED") return "bg-red-400 animate-pulse";
  if (status === "TRACKING")   return "bg-amber-400";
  return "bg-zinc-600";
}

export default function SystemCard({ name, role, status, items, description, large = false }: SystemCardProps) {
  const slug = nameToSlug(name);
  const href = `/systems/${slug}`;
  const formattedItems = items.toString().padStart(2, "0");

  return (
    <Link
      href={href}
      className={`group border border-zinc-900 bg-black/80 hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden flex flex-col cursor-pointer ${large ? "p-8 min-h-[240px]" : "p-5"}`}
    >
      {/* Subtle hover gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.07] bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.5)_0%,transparent_70%)] transition-opacity duration-500 pointer-events-none" />

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500/0 group-hover:bg-emerald-500/40 transition-colors duration-300 pointer-events-none" />

      {/* Header row */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className="font-mono text-[11px] tracking-[0.35em] text-emerald-400 mb-1 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot(status)}`} />
            {name}
          </div>
          <div className="text-[10px] text-zinc-600 font-mono tracking-[0.3em] uppercase pl-3.5">{role}</div>
        </div>
        <div className={`text-[10px] font-mono tracking-widest px-2 py-1 bg-zinc-950 border border-zinc-900 ${statusColor(status)}`}>
          {status}
        </div>
      </div>

      {/* Description */}
      <p className={`text-zinc-500 leading-relaxed flex-1 relative z-10 group-hover:text-zinc-400 transition-colors ${large ? "text-sm mt-2" : "text-xs mt-2"}`}>
        {description}
      </p>

      {/* Footer */}
      <div className="mt-6 border-t border-zinc-900 pt-4 flex justify-between items-end relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-700 mb-1">ACTIVE ITEMS</span>
          <span className="text-[11px] font-mono tracking-widest text-emerald-400/70">{formattedItems}</span>
        </div>
        <span className="text-[11px] font-mono tracking-[0.2em] text-zinc-600 group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
          ENTER SYSTEM
          <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
        </span>
      </div>
    </Link>
  );
}
