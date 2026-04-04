// ─── Types ────────────────────────────────────────────────────────────────────

export type SystemStatus  = "LIVE" | "CORE" | "RESTRICTED" | "TRACKING" | "PRIMARY";
export type FileStatus    = "ACTIVE" | "MONITORING" | "CLOSED";
export type DossierStatus = "ACTIVE" | "MONITORING" | "CLOSED";
export type RegionPosture = "STABLE" | "ELEVATED" | "CRITICAL";
export type ActivityLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
export type RegionStatus  = "MONITORING" | "ACTIVE" | "ESCALATING";
export type Priority      = "HIGH" | "NORMAL" | "LOW";
export type EntityType    = "Entity" | "Program" | "Network" | "Individual";

export interface System {
  name: string;
  role: string;
  status: SystemStatus;
  items: number;
  description: string;
}

export interface FileRecord {
  id: string;
  title: string;
  category: string;
  status: FileStatus;
  updated: string;
  region: string;
  tags: string[];
  summary: string;
  priority: Priority;
  classification: string;
}

export interface DossierRecord {
  id: string;
  name: string;
  type: EntityType;
  status: DossierStatus;
  region: string;
  network: string;
  notes: string;
  classification: string;
}

export interface Region {
  region: string;
  posture: RegionPosture;
  signals: number;
  activity: ActivityLevel;
  status: RegionStatus;
  lanes: string[];
  lastUpdated: string;
}

export interface FeedItem {
  id: string;
  text: string;
  timestamp: string;
  system: string;
  priority: Priority;
}

// ─── Systems ──────────────────────────────────────────────────────────────────

export const systems: System[] = [
  { name: "SENTRIX",    role: "Intelligence Analysis System", status: "PRIMARY",    items: 4,  description: "Structured intelligence environment for input analysis, verification, and reasoning. Classifies, breaks down, and evaluates raw information through multi-mode analysis systems, transforming claims, articles, and narratives into decision-ready intelligence." },
  { name: "SAGE",       role: "Analysis Engine",              status: "PRIMARY",    items: 6,  description: "Structured reasoning, verification, and analytic assessment engine. Classifies input, evaluates claims, breaks down assumptions, and produces structured intelligence outputs designed for clarity, accuracy, and decision usefulness." },
  { name: "AXION",      role: "Executive Briefs",             status: "LIVE",       items: 1,  description: "Daily synthesis, signal triage, and priority brief generation for decision-ready intelligence." },
  { name: "ATLAS",      role: "Entity Mapping",               status: "CORE",       items: 3,  description: "Entity profiles, ownership mapping, relationship graphs, and structured network analysis." },
  { name: "BLACK DOG",  role: "Restricted Review",            status: "RESTRICTED", items: 2,  description: "Anomaly detection, restricted source handling, and sensitive case file management." },
  { name: "ORION",      role: "World Monitor",                status: "LIVE",       items: 8,  description: "Regional watch, global posture classification, and location-based signal aggregation." },
  { name: "WHITE WING",          role: "Battlespace",                  status: "TRACKING",   items: 5,  description: "Conflict lane monitoring, escalation markers, and tactical incident documentation." },
  { name: "RSR CONTRACT TRACKER", role: "Contract Intelligence",        status: "TRACKING",   items: 12, description: "Defense and government contract monitoring. Tracks active awards, flags procurement irregularities, cross-references entities against award databases, and surfaces contractor concentration risk." },
  { name: "WARSTATE",             role: "Conflict Risk Assessment",     status: "LIVE",       items: 9,  description: "Global conflict risk classification and war-state monitoring. Tracks active hostilities, escalation thresholds, interstate threat postures, and mobilization signals across monitored conflict zones." },
];

// ─── Files ────────────────────────────────────────────────────────────────────

