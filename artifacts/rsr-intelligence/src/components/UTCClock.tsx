import { useState, useEffect } from "react";

export default function UTCClock() {
  const [time,   setTime]   = useState(() => new Date());
  const [tzAbbr, setTzAbbr] = useState("LCL");

  useEffect(() => {
    const abbr =
      new Intl.DateTimeFormat("en", { timeZoneName: "short" })
        .formatToParts(new Date())
        .find(p => p.type === "timeZoneName")?.value ?? "LCL";
    setTzAbbr(abbr);

    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const h = pad(time.getHours());
  const m = pad(time.getMinutes());
  const s = pad(time.getSeconds());

  const dateStr = time.toLocaleDateString("en-US", {
    month: "short", day: "2-digit", year: "numeric",
  }).toUpperCase();

  return (
    <div className="hidden md:flex flex-col items-end font-mono border border-zinc-900 px-3 py-1.5">
      <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-zinc-600">
        <span className="w-1 h-1 rounded-full bg-emerald-500/60 animate-pulse" />
        <span className="text-zinc-700">{tzAbbr}</span>
        <span className="text-zinc-400">{h}:{m}:{s}</span>
      </div>
      <div className="text-[8px] tracking-[0.2em] text-zinc-800 mt-0.5 text-right">{dateStr}</div>
    </div>
  );
}
