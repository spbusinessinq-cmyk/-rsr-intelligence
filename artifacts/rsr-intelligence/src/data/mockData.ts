// ─── Types ────────────────────────────────────────────────────────────────────
// Structured for future backend replacement — swap mock arrays for API calls.

export type SystemStatus  = "LIVE" | "CORE" | "RESTRICTED" | "TRACKING";
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
  updated: string;          // ISO date — replace with live timestamp from backend
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
  lastUpdated: string;      // ISO timestamp — replace with live field from backend
}

export interface FeedItem {
  id: string;
  text: string;
  timestamp: string;        // ISO timestamp — replace with live field from backend
  system: string;
  priority: Priority;
}

// ─── Systems ──────────────────────────────────────────────────────────────────

export const systems: System[] = [
  { name: "AXION",      role: "Executive Briefs",  status: "LIVE",       items: 1, description: "Daily synthesis, signal triage, and priority brief generation." },
  { name: "ATLAS",      role: "Entity Mapping",    status: "CORE",       items: 3, description: "Profiles, relationships, dossiers, and structured network mapping." },
  { name: "ORION",      role: "World Monitor",     status: "LIVE",       items: 8, description: "Regional watch, global events, and location-based signal tracking." },
  { name: "BLACK DOG",  role: "Restricted Review", status: "RESTRICTED", items: 2, description: "Anomalies, cyber incidents, and sensitive activity review." },
  { name: "WHITE WING", role: "Battlespace",       status: "TRACKING",   items: 5, description: "Conflict lanes, escalation markers, and tactical incident monitoring." },
];

// ─── Files ────────────────────────────────────────────────────────────────────

export const files: FileRecord[] = [
  {
    id: "F-001", title: "Operation Clearwater", category: "Corruption",
    status: "ACTIVE", updated: "2026-03-12", region: "Western Pacific",
    tags: ["procurement", "contracts", "DOD"],
    summary: "Coordinated procurement irregularities across three allied defense ministries. Evidence of parallel acquisition channels and off-book disbursements.",
    priority: "HIGH", classification: "RESTRICTED",
  },
  {
    id: "F-002", title: "Shadow Budget Review", category: "Budgets",
    status: "CLOSED", updated: "2026-02-28", region: "North America",
    tags: ["budgets", "governance", "audit"],
    summary: "Analysis of unaccounted appropriations within federal discretionary spending windows. Three fiscal cycles reviewed.",
    priority: "NORMAL", classification: "INTERNAL",
  },
  {
    id: "F-003", title: "Influence Architecture", category: "Influence",
    status: "ACTIVE", updated: "2026-03-15", region: "European Union",
    tags: ["influence", "media", "funding"],
    summary: "Mapping of coordinated influence infrastructure across major EU media outlets. Funding traced to three offshore intermediaries.",
    priority: "HIGH", classification: "RESTRICTED",
  },
  {
    id: "F-004", title: "Street Economy Audit", category: "Homelessness",
    status: "MONITORING", updated: "2026-03-10", region: "West Coast USA",
    tags: ["homelessness", "contractors", "governance"],
    summary: "Structural analysis of municipal homelessness contractor ecosystem. Service delivery gaps correlated with payment anomalies.",
    priority: "NORMAL", classification: "OPEN",
  },
  {
    id: "F-005", title: "Contractor Registry Alpha", category: "Contractors",
    status: "ACTIVE", updated: "2026-03-14", region: "Global",
    tags: ["contractors", "procurement"],
    summary: "Ongoing cataloging of defense and intelligence-adjacent contractor entities. Cross-referenced with lobbying disclosures.",
    priority: "LOW", classification: "INTERNAL",
  },
];

// ─── Dossiers ─────────────────────────────────────────────────────────────────

export const dossiers: DossierRecord[] = [
  {
    id: "D-001", name: "CORMORANT GROUP", type: "Entity",
    status: "ACTIVE", region: "North America", network: "Procurement",
    notes: "Defense contractor network with documented ties to three cabinet-level procurement decisions.",
    classification: "RESTRICTED",
  },
  {
    id: "D-002", name: "VESPER ASSOCIATES", type: "Entity",
    status: "MONITORING", region: "European Union", network: "Influence",
    notes: "Consultancy operating across EU legislative and media environments. Beneficial ownership unresolved.",
    classification: "RESTRICTED",
  },
  {
    id: "D-003", name: "LANTERN PROTOCOL", type: "Program",
    status: "CLOSED", region: "Global", network: "Intelligence",
    notes: "Classified analytic framework. Decommissioned Q4 2023. Successor program unconfirmed.",
    classification: "INTERNAL",
  },
  {
    id: "D-004", name: "MERIDIAN CAPITAL", type: "Entity",
    status: "ACTIVE", region: "Asia-Pacific", network: "Finance",
    notes: "Investment vehicle with links to state-adjacent capital flows. Three known front entities.",
    classification: "RESTRICTED",
  },
];

// ─── Regions ──────────────────────────────────────────────────────────────────

export const regions: Region[] = [
  { region: "North America", posture: "ELEVATED", signals: 14, activity: "HIGH",     status: "ACTIVE",     lanes: ["Procurement Watch", "Legislative Tracking"], lastUpdated: "2026-03-17T18:42:00Z" },
  { region: "European Union", posture: "STABLE",  signals: 7,  activity: "MODERATE", status: "MONITORING", lanes: ["Influence Operations", "Financial Flows"],    lastUpdated: "2026-03-17T17:15:00Z" },
  { region: "Asia-Pacific",   posture: "ELEVATED", signals: 11, activity: "HIGH",     status: "ACTIVE",     lanes: ["Conflict Escalation", "Trade Disruption"],    lastUpdated: "2026-03-17T19:01:00Z" },
  { region: "Middle East",    posture: "CRITICAL", signals: 19, activity: "CRITICAL", status: "ESCALATING", lanes: ["Conflict Lanes", "Energy Watch"],              lastUpdated: "2026-03-17T19:22:00Z" },
  { region: "Africa",         posture: "STABLE",  signals: 4,  activity: "LOW",      status: "MONITORING", lanes: ["Resource Monitoring"],                         lastUpdated: "2026-03-17T14:00:00Z" },
];

// ─── Feed ─────────────────────────────────────────────────────────────────────

export const feedItems: FeedItem[] = [
  { id: "SIG-001", text: "MULTI-SOURCE CONFIRMATION ACTIVE — 2 REGIONS ESCALATING", timestamp: "2026-03-17T19:22:00Z", system: "ORION",     priority: "HIGH" },
  { id: "SIG-002", text: "ATLAS ENTITY GRAPH EXPANDED — NEW NODE LINKED",           timestamp: "2026-03-17T18:55:00Z", system: "ATLAS",     priority: "NORMAL" },
  { id: "SIG-003", text: "BLACK DOG REVIEW QUEUE OPEN — RESTRICTED SIGNALS",        timestamp: "2026-03-17T18:31:00Z", system: "BLACK DOG", priority: "HIGH" },
  { id: "SIG-004", text: "ORION: ASIA-PACIFIC POSTURE SHIFT DETECTED",              timestamp: "2026-03-17T17:44:00Z", system: "ORION",     priority: "HIGH" },
  { id: "SIG-005", text: "F-003 UPDATED — NEW FUNDING SOURCE IDENTIFIED",           timestamp: "2026-03-17T17:10:00Z", system: "AXION",     priority: "NORMAL" },
];