export const files: FileRecord[] = [
  {
    id: "F-001", title: "Operation Clearwater", category: "Corruption",
    status: "ACTIVE", updated: "2026-03-12", region: "Western Pacific",
    tags: ["procurement", "contracts", "DOD"],
    summary: "Coordinated procurement irregularities across three allied defense ministries. Evidence of parallel acquisition channels and off-book disbursements across two fiscal cycles.",
    priority: "HIGH", classification: "RESTRICTED",
  },
  {
    id: "F-002", title: "Shadow Budget Review", category: "Budgets",
    status: "CLOSED", updated: "2026-02-28", region: "North America",
    tags: ["budgets", "governance", "audit"],
    summary: "Analysis of unaccounted appropriations within federal discretionary spending windows. Three fiscal cycles reviewed. Anomaly pattern consistent with structured diversion.",
    priority: "NORMAL", classification: "INTERNAL",
  },
  {
    id: "F-003", title: "Influence Architecture", category: "Influence",
    status: "ACTIVE", updated: "2026-03-15", region: "European Union",
    tags: ["influence", "media", "funding"],
    summary: "Coordinated influence infrastructure mapped across major EU media outlets. Primary funding traced to three offshore intermediaries. Secondary network active in Brussels advisory layer.",
    priority: "HIGH", classification: "RESTRICTED",
  },
  {
    id: "F-004", title: "Street Economy Audit", category: "Governance",
    status: "MONITORING", updated: "2026-03-10", region: "West Coast USA",
    tags: ["homelessness", "contractors", "governance"],
    summary: "Structural analysis of municipal homelessness contractor ecosystem. Service delivery gaps correlated with payment anomalies across four city contracts.",
    priority: "NORMAL", classification: "OPEN",
  },
  {
    id: "F-005", title: "Contractor Registry Alpha", category: "Contractors",
    status: "ACTIVE", updated: "2026-03-14", region: "Global",
    tags: ["contractors", "procurement"],
    summary: "Ongoing cataloging of defense and intelligence-adjacent contractor entities. Cross-referenced with lobbying disclosures and DOD contract awards database.",
    priority: "LOW", classification: "INTERNAL",
  },
  {
    id: "F-006", title: "Meridian Finance Audit", category: "Corruption",
    status: "ACTIVE", updated: "2026-03-16", region: "Asia-Pacific",
    tags: ["finance", "offshore", "procurement"],
    summary: "Capital flow analysis linked to Meridian Capital (D-004). Three state-adjacent investment vehicles identified with connections to active procurement bids in two Asia-Pacific jurisdictions.",
    priority: "HIGH", classification: "RESTRICTED",
  },
  {
    id: "F-007", title: "Policy Bridge Initiative", category: "Policy",
    status: "MONITORING", updated: "2026-03-08", region: "Global",
    tags: ["policy", "NGO", "advisory"],
    summary: "Cross-jurisdictional policy coordination network operating through three nonprofit intermediaries. Linked to legislative advisory access in North America and European Union.",
    priority: "NORMAL", classification: "INTERNAL",
  },
  {
    id: "F-008", title: "Sector 7 Contractor Review", category: "Contractors",
    status: "CLOSED", updated: "2026-02-14", region: "Asia-Pacific",
    tags: ["contractors", "logistics", "DOD"],
    summary: "Closed review of regional contractor cluster operating in Asia-Pacific logistics infrastructure. Key personnel cross-referenced with F-001 procurement network.",
    priority: "LOW", classification: "INTERNAL",
  },
  {
    id: "F-009", title: "Northern Gateway Project", category: "Procurement",
    status: "MONITORING", updated: "2026-03-11", region: "Canada",
    tags: ["procurement", "infrastructure", "contracts"],
    summary: "Infrastructure procurement anomaly involving three bid submissions with shared beneficial ownership. Tender process irregularities flagged by ATLAS entity review.",
    priority: "NORMAL", classification: "RESTRICTED",
  },
  {
    id: "F-010", title: "Eastern Influence Mapping", category: "Influence",
    status: "ACTIVE", updated: "2026-03-17", region: "Eastern Europe",
    tags: ["influence", "media", "state-adjacent"],
    summary: "Active mapping of state-adjacent influence channels operating through media, academic, and think tank layers across Eastern European jurisdictions.",
    priority: "HIGH", classification: "RESTRICTED",
  },
  {
    id: "F-011", title: "Public Housing Fund Review", category: "Governance",
    status: "ACTIVE", updated: "2026-03-13", region: "West Coast USA",
    tags: ["housing", "funds", "governance", "contractors"],
    summary: "Review of public housing fund disbursement patterns across three West Coast municipalities. Contractor concentration risk and subcontractor opacity identified.",
    priority: "NORMAL", classification: "OPEN",
  },
  {
    id: "F-012", title: "Defense Advisory Network", category: "Contractors",
    status: "MONITORING", updated: "2026-03-09", region: "North America",
    tags: ["advisory", "defense", "revolving-door"],
    summary: "Mapping of advisory relationships between former defense officials and active contractor networks. Fourteen individuals cross-referenced with active contract awards.",
    priority: "NORMAL", classification: "INTERNAL",
  },
  {
    id: "F-013", title: "South Pacific Procurement", category: "Procurement",
    status: "CLOSED", updated: "2026-01-31", region: "Asia-Pacific",
    tags: ["procurement", "maritime", "contracts"],
    summary: "Closed investigation into maritime procurement irregularities involving allied nation naval supply contracts. Two of four flagged contracts remain under administrative review.",
    priority: "LOW", classification: "INTERNAL",
  },
  {
    id: "F-014", title: "Information Corridor Watch", category: "Influence",
    status: "ACTIVE", updated: "2026-03-16", region: "Global",
    tags: ["information", "channels", "content-networks"],
    summary: "Active monitoring of coordinated content networks distributing structured narratives across financial, political, and geopolitical domains. Eleven active channels identified.",
    priority: "HIGH", classification: "RESTRICTED",
  },
  {
    id: "F-015", title: "Regional Budget Anomaly", category: "Budgets",
    status: "CLOSED", updated: "2026-02-07", region: "North America",
    tags: ["budgets", "state", "audit"],
    summary: "State-level budget anomaly review covering three fiscal periods. Pattern consistent with structured appropriation shifting between discretionary line items.",
    priority: "LOW", classification: "INTERNAL",
  },
  {
    id: "F-016", title: "Sovereign Fund Review", category: "Corruption",
    status: "MONITORING", updated: "2026-03-05", region: "Middle East",
    tags: ["sovereign-fund", "offshore", "finance"],
    summary: "Review of sovereign wealth fund capital flows linked to three offshore holding structures. Beneficiary identification incomplete. ATLAS cross-reference in progress.",
    priority: "NORMAL", classification: "RESTRICTED",
  },
  {
    id: "F-017", title: "Allied Media Network Watch", category: "Influence",
    status: "ACTIVE", updated: "2026-03-17", region: "European Union",
    tags: ["media", "funding", "allied-states"],
    summary: "Allied-state funded media network operating across six EU member countries. Editorial coordination pattern documented. Funding source confirmed via F-003 cross-reference.",
    priority: "HIGH", classification: "RESTRICTED",
  },
  {
    id: "F-018", title: "Infrastructure Bond Scheme", category: "Procurement",
    status: "MONITORING", updated: "2026-03-06", region: "Global",
    tags: ["bonds", "infrastructure", "offshore"],
    summary: "Structured infrastructure bond instrument linked to development project in three emerging market jurisdictions. Beneficial ownership of lead arranger remains obscured.",
    priority: "NORMAL", classification: "RESTRICTED",
  },
  {
    id: "F-019", title: "Cross-Border Lobbying Map", category: "Policy",
    status: "ACTIVE", updated: "2026-03-14", region: "North America",
    tags: ["lobbying", "policy", "foreign-interest"],
    summary: "Active mapping of cross-border lobbying relationships. Foreign-interest disclosure gaps identified in twenty-three registered lobbying relationships across four policy domains.",
    priority: "HIGH", classification: "INTERNAL",
  },
  {
    id: "F-020", title: "Civil Society Funding Review", category: "Governance",
    status: "CLOSED", updated: "2026-02-21", region: "Global",
    tags: ["NGO", "civil-society", "funding"],
    summary: "Review of funding flows through civil society organizations operating in governance reform and electoral monitoring spaces. Seven entities flagged for further ATLAS review.",
    priority: "LOW", classification: "OPEN",
  },
];

