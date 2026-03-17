import Layout from "@/components/Layout";
import { Link } from "wouter";

interface Message {
  id: string;
  handle: string;
  handleType: "system" | "analyst" | "restricted";
  system?: string;
  timestamp: string;
  content: string;
  priority?: "HIGH" | "NORMAL";
  redacted?: boolean;
}

const messages: Message[] = [
  {
    id: "m-001", handle: "ORION-WATCH", handleType: "system", system: "ORION",
    timestamp: "2026-03-17T19:22:00Z",
    content: "POSTURE UPDATE — Middle East zone moving to CRITICAL. Energy watch corridor active on Strait of Hormuz adjacent lanes. Logistics disruption confirmed on two supply routes. Signal count now 27.",
    priority: "HIGH",
  },
  {
    id: "m-002", handle: "ATLAS-07", handleType: "analyst",
    timestamp: "2026-03-17T19:18:00Z",
    content: "Cross-referencing D-004 Meridian Capital against the new Asia-Pacific acquisition node flagged by signal SIG-004. Looking at shared registered agents across four offshore holding structures. Will post update to ATLAS layer by 20:00Z.",
  },
  {
    id: "m-003", handle: "SIGNAL-DESK", handleType: "analyst",
    timestamp: "2026-03-17T19:15:00Z",
    content: "F-017 Allied Media Network Watch — confirmed the funding link back to F-003's offshore intermediary chain. The editorial coordination pattern is consistent across six EU jurisdictions. This is not coincidental alignment.",
    priority: "HIGH",
  },
  {
    id: "m-004", handle: "AXION-SYS", handleType: "system", system: "AXION",
    timestamp: "2026-03-17T19:11:00Z",
    content: "BRIEF ALERT — F-017 and F-003 cross-reference flagged for priority inclusion in next AXION cycle. Confidence rating: HIGH. Source basis: multi-source corroborated. Distribution: Tier-2 Cleared.",
    priority: "HIGH",
  },
  {
    id: "m-005", handle: "ANALYST-03", handleType: "analyst",
    timestamp: "2026-03-17T19:05:00Z",
    content: "Anyone have current status on D-007 Northern Bridge Consortium? F-009 update flagged shared beneficial ownership but I need the ATLAS entity graph to confirm link depth. ATLAS-07 can you pull that?",
  },
  {
    id: "m-006", handle: "ATLAS-07", handleType: "analyst",
    timestamp: "2026-03-17T19:03:00Z",
    content: "D-007 — confirmed four entities, shared registration agent in two jurisdictions. Beneficial ownership resolves to two individuals, one of whom appears in F-001 procurement network as third-tier contractor. Graph updated in ATLAS layer.",
  },
  {
    id: "m-007", handle: "BLACK Dog // RESTRICTED", handleType: "restricted",
    timestamp: "2026-03-17T18:59:00Z",
    content: "[CONTENT RESTRICTED — ACCESS REQUIRES CLEARED AUTHORIZATION]",
    redacted: true,
  },
  {
    id: "m-008", handle: "ORION-WATCH", handleType: "system", system: "ORION",
    timestamp: "2026-03-17T18:55:00Z",
    content: "EASTERN EUROPE POSTURE — now elevated. F-010 influence mapping consistent with increased activity across media and policy advisory channels. Capital exodus signals have increased since previous cycle.",
    priority: "NORMAL",
  },
  {
    id: "m-009", handle: "SIGNAL-DESK", handleType: "analyst",
    timestamp: "2026-03-17T18:47:00Z",
    content: "D-010 Western Advocacy Network update — coordinated legislative outreach documented across three Senate committees and two House oversight bodies. Cross-referencing with F-019 lobbying map now. The pattern is structured, not organic.",
  },
  {
    id: "m-010", handle: "ANALYST-11", handleType: "analyst",
    timestamp: "2026-03-17T18:39:00Z",
    content: "F-014 Information Corridor Watch — two new channels identified this cycle. Both distributing structured framing around energy policy and trade disruption in coordinated timing with Middle East escalation signal cluster. Flagging for AXION inclusion.",
    priority: "HIGH",
  },
  {
    id: "m-011", handle: "AXION-SYS", handleType: "system", system: "AXION",
    timestamp: "2026-03-17T18:31:00Z",
    content: "DAILY BRIEF CYCLE COMPLETE — summary distributed to Tier-2 cleared analysts. Priority items: F-001, F-006, F-017. Elevated items: Middle East posture, Eastern Europe influence activity, D-004 acquisition node.",
    priority: "NORMAL",
  },
  {
    id: "m-012", handle: "ANALYST-03", handleType: "analyst",
    timestamp: "2026-03-17T18:22:00Z",
    content: "F-016 Sovereign Fund Review — ATLAS cross-reference is slow. Beneficial ownership chain on the primary holding structure has three layers. One of the entities uses a jurisdiction with restricted company registry access. Requesting BLACK DOG escalation.",
  },
  {
    id: "m-013", handle: "BLACK Dog // RESTRICTED", handleType: "restricted",
    timestamp: "2026-03-17T18:19:00Z",
    content: "[CONTENT RESTRICTED — ACCESS REQUIRES CLEARED AUTHORIZATION]",
    redacted: true,
  },
  {
    id: "m-014", handle: "ORION-WATCH", handleType: "system", system: "ORION",
    timestamp: "2026-03-17T18:10:00Z",
    content: "WHITE WING coordination — Conflict Lane 3 movement indicators elevated. Not at threshold for escalation alert yet but trending. AXION flagged for monitoring inclusion. See WHITE WING module for current documentation.",
    priority: "NORMAL",
  },
  {
    id: "m-015", handle: "SIGNAL-DESK", handleType: "analyst",
    timestamp: "2026-03-17T17:58:00Z",
    content: "Noting for the record: F-009 Northern Gateway and D-007 Northern Bridge Consortium now have three confirmed linkage points. This is not a coincidence of geography. Recommend elevating F-009 to RESTRICTED classification.",
  },
];

