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
    admin:    "text-emerald-300 border-emerald-400/30",
    lead:     "text-blue-300 border-blue-400/20",
    analyst:  "text-zinc-400 border-zinc-700",
    member:   "text-zinc-600 border-zinc-800",
  };
  return map[role] ?? "text-zinc-600 border-zinc-800";
}

/* ── Message component ──────────────────────────────────────────────── */

function MessageRow({ msg }: { msg: Message }) {
  const { files, dossiers, cleanBody } = extractRefs(msg.body);
  const roleCls = roleBadge(msg.role);

  return (
    <div className="px-5 py-4 border-b border-zinc-900/60 hover:bg-zinc-950/20 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
            <span className="font-mono text-[9px] tracking-[0.12em] text-zinc-300 font-medium">{msg.handle}</span>
            {roleCls && msg.role && (
              <span className={`font-mono text-[7px] tracking-[0.25em] border px-1 py-0.5 ${roleCls}`}>
                {msg.role.toUpperCase()}
              </span>
            )}
            <span className="font-mono text-[8px] text-zinc-700">{fmtTime(msg.created_at)}</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-mono tracking-[0.03em]">{cleanBody}</p>
          {(files.length > 0 || dossiers.length > 0) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {files.map(f => (
                <Link key={f} href={`/files/${f}`} className="font-mono text-[8px] tracking-widest text-zinc-700 hover:text-emerald-400 border border-zinc-900 hover:border-emerald-900/40 px-1.5 py-0.5 transition-colors">
                  {f} →
                </Link>
              ))}
              {dossiers.map(d => (
                <Link key={d} href={`/dossiers/${d}`} className="font-mono text-[8px] tracking-widest text-zinc-700 hover:text-emerald-400 border border-zinc-900 hover:border-emerald-900/40 px-1.5 py-0.5 transition-colors">
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

/* ── SAGE Terminal component ────────────────────────────────────────── */

const QUICK_BRIEFS = [
  { label: "QUICK BRIEF", action: "brief" as SageAction, query: "Provide the current priority intelligence brief for RSR analysts. Include the top 3 active developments, regional posture changes, and which files/dossiers require immediate attention." },
  { label: "MIDDLE EAST", action: "brief" as SageAction, query: "Brief on current Middle East posture, energy watch status, and all RSR records relevant to the region." },
  { label: "EU INFLUENCE", action: "brief" as SageAction, query: "Brief on the European Union influence operation tracking — F-003, F-017, D-006, and current status." },
  { label: "NORTH AMERICA", action: "brief" as SageAction, query: "Brief on North America case activity — F-001, D-001, F-019, D-010, and current procurement watch posture." },
];

function SageTerminal({ configured }: { configured: boolean }) {
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

  async function querySage(query: string, action: SageAction) {
    const id = crypto.randomUUID();
    const entry: SageEntry = { id, action, query, response: null, loading: true };
    setEntries(prev => [...prev, entry]);
    setInputVal("");

    try {
      const res = await fetch("/api/sage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, action }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Request failed" }));
        setEntries(prev => prev.map(e => e.id === id ? { ...e, loading: false, error: errData.error ?? "SAGE QUERY FAILED" } : e));
        return;
      }

      const data = await res.json();
      setEntries(prev => prev.map(e => e.id === id ? { ...e, loading: false, response: data.response } : e));
    } catch (err) {
      setEntries(prev => prev.map(e => e.id === id ? {
        ...e, loading: false, error: err instanceof Error ? err.message : "NETWORK ERROR",
      } : e));
    }
  }

  function submit() {
    const q = inputVal.trim();
    if (!q || !online) return;
    querySage(q, selectedAction);
  }

  const actionOpts: { value: SageAction; label: string }[] = [
    { value: "query", label: "QUERY" },
    { value: "brief", label: "BRIEF" },
    { value: "summarize", label: "SUMMARIZE" },
    { value: "factcheck", label: "FACT CHECK" },
    { value: "trace", label: "TRACE" },
  ];

  const hasEntries = entries.length > 0;

  return (
    <div className="p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-600">SAGE TERMINAL</div>
        <span className={`font-mono text-[7px] tracking-widest flex items-center gap-1.5 ${online ? "text-emerald-600" : "text-zinc-700"}`}>
          <span className={`w-1 h-1 rounded-full ${online ? "bg-emerald-500 animate-pulse" : "bg-zinc-700 animate-pulse"}`} />
          {online ? "ONLINE" : "INIT..."}
        </span>
      </div>

      {/* Quick brief buttons */}
      <div className="grid grid-cols-2 gap-1">
        {QUICK_BRIEFS.map(b => (
          <button
            key={b.label}
            disabled={!online}
            onClick={() => querySage(b.query, b.action)}
            className="font-mono text-[7px] tracking-[0.2em] border border-zinc-800 text-zinc-600 hover:text-emerald-400 hover:border-emerald-900/40 px-2 py-1.5 transition-colors text-left disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Response area */}
      <div className="border border-zinc-900 bg-zinc-950/50 min-h-[180px] max-h-[320px] overflow-y-auto">
        {!hasEntries ? (
          <div className="p-3 space-y-1 font-mono text-[8px]">
            <div className="text-zinc-700">&gt; SAGE // RSR STRATEGIC ANALYSIS ENGINE</div>
            <div className="text-zinc-800">&gt; LOADED: 20 files · 14 dossiers · 5 systems · 6 regions</div>
            <div className="text-zinc-800">&gt; ────────────────────────────────────</div>
            {online ? (
              <div className="text-emerald-700 animate-pulse">&gt; READY. Submit query below.</div>
            ) : (
              <div className="text-zinc-800 animate-pulse">&gt; Initializing knowledge base...</div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-900/50">
            {entries.map(e => (
              <div key={e.id} className="p-3 space-y-2">
                {/* Query */}
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[7px] tracking-[0.2em] text-zinc-700 shrink-0 mt-0.5">
                    {e.action.toUpperCase()} »
                  </span>
                  <span className="font-mono text-[8px] text-zinc-500 leading-relaxed">{e.query}</span>
                </div>
                {/* Response */}
                {e.loading ? (
                  <div className="font-mono text-[8px] text-emerald-700 animate-pulse pl-10">
                    SAGE processing...
                  </div>
                ) : e.error ? (
                  <div className="font-mono text-[8px] text-red-500 pl-10">{e.error}</div>
                ) : (
                  <div className="font-mono text-[8px] text-zinc-400 leading-relaxed pl-10 whitespace-pre-wrap">
                    {e.response}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Action selector */}
      <div className="flex gap-1 flex-wrap">
        {actionOpts.map(a => (
          <button
            key={a.value}
            onClick={() => setSelectedAction(a.value)}
            className={`font-mono text-[7px] tracking-[0.2em] border px-1.5 py-0.5 transition-colors ${
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
      <div className="border border-zinc-800 focus-within:border-zinc-700 transition-colors">
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
          placeholder={online ? "Query SAGE... (Enter to send, Shift+Enter for newline)" : "Initializing..."}
          rows={2}
          className="w-full bg-black text-zinc-400 font-mono text-[9px] tracking-[0.05em] px-3 py-2 resize-none outline-none placeholder-zinc-800 disabled:opacity-50"
        />
        <div className="border-t border-zinc-900 px-3 py-1.5 flex items-center justify-between">
          <span className="font-mono text-[7px] tracking-[0.2em] text-zinc-800">{inputVal.length}/500</span>
          <button
            disabled={!online || !inputVal.trim()}
            onClick={submit}
            className="font-mono text-[8px] tracking-[0.25em] text-zinc-700 hover:text-emerald-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            SEND →
          </button>
        </div>
      </div>

      {/* Clear */}
      {hasEntries && (
        <button
          onClick={() => setEntries([])}
          className="font-mono text-[7px] tracking-[0.2em] text-zinc-800 hover:text-zinc-600 text-left transition-colors"
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
    admin:    "text-emerald-600",
    lead:     "text-blue-500",
    analyst:  "text-zinc-500",
    member:   "text-zinc-700",
  };

  return (
    <div className="border-b border-zinc-900 p-5">
      <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-4">ANALYST ROSTER</div>
      <div className="space-y-2">
        {analysts.map(a => (
          <div key={a.handle} className="flex items-center justify-between font-mono text-[9px]">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.status === "ACTIVE" ? "bg-zinc-500" : "bg-zinc-800"}`} />
              <span className={a.status === "ACTIVE" ? "text-zinc-400 tracking-[0.1em]" : "text-zinc-700 tracking-[0.1em]"}>
                {a.handle}
              </span>
            </div>
            <span className={`text-[7px] tracking-[0.2em] ${roleCls[a.role] ?? "text-zinc-700"}`}>
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
  const { profile: user } = useAuth();
  const configured = isConfigured;

  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS);
  const [activeChannel, setActiveChannel] = useState("investigations");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerVal, setComposerVal] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const activeChannelData = channels.find(c => c.id === activeChannel);

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
    if (!composerVal.trim() || !user || !configured) return;
    setSending(true);
    setSendError(null);
    const { error } = await supabase.from("room_messages").insert({
      channel_id: activeChannel,
      user_id: user.id,
      handle: user.handle,
      role: user.role,
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

  const msgCount = messages.length;

  return (
    <Layout>
      {/* Full-height 3-panel layout uses negative margin trick */}
      <div className="-my-10 -mx-6 flex" style={{ height: "calc(100vh - 3.25rem)" }}>

        {/* ── LEFT — Channel selector ─────────────────────────────── */}
        <div className="w-52 shrink-0 border-r border-zinc-900 flex flex-col overflow-y-auto">

          {/* Header */}
          <div className="border-b border-zinc-900 p-4">
            <div className="font-mono text-[8px] tracking-[0.4em] text-zinc-700 mb-1">INVESTIGATION ROOM</div>
            <div className="font-mono text-[7px] tracking-[0.3em] text-zinc-800">SECURE ANALYST WORKSPACE</div>
          </div>

          {/* Status strip */}
          {!configured && (
            <div className="border-b border-zinc-900 px-4 py-2.5 bg-amber-500/5">
              <div className="font-mono text-[7px] tracking-[0.2em] text-amber-700 leading-relaxed">
                OFFLINE MODE — Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to activate live collaboration
              </div>
            </div>
          )}

          {/* Channels */}
          <div className="flex-1 py-2">
            <div className="font-mono text-[7px] tracking-[0.35em] text-zinc-700 px-4 py-2">CHANNELS</div>
            {channels.map(ch => {
              const isActive = ch.id === activeChannel;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`w-full text-left px-4 py-2 transition-colors ${
                    isActive ? "bg-zinc-900/60 text-zinc-300" : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-950"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[8px] tracking-[0.1em] text-zinc-700">#</span>
                    <span className="font-mono text-[8px] tracking-[0.1em]">{ch.name}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Operator identity */}
          {user && (
            <div className="border-t border-zinc-900 p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span className="font-mono text-[8px] tracking-[0.1em] text-zinc-400">{user.handle}</span>
              </div>
              <div className="font-mono text-[7px] tracking-[0.2em] text-zinc-700">{user.role?.toUpperCase()}</div>
            </div>
          )}
        </div>

        {/* ── CENTER — Message feed ────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Channel header */}
          <div className="border-b border-zinc-900 px-5 py-3 flex items-center justify-between shrink-0">
            <div>
              <div className="font-mono text-[9px] tracking-[0.1em] text-zinc-400">
                <span className="text-zinc-700"># </span>{activeChannel}
              </div>
              {activeChannelData?.description && (
                <div className="font-mono text-[7px] tracking-[0.2em] text-zinc-700 mt-0.5">
                  {activeChannelData.description.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[7px] tracking-[0.2em] text-zinc-800">{msgCount} MSG</span>
              {configured && (
                <span className="flex items-center gap-1.5 font-mono text-[7px] tracking-[0.2em] text-emerald-700">
                  <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-700 animate-pulse">LOADING TRANSMISSIONS...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-700">NO TRANSMISSIONS IN #{activeChannel}</div>
                <div className="font-mono text-[7px] tracking-[0.2em] text-zinc-800">
                  {configured ? "Begin a thread below." : "Activate Supabase to enable live messaging."}
                </div>
              </div>
            ) : (
              <div>
                {messages.map(msg => (
                  <MessageRow key={msg.id} msg={msg} />
                ))}
                <div ref={messagesEndRef} className="py-2" />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-zinc-900 shrink-0">
            {!configured && (
              <div className="border-b border-zinc-900 px-5 py-2.5">
                <div className="font-mono text-[7px] tracking-[0.2em] text-zinc-800">
                  OFFLINE MODE — Supabase credentials required for live messaging
                </div>
              </div>
            )}
            {sendError && (
              <div className="border-b border-zinc-900 px-5 py-2 bg-red-950/10">
                <div className="font-mono text-[8px] tracking-[0.2em] text-red-500">{sendError}</div>
              </div>
            )}
            <div className="flex items-end gap-3 px-5 py-4">
              <div className="flex-1 border border-zinc-800 focus-within:border-zinc-700 transition-colors">
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
                  disabled={!configured || !user || sending}
                  placeholder={
                    !configured ? "Offline mode — Supabase not configured"
                    : !user ? "Sign in to post"
                    : `Transmit to #${activeChannel}... (Enter to send, Shift+Enter for newline)`
                  }
                  rows={2}
                  className="w-full bg-black font-mono text-[10px] tracking-[0.04em] text-zinc-400 px-3 py-2.5 resize-none outline-none placeholder-zinc-800 disabled:opacity-40"
                />
                <div className="border-t border-zinc-900 px-3 py-1.5 flex items-center gap-3">
                  <span className="font-mono text-[7px] tracking-[0.2em] text-zinc-800">
                    # {activeChannel}
                  </span>
                  <span className="font-mono text-[7px] tracking-[0.15em] text-zinc-800">
                    {composerVal.length > 0 ? `${composerVal.length} chars` : "Use [F-001] [D-001] to ref records"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={!configured || !user || !composerVal.trim() || sending}
                className="shrink-0 border border-zinc-800 hover:border-emerald-800/60 text-zinc-600 hover:text-emerald-500 font-mono text-[8px] tracking-[0.25em] px-4 py-3 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {sending ? "..." : "SEND"}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT — Context sidebar ──────────────────────────────── */}
        <div className="w-72 shrink-0 border-l border-zinc-900 overflow-y-auto flex flex-col">

          {/* Room status */}
          <div className="border-b border-zinc-900 p-5">
            <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-4">ROOM STATUS</div>
            <div className="space-y-3 font-mono text-[9px] tracking-widest">
              <div>
                <div className="text-zinc-700 text-[7px] tracking-[0.3em] mb-0.5">DESIGNATION</div>
                <div className="text-zinc-400 text-[8px]">INVESTIGATION ROOM // ALPHA</div>
              </div>
              <div>
                <div className="text-zinc-700 text-[7px] tracking-[0.3em] mb-0.5">ACTIVE CYCLE</div>
                <div className="text-zinc-400 text-[8px]">MARCH 2026</div>
              </div>
              <div>
                <div className="text-zinc-700 text-[7px] tracking-[0.3em] mb-0.5">ACCESS</div>
                <div className="text-zinc-700 text-[7px]">TEAM ONLY — RESTRICTED</div>
              </div>
            </div>
          </div>

          {/* Active cases */}
          <div className="border-b border-zinc-900 p-5">
            <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-3">ACTIVE CASES</div>
            <div className="space-y-1.5">
              {activeCases.map(c => (
                <div key={c.ref} className="flex items-center gap-2">
                  <Link
                    href={c.ref.startsWith("F") ? `/files/${c.ref}` : `/dossiers/${c.ref}`}
                    className="font-mono text-[8px] tracking-[0.12em] text-zinc-600 hover:text-emerald-500 transition-colors shrink-0"
                  >
                    {c.ref}
                  </Link>
                  <span className="font-mono text-[7px] tracking-widest text-zinc-700 truncate flex-1">{c.name}</span>
                  <span className={`font-mono text-[7px] tracking-widest shrink-0 ${stageStyle[c.stage] ?? "text-zinc-600"}`}>
                    {c.stage}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Analyst roster */}
          <AnalystRoster configured={configured} user={user} />

          {/* SAGE Terminal */}
          <SageTerminal configured={configured} />

        </div>
      </div>
    </Layout>
  );
}
