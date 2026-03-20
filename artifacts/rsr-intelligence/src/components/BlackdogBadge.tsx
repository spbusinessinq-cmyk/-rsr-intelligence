import { useState, useEffect } from "react";

type IntelState = "loading" | "ok" | "degraded" | "down" | "unreachable";

interface BadgeStatus {
  state: IntelState;
  latency?: number;
}

const BLACKDOG_URL = "https://rsr-blackdog.edgeone.app/api/network-status";
const POLL_MS = 60_000;

function isDevEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h.endsWith(".replit.dev") ||
    h.endsWith(".spock.replit.dev") ||
    h.endsWith(".repl.co")
  );
}

export default function BlackdogBadge() {
  const [status, setStatus] = useState<BadgeStatus>({ state: "loading" });
  const isDev = isDevEnvironment();

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
        const latency: number | undefined =
          typeof intel?.latency === "number" ? intel.latency : undefined;

        const norm = raw.toLowerCase();
        const state: IntelState =
          norm === "ok" || norm === "online"   ? "ok"       :
          norm === "degraded"                  ? "degraded" :
          norm === "down" || norm === "offline" ? "down"     :
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

  /* ── Status display config ─────────────────────────────────────────── */

  type DisplayCfg = {
    label: string;
    subtext?: string;
    dot: string;
    text: string;
    border: string;
  };

  function getDisplay(): DisplayCfg {
    if (status.state === "unreachable" && isDev) {
      return {
        label:   "DEV MODE — BLACKDOG NOT ACCESSIBLE",
        subtext: "Live status available in production",
        dot:     "bg-zinc-700",
        text:    "text-zinc-500",
        border:  "border-zinc-800/60",
      };
    }

    const map: Record<IntelState, DisplayCfg> = {
      loading: {
        label:  "CHECKING...",
        dot:    "bg-zinc-700 animate-pulse",
        text:   "text-zinc-600",
        border: "border-zinc-800/60",
      },
      ok: {
        label:  "CONNECTED",
        dot:    "bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.7)]",
        text:   "text-emerald-400",
        border: "border-emerald-900/40",
      },
      degraded: {
        label:  "DEGRADED",
        dot:    "bg-amber-400",
        text:   "text-amber-400",
        border: "border-amber-900/30",
      },
      down: {
        label:  "OFFLINE",
        dot:    "bg-red-500",
        text:   "text-red-400",
        border: "border-red-900/30",
      },
      unreachable: {
        label:  "UNKNOWN — BLACKDOG UNREACHABLE",
        dot:    "bg-zinc-700",
        text:   "text-zinc-500",
        border: "border-zinc-800/60",
      },
    };

    return map[status.state];
  }

  const cfg = getDisplay();

  return (
    <div className={`hidden lg:flex flex-col items-end font-mono border border-r-0 ${cfg.border} pl-2.5 pr-3 py-1.5 mr-1 shrink-0`}>
      <span className="text-[9px] tracking-[0.3em] text-zinc-500 whitespace-nowrap uppercase leading-none font-semibold">
        PROTECTED BY BLACKDOG SECURITY
      </span>
      <div className="flex items-center gap-2 mt-1.5">
        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
        <span className={`text-[10px] tracking-[0.18em] whitespace-nowrap leading-none font-medium ${cfg.text}`}>
          {cfg.label}
          {status.latency != null && status.state === "ok" && (
            <span className="text-zinc-600 ml-2">{status.latency}ms</span>
          )}
        </span>
      </div>
      {cfg.subtext && (
        <div className="text-[8px] tracking-[0.15em] text-zinc-700 mt-1 whitespace-nowrap">
          {cfg.subtext}
        </div>
      )}
    </div>
  );
}
