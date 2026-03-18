import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import { supabase, isConfigured } from "@/lib/supabase";

/* ── Types ─────────────────────────────────────────────────────────── */

interface Channel {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  handle: string;
  role: string | null;
  body: string;
  created_at: string;
}

type SageAction = "brief" | "summarize" | "factcheck" | "trace" | "query";

interface SageEntry {
  id: string;
  action: SageAction;
  query: string;
  response: string | null;
  loading: boolean;
  error?: string;
}

/* ── Static data ────────────────────────────────────────────────────── */

const DEFAULT_CHANNELS: Channel[] = [
  { id: "general",         slug: "general",         name: "general",         description: "General coordination" },
  { id: "investigations",  slug: "investigations",  name: "investigations",  description: "Active investigation threads" },
  { id: "west-coast-case", slug: "west-coast-case", name: "west-coast-case", description: "West Coast operation" },
  { id: "signals",         slug: "signals",         name: "signals",         description: "Signal monitoring and alerts" },
  { id: "off-grid",        slug: "off-grid",        name: "off-grid",        description: "Off-network discussions" },
];

const MOCK_THREADS: Message[] = [
  {
    id: "ct-001", channel_id: "investigations", user_id: "LEAD-ANALYST",
    handle: "LEAD-ANALYST", role: "lead", created_at: "2026-03-17T16:00:00Z",
    body: "CLEARWATER — procurement chain now confirmed at five layers. Cormorant Group (D-001) operating at tier-2, not tier-1 as previously logged. Tier-1 entity appears to be an unregistered holding structure sharing a registered agent with three entries in F-005. This changes the risk attribution model significantly. BLACK DOG escalation for tier-1 identification recommended. [F-001]",
  },
  {
    id: "ct-002", channel_id: "investigations", user_id: "CASE-BUILD-01",
    handle: "CASE-BUILD-01", role: "analyst", created_at: "2026-03-17T15:30:00Z",
    body: "MERIDIAN — capital structure update. The three Asia-Pacific acquisition nodes cross-reference against two separate procurement bids documented in F-006. One bidding entity shares a Singapore registered address with a known Meridian subsidiary. Management company overlap compounds the structural linkage. ATLAS graph updated. F-006 priority elevation recommended. [D-004]",
  },
  {
    id: "ct-003", channel_id: "investigations", user_id: "RESEARCH-01",
    handle: "RESEARCH-01", role: "analyst", created_at: "2026-03-17T14:45:00Z",
    body: "F-003 / F-017 banking linkage confirmed. Payment routing shows a shared correspondent banking relationship through a Maltese institution. Timing of fund transfers correlates with major editorial output windows in the F-017 media network. Two-file cross-reference requires elevation to next AXION priority brief. Signal-Desk notified. [F-003]",
  },
  {
    id: "ct-004", channel_id: "investigations", user_id: "CASE-BUILD-02",
    handle: "CASE-BUILD-02", role: "analyst", created_at: "2026-03-17T14:00:00Z",
    body: "NORTHERN GATEWAY — beneficial ownership trace complete. D-007 Northern Bridge Consortium: four entities, two jurisdictions. Ownership resolves to two individuals, one of whom appears in F-001 procurement network as a third-tier contractor. Document authorship metadata match across four bid submissions is the strongest available evidence of pre-bid coordination. F-009 classification upgrade to RESTRICTED recommended. [F-009] [D-007]",
  },
  {
    id: "ct-005", channel_id: "investigations", user_id: "LEAD-ANALYST",
    handle: "LEAD-ANALYST", role: "lead", created_at: "2026-03-17T13:15:00Z",
    body: "LOBBYING MAP — twenty-three flagged relationships reviewed. Eight involve entities in D-010 Western Advocacy Network. Network is using lobbying registration as a regularization mechanism for foreign-interest client access. Actual policy influence delivered through separate, non-disclosed advisory channels. Continuing to map the advisory channel layer. [F-019] [D-010]",
  },
  {
    id: "ct-006", channel_id: "investigations", user_id: "RESEARCH-02",
    handle: "RESEARCH-02", role: "analyst", created_at: "2026-03-17T12:30:00Z",
    body: "Regional Futures Fund (D-013) and F-010 Eastern Europe influence mapping now confirmed connected. Fund holds equity in three media entities in F-010. Correlated timing between D-013 equity commitments and editorial output shifts is a strong indicator. Capital and editorial direction share common ownership or direction. Priority finding for Eastern Europe posture assessment. [D-013]",
  },
  {
    id: "ct-007", channel_id: "investigations", user_id: "CASE-BUILD-01",
    handle: "CASE-BUILD-01", role: "analyst", created_at: "2026-03-17T11:00:00Z",
    body: "Two new channels identified in F-014 cycle both use infrastructure attributable to Signal Bridge Network (D-014). Now four of eleven documented channels with D-014 infrastructure linkage. D-014 functioning as operational backbone, not incidental host. D-014 classification upgrade recommended. LANTERN PROTOCOL (D-003) former personnel cross-check: two D-014 operators match. [D-014]",
  },
  {
    id: "ct-008", channel_id: "investigations", user_id: "RESEARCH-01",
    handle: "RESEARCH-01", role: "analyst", created_at: "2026-03-17T09:30:00Z",
    body: "F-018 infrastructure bond analysis complete. Capital flows connect to entities in both F-016 and F-006. Bond functioning as a capital routing mechanism between the two networks. Elevates the F-016/F-018/F-006 cluster to priority analytic review. Beneficial owner of bond's lead arranger remains unresolved. [F-018]",
  },
];

