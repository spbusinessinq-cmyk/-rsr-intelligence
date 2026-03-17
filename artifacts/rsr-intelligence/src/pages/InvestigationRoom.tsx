import Layout from "@/components/Layout";
import { Link } from "wouter";

interface CaseThread {
  id: string;
  handle: string;
  role: string;
  timestamp: string;
  fileRef?: string;
  dossierRef?: string;
  subject: string;
  content: string;
  stage: "NEW" | "REVIEW" | "BUILDING" | "MONITORING" | "READY";
}

const threads: CaseThread[] = [
  {
    id: "CT-001", handle: "LEAD-ANALYST", role: "Case Lead",
    timestamp: "2026-03-17T16:00:00Z",
    fileRef: "F-001", subject: "CLEARWATER — Procurement chain tier update",
    content: "Clearwater procurement chain now confirmed at five layers. Cormorant Group (D-001) is operating at tier-2, not tier-1 as previously logged. The tier-1 entity appears to be an unregistered holding structure sharing a registered agent with three entries in F-005 contractor registry. This changes the risk attribution model significantly — Cormorant is the execution layer, not the directing principal. Recommend BLACK DOG escalation for the tier-1 entity identification.",
    stage: "BUILDING",
  },
  {
    id: "CT-002", handle: "CASE-BUILD-01", role: "Entity Analyst",
    timestamp: "2026-03-17T15:30:00Z",
    dossierRef: "D-004", subject: "MERIDIAN — Asia-Pacific acquisition node breakdown",
    content: "Meridian Capital (D-004) capital structure update: the three Asia-Pacific acquisition nodes cross-reference against two separate procurement bids documented in F-006 finance audit. One of the bidding entities shares a Singapore registered address with a known Meridian subsidiary. The shared address alone is not conclusive, but combined with the management company overlap, this is a strong structural linkage. ATLAS graph updated. Recommend F-006 priority elevation.",
    stage: "REVIEW",
  },
  {
    id: "CT-003", handle: "RESEARCH-01", role: "Financial Analyst",
    timestamp: "2026-03-17T14:45:00Z",
    fileRef: "F-003", subject: "F-003 / F-017 banking linkage — confirmed",
    content: "Confirmed link between F-003 offshore intermediary chain and F-017 Allied Media funding source. The payment routing shows a shared correspondent banking relationship through a Maltese institution. This is not a coincidental connection — the timing of fund transfers correlates with major editorial output windows in the F-017 media network. This is now a two-file cross-reference that needs elevation to the next AXION priority brief. Signal-Desk has been notified.",
    stage: "BUILDING",
  },
  {
    id: "CT-004", handle: "CASE-BUILD-02", role: "Entity Analyst",
    timestamp: "2026-03-17T14:00:00Z",
    fileRef: "F-009", dossierRef: "D-007",
    subject: "NORTHERN GATEWAY — beneficial ownership complete",
    content: "F-009 Northern Gateway beneficial ownership trace is complete. D-007 Northern Bridge Consortium — four entities, two jurisdictions. Beneficial ownership resolves to two individuals, one of whom appears in F-001 procurement network as a third-tier contractor through a separate shell entity. The document authorship metadata match across four bid submissions is the strongest available evidence of pre-bid coordination. Formally recommending F-009 classification upgrade to RESTRICTED and flagging for inclusion in next legal review cycle.",
    stage: "READY",
  },
  {
    id: "CT-005", handle: "LEAD-ANALYST", role: "Case Lead",
    timestamp: "2026-03-17T13:15:00Z",
    fileRef: "F-019", dossierRef: "D-010",
    subject: "LOBBYING MAP — Western Advocacy Network structure confirmed",
    content: "F-019 Cross-Border Lobbying Map update: twenty-three flagged relationships reviewed. Eight involve entities appearing in D-010 Western Advocacy Network as affiliated organizations. This is not a statistical coincidence at this sample size — the network is using lobbying registration as a regularization mechanism for foreign-interest client access. The key finding is that the actual policy influence is delivered through separate, non-disclosed advisory channels after the lobbying relationship establishes formal access. Continuing to map the advisory channel layer.",
    stage: "BUILDING",
  },
  {
    id: "CT-006", handle: "RESEARCH-02", role: "Regional Analyst",
    timestamp: "2026-03-17T12:30:00Z",
    dossierRef: "D-013", subject: "D-013 / F-010 — capital and editorial coordination confirmed",
    content: "Regional Futures Fund (D-013) and F-010 Eastern Europe influence mapping are now confirmed as connected. The fund has equity exposure in three of the media entities documented in F-010. The correlated timing between new D-013 equity commitments and editorial output shifts in those entities over two documented periods is a strong indicator that capital and editorial direction share common ownership or direction. This is now a priority finding for the Eastern Europe posture assessment.",
    stage: "REVIEW",
  },
  {
    id: "CT-007", handle: "CASE-BUILD-01", role: "Entity Analyst",
    timestamp: "2026-03-17T11:00:00Z",
    dossierRef: "D-014", subject: "SIGNAL BRIDGE — infrastructure attribution update",
    content: "Two new channels identified in F-014 Information Corridor Watch cycle both use infrastructure attributable to Signal Bridge Network (D-014). This now gives us four of eleven documented channels with D-014 infrastructure linkage. At this ratio, D-014 is functioning as an operational backbone rather than an incidental host. Recommending D-014 classification upgrade and cross-reference with the LANTERN PROTOCOL (D-003) former personnel list — two D-014 operators match.",
    stage: "MONITORING",
  },
  {
    id: "CT-008", handle: "RESEARCH-01", role: "Financial Analyst",
    timestamp: "2026-03-17T09:30:00Z",
    fileRef: "F-018", subject: "F-018 bond structure — Meridian / Granite convergence",
    content: "F-018 infrastructure bond structure analysis complete. Capital flows through the bond vehicle connect to entities present in both F-016 (Granite Capital) and F-006 (Meridian Capital). The bond is not operating as a standalone investment product — it is functioning as a capital routing mechanism between the two networks. This convergence elevates the combined F-016/F-018/F-006 file cluster to a priority analytic review. The beneficial owner of the bond's lead arranger remains unresolved.",
    stage: "NEW",
  },
];

