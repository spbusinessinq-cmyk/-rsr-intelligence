import { useState, useEffect } from "react";

type IntelState = "loading" | "ok" | "degraded" | "down" | "unreachable";

interface BadgeStatus {
  state: IntelState;
  latency?: number;
}

const BLACKDOG_URL = "https://rsr-blackdog.edgeone.app/api/network-status";
const POLL_MS = 60_000;

const STATE_CONFIG: Record<IntelState, { label: string; dot: string; text: string }> = {
  loading:     { label: "CHECKING...",                    dot: "bg-zinc-700 animate-pulse",        text: "text-zinc-700" },
  ok:          { label: "CONNECTED",                      dot: "bg-emerald-500 animate-pulse",     text: "text-emerald-500" },
  degraded:    { label: "DEGRADED",                       dot: "bg-amber-400",                     text: "text-amber-400" },
  down:        { label: "OFFLINE",                        dot: "bg-red-500",                       text: "text-red-500" },
  unreachable: { label: "UNKNOWN — BLACKDOG UNREACHABLE", dot: "bg-zinc-800",                      text: "text-zinc-700" },
};

export default function BlackdogBadge() {
  const [status, setStatus] = useState<BadgeStatus>({ state: "loading" });

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(BLACKDOG_URL, { cache: "no-store" });
        if (!res.ok) {
          setStatus({ state: "unreachable" });
          return;
        }
        const data = await res.json();
        const intel = data?.services?.intel;
        const raw: string = intel?.status ?? "";
        const latency: number | undefined = typeof intel?.latency === "number" ? intel.latency : undefined;

        const state: IntelState =
          raw === "ok"       ? "ok"       :
          raw === "degraded" ? "degraded" :
          raw === "down"     ? "down"     :
          "unreachable";

        setStatus({ state, latency });
      } catch {
        setStatus({ state: "unreachable" });
      }
    }

    poll();
    const timer = setInterval(poll, POLL_MS);
    return () => clearInterval(timer);
  }, []);

  const cfg = STATE_CONFIG[status.state];

  return (
    <div className="hidden lg:flex flex-col items-end font-mono border-r border-zinc-900 pr-3 mr-0.5 shrink-0">
      <span className="text-[7px] tracking-[0.35em] text-zinc-700 whitespace-nowrap uppercase leading-none">
        Protected by Blackdog Security
      </span>
      <div className="flex items-center gap-1.5 mt-1">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
        <span className={`text-[9px] tracking-[0.2em] whitespace-nowrap leading-none ${cfg.text}`}>
          {cfg.label}
          {status.latency != null && status.state === "ok" && (
            <span className="text-zinc-700 ml-2">{status.latency}ms</span>
          )}
        </span>
      </div>
    </div>
  );
}