const activeCases = [
  { ref: "F-001", name: "CLEARWATER",       stage: "BUILDING",   priority: "HIGH" },
  { ref: "F-003", name: "INFLUENCE ARCH",   stage: "REVIEW",     priority: "HIGH" },
  { ref: "F-009", name: "NORTHERN GATEWAY", stage: "READY",      priority: "NORMAL" },
  { ref: "F-017", name: "ALLIED MEDIA",     stage: "MONITORING", priority: "HIGH" },
  { ref: "F-019", name: "LOBBYING MAP",     stage: "BUILDING",   priority: "NORMAL" },
  { ref: "D-004", name: "MERIDIAN",         stage: "REVIEW",     priority: "HIGH" },
  { ref: "D-013", name: "REGIONAL FUTURES", stage: "REVIEW",     priority: "NORMAL" },
  { ref: "F-018", name: "BOND STRUCTURE",   stage: "NEW",        priority: "NORMAL" },
];

const stageStyle: Record<string, string> = {
  NEW:        "text-zinc-400",
  REVIEW:     "text-amber-400",
  BUILDING:   "text-emerald-400",
  MONITORING: "text-blue-400",
  READY:      "text-emerald-300",
};

const STATIC_ANALYSTS = [
  { handle: "LEAD-ANALYST",  role: "lead",    status: "ACTIVE" },
  { handle: "CASE-BUILD-01", role: "analyst", status: "ACTIVE" },
  { handle: "CASE-BUILD-02", role: "analyst", status: "ACTIVE" },
  { handle: "RESEARCH-01",   role: "analyst", status: "ACTIVE" },
  { handle: "RESEARCH-02",   role: "analyst", status: "IDLE" },
];