const activeCases = [
  { ref: "F-001", name: "CLEARWATER",        stage: "BUILDING",   priority: "HIGH" },
  { ref: "F-003", name: "INFLUENCE ARCH",    stage: "REVIEW",     priority: "HIGH" },
  { ref: "F-009", name: "NORTHERN GATEWAY",  stage: "READY",      priority: "NORMAL" },
  { ref: "F-017", name: "ALLIED MEDIA",      stage: "MONITORING", priority: "HIGH" },
  { ref: "F-019", name: "LOBBYING MAP",      stage: "BUILDING",   priority: "NORMAL" },
  { ref: "D-004", name: "MERIDIAN",          stage: "REVIEW",     priority: "HIGH" },
  { ref: "D-013", name: "REGIONAL FUTURES",  stage: "REVIEW",     priority: "NORMAL" },
  { ref: "F-018", name: "BOND STRUCTURE",    stage: "NEW",        priority: "NORMAL" },
];

const stageStyle: Record<string, string> = {
  "NEW":        "text-zinc-400 border-zinc-700",
  "REVIEW":     "text-amber-400 border-amber-500/30",
  "BUILDING":   "text-emerald-400 border-emerald-500/30",
  "MONITORING": "text-blue-400 border-blue-500/30",
  "READY":      "text-emerald-300 border-emerald-400/50 bg-emerald-500/5",
};

const stageCounts = activeCases.reduce<Record<string, number>>((acc, c) => {
  acc[c.stage] = (acc[c.stage] ?? 0) + 1;
  return acc;
}, {});

