import type { FeedItem } from "@/data/mockData";

interface SignalFeedProps {
  items: FeedItem[];
}

function formatRelative(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000 / 60);
  if (diff < 1)   return "just now";
  if (diff < 60)  return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function SignalFeed({ items }: SignalFeedProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="group border border-zinc-900 bg-black/60 px-4 py-3 hover:border-emerald-500/25 transition-colors duration-200 relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-zinc-900 group-hover:bg-emerald-500/40 transition-colors" />

          <div className="flex items-start gap-3 pl-1">
            {item.priority === "HIGH" ? (
              <span className="mt-[4px] w-1.5 h-1.5 rounded-full bg-red-400/80 shrink-0 animate-pulse" />
            ) : (
              <span className="mt-[4px] w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-zinc-300 font-mono tracking-[0.08em] uppercase leading-relaxed group-hover:text-zinc-100 transition-colors">
                {item.text}
              </div>
              <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px] tracking-widest text-zinc-700">
                <span>{item.system}</span>
                <span>·</span>
                <span>{formatRelative(item.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