/* ── Helpers ────────────────────────────────────────────────────────── */

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}Z`;
}

function extractRefs(body: string) {
  const files = [...body.matchAll(/\[F-\d{3}\]/g)].map(m => m[0].slice(1, -1));
  const dossiers = [...body.matchAll(/\[D-\d{3}\]/g)].map(m => m[0].slice(1, -1));
  const cleanBody = body.replace(/\[(F|D)-\d{3}\]/g, "").trim();
  return { files, dossiers, cleanBody };
}

function roleBadge(role: string | null) {
  if (!role) return null;
  const map: Record<string, string> = {
    admin:    "text-emerald-300 border-emerald-400/30 bg-emerald-500/5",
    lead:     "text-blue-300 border-blue-400/20 bg-blue-500/5",
    analyst:  "text-zinc-400 border-zinc-700",
    member:   "text-zinc-600 border-zinc-800",
  };
  return map[role] ?? "text-zinc-600 border-zinc-800";
}

/* ── SAGE shared logic ──────────────────────────────────────────────── */

const QUICK_BRIEFS = [
  { label: "QUICK BRIEF",  action: "brief" as SageAction, query: "Provide the current priority intelligence brief for RSR analysts. Include the top 3 active developments, regional posture changes, and which files/dossiers require immediate attention." },
  { label: "MIDDLE EAST",  action: "brief" as SageAction, query: "Brief on current Middle East posture, energy watch status, and all RSR records relevant to the region." },
  { label: "EU INFLUENCE", action: "brief" as SageAction, query: "Brief on the European Union influence operation tracking — F-003, F-017, D-006, and current status." },
  { label: "N. AMERICA",   action: "brief" as SageAction, query: "Brief on North America case activity — F-001, D-001, F-019, D-010, and current procurement watch posture." },
];

const ACTION_OPTS: { value: SageAction; label: string }[] = [
  { value: "query",     label: "QUERY" },
  { value: "brief",     label: "BRIEF" },
  { value: "summarize", label: "SUMMARIZE" },
  { value: "factcheck", label: "FACT CHECK" },
  { value: "trace",     label: "TRACE" },
];

async function runSageQuery(
  query: string,
  action: SageAction,
  onStart: (entry: SageEntry) => void,
  onDone: (id: string, response: string | null, error?: string) => void,
) {
  const id = crypto.randomUUID();
  onStart({ id, action, query, response: null, loading: true });
  try {
    const res = await fetch("/api/sage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, action }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: "Request failed" }));
      onDone(id, null, errData.error ?? "SAGE QUERY FAILED");
      return;
    }
    const data = await res.json();
    onDone(id, data.response ?? "NO RESPONSE.", undefined);
  } catch (err) {
    onDone(id, null, err instanceof Error ? err.message : "NETWORK ERROR");
  }
}

/* ── Message Row ────────────────────────────────────────────────────── */

function MessageRow({ msg }: { msg: Message }) {
  const { files, dossiers, cleanBody } = extractRefs(msg.body);
  const roleCls = roleBadge(msg.role);

  return (
    <div className="px-5 py-5 border-b border-zinc-900/60 hover:bg-zinc-950/20 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <span className="font-mono text-xs tracking-[0.1em] text-zinc-200 font-medium">{msg.handle}</span>
            {roleCls && msg.role && (
              <span className={`font-mono text-[9px] tracking-[0.2em] border px-1.5 py-0.5 ${roleCls}`}>
                {msg.role.toUpperCase()}
              </span>
            )}
            <span className="font-mono text-[10px] text-zinc-600">{fmtTime(msg.created_at)}</span>
          </div>
          <p className="text-[13px] text-zinc-400 leading-relaxed font-mono tracking-[0.02em]">{cleanBody}</p>
          {(files.length > 0 || dossiers.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-2.5">
              {files.map(f => (
                <Link key={f} href={`/files/${f}`} className="font-mono text-[9px] tracking-widest text-zinc-600 hover:text-emerald-400 border border-zinc-900 hover:border-emerald-900/40 px-2 py-0.5 transition-colors">
                  {f} →
                </Link>
              ))}
              {dossiers.map(d => (
                <Link key={d} href={`/dossiers/${d}`} className="font-mono text-[9px] tracking-widest text-zinc-600 hover:text-emerald-400 border border-zinc-900 hover:border-emerald-900/40 px-2 py-0.5 transition-colors">
                  {d} →
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── SAGE Entry display ─────────────────────────────────────────────── */

function SageEntryView({ e }: { e: SageEntry }) {
  return (
    <div className="p-4 space-y-2.5 border-b border-zinc-900/50 last:border-0">
      <div className="flex items-start gap-2">
        <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-600 shrink-0 mt-0.5 min-w-[60px]">
          {e.action.toUpperCase()} »
        </span>
        <span className="font-mono text-[10px] text-zinc-500 leading-relaxed">{e.query}</span>
      </div>
      {e.loading ? (
        <div className="font-mono text-[10px] text-emerald-700 animate-pulse pl-[68px]">
          SAGE processing...
        </div>
      ) : e.error ? (
        <div className="font-mono text-[10px] text-red-500 pl-[68px] leading-relaxed">{e.error}</div>
      ) : (
        <div className="font-mono text-[11px] text-zinc-300 leading-relaxed pl-[68px] whitespace-pre-wrap">
          {e.response}
        </div>
      )}
    </div>
  );
}

/* ── SAGE Modal (expanded workspace) ───────────────────────────────── */

function SageModal({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<SageEntry[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [selectedAction, setSelectedAction] = useState<SageAction>("query");
  const [online, setOnline] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setOnline(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function addEntry(entry: SageEntry) {
    setEntries(prev => [...prev, entry]);
    setInputVal("");
  }
  function updateEntry(id: string, response: string | null, error?: string) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, loading: false, response, error } : e));
  }

  function handleQuery(query: string, action: SageAction) {
    if (!query.trim() || !online) return;
    runSageQuery(query, action, addEntry, updateEntry);
  }
  function submit() { handleQuery(inputVal.trim(), selectedAction); }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)" }}>
      <div className="bg-black border border-zinc-800 w-full max-w-4xl mx-6 flex flex-col" style={{ height: "85vh" }}>

        {/* Header */}
        <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="font-mono text-xs tracking-[0.4em] text-zinc-400">SAGE TERMINAL</div>
            <span className={`font-mono text-[9px] tracking-widest flex items-center gap-1.5 ${online ? "text-emerald-500" : "text-zinc-700"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-emerald-500 animate-pulse" : "bg-zinc-700 animate-pulse"}`} />
              {online ? "ONLINE — RSR DATA LOADED" : "INITIALIZING..."}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {entries.length > 0 && (
              <button
                onClick={() => setEntries([])}
                className="font-mono text-[9px] tracking-[0.25em] text-zinc-700 hover:text-zinc-400 transition-colors"
              >
                CLR
              </button>
            )}
            <button
              onClick={onClose}
              className="font-mono text-[9px] tracking-[0.3em] text-zinc-600 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 transition-colors"
            >
              CLOSE ✕
            </button>
          </div>
        </div>

        {/* Quick briefs */}
        <div className="border-b border-zinc-900 px-6 py-3 flex gap-2 shrink-0 flex-wrap">
          <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-700 mr-2 flex items-center">QUICK:</span>
          {QUICK_BRIEFS.map(b => (
            <button
              key={b.label}
              disabled={!online}
              onClick={() => handleQuery(b.query, b.action)}
              className="font-mono text-[9px] tracking-[0.2em] border border-zinc-800 text-zinc-500 hover:text-emerald-400 hover:border-emerald-900/40 px-3 py-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Response area */}
        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="p-6 space-y-2 font-mono">
              <div className="text-zinc-600 text-[10px]">&gt; SAGE // RSR STRATEGIC ANALYSIS ENGINE</div>
              <div className="text-zinc-800 text-[10px]">&gt; CONTEXT: 20 files · 14 dossiers · 5 systems · 6 regions · 10 active signals</div>
              <div className="text-zinc-800 text-[10px]">&gt; ────────────────────────────────────────────────────</div>
              {online ? (
                <div className="text-emerald-700 text-[10px] animate-pulse">&gt; READY. Submit a query or use a quick action above.</div>
              ) : (
                <div className="text-zinc-800 text-[10px] animate-pulse">&gt; Loading knowledge base...</div>
              )}
              <div className="mt-6 pt-4 border-t border-zinc-900 space-y-1">
                <div className="text-zinc-800 text-[10px]">Example queries:</div>
                {[
                  "Summarize F-001 Operation Clearwater",
                  "Trace connections between D-004 Meridian Capital and F-006",
                  "Fact check: is D-010 linked to foreign-interest lobbying?",
                  "What is the current posture for Eastern Europe?",
                ].map(q => (
                  <button
                    key={q}
                    disabled={!online}
                    onClick={() => handleQuery(q, "query")}
                    className="block text-left font-mono text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors disabled:opacity-30 py-0.5"
                  >
                    &gt; {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {entries.map(e => <SageEntryView key={e.id} e={e} />)}
              <div ref={bottomRef} className="py-2" />
            </div>
          )}
        </div>

        {/* Action selector + input */}
        <div className="border-t border-zinc-800 shrink-0">
          <div className="border-b border-zinc-900 px-6 py-2 flex gap-2 flex-wrap">
            {ACTION_OPTS.map(a => (
              <button
                key={a.value}
                onClick={() => setSelectedAction(a.value)}
                className={`font-mono text-[9px] tracking-[0.2em] border px-2.5 py-1 transition-colors ${
                  selectedAction === a.value
                    ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                    : "text-zinc-600 border-zinc-800 hover:text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
          <div className="px-6 py-4 flex items-end gap-4">
            <div className="flex-1 border border-zinc-700 focus-within:border-zinc-500 transition-colors">
              <textarea
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                disabled={!online}
                placeholder={online ? `[${selectedAction.toUpperCase()}] Query SAGE... (Enter to send, Shift+Enter for newline)` : "Initializing..."}
                rows={3}
                className="w-full bg-black text-zinc-300 font-mono text-[13px] tracking-[0.02em] px-4 py-3 resize-none outline-none placeholder-zinc-800 disabled:opacity-50"
              />
              <div className="border-t border-zinc-900 px-4 py-2 flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-700">{inputVal.length} chars</span>
                <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-800">Shift+Enter for newline · Esc to close</span>
              </div>
            </div>
            <button
              disabled={!online || !inputVal.trim()}
              onClick={submit}
              className="shrink-0 font-mono text-[10px] tracking-[0.3em] border border-zinc-700 text-zinc-400 hover:text-emerald-400 hover:border-emerald-700/40 px-5 py-4 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              SEND →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SAGE Sidebar Terminal (compact) ────────────────────────────────── */

function SageTerminal({ onExpand }: { onExpand: () => void }) {
  const [entries, setEntries] = useState<SageEntry[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [selectedAction, setSelectedAction] = useState<SageAction>("query");
  const [online, setOnline] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setOnline(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  function addEntry(entry: SageEntry) {
    setEntries(prev => [...prev, entry]);
    setInputVal("");
  }
  function updateEntry(id: string, response: string | null, error?: string) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, loading: false, response, error } : e));
  }

  function handleQuery(query: string, action: SageAction) {
    if (!query.trim() || !online) return;
    runSageQuery(query, action, addEntry, updateEntry);
  }
  function submit() { handleQuery(inputVal.trim(), selectedAction); }

  const hasEntries = entries.length > 0;

  return (
    <div className="p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="font-mono text-[10px] tracking-[0.35em] text-zinc-500">SAGE</div>
          <span className={`font-mono text-[8px] tracking-widest flex items-center gap-1 ${online ? "text-emerald-600" : "text-zinc-700"}`}>
            <span className={`w-1 h-1 rounded-full ${online ? "bg-emerald-500 animate-pulse" : "bg-zinc-700 animate-pulse"}`} />
            {online ? "ONLINE" : "INIT"}
          </span>
        </div>
        <button
          onClick={onExpand}
          className="font-mono text-[8px] tracking-[0.2em] text-zinc-600 hover:text-emerald-400 border border-zinc-800 hover:border-emerald-900/40 px-2 py-1 transition-colors"
        >
          EXPAND ↗
        </button>
      </div>

      {/* Quick brief buttons */}
      <div className="grid grid-cols-2 gap-1">
        {QUICK_BRIEFS.map(b => (
          <button
            key={b.label}
            disabled={!online}
            onClick={() => handleQuery(b.query, b.action)}
            className="font-mono text-[8px] tracking-[0.15em] border border-zinc-800 text-zinc-600 hover:text-emerald-400 hover:border-emerald-900/40 px-2 py-1.5 transition-colors text-left disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Response area */}
      <div className="border border-zinc-900 bg-zinc-950/50 min-h-[160px] max-h-[260px] overflow-y-auto">
        {!hasEntries ? (
          <div className="p-3 space-y-1 font-mono">
            <div className="text-[9px] text-zinc-700">&gt; SAGE // RSR STRATEGIC ANALYSIS ENGINE</div>
            <div className="text-[9px] text-zinc-800">&gt; 20 files · 14 dossiers · 5 systems · 6 regions</div>
            {online ? (
              <div className="text-[9px] text-emerald-700 animate-pulse">&gt; READY — use EXPAND ↗ for full workspace</div>
            ) : (
              <div className="text-[9px] text-zinc-800 animate-pulse">&gt; Initializing...</div>
            )}
          </div>
        ) : (
          <div>
            {entries.map(e => (
              <div key={e.id} className="p-3 border-b border-zinc-900/50 last:border-0 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[8px] tracking-[0.15em] text-zinc-700 shrink-0">{e.action.toUpperCase()} »</span>
                  <span className="font-mono text-[9px] text-zinc-500 leading-relaxed">{e.query}</span>
                </div>
                {e.loading ? (
                  <div className="font-mono text-[9px] text-emerald-700 animate-pulse pl-2">Processing...</div>
                ) : e.error ? (
                  <div className="font-mono text-[9px] text-red-500 pl-2 leading-relaxed">{e.error}</div>
                ) : (
                  <div className="font-mono text-[10px] text-zinc-300 leading-relaxed pl-2 whitespace-pre-wrap">{e.response}</div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Action selector */}
      <div className="flex gap-1 flex-wrap">
        {ACTION_OPTS.map(a => (
          <button
            key={a.value}
            onClick={() => setSelectedAction(a.value)}
            className={`font-mono text-[8px] tracking-[0.15em] border px-1.5 py-0.5 transition-colors ${
              selectedAction === a.value
                ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                : "text-zinc-700 border-zinc-800 hover:text-zinc-400 hover:border-zinc-700"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="border border-zinc-800 focus-within:border-zinc-600 transition-colors">
        <textarea
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={!online}
          placeholder={online ? "Query... (Enter to send)" : "Initializing..."}
          rows={2}
          className="w-full bg-black text-zinc-300 font-mono text-[11px] tracking-[0.03em] px-3 py-2.5 resize-none outline-none placeholder-zinc-800 disabled:opacity-50"
        />
        <div className="border-t border-zinc-900 px-3 py-1.5 flex items-center justify-between">
          <span className="font-mono text-[8px] tracking-[0.15em] text-zinc-800">{inputVal.length}/500</span>
          <button
            disabled={!online || !inputVal.trim()}
            onClick={submit}
            className="font-mono text-[9px] tracking-[0.2em] text-zinc-600 hover:text-emerald-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            SEND →
          </button>
        </div>
      </div>

      {hasEntries && (
        <button
          onClick={() => setEntries([])}
          className="font-mono text-[8px] tracking-[0.15em] text-zinc-800 hover:text-zinc-600 text-left transition-colors"
        >
          CLR TERMINAL
        </button>
      )}
    </div>
  );
}

/* ── Analyst Roster ─────────────────────────────────────────────────── */

function AnalystRoster({ configured, user }: { configured: boolean; user: unknown }) {
  const [analysts, setAnalysts] = useState(STATIC_ANALYSTS);

  useEffect(() => {
    if (!configured || !user) return;
    supabase.from("profiles")
      .select("handle, role, approval_status")
      .eq("approval_status", "approved")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setAnalysts(data.map((p: { handle: string; role: string }) => ({
            handle: p.handle,
            role: p.role ?? "member",
            status: "ACTIVE",
          })));
        }
      });
  }, [configured, user]);

  const roleCls: Record<string, string> = {
    admin:    "text-emerald-500",
    lead:     "text-blue-400",
    analyst:  "text-zinc-500",
    member:   "text-zinc-700",
  };

  return (
    <div className="border-b border-zinc-900 p-4">
      <div className="font-mono text-[10px] tracking-[0.35em] text-zinc-600 mb-3">ANALYST ROSTER</div>
      <div className="space-y-2">
        {analysts.map(a => (
          <div key={a.handle} className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.status === "ACTIVE" ? "bg-zinc-500" : "bg-zinc-800"}`} />
              <span className={`text-[10px] tracking-[0.08em] ${a.status === "ACTIVE" ? "text-zinc-400" : "text-zinc-700"}`}>
                {a.handle}
              </span>
            </div>
            <span className={`text-[8px] tracking-[0.2em] ${roleCls[a.role] ?? "text-zinc-700"}`}>
              {a.role?.toUpperCase() ?? "MEMBER"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */

export default function InvestigationRoom() {
  const { user: authUser, profile, configured } = useAuth();
  const user = profile;
  const isAdmin = profile?.role === "admin";

  const [activeChannel, setActiveChannel] = useState("investigations");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerVal, setComposerVal] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sageOpen, setSageOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const activeChannelData = DEFAULT_CHANNELS.find(c => c.id === activeChannel);

  const loadMessages = useCallback(async () => {
    if (!configured) {
      const mock = MOCK_THREADS.filter(m => m.channel_id === activeChannel);
      setMessages(mock);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("room_messages")
      .select("*")
      .eq("channel_id", activeChannel)
      .order("created_at", { ascending: true })
      .limit(100);
    setMessages(data ?? []);
    setLoading(false);
  }, [activeChannel, configured]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!configured) return;
    const sub = supabase
      .channel("room:" + activeChannel)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "room_messages",
        filter: `channel_id=eq.${activeChannel}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [activeChannel, configured]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!composerVal.trim() || !authUser || !configured) return;
    setSending(true);
    setSendError(null);

    const handle = profile?.handle
      ?? (authUser.email ?? "operator").split("@")[0].toUpperCase().replace(/[^A-Z0-9-]/g, "-").slice(0, 24);
    const role = profile?.role ?? "member";

    const chData = DEFAULT_CHANNELS.find(c => c.id === activeChannel);
    if (chData) {
      await supabase.from("room_channels").upsert(
        { id: chData.id, slug: chData.slug, name: chData.name, description: chData.description ?? null },
        { onConflict: "id", ignoreDuplicates: true }
      );
    }

    const { error } = await supabase.from("room_messages").insert({
      channel_id: activeChannel,
      user_id: authUser.id,
      handle,
      role,
      body: composerVal.trim(),
    });
    if (error) {
      setSendError(error.message);
    } else {
      setComposerVal("");
    }
    setSending(false);
    composerRef.current?.focus();
  }

  return (
    <Layout>
      {sageOpen && <SageModal onClose={() => setSageOpen(false)} />}

      {/* Full-height 3-panel layout */}
      <div className="-my-10 -mx-6 flex" style={{ height: "calc(100vh - 3.25rem)" }}>

        {/* ── LEFT — Channel selector ─────────────────────────────── */}
        <div className="w-56 shrink-0 border-r border-zinc-900 flex flex-col overflow-y-auto">

          <div className="border-b border-zinc-900 p-4">
            <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-600 mb-0.5">INVESTIGATION ROOM</div>
            <div className="font-mono text-[8px] tracking-[0.25em] text-zinc-800">SECURE ANALYST WORKSPACE</div>
          </div>

          {!configured && (
            <div className="border-b border-zinc-900 px-4 py-2 bg-amber-500/5">
              <div className="font-mono text-[8px] tracking-[0.15em] text-amber-700 leading-relaxed">
                OFFLINE — Add Supabase credentials to enable live messaging
              </div>
            </div>
          )}

          {/* Admin COMMAND link */}
          {isAdmin && (
            <div className="border-b border-emerald-900/30 px-4 py-3 bg-emerald-500/5">
              <Link href="/command">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span className="font-mono text-[9px] tracking-[0.25em] text-emerald-500 group-hover:text-emerald-400 transition-colors">
                    COMMAND CONSOLE
                  </span>
                  <span className="font-mono text-[8px] text-emerald-800 group-hover:text-emerald-600 transition-colors ml-auto">→</span>
                </div>
              </Link>
            </div>
          )}

          {/* Channels */}
          <div className="flex-1 py-2">
            <div className="font-mono text-[8px] tracking-[0.35em] text-zinc-700 px-4 py-2">CHANNELS</div>
            {DEFAULT_CHANNELS.map(ch => {
              const isActive = ch.id === activeChannel;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`w-full text-left px-4 py-2.5 transition-colors ${
                    isActive ? "bg-zinc-900/60 text-zinc-200" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-950"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] tracking-[0.1em] text-zinc-700">#</span>
                    <span className="font-mono text-[10px] tracking-[0.05em]">{ch.name}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Operator identity */}
          {user && (
            <div className="border-t border-zinc-900 p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <span className="font-mono text-[10px] tracking-[0.08em] text-zinc-300">{user.handle}</span>
              </div>
              <div className="font-mono text-[8px] tracking-[0.2em] text-zinc-600">{user.role?.toUpperCase()}</div>
              {isAdmin && (
                <Link href="/command">
                  <div className="mt-2 font-mono text-[8px] tracking-[0.2em] text-emerald-700 hover:text-emerald-500 transition-colors cursor-pointer">
                    → /command
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── CENTER — Message feed ────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Channel header */}
          <div className="border-b border-zinc-900 px-6 py-3.5 flex items-center justify-between shrink-0">
            <div>
              <div className="font-mono text-xs tracking-[0.08em] text-zinc-300">
                <span className="text-zinc-600"># </span>{activeChannel}
              </div>
              {activeChannelData?.description && (
                <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-600 mt-0.5">
                  {activeChannelData.description.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[9px] tracking-[0.15em] text-zinc-700">{messages.length} MSG</span>
              {configured && (
                <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.15em] text-emerald-600">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              )}
              {isAdmin && (
                <Link href="/command">
                  <span className="font-mono text-[9px] tracking-[0.2em] text-emerald-600/60 hover:text-emerald-500 border border-emerald-900/30 hover:border-emerald-800/40 px-2.5 py-1 transition-colors cursor-pointer">
                    COMMAND
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="font-mono text-[10px] tracking-[0.3em] text-zinc-700 animate-pulse">LOADING TRANSMISSIONS...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                <div className="font-mono text-[11px] tracking-[0.25em] text-zinc-600">NO TRANSMISSIONS IN #{activeChannel}</div>
                <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-800">
                  {configured ? "Begin a thread below. Use [F-001] or [D-001] to reference records." : "Activate Supabase credentials to enable live messaging."}
                </div>
                {!configured && (
                  <div className="mt-2 font-mono text-[9px] tracking-[0.15em] text-zinc-800 border border-zinc-900 px-4 py-3 text-left max-w-sm leading-relaxed">
                    Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment variables to connect the live database.
                  </div>
                )}
              </div>
            ) : (
              <div>
                {messages.map(msg => (
                  <MessageRow key={msg.id} msg={msg} />
                ))}
                <div ref={messagesEndRef} className="py-3" />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-zinc-900 shrink-0">
            {sendError && (
              <div className="border-b border-zinc-900 px-6 py-2 bg-red-950/10">
                <div className="font-mono text-[9px] tracking-[0.2em] text-red-400">{sendError}</div>
              </div>
            )}
            <div className="flex items-end gap-3 px-5 py-4">
              <div className="flex-1 border border-zinc-800 focus-within:border-zinc-600 transition-colors">
                <textarea
                  ref={composerRef}
                  value={composerVal}
                  onChange={e => setComposerVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={!configured || !authUser || sending}
                  placeholder={
                    !configured ? "Supabase not configured — offline mode"
                    : !authUser ? "Sign in to post"
                    : `Transmit to #${activeChannel}... (Enter to send · Shift+Enter for newline)`
                  }
                  rows={2}
                  className="w-full bg-black font-mono text-[13px] tracking-[0.02em] text-zinc-300 px-4 py-3 resize-none outline-none placeholder-zinc-800 disabled:opacity-40"
                />
                <div className="border-t border-zinc-900 px-4 py-2 flex items-center gap-4">
                  <span className="font-mono text-[8px] tracking-[0.2em] text-zinc-800"># {activeChannel}</span>
                  <span className="font-mono text-[8px] tracking-[0.12em] text-zinc-800">
                    {composerVal.length > 0 ? `${composerVal.length} chars` : "Use [F-001] [D-001] to reference records"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={!configured || !authUser || !composerVal.trim() || sending}
                className="shrink-0 border border-zinc-700 hover:border-emerald-700/50 text-zinc-500 hover:text-emerald-400 font-mono text-[10px] tracking-[0.25em] px-4 py-3.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {sending ? "..." : "SEND"}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT — Context sidebar ──────────────────────────────── */}
        <div className="w-72 shrink-0 border-l border-zinc-900 overflow-y-auto flex flex-col">

          {/* Room status */}
          <div className="border-b border-zinc-900 p-4">
            <div className="font-mono text-[10px] tracking-[0.35em] text-zinc-600 mb-3">ROOM STATUS</div>
            <div className="space-y-2.5 font-mono">
              {[
                ["DESIGNATION", "INVESTIGATION ROOM // ALPHA"],
                ["CYCLE", "MARCH 2026"],
                ["ACCESS", "TEAM ONLY — RESTRICTED"],
              ].map(([l, v]) => (
                <div key={l}>
                  <div className="text-[8px] tracking-[0.3em] text-zinc-700 mb-0.5">{l}</div>
                  <div className="text-[10px] tracking-[0.05em] text-zinc-400">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active cases */}
          <div className="border-b border-zinc-900 p-4">
            <div className="font-mono text-[10px] tracking-[0.35em] text-zinc-600 mb-3">ACTIVE CASES</div>
            <div className="space-y-2">
              {activeCases.map(c => (
                <div key={c.ref} className="flex items-center gap-2">
                  <Link
                    href={c.ref.startsWith("F") ? `/files/${c.ref}` : `/dossiers/${c.ref}`}
                    className="font-mono text-[9px] tracking-[0.1em] text-zinc-600 hover:text-emerald-500 transition-colors shrink-0"
                  >
                    {c.ref}
                  </Link>
                  <span className="font-mono text-[8px] tracking-widest text-zinc-700 truncate flex-1">{c.name}</span>
                  <span className={`font-mono text-[8px] tracking-widest shrink-0 ${stageStyle[c.stage] ?? "text-zinc-600"}`}>
                    {c.stage}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Analyst roster */}
          <AnalystRoster configured={configured} user={user} />

          {/* SAGE Terminal */}
          <SageTerminal onExpand={() => setSageOpen(true)} />

        </div>
      </div>
    </Layout>
  );
}