const analysts = [
  { handle: "LEAD-ANALYST",  role: "Case Lead",         status: "ACTIVE" },
  { handle: "CASE-BUILD-01", role: "Entity Analyst",    status: "ACTIVE" },
  { handle: "CASE-BUILD-02", role: "Entity Analyst",    status: "ACTIVE" },
  { handle: "RESEARCH-01",   role: "Financial Analyst", status: "ACTIVE" },
  { handle: "RESEARCH-02",   role: "Regional Analyst",  status: "IDLE" },
];

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}Z`;
}

export default function InvestigationRoom() {
  const stageOrder = ["NEW", "REVIEW", "BUILDING", "MONITORING", "READY"];

  return (
    <Layout>
      <div className="flex flex-col gap-0">

        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <section className="border-b border-zinc-900 pb-6 mb-6">
          <div className="font-mono text-[9px] tracking-[0.45em] text-zinc-600 mb-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-zinc-700" />
            RSR INTELLIGENCE NETWORK // RESTRICTED
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">
              INVESTIGATION ROOM
            </h1>
            <div className="flex items-center gap-4 font-mono text-[9px] tracking-[0.3em]">
              <span className="flex items-center gap-2 text-zinc-600">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                CASE CYCLE: MARCH 2026
              </span>
              <span className="text-zinc-800">·</span>
              <span className="text-zinc-700">{analysts.filter(a => a.status === "ACTIVE").length} ANALYSTS ACTIVE</span>
              <span className="text-zinc-800">·</span>
              <span className="text-zinc-800">RESTRICTED ACCESS</span>
            </div>
          </div>
        </section>

        {/* ── CASE PROGRESS STRIP ───────────────────────────────────────── */}
        <div className="grid grid-cols-5 border border-zinc-900 bg-zinc-950 mb-6 divide-x divide-zinc-900">
          {stageOrder.map(stage => (
            <div key={stage} className="px-4 py-3 text-center">
              <div className={`font-mono text-[8px] tracking-[0.3em] mb-2 ${stageStyle[stage].split(" ")[0]}`}>
                {stage}
              </div>
              <div className="font-mono text-xl text-white">
                {stageCounts[stage] ?? 0}
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN LAYOUT ───────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-4 gap-6 items-start">

          {/* Thread stream — 3/4 */}
          <div className="lg:col-span-3 space-y-0 border border-zinc-900">

            {/* Thread header */}
            <div className="border-b border-zinc-900 bg-zinc-950 px-5 py-3 flex items-center justify-between font-mono text-[9px] tracking-[0.3em]">
              <span className="text-zinc-600">CASE THREADS — ACTIVE CYCLE</span>
              <span className="text-zinc-700">{threads.length} ENTRIES</span>
            </div>

            {/* Threads */}
            {threads.map((thread, i) => (
              <div
                key={thread.id}
                className={`px-5 py-5 ${i < threads.length - 1 ? "border-b border-zinc-900" : ""} bg-black hover:bg-zinc-950/60 transition-colors`}
              >
                <div className="flex items-start gap-3">

                  {/* Stage indicator */}
                  <div className="shrink-0 mt-0.5">
                    <span className={`font-mono text-[8px] tracking-widest border px-1.5 py-0.5 ${stageStyle[thread.stage]}`}>
                      {thread.stage}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Handle + refs + time */}
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-300 font-medium">
                        {thread.handle}
                      </span>
                      <span className="font-mono text-[9px] tracking-widest text-zinc-700">{thread.role}</span>
                      {thread.fileRef && (
                        <Link
                          href={`/files/${thread.fileRef}`}
                          className="font-mono text-[9px] tracking-widest text-emerald-600 hover:text-emerald-400 transition-colors border border-emerald-900/50 px-1.5 py-0.5"
                        >
                          {thread.fileRef}
                        </Link>
                      )}
                      {thread.dossierRef && (
                        <Link
                          href={`/dossiers/${thread.dossierRef}`}
                          className="font-mono text-[9px] tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors border border-zinc-800 px-1.5 py-0.5"
                        >
                          {thread.dossierRef}
                        </Link>
                      )}
                      <span className="ml-auto font-mono text-[9px] tracking-widest text-zinc-700">
                        {formatTimestamp(thread.timestamp)}
                      </span>
                    </div>

                    {/* Subject */}
                    <div className="font-mono text-[10px] tracking-[0.15em] text-zinc-500 mb-2">
                      {thread.subject}
                    </div>

                    {/* Content */}
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      {thread.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="border-t border-zinc-900 bg-zinc-950 px-5 py-3 flex items-center gap-3">
              <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-700 flex-1">
                CASE ENTRIES RESTRICTED — TEAM ACCESS REQUIRED TO CONTRIBUTE
              </span>
              <Link
                href="/signal-room"
                className="font-mono text-[9px] tracking-[0.2em] text-zinc-700 hover:text-zinc-400 transition-colors"
              >
                SIGNAL ROOM →
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5 sticky top-6">

            {/* Room descriptor */}
            <div className="border border-zinc-900 p-5">
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
            <div className="border border-zinc-900 p-5">
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
                    <span className={`font-mono text-[8px] tracking-widest shrink-0 ${stageStyle[c.stage].split(" ")[0]}`}>
                      {c.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Analyst roster */}
            <div className="border border-zinc-900 p-5">
              <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-4">ANALYST ROSTER</div>
              <div className="space-y-2">
                {analysts.map(a => (
                  <div key={a.handle} className="flex items-center justify-between font-mono text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        a.status === "ACTIVE" ? "bg-zinc-400" : "bg-zinc-800"
                      }`} />
                      <span className={`tracking-[0.1em] ${
                        a.status === "ACTIVE" ? "text-zinc-400" : "text-zinc-700"
                      }`}>{a.handle}</span>
                    </div>
                    <span className="text-zinc-700 tracking-widest text-[8px]">{a.status}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
}
