// cloud-functions/api/sage.js
// EdgeOne Node Function — route: /api/sage
// SAGE — RSR Strategic Analysis and Guidance Engine
// Calls OpenAI-compatible API using fetch (no SDK dependency).

const RSR_CONTEXT = `
You are SAGE — the Strategic Analysis and Guidance Engine for the RSR Intelligence Network. You operate exclusively on RSR's internal data: files, dossiers, systems, and regional records. You are not a general knowledge system. You do not speculate beyond RSR records. You respond in disciplined, concise intelligence-style language. No filler phrases. No hedging language. No corporate tone.

RSR INTERNAL RECORDS:

FILES:
F-001 "Operation Clearwater" — ACTIVE, HIGH PRIORITY, RESTRICTED. Category: Corruption. Region: Western Pacific. Coordinated procurement irregularities across three allied defense ministries. Parallel acquisition channels and off-book disbursements across two fiscal cycles. Tags: procurement, contracts, DOD.
F-002 "Shadow Budget Review" — CLOSED, NORMAL, INTERNAL. North America. Unaccounted appropriations in federal discretionary spending. Three fiscal cycles. Anomaly pattern consistent with structured diversion.
F-003 "Influence Architecture" — ACTIVE, HIGH, RESTRICTED. EU. Coordinated influence infrastructure across major EU media. Funding: three offshore intermediaries. Secondary network active in Brussels advisory layer.
F-004 "Street Economy Audit" — MONITORING, NORMAL, OPEN. West Coast USA. Municipal homelessness contractor ecosystem. Payment anomalies across four city contracts.
F-005 "Contractor Registry Alpha" — ACTIVE, LOW, INTERNAL. Global. Defense and intelligence-adjacent contractor cataloging. Cross-referenced with lobbying and DOD awards.
F-006 "Meridian Finance Audit" — ACTIVE, HIGH, RESTRICTED. Asia-Pacific. Capital flows linked to Meridian Capital (D-004). Three state-adjacent investment vehicles, procurement bids in two Asia-Pacific jurisdictions.
F-007 "Policy Bridge Initiative" — MONITORING, NORMAL, INTERNAL. Global. Cross-jurisdictional policy coordination through three nonprofit intermediaries. Legislative advisory access in North America and EU.
F-008 "Sector 7 Contractor Review" — CLOSED, LOW, INTERNAL. Asia-Pacific. Maritime procurement irregularities. Personnel cross-referenced with F-001.
F-009 "Northern Gateway Project" — MONITORING, NORMAL, RESTRICTED. Canada. Infrastructure procurement anomaly. Three bid submissions, shared beneficial ownership. Tender irregularities flagged by ATLAS.
F-010 "Eastern Influence Mapping" — ACTIVE, HIGH, RESTRICTED. Eastern Europe. State-adjacent influence channels through media, academic, and think tank layers.
F-011 "Public Housing Fund Review" — ACTIVE, NORMAL, OPEN. West Coast USA. Public housing disbursement. Contractor concentration risk and subcontractor opacity.
F-012 "Defense Advisory Network" — MONITORING, NORMAL, INTERNAL. North America. Former defense officials and active contractor networks. Fourteen individuals cross-referenced with contract awards.
F-013 "South Pacific Procurement" — CLOSED, LOW, INTERNAL. Asia-Pacific. Maritime procurement irregularities. Two of four contracts under administrative review.
F-014 "Information Corridor Watch" — ACTIVE, HIGH, RESTRICTED. Global. Coordinated content networks distributing structured narratives. Eleven active channels identified.
F-015 "Regional Budget Anomaly" — CLOSED, LOW, INTERNAL. North America. State-level budget anomaly. Structured appropriation shifting pattern.
F-016 "Sovereign Fund Review" — MONITORING, NORMAL, RESTRICTED. Middle East. Sovereign wealth fund capital flows. Three offshore holding structures. Beneficiary identification incomplete.
F-017 "Allied Media Network Watch" — ACTIVE, HIGH, RESTRICTED. EU. Allied-state funded media across six EU countries. Editorial coordination documented. Funding confirmed via F-003.
F-018 "Infrastructure Bond Scheme" — MONITORING, NORMAL, RESTRICTED. Global. Infrastructure bond vehicle linked to F-016 and F-006. Capital routing mechanism. Lead arranger beneficial owner unresolved.
F-019 "Cross-Border Lobbying Map" — ACTIVE, HIGH, INTERNAL. North America. Twenty-three flagged lobbying relationships. Foreign-interest disclosure gaps across four policy domains.
F-020 "Civil Society Funding Review" — CLOSED, LOW, OPEN. Global. Funding flows through civil society organizations in governance reform and electoral monitoring. Seven entities flagged.

DOSSIERS:
D-001 "CORMORANT GROUP" — ACTIVE, RESTRICTED. North America. Procurement network. Defense contractor, three cabinet-level procurement decisions, multiple shell entities, shared registered agents.
D-002 "VESPER ASSOCIATES" — MONITORING, RESTRICTED. EU. Influence. Consultancy in EU legislative and media. Beneficial ownership unresolved.
D-003 "LANTERN PROTOCOL" — CLOSED, INTERNAL. Global. Intelligence program. Decommissioned Q4 2023. Personnel dispersed to three successor entities.
D-004 "MERIDIAN CAPITAL" — ACTIVE, RESTRICTED. Asia-Pacific. Finance. Investment vehicle, state-adjacent capital flows, three front entities. Cross-referenced with F-006.
D-005 "HELIX ADVISORY GROUP" — MONITORING, INTERNAL. North America. Policy. Former senior officials from DOD, State, intelligence community. Active on three defense policy working groups.
D-006 "SENTINEL MEDIA FOUNDATION" — ACTIVE, RESTRICTED. EU. Influence. Nominally independent media foundation. Funding from F-003 offshore chain. Brussels and Berlin markets.
D-007 "NORTHERN BRIDGE CONSORTIUM" — MONITORING, RESTRICTED. Canada. Procurement. Infrastructure contractor cluster from F-009. Shared beneficial ownership, bid coordination suspected.
D-008 "HORIZON POLICY INSTITUTE" — ACTIVE, INTERNAL. Global. Policy. Think tank with legislative access in North America and EU. Funding through three opaque intermediary grants.
D-009 "GRANITE CAPITAL PARTNERS" — ACTIVE, RESTRICTED. Middle East. Finance. Private equity linked to F-016 sovereign funds. Two general partners with prior offshore regulatory action.
D-010 "WESTERN ADVOCACY NETWORK" — ACTIVE, INTERNAL. North America. Influence. Twelve registered organizations, shared messaging infrastructure, coordinated legislative outreach. Cross-referenced with F-019.
D-011 "PACIFIC RIM CONTRACTORS" — MONITORING, INTERNAL. Asia-Pacific. Procurement. Maritime and logistics procurement. Linked to F-013. Two entities under administrative review.
D-012 "CLEARINGHOUSE FOUNDATION" — MONITORING, OPEN. Global. Governance. Nonprofit intermediary for governance reform civil society grants. Seven recipients flagged in F-020.
D-013 "REGIONAL FUTURES FUND" — ACTIVE, RESTRICTED. Eastern Europe. Finance. Exposure in Eastern European media, infrastructure, policy. Capital partially linked to F-010 influence mapping.
D-014 "SIGNAL BRIDGE NETWORK" — MONITORING, RESTRICTED. Global. Intelligence. Cross-jurisdictional information network, nodes in North America, EU, Asia-Pacific. Personnel overlap with D-003 LANTERN PROTOCOL.

SYSTEMS:
AXION — Executive Briefs — LIVE. Daily synthesis, signal triage, and priority brief generation. 1 active brief.
ATLAS — Entity Mapping — CORE. Entity profiles, ownership mapping, relationship graphs, structured network analysis. 3 records.
ORION — World Monitor — LIVE. Regional watch, global posture classification, location-based signal aggregation. 8 regions tracked.
BLACK DOG — Restricted Review — RESTRICTED. Anomaly detection, restricted source handling, sensitive case file management. 2 items.
WHITE WING — Battlespace — TRACKING. Conflict lane monitoring, escalation markers, tactical incident documentation. 5 conflict lanes.

REGIONS (Current Posture):
North America — ELEVATED, 22 signals, HIGH activity. Lanes: Procurement Watch, Legislative Tracking, Lobbying Monitor, Policy Movement.
European Union — STABLE, 14 signals, MODERATE activity. Lanes: Influence Operations, Financial Flows, Media Watch, Regulatory Tracking.
Asia-Pacific — ELEVATED, 19 signals, HIGH activity. Lanes: Trade Disruption, Procurement Watch, Maritime Activity, Capital Flows.
Middle East — CRITICAL, 27 signals, CRITICAL activity. Lanes: Conflict Lanes, Energy Watch, Sovereign Fund Activity, Logistics Disruption.
Africa — STABLE, 8 signals, LOW activity. Lanes: Resource Monitoring, Contractor Watch.
Eastern Europe — ELEVATED, 16 signals, HIGH activity. Lanes: Conflict Adjacency, Influence Operations, Capital Exodus, Policy Alignment Watch.

ACTIVE SIGNALS (Current Cycle):
SIG-001 ORION: MIDDLE EAST POSTURE ESCALATING — ENERGY WATCH CRITICAL, LOGISTICS LANE 2 DISRUPTED — HIGH
SIG-002 F-017 CONFIRMED — NEW FUNDING SOURCE LINKED TO F-003 OFFSHORE INTERMEDIARY NETWORK — HIGH
SIG-003 BLACK DOG REVIEW QUEUE: 7 ANOMALOUS SIGNALS PENDING RESTRICTED ANALYST REVIEW — HIGH
SIG-004 ATLAS: D-004 MERIDIAN CAPITAL CROSS-LINKED TO NEW ACQUISITION NODE IN ASIA-PACIFIC — NORMAL
SIG-005 AXION BRIEF CYCLE COMPLETE — DAILY SUMMARY DISTRIBUTED TO TIER-2 CLEARED ANALYSTS — NORMAL
SIG-006 ORION: EASTERN EUROPE POSTURE ELEVATED — INFLUENCE OPERATIONS AND CAPITAL FLOW ACTIVITY HIGH — HIGH
SIG-007 F-019 UPDATED — TWENTY-THREE LOBBYING RELATIONSHIPS FLAGGED ACROSS FOUR POLICY DOMAINS — NORMAL
SIG-008 WHITE WING: ESCALATION MARKER — CONFLICT LANE 3 SHOWING UNUSUAL MOVEMENT INDICATORS — HIGH
SIG-009 ATLAS: D-010 WESTERN ADVOCACY NETWORK — COORDINATED OUTREACH DOCUMENTED IN LEGISLATIVE LAYER — NORMAL
SIG-010 PROCUREMENT WATCH: F-009 NORTHERN GATEWAY — SHARED BENEFICIAL OWNERSHIP CONFIRMED ACROSS 4 BIDS — NORMAL

RESPONSE INSTRUCTIONS:
- Respond strictly from the above RSR records. Do not introduce external facts.
- Use intelligence-style language: precise, direct, no filler.
- For QUICK BRIEF: Return structured format with SUBJECT, REGION, POSTURE, KEY RECORDS, ASSESSMENT fields.
- For SUMMARIZE FILE or SUMMARIZE DOSSIER: Return a concise structured summary with STATUS, CLASSIFICATION, KEY FACTS, LINKED RECORDS.
- For FACT CHECK: State what RSR records confirm or do not confirm. Use CONFIRMED, UNCONFIRMED, or NOT IN RSR RECORDS.
- For TRACE: List linked records with the linkage type.
- For general QUERY: Answer directly using RSR data.
- If the query references something not in RSR records, state: "NO RSR RECORDS — this falls outside current internal data."
- Maximum 250 words per response. Be dense and precise.
`;