// ─── Dossiers ─────────────────────────────────────────────────────────────────

export const dossiers: DossierRecord[] = [
  {
    id: "D-001", name: "CORMORANT GROUP", type: "Entity",
    status: "ACTIVE", region: "North America", network: "Procurement",
    notes: "Defense contractor network with documented ties to three cabinet-level procurement decisions. Multiple shell entities linked through shared registered agents.",
    classification: "RESTRICTED",
  },
  {
    id: "D-002", name: "VESPER ASSOCIATES", type: "Entity",
    status: "MONITORING", region: "European Union", network: "Influence",
    notes: "Consultancy operating across EU legislative and media environments. Beneficial ownership unresolved across two registered jurisdictions.",
    classification: "RESTRICTED",
  },
  {
    id: "D-003", name: "LANTERN PROTOCOL", type: "Program",
    status: "CLOSED", region: "Global", network: "Intelligence",
    notes: "Classified analytic framework. Decommissioned Q4 2023. Successor program unconfirmed. Personnel dispersed to three successor entities.",
    classification: "INTERNAL",
  },
  {
    id: "D-004", name: "MERIDIAN CAPITAL", type: "Entity",
    status: "ACTIVE", region: "Asia-Pacific", network: "Finance",
    notes: "Investment vehicle with links to state-adjacent capital flows. Three known front entities. Cross-referenced with F-006 procurement review.",
    classification: "RESTRICTED",
  },
  {
    id: "D-005", name: "HELIX ADVISORY GROUP", type: "Entity",
    status: "MONITORING", region: "North America", network: "Policy",
    notes: "Advisory firm with rotating roster of former senior officials across DOD, State, and intelligence community. Active on three defense policy working groups.",
    classification: "INTERNAL",
  },
  {
    id: "D-006", name: "SENTINEL MEDIA FOUNDATION", type: "Entity",
    status: "ACTIVE", region: "European Union", network: "Influence",
    notes: "Nominally independent media foundation with funding traced to two offshore intermediaries linked to F-003 influence network. Active in Brussels and Berlin media markets.",
    classification: "RESTRICTED",
  },
  {
    id: "D-007", name: "NORTHERN BRIDGE CONSORTIUM", type: "Entity",
    status: "MONITORING", region: "Canada", network: "Procurement",
    notes: "Infrastructure contractor cluster identified in F-009 Northern Gateway review. Shared beneficial ownership across four entities. Bid coordination pattern suspected.",
    classification: "RESTRICTED",
  },
  {
    id: "D-008", name: "HORIZON POLICY INSTITUTE", type: "Program",
    status: "ACTIVE", region: "Global", network: "Policy",
    notes: "Think tank with active advisory access to legislative bodies in North America and EU. Funding structure involves three intermediary grant organizations of unclear origin.",
    classification: "INTERNAL",
  },
  {
    id: "D-009", name: "GRANITE CAPITAL PARTNERS", type: "Entity",
    status: "ACTIVE", region: "Middle East", network: "Finance",
    notes: "Private equity vehicle linked to sovereign fund structures reviewed in F-016. Two general partners carry prior regulatory action in offshore jurisdictions.",
    classification: "RESTRICTED",
  },
  {
    id: "D-010", name: "WESTERN ADVOCACY NETWORK", type: "Network",
    status: "ACTIVE", region: "North America", network: "Influence",
    notes: "Distributed advocacy network operating through twelve registered organizations. Shared messaging infrastructure and coordinated legislative outreach documented. Cross-referenced with F-019.",
    classification: "INTERNAL",
  },
  {
    id: "D-011", name: "PACIFIC RIM CONTRACTORS", type: "Entity",
    status: "MONITORING", region: "Asia-Pacific", network: "Procurement",
    notes: "Contractor collective operating across maritime and logistics infrastructure procurement in Asia-Pacific region. Linked to F-013 investigation. Two entities under ongoing administrative review.",
    classification: "INTERNAL",
  },
  {
    id: "D-012", name: "CLEARINGHOUSE FOUNDATION", type: "Entity",
    status: "MONITORING", region: "Global", network: "Governance",
    notes: "Nonprofit intermediary distributing grants to civil society organizations in governance reform sector. Seven recipient organizations flagged in F-020 civil society review.",
    classification: "OPEN",
  },
  {
    id: "D-013", name: "REGIONAL FUTURES FUND", type: "Entity",
    status: "ACTIVE", region: "Eastern Europe", network: "Finance",
    notes: "Investment fund with exposure to Eastern European media, infrastructure, and policy sectors. Capital source partially linked to structures identified in F-010 influence mapping.",
    classification: "RESTRICTED",
  },
  {
    id: "D-014", name: "SIGNAL BRIDGE NETWORK", type: "Network",
    status: "MONITORING", region: "Global", network: "Intelligence",
    notes: "Cross-jurisdictional information network with active nodes in North America, EU, and Asia-Pacific. Operational structure shares personnel with LANTERN PROTOCOL (D-003).",
    classification: "RESTRICTED",
  },
];