const activeAnalysts = [
  { handle: "ATLAS-07",    status: "ACTIVE",  role: "Entity Analysis" },
  { handle: "SIGNAL-DESK", status: "ACTIVE",  role: "Signal Review" },
  { handle: "ANALYST-03",  status: "ACTIVE",  role: "Case Review" },
  { handle: "ANALYST-11",  status: "ACTIVE",  role: "Content Monitoring" },
  { handle: "ORION-WATCH", status: "SYSTEM",  role: "Automated Feed" },
  { handle: "AXION-SYS",   status: "SYSTEM",  role: "Brief System" },
  { handle: "ANALYST-06",  status: "IDLE",    role: "World Monitor" },
];

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}Z`;
}

function handleStyle(type: Message["handleType"]) {
  if (type === "system")     return "text-emerald-400";
  if (type === "restricted") return "text-red-400";
  return "text-zinc-300";
}

export default function SignalRoom() {
  return (
    <Layout>
      <div className="flex flex-col gap-0 h-full">

        {/* ── PAGE HEADER ───────────────────────────────────────────────── */}
        <section className="border-b border-zinc-900 pb-6 mb-6">
          <div className="font-mono text-[9px] tracking-[0.45em] text-emerald-400 mb-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-emerald-400 animate-pulse" />
            RSR INTELLIGENCE NETWORK
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
              SIGNAL ROOM
            </h1>
            <div className="flex items-center gap-4 font-mono text-[9px] tracking-[0.3em]">
              <span className="flex items-center gap-2 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                CHANNEL ACTIVE
              </span>
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-600">{activeAnalysts.filter(a => a.status === "ACTIVE").length} ANALYSTS ONLINE</span>
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-700">OBSERVATION MODE</span>
            </div>
          </div>
        </section>

        {/* ── MAIN LAYOUT ───────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-4 gap-6 items-start">

          {/* Message stream — takes up 3/4 */}
          <div className="lg:col-span-3 flex flex-col gap-0">

            {/* Active topic bar */}
            <div className="border border-zinc-900 bg-zinc-950 px-5 py-3 mb-4 flex flex-wrap items-center gap-4 font-mono text-[9px] tracking-[0.3em]">
              <span className="text-zinc-700">ACTIVE TOPIC:</span>
              <span className="text-zinc-400">MIDDLE EAST ESCALATION // F-017 MEDIA NETWORK // D-004 CAPITAL FLOWS</span>
              <span className="ml-auto text-zinc-700">{messages.length} ENTRIES IN CURRENT CYCLE</span>
            </div>

            {/* Messages */}
            <div className="space-y-0 border border-zinc-900">
              {messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`px-5 py-4 ${i < messages.length - 1 ? "border-b border-zinc-900" : ""} ${
                    msg.handleType === "system" ? "bg-zinc-950/60" :
                    msg.redacted ? "bg-red-950/10" : "bg-black"
                  } hover:bg-zinc-950/80 transition-colors`}
                >
                  <div className="flex items-start gap-4">

                    {/* Priority dot */}
                    <div className="mt-1 shrink-0">
                      {msg.priority === "HIGH" ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400/80 animate-pulse block" />
                      ) : msg.handleType === "system" ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 block" />
                      ) : msg.redacted ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-800 block" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 block" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Handle row */}
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`font-mono text-[10px] tracking-[0.2em] font-medium ${handleStyle(msg.handleType)}`}>
                          {msg.handle}
                        </span>
                        {msg.system && (
                          <span className="font-mono text-[8px] tracking-widest text-zinc-700 border border-zinc-900 px-1.5 py-0.5">
                            {msg.system}
                          </span>
                        )}
                        {msg.priority === "HIGH" && !msg.redacted && (
                          <span className="font-mono text-[8px] tracking-widest text-red-400/70 border border-red-900/30 px-1.5 py-0.5">
                            PRIORITY
                          </span>
                        )}
                        <span className="font-mono text-[9px] tracking-widest text-zinc-700 ml-auto">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>

                      {/* Content */}
                      {msg.redacted ? (
                        <p className="text-sm text-red-900/80 font-mono tracking-[0.1em] leading-relaxed">
                          {msg.content}
                        </p>
                      ) : (
                        <p className="text-sm text-zinc-400 leading-relaxed">
                          {msg.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Observation mode footer */}
            <div className="border border-zinc-900 border-t-0 bg-zinc-950 px-5 py-3 flex items-center gap-4">
              <div className="flex-1 font-mono text-[9px] tracking-[0.3em] text-zinc-700">
                OBSERVATION MODE — INPUT RESTRICTED TO CLEARED ANALYSTS
              </div>
              <span className="font-mono text-[9px] tracking-widest text-zinc-800">
                REQUEST ACCESS TO PARTICIPATE →
              </span>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 sticky top-6">

            {/* Channel info */}
            <div className="border border-zinc-900 p-5">
              <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-600 mb-4">CHANNEL INFO</div>
              <div className="space-y-3 font-mono text-[10px] tracking-widest">
                <div>
                  <div className="text-zinc-700 mb-1">DESIGNATION</div>
                  <div className="text-zinc-400">SIGNAL ROOM // ALPHA</div>
                </div>
                <div>
                  <div className="text-zinc-700 mb-1">ACCESS TIER</div>
                  <div className="text-zinc-400">MONITORED / PUBLIC OBSERVATION</div>
                </div>
                <div>
                  <div className="text-zinc-700 mb-1">CYCLE</div>
                  <div className="text-zinc-400">CONTINUOUS</div>
                </div>
                <div>
                  <div className="text-zinc-700 mb-1">RETENTION</div>
                  <div className="text-zinc-400">72H ROLLING ARCHIVE</div>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-zinc-900 text-[11px] text-zinc-600 leading-relaxed">
                This channel is monitored. Analysis discussions reference active RSR case files
                and ATLAS entity records. Restricted content is redacted for public observation.
              </div>
            </div>

            {/* Active analysts */}
            <div className="border border-zinc-900 p-5">
              <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-600 mb-4">ACTIVE ANALYSTS</div>
              <div className="space-y-2">
                {activeAnalysts.map(a => (
                  <div key={a.handle} className="flex items-center justify-between font-mono text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        a.status === "ACTIVE" ? "bg-emerald-500" :
                        a.status === "SYSTEM" ? "bg-emerald-400/40 animate-pulse" :
                        "bg-zinc-700"
                      }`} />
                      <span className={`tracking-[0.15em] ${
                        a.status === "ACTIVE" ? "text-zinc-400" :
                        a.status === "SYSTEM" ? "text-emerald-600" :
                        "text-zinc-700"
                      }`}>{a.handle}</span>
                    </div>
                    <span className="text-zinc-700 tracking-widest text-[8px]">{a.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked resources */}
            <div className="border border-zinc-900 p-5">
              <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-600 mb-4">REFERENCED IN THIS CYCLE</div>
              <div className="space-y-1.5">
                {["F-001", "F-003", "F-006", "F-009", "F-010", "F-014", "F-016", "F-017", "F-019"].map(ref => (
                  <Link
                    key={ref}
                    href={`/files/${ref}`}
                    className="flex items-center gap-2 group"
                  >
                    <span className="font-mono text-[9px] tracking-widest text-zinc-700 group-hover:text-emerald-500 transition-colors">{ref}</span>
                    <span className="font-mono text-[8px] tracking-widest text-zinc-800 group-hover:text-zinc-600 transition-colors">→ FILE</span>
                  </Link>
                ))}
                {["D-004", "D-007", "D-010"].map(ref => (
                  <Link
                    key={ref}
                    href={`/dossiers/${ref}`}
                    className="flex items-center gap-2 group"
                  >
                    <span className="font-mono text-[9px] tracking-widest text-zinc-700 group-hover:text-emerald-500 transition-colors">{ref}</span>
                    <span className="font-mono text-[8px] tracking-widest text-zinc-800 group-hover:text-zinc-600 transition-colors">→ DOSSIER</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Cross-navigation */}
            <div className="border border-zinc-900 p-5">
              <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-600 mb-4">INNER LAYER</div>
              <div className="space-y-2">
                <Link
                  href="/investigation-room"
                  className="flex items-center justify-between group"
                >
                  <span className="font-mono text-[10px] tracking-widest text-zinc-600 group-hover:text-zinc-300 transition-colors">INVESTIGATION ROOM</span>
                  <span className="font-mono text-[8px] text-zinc-800 group-hover:text-emerald-600 transition-colors">→</span>
                </Link>
                <Link
                  href="/dossiers"
                  className="flex items-center justify-between group"
                >
                  <span className="font-mono text-[10px] tracking-widest text-zinc-600 group-hover:text-zinc-300 transition-colors">ENTITY DOSSIERS</span>
                  <span className="font-mono text-[8px] text-zinc-800 group-hover:text-emerald-600 transition-colors">→</span>
                </Link>
                <Link
                  href="/world"
                  className="flex items-center justify-between group"
                >
                  <span className="font-mono text-[10px] tracking-widest text-zinc-600 group-hover:text-zinc-300 transition-colors">WORLD MONITOR</span>
                  <span className="font-mono text-[8px] text-zinc-800 group-hover:text-emerald-600 transition-colors">→</span>
                </Link>
              </div>
            </div>

            {/* SAGE Terminal teaser */}
            <div className="border border-zinc-900 bg-zinc-950/30 p-5">
              <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-1 bg-zinc-800" />
                SAGE TERMINAL
              </div>
              <div className="font-mono text-[9px] tracking-widest text-zinc-800 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 animate-pulse" />
                COMING ONLINE...
              </div>
              <div className="border border-zinc-900 bg-black px-3 py-2.5">
                <span className="font-mono text-[9px] tracking-widest text-zinc-800 italic">
                  Query interface initializing. SAGE will provide rapid brief synthesis, fact verification, and signal summarization.
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
}
