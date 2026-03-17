import React from "react";

interface SignalFeedProps {
  items: string[];
}

export default function SignalFeed({ items }: SignalFeedProps) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div 
          key={i} 
          className="group border border-zinc-900 bg-black/60 px-4 py-3 hover:border-emerald-500/30 transition-colors duration-200 relative overflow-hidden"
        >
          {/* Left accent line */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-zinc-800 group-hover:bg-emerald-500/50 transition-colors" />
          
          <div className="flex gap-3 items-start">
            <span className="text-emerald-500/50 font-mono text-[10px] mt-0.5">[{new Date().toISOString().substring(11, 19)}]</span>
            <span className="text-xs text-zinc-300 font-mono tracking-[0.1em] uppercase leading-relaxed group-hover:text-zinc-100 transition-colors">
              {item}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