// ─── Regions ──────────────────────────────────────────────────────────────────

export const regions: Region[] = [
  {
    region: "North America",
    posture: "ELEVATED", signals: 22, activity: "HIGH", status: "ACTIVE",
    lanes: ["Procurement Watch", "Legislative Tracking", "Lobbying Monitor", "Policy Movement"],
    lastUpdated: "2026-03-17T18:42:00Z",
  },
  {
    region: "European Union",
    posture: "STABLE", signals: 14, activity: "MODERATE", status: "MONITORING",
    lanes: ["Influence Operations", "Financial Flows", "Media Watch", "Regulatory Tracking"],
    lastUpdated: "2026-03-17T17:15:00Z",
  },
  {
    region: "Asia-Pacific",
    posture: "ELEVATED", signals: 19, activity: "HIGH", status: "ACTIVE",
    lanes: ["Trade Disruption", "Procurement Watch", "Maritime Activity", "Capital Flows"],
    lastUpdated: "2026-03-17T19:01:00Z",
  },
  {
    region: "Middle East",
    posture: "CRITICAL", signals: 27, activity: "CRITICAL", status: "ESCALATING",
    lanes: ["Conflict Lanes", "Energy Watch", "Sovereign Fund Activity", "Logistics Disruption"],
    lastUpdated: "2026-03-17T19:22:00Z",
  },
  {
    region: "Africa",
    posture: "STABLE",  signals: 8, activity: "LOW", status: "MONITORING",
    lanes: ["Resource Monitoring", "Contractor Watch"],
    lastUpdated: "2026-03-17T14:00:00Z",
  },
  {
    region: "Eastern Europe",
    posture: "ELEVATED", signals: 16, activity: "HIGH", status: "ACTIVE",
    lanes: ["Conflict Adjacency", "Influence Operations", "Capital Exodus", "Policy Alignment Watch"],
    lastUpdated: "2026-03-17T19:15:00Z",
  },
];

