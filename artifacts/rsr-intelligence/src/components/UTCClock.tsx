import { useState, useEffect } from "react";

export default function UTCClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const h = pad(time.getUTCHours());
  const m = pad(time.getUTCMinutes());
  const s = pad(time.getUTCSeconds());

  return (
    <div className="hidden md:flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-zinc-600 border border-zinc-900 px-3 py-1.5">
      <span className="w-1 h-1 rounded-full bg-emerald-500/60 animate-pulse" />
      <span>UTC</span>
      <span className="text-zinc-400">{h}:{m}:{s}</span>
    </div>
  );
}