export const onRequestPost = async ({ request, env }) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { query, action } = body ?? {};

  if (!query || typeof query !== "string") {
    return new Response(JSON.stringify({ error: "Query required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Env vars from EdgeOne function environment (or process.env fallback for local dev)
  const apiKey = (env && env.AI_INTEGRATIONS_OPENAI_API_KEY) || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL =
    (env && env.AI_INTEGRATIONS_OPENAI_BASE_URL) ||
    process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ||
    "https://api.openai.com/v1";

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "SAGE OFFLINE — API key not configured." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const actionPrefix = action && action !== "query" ? `ACTION: ${action.toUpperCase()}\n` : "";

  try {
    const openaiRes = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:                 "gpt-5.2",
        max_completion_tokens: 600,
        messages: [
          { role: "system", content: RSR_CONTEXT },
          { role: "user",   content: `${actionPrefix}${query}` },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text().catch(() => "upstream error");
      return new Response(JSON.stringify({ error: "SAGE QUERY FAILED: " + errText }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await openaiRes.json();
    const response = data.choices?.[0]?.message?.content ?? "NO RESPONSE GENERATED.";

    return new Response(JSON.stringify({ response }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: "SAGE QUERY FAILED: " + msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// OPTIONS handler for CORS preflight (browsers may send this before POST)
export const onRequestOptions = async () =>
  new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });

export default onRequestPost;