// ─── Feed ─────────────────────────────────────────────────────────────────────

export const feedItems: FeedItem[] = [
  { id: "SIG-001", text: "ORION: MIDDLE EAST POSTURE ESCALATING — ENERGY WATCH CRITICAL, LOGISTICS LANE 2 DISRUPTED",   timestamp: "2026-03-17T19:22:00Z", system: "ORION",     priority: "HIGH" },
  { id: "SIG-002", text: "F-017 CONFIRMED — NEW FUNDING SOURCE LINKED TO F-003 OFFSHORE INTERMEDIARY NETWORK",            timestamp: "2026-03-17T19:11:00Z", system: "ATLAS",     priority: "HIGH" },
  { id: "SIG-003", text: "BLACK DOG REVIEW QUEUE: 7 ANOMALOUS SIGNALS PENDING RESTRICTED ANALYST REVIEW",                timestamp: "2026-03-17T18:55:00Z", system: "BLACK DOG", priority: "HIGH" },
  { id: "SIG-004", text: "ATLAS: D-004 MERIDIAN CAPITAL CROSS-LINKED TO NEW ACQUISITION NODE IN ASIA-PACIFIC",           timestamp: "2026-03-17T18:44:00Z", system: "ATLAS",     priority: "NORMAL" },
  { id: "SIG-005", text: "AXION BRIEF CYCLE COMPLETE — DAILY SUMMARY DISTRIBUTED TO TIER-2 CLEARED ANALYSTS",            timestamp: "2026-03-17T18:31:00Z", system: "AXION",     priority: "NORMAL" },
  { id: "SIG-006", text: "ORION: EASTERN EUROPE POSTURE ELEVATED — INFLUENCE OPERATIONS AND CAPITAL FLOW ACTIVITY HIGH",  timestamp: "2026-03-17T18:10:00Z", system: "ORION",     priority: "HIGH" },
  { id: "SIG-007", text: "F-019 UPDATED — TWENTY-THREE LOBBYING RELATIONSHIPS FLAGGED ACROSS FOUR POLICY DOMAINS",       timestamp: "2026-03-17T17:52:00Z", system: "AXION",     priority: "NORMAL" },
  { id: "SIG-008", text: "WHITE WING: ESCALATION MARKER DETECTED — CONFLICT LANE 3 SHOWING UNUSUAL MOVEMENT INDICATORS", timestamp: "2026-03-17T17:44:00Z", system: "WHITE WING",priority: "HIGH" },
  { id: "SIG-009", text: "ATLAS: D-010 WESTERN ADVOCACY NETWORK — COORDINATED OUTREACH DOCUMENTED IN LEGISLATIVE LAYER", timestamp: "2026-03-17T17:30:00Z", system: "ATLAS",     priority: "NORMAL" },
  { id: "SIG-010", text: "PROCUREMENT WATCH: F-009 NORTHERN GATEWAY — SHARED BENEFICIAL OWNERSHIP CONFIRMED ACROSS 4 BIDS",timestamp: "2026-03-17T17:10:00Z", system: "ORION",    priority: "NORMAL" },
  { id: "SIG-011", text: "ORION: ASIA-PACIFIC TRADE DISRUPTION DEVELOPING — SIGNAL LOAD ELEVATED ACROSS 3 LANES",        timestamp: "2026-03-17T16:55:00Z", system: "ORION",     priority: "NORMAL" },
  { id: "SIG-012", text: "AXION: HIGH-PRIORITY ITEMS QUEUED — F-001 F-006 F-017 FLAGGED FOR NEXT BRIEF CYCLE",           timestamp: "2026-03-17T16:40:00Z", system: "AXION",     priority: "HIGH" },
];
