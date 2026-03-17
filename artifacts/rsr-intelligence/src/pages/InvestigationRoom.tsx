import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import { supabase, isConfigured } from "@/lib/supabase";

/* ── Types ───────────────────────────────────────────────────────────── */

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

/* ── Static data ─────────────────────────────────────────────────────── */

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
    handle: "LEAD-ANALYST", role: "Case Lead", created_at: "2026-03-17T16:00:00Z",
    body: "CLEARWATER — Clearwater procurement chain now confirmed at five layers. Cormorant Group (D-001) is operating at tier-2, not tier-1 as previously logged. The tier-1 entity appears to be an unregistered holding structure sharing a registered agent with three entries in F-005. This changes the risk attribution model significantly. Recommend BLACK DOG escalation for tier-1 entity identification. [F-001]",
  },
  {
    id: "ct-002", channel_id: "investigations", user_id: "CASE-BUILD-01",
    handle: "CASE-BUILD-01", role: "Entity Analyst", created_at: "2026-03-17T15:30:00Z",
    body: "MERIDIAN — Capital structure update: the three Asia-Pacific acquisition nodes cross-reference against two separate procurement bids documented in F-006 finance audit. One bidding entity shares a Singapore registered address with a known Meridian subsidiary. Combined with management company overlap, this is a strong structural linkage. ATLAS graph updated. Recommend F-006 priority elevation. [D-004]",
  },
  {
    id: "ct-003", channel_id: "investigations", user_id: "RESEARCH-01",
    handle: "RESEARCH-01", role: "Financial Analyst", created_at: "2026-03-17T14:45:00Z",
    body: "F-003 / F-017 banking linkage confirmed. Payment routing shows a shared correspondent banking relationship through a Maltese institution. Timing of fund transfers correlates with major editorial output windows in the F-017 media network. This is now a two-file cross-reference that needs elevation to the next AXION priority brief. Signal-Desk has been notified. [F-003]",
  },
  {
    id: "ct-004", channel_id: "investigations", user_id: "CASE-BUILD-02",
    handle: "CASE-BUILD-02", role: "Entity Analyst", created_at: "2026-03-17T14:00:00Z",
    body: "NORTHERN GATEWAY — Beneficial ownership trace complete. D-007 Northern Bridge Consortium: four entities, two jurisdictions. Ownership resolves to two individuals, one of whom appears in F-001 procurement network as a third-tier contractor through a separate shell entity. Document authorship metadata match across four bid submissions is the strongest available evidence of pre-bid coordination. Recommending F-009 classification upgrade to RESTRICTED. [F-009] [D-007]",
  },
  {
    id: "ct-005", channel_id: "investigations", user_id: "LEAD-ANALYST",
    handle: "LEAD-ANALYST", role: "Case Lead", created_at: "2026-03-17T13:15:00Z",
    body: "LOBBYING MAP — Twenty-three flagged relationships reviewed. Eight involve entities appearing in D-010 Western Advocacy Network as affiliated organizations. The network is using lobbying registration as a regularization mechanism for foreign-interest client access. Actual policy influence delivered through separate, non-disclosed advisory channels after the lobbying relationship establishes formal access. Continuing to map the advisory channel layer. [F-019] [D-010]",
  },
  {
    id: "ct-006", channel_id: "investigations", user_id: "RESEARCH-02",
    handle: "RESEARCH-02", role: "Regional Analyst", created_at: "2026-03-17T12:30:00Z",
    body: "Regional Futures Fund (D-013) and F-010 Eastern Europe influence mapping now confirmed as connected. Fund has equity exposure in three media entities documented in F-010. Correlated timing between new D-013 equity commitments and editorial output shifts is a strong indicator that capital and editorial direction share common ownership or direction. Priority finding for Eastern Europe posture assessment. [D-013]",
  },
  {
    id: "ct-007", channel_id: "investigations", user_id: "CASE-BUILD-01",
    handle: "CASE-BUILD-01", role: "Entity Analyst", created_at: "2026-03-17T11:00:00Z",
    body: "Two new channels identified in F-014 Information Corridor Watch cycle both use infrastructure attributable to Signal Bridge Network (D-014). Now four of eleven documented channels with D-014 infrastructure linkage. D-014 is functioning as an operational backbone rather than an incidental host. Recommending D-014 classification upgrade and cross-reference with LANTERN PROTOCOL (D-003) former personnel list — two D-014 operators match. [D-014]",
  },
  {
    id: "ct-008", channel_id: "investigations", user_id: "RESEARCH-01",
    handle: "RESEARCH-01", role: "Financial Analyst", created_at: "2026-03-17T09:30:00Z",
    body: "F-018 infrastructure bond structure analysis complete. Capital flows through the bond vehicle connect to entities present in both F-016 (Granite Capital) and F-006 (Meridian Capital). The bond is functioning as a capital routing mechanism between the two networks. This elevates the combined F-016/F-018/F-006 file cluster to a priority analytic review. Beneficial owner of the bond's lead arranger remains unresolved. [F-018]",
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

/* ── Helpers ─────────────────────────────────────────────────────────── */

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

/* ── Sub-components ──────────────────────────────────────────────────── */

function MessageRow({ msg }: { msg: Message }) {
  const { files, dossiers, cleanBody } = extractRefs(msg.body);

  return (
    <div className="px-5 py-4 border-b border-zinc-900/60 hover:bg-zinc-950/30 transition-colors group">
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <span className="font-mono text-[9px] tracking-widest text-zinc-700 shrink-0">
          [{fmtTime(msg.created_at)}]
        </span>
        <span className="font-mono text-[10px] tracking-[0.15em] text-zinc-300 font-medium">
          {msg.handle}
        </span>
        {msg.role && (
          <span className="font-mono text-[8px] tracking-widest text-zinc-700">{msg.role}</span>
        )}
        {files.map(f => (
          <Link key={f} href={`/files/${f}`}
            className="font-mono text-[8px] tracking-widest text-emerald-700 hover:text-emerald-400 border border-emerald-900/40 px-1.5 py-0.5 transition-colors">
            {f}
          </Link>
        ))}
        {dossiers.map(d => (
          <Link key={d} href={`/dossiers/${d}`}
            className="font-mono text-[8px] tracking-widest text-zinc-600 hover:text-zinc-300 border border-zinc-800 px-1.5 py-0.5 transition-colors">
            {d}
          </Link>
        ))}
      </div>
      <p className="text-sm text-zinc-500 leading-relaxed pl-0 font-mono text-[11px] tracking-wide">
        {cleanBody}
      </p>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */

export default function InvestigationRoom() {
  const { user, profile, configured, signOut } = useAuth();

  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS);
  const [activeChannel, setActiveChannel] = useState<Channel>(DEFAULT_CHANNELS[1]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  /* Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Fetch channels from DB */
  useEffect(() => {
    if (!configured || !user) return;
    supabase.from("room_channels").select("*").order("created_at").then(({ data }) => {
      if (data && data.length > 0) {
        setChannels(data as Channel[]);
        setActiveChannel(data.find((c: Channel) => c.slug === "investigations") ?? data[0]);
      }
    });
  }, [configured, user]);

  /* Load messages + subscribe when channel changes */
  const loadChannel = useCallback(async (ch: Channel) => {
    setActiveChannel(ch);
    setMessages([]);
    setLoadingMsgs(true);

    // Tear down old subscription
    if (realtimeRef.current) {
      supabase.removeChannel(realtimeRef.current);
      realtimeRef.current = null;
    }

    if (configured && user) {
      const { data } = await supabase
        .from("room_messages")
        .select("*")
        .eq("channel_id", ch.id)
        .order("created_at", { ascending: true })
        .limit(200);
      setMessages((data ?? []) as Message[]);
      setLoadingMsgs(false);

      // Subscribe realtime
      const sub = supabase
        .channel(`room:${ch.id}`)
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "room_messages",
          filter: `channel_id=eq.${ch.id}`,
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        })
        .subscribe();
      realtimeRef.current = sub;
    } else {
      // Show mock data offline
      const mock = ch.slug === "investigations" ? MOCK_THREADS : [];
      setMessages(mock);
      setLoadingMsgs(false);
    }
  }, [configured, user]);

  /* Initial load */
  useEffect(() => {
    loadChannel(activeChannel);
    return () => {
      if (realtimeRef.current) supabase.removeChannel(realtimeRef.current);
    };
  }, []);

  /* Send message */
  async function handleSend() {
    if (!newMsg.trim() || !user || !profile) return;
    setSending(true);
    setSendError(null);

    const { error } = await supabase.from("room_messages").insert({
      channel_id: activeChannel.id,
      user_id: user.id,
      handle: profile.handle,
      role: profile.role ?? null,
      body: newMsg.trim(),
    });

    if (error) {
      setSendError("TRANSMISSION FAILED — try again.");
    } else {
      setNewMsg("");
    }
    setSending(false);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  }

  /* Stage counts for the header strip */
  const stageCounts = activeCases.reduce<Record<string, number>>((acc, c) => {
    acc[c.stage] = (acc[c.stage] ?? 0) + 1;
    return acc;
  }, {});
  const stageOrder = ["NEW", "REVIEW", "BUILDING", "MONITORING", "READY"];

  const canPost = configured && !!user;

  return (
    <Layout>
      {/* Override main padding — pull content to layout edges */}
      <div className="-my-10 -mx-6 flex flex-col" style={{ minHeight: "calc(100vh - 185px)" }}>

        {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
        <div className="border-b border-zinc-900 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <div className="font-mono text-[9px] tracking-[0.45em] text-zinc-700 mb-1 flex items-center gap-2">
                <span className="w-1 h-1 bg-zinc-800" />
                RSR INTELLIGENCE NETWORK // RESTRICTED
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-none">
                INVESTIGATION ROOM
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4 font-mono text-[9px] tracking-[0.3em]">
            <span className="flex items-center gap-2 text-zinc-700">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              CASE CYCLE: MARCH 2026
            </span>
            <span className="text-zinc-800">·</span>
            {configured && user ? (
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-600">{profile?.handle ?? user.email}</span>
              </span>
            ) : (
              <Link href="/access" className="text-zinc-700 hover:text-emerald-500 transition-colors border border-zinc-800 px-2 py-1">
                AUTHENTICATE →
              </Link>
            )}
            {configured && user && (
              <button onClick={signOut} className="text-zinc-700 hover:text-zinc-400 transition-colors">
                SIGN OUT
              </button>
            )}
          </div>
        </div>

        {/* ── CASE PROGRESS STRIP ─────────────────────────────────────── */}
        <div className="border-b border-zinc-900 grid grid-cols-5 divide-x divide-zinc-900 shrink-0">
          {stageOrder.map(stage => (
            <div key={stage} className="px-4 py-2.5 text-center bg-zinc-950/20">
              <div className={`font-mono text-[8px] tracking-[0.3em] mb-1 ${stageStyle[stage] ?? "text-zinc-600"}`}>
                {stage}
              </div>
              <div className="font-mono text-base text-white">
                {stageCounts[stage] ?? 0}
              </div>
            </div>
          ))}
        </div>

        {/* ── 3-COLUMN TERMINAL ───────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* LEFT — Channel sidebar */}
          <div className="w-44 shrink-0 border-r border-zinc-900 flex flex-col bg-zinc-950/20">
            <div className="px-4 pt-4 pb-2 border-b border-zinc-900">
              <div className="font-mono text-[8px] tracking-[0.4em] text-zinc-700">CHANNELS</div>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {channels.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => loadChannel(ch)}
                  className={`w-full text-left px-4 py-2.5 font-mono text-[10px] tracking-[0.1em] transition-colors ${
                    activeChannel.id === ch.id
                      ? "text-emerald-400 bg-emerald-500/5 border-r-2 border-emerald-500/40"
                      : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/30"
                  }`}
                >
                  <span className="text-zinc-700 mr-1">#</span>{ch.name}
                </button>
              ))}
            </nav>
            <div className="border-t border-zinc-900 p-4 space-y-2">
              <Link href="/signal-room" className="block font-mono text-[9px] tracking-[0.2em] text-zinc-700 hover:text-zinc-400 transition-colors">
                SIGNAL ROOM →
              </Link>
              <Link href="/briefing" className="block font-mono text-[9px] tracking-[0.2em] text-zinc-700 hover:text-zinc-400 transition-colors">
                REQUEST BRIEFING →
              </Link>
            </div>
          </div>

          {/* CENTER — Message feed */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-900">

            {/* Channel header */}
            <div className="border-b border-zinc-900 px-5 py-3 flex items-center justify-between shrink-0 bg-zinc-950/10">
              <div>
                <div className="font-mono text-[11px] tracking-[0.2em] text-zinc-300">
                  <span className="text-zinc-600"># </span>{activeChannel.name}
                </div>
                {activeChannel.description && (
                  <div className="font-mono text-[8px] tracking-widest text-zinc-700 mt-0.5">
                    {activeChannel.description}
                  </div>
                )}
              </div>
              <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-700">
                {messages.length} {messages.length === 1 ? "ENTRY" : "ENTRIES"}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-32">
                  <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-700 animate-pulse">LOADING CHANNEL...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-800">NO ENTRIES</div>
                  <div className="font-mono text-[9px] tracking-widest text-zinc-800">
                    {canPost ? "Post the first message to open this channel." : "Authenticate to view and contribute."}
                  </div>
                </div>
              ) : (
                <>
                  {!configured && (
                    <div className="px-5 py-3 border-b border-zinc-900 bg-zinc-950/40">
                      <div className="font-mono text-[8px] tracking-[0.3em] text-zinc-700">
                        OFFLINE MODE — Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to activate live collaboration
                      </div>
                    </div>
                  )}
                  {messages.map(msg => <MessageRow key={msg.id} msg={msg} />)}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-zinc-900 p-4 shrink-0">
              {canPost ? (
                <>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 border border-zinc-800 focus-within:border-emerald-500/30 transition-colors">
                      <textarea
                        ref={textareaRef}
                        value={newMsg}
                        onChange={e => setNewMsg(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={2}
                        placeholder={`Post to # ${activeChannel.name} ...`}
                        disabled={sending}
                        className="w-full bg-black px-4 py-3 font-mono text-xs text-zinc-300 tracking-wide placeholder:text-zinc-800 focus:outline-none resize-none disabled:opacity-40"
                      />
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={sending || !newMsg.trim()}
                      className="shrink-0 border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 font-mono text-[9px] tracking-[0.3em] text-emerald-500/80 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed self-stretch"
                    >
                      {sending ? "..." : "TRANSMIT"}
                    </button>
                  </div>
                  {sendError && (
                    <div className="mt-2 font-mono text-[8px] tracking-widest text-red-400/60">{sendError}</div>
                  )}
                  <div className="mt-1.5 font-mono text-[8px] tracking-widest text-zinc-800">
                    ⌘ + ENTER to transmit · {profile?.handle} · {profile?.role ?? "ANALYST"}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between border border-zinc-900 bg-zinc-950/20 px-4 py-3">
                  <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-700">
                    {configured ? "AUTHENTICATE TO CONTRIBUTE" : "CONFIGURE SUPABASE TO GO LIVE"}
                  </span>
                  <Link href="/access" className="font-mono text-[9px] tracking-[0.2em] text-emerald-600 hover:text-emerald-400 transition-colors border border-emerald-900/40 px-3 py-1">
                    ACCESS →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Context sidebar */}
          <div className="w-72 shrink-0 overflow-y-auto flex flex-col">

            {/* Room status */}
            <div className="border-b border-zinc-900 p-5">
              <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-4">ROOM STATUS</div>
              <div className="space-y-3 font-mono text-[10px] tracking-widest">
                <div>
                  <div className="text-zinc-700 mb-1">DESIGNATION</div>
                  <div className="text-zinc-400">INVESTIGATION ROOM // ALPHA</div>
                </div>
                <div>
                  <div className="text-zinc-700 mb-1">ACTIVE CYCLE</div>
                  <div className="text-zinc-400">MARCH 2026</div>
                </div>
                <div>
                  <div className="text-zinc-700 mb-1">ACCESS</div>
                  <div className="text-zinc-700">TEAM ONLY — RESTRICTED</div>
                </div>
                <div>
                  <div className="text-zinc-700 mb-1">OBJECTIVE</div>
                  <div className="text-zinc-500 text-[9px] tracking-widest leading-relaxed">
                    Develop case files, trace entity networks, and build dossiers across active investigations.
                  </div>
                </div>
              </div>
            </div>

            {/* Active cases */}
            <div className="border-b border-zinc-900 p-5">
              <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-4">ACTIVE CASES</div>
              <div className="space-y-2">
                {activeCases.map(c => (
                  <div key={c.ref} className="flex items-center justify-between gap-2">
                    <Link
                      href={c.ref.startsWith("F") ? `/files/${c.ref}` : `/dossiers/${c.ref}`}
                      className="font-mono text-[9px] tracking-widest text-zinc-600 hover:text-emerald-500 transition-colors"
                    >
                      {c.ref}
                    </Link>
                    <span className="font-mono text-[8px] tracking-widest text-zinc-700 truncate flex-1">
                      {c.name}
                    </span>
                    <span className={`font-mono text-[8px] tracking-widest shrink-0 ${stageStyle[c.stage] ?? "text-zinc-600"}`}>
                      {c.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Analyst roster — pulls live from Supabase or shows static */}
            <AnalystRoster configured={configured} user={user} />

            {/* SAGE Terminal */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-800">SAGE TERMINAL</div>
                <span className="font-mono text-[8px] tracking-widest text-zinc-800 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-zinc-800 animate-pulse" />
                  INITIALIZING
                </span>
              </div>
              <div className="border border-zinc-900 bg-black p-3 mb-3">
                <div className="font-mono text-[9px] text-zinc-800 space-y-1">
                  <div>&gt; SAGE // QUERY INTERFACE</div>
                  <div>&gt; STATUS: COMING ONLINE...</div>
                  <div>&gt; ─────────────────────</div>
                  <div className="animate-pulse">&gt; Awaiting authorization.</div>
                </div>
              </div>
              <div className="font-mono text-[8px] tracking-widest text-zinc-800 space-y-1 leading-relaxed">
                <div>FACT CHECK · QUICK BRIEF · SITREP</div>
                <div>Rapid synthesis. Next cycle.</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ── Analyst Roster sub-component ────────────────────────────────────── */

const STATIC_ANALYSTS = [
  { handle: "LEAD-ANALYST",  role: "Case Lead",         status: "ACTIVE" },
  { handle: "CASE-BUILD-01", role: "Entity Analyst",    status: "ACTIVE" },
  { handle: "CASE-BUILD-02", role: "Entity Analyst",    status: "ACTIVE" },
  { handle: "RESEARCH-01",   role: "Financial Analyst", status: "ACTIVE" },
  { handle: "RESEARCH-02",   role: "Regional Analyst",  status: "IDLE" },
];

function AnalystRoster({ configured, user }: { configured: boolean; user: unknown }) {
  const [analysts, setAnalysts] = useState(STATIC_ANALYSTS);

  useEffect(() => {
    if (!configured || !user) return;
    supabase.from("profiles").select("handle, role").then(({ data }) => {
      if (data && data.length > 0) {
        setAnalysts(data.map((p: { handle: string; role: string }) => ({
          handle: p.handle,
          role: p.role,
          status: "ACTIVE",
        })));
      }
    });
  }, [configured, user]);

  return (
    <div className="border-b border-zinc-900 p-5">
      <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-4">ANALYST ROSTER</div>
      <div className="space-y-2">
        {analysts.map(a => (
          <div key={a.handle} className="flex items-center justify-between font-mono text-[10px]">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.status === "ACTIVE" ? "bg-zinc-400" : "bg-zinc-800"}`} />
              <span className={`tracking-[0.1em] ${a.status === "ACTIVE" ? "text-zinc-400" : "text-zinc-700"}`}>
                {a.handle}
              </span>
            </div>
            <span className="text-zinc-700 tracking-widest text-[8px]">{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
