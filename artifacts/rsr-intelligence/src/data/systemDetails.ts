// ─── System Detail Data ───────────────────────────────────────────────────────
// Structured for future CMS / API replacement.
// Each key matches the URL slug: /systems/{slug}

import type { SystemStatus } from "./mockData";

export interface Capability {
  label: string;       // tactical micro-label, e.g. "MODULE 01"
  title: string;       // capability name
  description: string; // 1–2 sentence explanation
}

export interface MissionApplication {
  context: string;     // who/what scenario
  use: string;         // how this system applies
}

export interface OperationalStat {
  label: string;
  value: string;
  color?: string;      // optional accent — defaults to zinc
}

export interface SystemDetailData {
  slug: string;
  name: string;
  role: string;
  status: SystemStatus;
  layer: string;       // e.g. "SYNTHESIS LAYER" — architecture classification
  category: string;    // e.g. "ANALYTIC FRAMEWORK"
  tagline: string;     // 1-line operational descriptor for hero
  identity?: string;   // one-line identity shown under role in page header
  doctrine?: string;   // highlighted principle line rendered after mission applications
  externalUrl?: string; // optional external product URL — renders a secondary CTA on the detail page
  overview: {
    headline: string;
    body: string[];    // paragraphs
  };
  capabilities: Capability[];
  missionApplications: MissionApplication[];
  operationalStats: OperationalStat[]; // mock command panel data
  relatedSystems: string[];            // system slugs
  relatedFiles: string[];              // file IDs e.g. "F-001"
  relatedDossiers: string[];           // dossier IDs e.g. "D-001"
}

// ─── Slug helper ──────────────────────────────────────────────────────────────
export function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function slugToSystemDetail(slug: string): SystemDetailData | null {
  return systemDetails[slug] ?? null;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const systemDetails: Record<string, SystemDetailData> = {

  sentrix: {
    slug: "sentrix",
    name: "SENTRIX",
    role: "Intelligence Analysis System",
    status: "PRIMARY",
    layer: "ANALYSIS LAYER",
    category: "INTELLIGENCE ANALYSIS SYSTEM",
    tagline: "Structured intelligence analysis, verification, and case-building environment.",
    identity: "Intelligence-first analysis and verification environment.",
    externalUrl: "https://sentrix.live",
    overview: {
      headline: "Structured intelligence analysis, verification, and case-building environment.",
      body: [
        "SENTRIX is an intelligence-first analysis system built to take raw user input and turn it into structured, decision-useful output. It sits between the user and the information they are trying to understand, then classifies, breaks down, verifies, assesses, and organizes that information before the user has to trust it.",
        "Rather than behaving like a normal search engine or a generic chatbot shell, SENTRIX functions as a disciplined intelligence workspace. It is designed to receive claims, questions, articles, URLs, narratives, or raw material and process them through a structured reasoning workflow that emphasizes verification, source discipline, uncertainty handling, and long-term organization.",
      ],
    },
    capabilities: [
      { label: "FUNCTION 01", title: "Input Classification",       description: "Classifies user input by type so the system knows whether it is dealing with a factual question, a verifiable claim, a strategic assertion, or raw source material." },
      { label: "FUNCTION 02", title: "Verification Workflow",      description: "Runs corroboration-oriented verification logic for factual claims and current-event questions, comparing confirming and contradicting evidence instead of relying on one shallow result path." },
      { label: "FUNCTION 03", title: "Analytic Reasoning",         description: "Breaks broad claims into assumptions, scope, framing, and structural dependencies so the user gets disciplined analysis instead of shallow binary answers." },
      { label: "FUNCTION 04", title: "Source Extraction",          description: "Extracts structure from URLs, pasted text, and long-form material, including title, source domain, author, date, body, core claims, framing, and direct versus implied statements." },
      { label: "FUNCTION 05", title: "Sensitive-Claim Control",    description: "Applies stricter standards for sensitive personal claims involving medical, psychiatric, developmental, disability, addiction, or similar private-condition topics to avoid rumor-engine behavior." },
      { label: "FUNCTION 06", title: "Case Workflow",              description: "Supports long-term investigation building through saved analyses, structured case files, bookmarks, Vault storage, and persistent working sessions." },
    ],
    missionApplications: [
      { context: "Claim verification",         use: "Evaluates factual claims and current-event assertions through structured corroboration logic, surfacing confirming and contradicting evidence before returning a verdict." },
      { context: "Source analysis",            use: "Ingests URLs, pasted articles, and long-form material to extract structured metadata, core claims, framing signals, and source positioning." },
      { context: "Investigation building",     use: "Supports persistent case development through structured session management, Vault storage, and cross-referencing of prior analyses into active investigation files." },
      { context: "Narrative assessment",       use: "Applies analytic reasoning to strategic assertions and media narratives, breaking framing, scope, and implied assumptions into discrete, evaluable components." },
    ],
    operationalStats: [
      { label: "STATUS",           value: "PRIMARY",          color: "text-emerald-400" },
      { label: "ANALYSIS ENGINE",  value: "SAGE",             color: "text-zinc-300" },
      { label: "RISK LAYER",       value: "BLACKDOG",         color: "text-zinc-300" },
      { label: "WORKFLOW",         value: "INVESTIGATIONS",   color: "text-zinc-300" },
      { label: "INPUT MODES",      value: "4",                color: "text-zinc-300" },
      { label: "CLASSIFICATION",   value: "MULTI-MODE",       color: "text-amber-400" },
      { label: "STATE",            value: "ACTIVE",           color: "text-emerald-400" },
    ],
    relatedSystems: ["axion", "black-dog", "atlas"],
    relatedFiles: [],
    relatedDossiers: [],
  },

  sage: {
    slug: "sage",
    name: "SAGE",
    role: "Analysis Engine",
    status: "PRIMARY",
    layer: "ANALYSIS LAYER",
    category: "ANALYSIS ENGINE",
    tagline: "Structured reasoning, verification, and analytic assessment engine.",
    identity: "Structured reasoning and verification engine.",
    doctrine: "SAGE does not generate noise. It structures judgment.",
    overview: {
      headline: "Structured reasoning, verification, and analytic assessment.",
      body: [
        "SAGE is the central analysis engine operating inside the RSR Intelligence Network. It classifies incoming material, selects the correct reasoning mode, evaluates evidence, surfaces uncertainty, and produces structured outputs that are more disciplined and reliable than raw information.",
        "It is not a chatbot. It is an intelligence processor designed to reduce noise, test claims, and organize information into usable analysis.",
      ],
    },
    capabilities: [
      { label: "MODE 01", title: "Mode Classification",  description: "Determines the correct reasoning path for each input — factual question, verifiable claim, strategic assertion, or raw source material — before any analysis begins." },
      { label: "MODE 02", title: "Fact Response",        description: "Handles basic known questions with direct, sourced answers. Applied when the input is a straightforward query with a high-confidence available answer." },
      { label: "MODE 03", title: "Claim Verification",  description: "Checks factual claims through corroboration logic, comparing confirming and contradicting evidence rather than returning a single shallow result." },
      { label: "MODE 04", title: "Analytic Assessment", description: "Breaks down complex or broad claims structurally — examining assumptions, scope, framing, and dependencies — to produce disciplined multi-part analysis." },
      { label: "MODE 05", title: "Source Extraction",   description: "Processes articles, pasted text, and URLs into structured metadata: title, source, author, date, core claims, framing signals, and implied versus stated assertions." },
      { label: "MODE 06", title: "Output Structuring",  description: "Formats every analysis into clean, labeled intelligence output with uncertainty signals, source confidence markers, and clear analytic conclusions." },
    ],
    missionApplications: [
      { context: "Claim verification",    use: "Runs structured corroboration logic on factual claims and current-event assertions, surfacing confirming and contradicting evidence before returning an analytic verdict." },
      { context: "Source analysis",       use: "Ingests URLs and long-form material to extract structured metadata, core claims, framing signals, and source positioning for further analytic use." },
      { context: "Complex assessment",    use: "Applies structured reasoning to multi-layered questions, breaking framing, scope, and assumptions into discrete evaluable components." },
      { context: "Intelligence output",   use: "Produces clean, labeled structured outputs with confidence markers for integration into AXION brief cycles and SENTRIX investigation files." },
    ],
    operationalStats: [
      { label: "STATUS",                  value: "PRIMARY",        color: "text-emerald-400" },
      { label: "ENGINE TYPE",             value: "ANALYSIS CORE",  color: "text-zinc-300" },
      { label: "REASONING MODES",         value: "4",              color: "text-zinc-300" },
      { label: "VERIFICATION STATE",      value: "ACTIVE",         color: "text-emerald-400" },
      { label: "CLASSIFICATION SUPPORT",  value: "BLACKDOG",       color: "text-zinc-300" },
      { label: "WORKFLOW",                value: "LIVE",           color: "text-emerald-400" },
      { label: "OUTPUT",                  value: "STRUCTURED",     color: "text-zinc-300" },
    ],
    relatedSystems: ["sentrix", "black-dog", "axion"],
    relatedFiles: [],
    relatedDossiers: [],
  },

  axion: {
    slug: "axion",
    name: "AXION",
    role: "Executive Briefs",
    status: "LIVE",
    layer: "SYNTHESIS LAYER",
    category: "INTELLIGENCE SYNTHESIS",
    tagline: "Converts distributed signal into decision-ready intelligence.",
    identity: "Executive synthesis and intelligence briefing system.",
    overview: {
      headline: "Structured intelligence for decision-makers.",
      body: [
        "AXION is the primary synthesis and briefing engine within the RSR Intelligence Network. It aggregates signals from across the monitoring stack, applies analytic weighting, and produces structured executive briefs calibrated for decision-makers who cannot engage raw signal feeds directly.",
        "The system is designed around a core principle: that the distance between raw information and actionable intelligence must be shortened without sacrificing accuracy or nuance. AXION does not summarize — it synthesizes, structures, and prioritizes.",
        "Each output produced by AXION is tagged with source confidence ratings, classification tiers, and analytic confidence markers — ensuring that consumers of its output understand the epistemic basis of every assessment.",
      ],
    },
    capabilities: [
      { label: "FUNCTION 01", title: "Signal Triage",           description: "Prioritizes incoming signals from ORION, ATLAS, and BLACK DOG feeds based on configurable threat and relevance weighting." },
      { label: "FUNCTION 02", title: "Brief Structuring",        description: "Formats synthesized intelligence into structured brief templates: SITUATION, SIGNIFICANCE, IMPLICATIONS, RECOMMENDED ACTION." },
      { label: "FUNCTION 03", title: "Source Aggregation",       description: "Consolidates multi-layer source inputs including open-source, structured reporting, and monitored network signals into unified analytic input." },
      { label: "FUNCTION 04", title: "Confidence Scoring",       description: "Applies analytic confidence markers (HIGH / MODERATE / LOW) to each assessment line based on source quality and corroboration depth." },
      { label: "FUNCTION 05", title: "Priority Escalation",      description: "Flags time-sensitive items for immediate distribution across the network, bypassing standard brief cycle cadence where required." },
    ],
    missionApplications: [
      { context: "Executive leadership",            use: "Produces daily priority briefs condensing the most relevant developments across tracked domains into a structured single document." },
      { context: "Investigative teams",             use: "Synthesizes distributed investigative signals into coherent narrative summaries, ensuring analytic continuity across case cycles." },
      { context: "Stakeholder reporting",           use: "Generates formatted intelligence outputs suitable for distribution to external stakeholders and partner organizations." },
      { context: "Escalation management",           use: "Identifies developing situations requiring immediate escalation and produces rapid-cycle alert briefs outside normal delivery cadence." },
    ],
    operationalStats: [
      { label: "STATUS",          value: "LIVE",            color: "text-emerald-400" },
      { label: "BRIEF CYCLE",     value: "DAILY — 06:00Z",  color: "text-zinc-300" },
      { label: "SOURCE INPUTS",   value: "4 ACTIVE FEEDS",  color: "text-zinc-300" },
      { label: "CONFIDENCE MODE", value: "MULTI-SOURCE",    color: "text-emerald-400" },
      { label: "OUTPUT FORMAT",   value: "STRUCTURED PDF",  color: "text-zinc-300" },
      { label: "DISTRIBUTION",    value: "TIER-2 CLEARED",  color: "text-amber-400" },
    ],
    relatedSystems: ["atlas", "orion", "black-dog"],
    relatedFiles: ["F-001", "F-006", "F-009", "F-017"],
    relatedDossiers: ["D-001", "D-004"],
  },

  atlas: {
    slug: "atlas",
    name: "ATLAS",
    role: "Entity Mapping",
    status: "CORE",
    layer: "RELATIONAL LAYER",
    category: "NETWORK & ENTITY ANALYSIS",
    tagline: "Maps the hidden architecture of institutions, networks, and individuals.",
    identity: "Entity mapping and relationship analysis system.",
    overview: {
      headline: "Structured mapping of power, ownership, and connection.",
      body: [
        "ATLAS is the core entity intelligence and network mapping system within RSR. It maintains structured records of organizations, individuals, programs, and financial entities — and maps the relationships between them with analytic precision.",
        "Where surface-level research identifies actors, ATLAS identifies structures. It traces ownership layers, maps directorial overlaps, follows capital flows, and surfaces the non-obvious connections that define real power architecture.",
        "ATLAS outputs feed directly into AXION for synthesis, and provide the primary source base for the Dossiers layer. All entity records are maintained with classification tiers, confidence assessments, and update tracking to ensure analytic currency.",
      ],
    },
    capabilities: [
      { label: "FUNCTION 01", title: "Entity Profiling",          description: "Maintains structured records for organizations, programs, individuals, and networks — including status, jurisdiction, and operational context." },
      { label: "FUNCTION 02", title: "Relationship Graphing",     description: "Maps directorial overlaps, ownership chains, contractual relationships, and capital flows between tracked entities." },
      { label: "FUNCTION 03", title: "Beneficial Ownership Trace",description: "Identifies and documents the ultimate beneficial ownership structure of entities where surface-level records are obscured or incomplete." },
      { label: "FUNCTION 04", title: "Network Cluster Analysis",  description: "Identifies clusters of co-related entities operating in coordinated fashion across procurement, finance, media, or political domains." },
      { label: "FUNCTION 05", title: "Cross-Reference Index",     description: "Links entity records to associated files, signals, and world-layer events — providing full-network context for any tracked actor." },
    ],
    missionApplications: [
      { context: "Corruption investigations",       use: "Traces the ownership and control architecture behind entities implicated in procurement fraud, contract irregularities, or financial crime." },
      { context: "Influence network mapping",       use: "Identifies coordinated actor networks operating across media, lobbying, and government advisory roles." },
      { context: "Due diligence support",           use: "Provides structured entity intelligence supporting third-party risk assessment and organizational due diligence." },
      { context: "Investment structure analysis",   use: "Maps capital flow patterns and fund structures associated with entities of analytic interest." },
    ],
    operationalStats: [
      { label: "STATUS",           value: "CORE",              color: "text-cyan-400" },
      { label: "ACTIVE ENTITIES",  value: "1,247 RECORDS",     color: "text-zinc-300" },
      { label: "RELATIONSHIP MAP", value: "3,891 LINKS",       color: "text-zinc-300" },
      { label: "CLASSIFICATION",   value: "MULTI-TIER",        color: "text-amber-400" },
      { label: "UPDATE CYCLE",     value: "CONTINUOUS",        color: "text-emerald-400" },
      { label: "CONFIDENCE MODE",  value: "CORROBORATED",      color: "text-emerald-400" },
    ],
    relatedSystems: ["axion", "black-dog"],
    relatedFiles: ["F-003", "F-012", "F-019", "F-020"],
    relatedDossiers: ["D-002", "D-006", "D-007", "D-014"],
  },

  orion: {
    slug: "orion",
    name: "ORION",
    role: "World Monitor",
    status: "LIVE",
    layer: "SITUATIONAL LAYER",
    category: "GLOBAL MONITORING",
    tagline: "Continuous regional situational awareness across active monitoring zones.",
    overview: {
      headline: "Real-time global posture tracking across priority regions.",
      body: [
        "ORION provides the RSR network's global situational awareness infrastructure. It maintains continuous monitoring of geopolitical, economic, and conflict-adjacent developments across priority regions, feeding structured posture assessments and signal data to the broader analytic stack.",
        "Rather than consuming raw news or unstructured social media, ORION operates against a structured regional framework — assigning posture classifications (STABLE / ELEVATED / CRITICAL), tracking active signal counts, and monitoring escalation indicators across defined geographic lanes.",
        "ORION's outputs are the primary geographic intelligence source for AXION brief cycles and provide the signal context layer that ATLAS uses for entity-linked regional tracking.",
      ],
    },
    capabilities: [
      { label: "FUNCTION 01", title: "Regional Posture Classification", description: "Assigns and maintains posture ratings (STABLE / ELEVATED / CRITICAL) for all monitored regions based on structured indicator sets." },
      { label: "FUNCTION 02", title: "Signal Aggregation",               description: "Aggregates regional signals from monitored lanes including conflict, procurement, political, and economic indicators." },
      { label: "FUNCTION 03", title: "Escalation Tracking",              description: "Monitors defined escalation markers within active regions and triggers escalation alerts when threshold conditions are met." },
      { label: "FUNCTION 04", title: "Lane Monitoring",                  description: "Maintains active monitoring across defined operational lanes: procurement, influence operations, conflict, energy, trade disruption." },
      { label: "FUNCTION 05", title: "Geospatial Context Layer",         description: "Provides geographic context and coordinates for entity-linked events, enabling cross-referencing with ATLAS entity records." },
      { label: "FUNCTION 06", title: "Signal Feed Generation",           description: "Produces continuous structured signal feed output consumed by the AXION synthesis layer and visible in the World Monitor interface." },
    ],
    missionApplications: [
      { context: "Geopolitical risk assessment",   use: "Provides structured regional posture intelligence for organizations assessing operational risk in monitored zones." },
      { context: "Early warning",                  use: "Flags developing escalation patterns in monitored regions before they surface in mainstream reporting." },
      { context: "Conflict zone briefing",         use: "Produces tactical summaries of active conflict lanes for integration into daily AXION brief cycles." },
      { context: "Supply chain monitoring",        use: "Tracks trade and logistics lane disruptions within priority regions affecting supply chain operations." },
    ],
    operationalStats: [
      { label: "STATUS",             value: "LIVE",           color: "text-emerald-400" },
      { label: "MONITORED REGIONS",  value: "5 ACTIVE",       color: "text-zinc-300" },
      { label: "SIGNAL COUNT",       value: "55 LIVE",        color: "text-zinc-300" },
      { label: "CRITICAL ZONES",     value: "1 ACTIVE",       color: "text-red-400" },
      { label: "ELEVATED ZONES",     value: "2 ACTIVE",       color: "text-amber-400" },
      { label: "FEED CYCLE",         value: "CONTINUOUS",     color: "text-emerald-400" },
    ],
    relatedSystems: ["axion", "white-wing"],
    relatedFiles: ["F-010", "F-014", "F-017"],
    relatedDossiers: ["D-006", "D-013"],
  },

  "black-dog": {
    slug: "black-dog",
    name: "BLACK DOG",
    role: "Restricted Review",
    status: "RESTRICTED",
    layer: "SENSITIVE LAYER",
    category: "ANOMALY & RESTRICTED REVIEW",
    tagline: "Handles anomalous signals, sensitive cases, and restricted source material.",
    identity: "Risk classification and system protection layer.",
    overview: {
      headline: "Elevated handling for sensitive and anomalous intelligence.",
      body: [
        "BLACK DOG is the RSR network's restricted review and anomaly management system. It handles the intelligence cases and signal categories that require elevated handling procedures, restricted access controls, or specialized analytic approaches not appropriate for standard network layers.",
        "The system processes signals flagged by ORION and ATLAS as anomalous, sensitive, or potentially indicative of organized counter-intelligence activity. It also manages cyber-adjacent incident tracking and maintains restricted case files that are not surfaced to the standard dossier layer.",
        "Access to BLACK DOG outputs is limited to cleared analytic personnel. The system operates on a need-to-know basis, and its outputs feed selectively into AXION brief cycles only where appropriate classification controls are maintained.",
      ],
    },
    capabilities: [
      { label: "FUNCTION 01", title: "Anomaly Flagging",          description: "Identifies and queues signals exhibiting anomalous patterns relative to established baseline behavior in monitored domains." },
      { label: "FUNCTION 02", title: "Restricted Case Management",description: "Maintains classified case files for sensitive investigations requiring access controls above the standard network tier." },
      { label: "FUNCTION 03", title: "Cyber Incident Tracking",   description: "Monitors and logs cyber-adjacent incidents, infrastructure anomalies, and digital operation indicators relevant to tracked entities." },
      { label: "FUNCTION 04", title: "Counter-Intelligence Watch", description: "Monitors for indicators of organized counter-intelligence activity directed at RSR network infrastructure or tracked sources." },
      { label: "FUNCTION 05", title: "Restricted Source Handling", description: "Manages intelligence derived from restricted source categories, applying appropriate access controls and handling protocols." },
    ],
    missionApplications: [
      { context: "Sensitive investigations",          use: "Manages high-value cases requiring elevated access controls and restricted distribution of analytic outputs." },
      { context: "Anomaly triage",                   use: "Reviews and classifies anomalous signals that do not fit standard monitoring patterns, escalating confirmed cases to cleared analysts." },
      { context: "Infrastructure security",           use: "Monitors RSR network infrastructure for intrusion indicators and anomalous access patterns." },
      { context: "Counter-intelligence assessment",  use: "Provides analytic support for identifying and assessing organized attempts to disrupt, penetrate, or mislead RSR monitoring operations." },
    ],
    operationalStats: [
      { label: "STATUS",             value: "RESTRICTED",       color: "text-red-400" },
      { label: "ACCESS TIER",        value: "CLEARED ONLY",     color: "text-red-400" },
      { label: "OPEN CASES",         value: "2 ACTIVE",         color: "text-amber-400" },
      { label: "ANOMALY QUEUE",      value: "7 PENDING",        color: "text-amber-400" },
      { label: "ENCRYPTION",         value: "AES-256 / E2E",    color: "text-emerald-400" },
      { label: "REVIEW CYCLE",       value: "CONTINUOUS",       color: "text-emerald-400" },
    ],
    relatedSystems: ["axion", "atlas"],
    relatedFiles: ["F-001", "F-016", "F-018"],
    relatedDossiers: ["D-003", "D-004", "D-009"],
  },

  "white-wing": {
    slug: "white-wing",
    name: "WHITE WING",
    role: "Battlespace",
    status: "TRACKING",
    layer: "TACTICAL LAYER",
    category: "CONFLICT & ESCALATION MONITORING",
    tagline: "Tactical intelligence on active conflict environments, escalation patterns, and force movements.",
    overview: {
      headline: "Structured intelligence across active conflict and escalation zones.",
      body: [
        "WHITE WING is the RSR network's tactical intelligence layer, focused on active and developing conflict environments. It tracks escalation indicators, monitors defined conflict lanes, logs tactical incidents, and provides structured situational intelligence for decision-making in volatile operational contexts.",
        "The system operates against a defined set of conflict zones and monitored escalation corridors. It tracks the status of active engagements, documents force movement indicators, monitors logistics and supply lane disruptions, and maintains rolling escalation assessments for each active zone.",
        "WHITE WING outputs feed into ORION's regional posture layer and contribute to AXION brief cycles on conflict-affected regions. The system does not pretend to real-time battlefield intelligence — it provides structured, sourced, analytic assessment of conflict dynamics based on available open and monitored source material.",
      ],
    },
    capabilities: [
      { label: "FUNCTION 01", title: "Conflict Lane Mapping",      description: "Maintains active monitoring and mapping of defined conflict corridors, tracking engagement patterns and zone boundary shifts." },
      { label: "FUNCTION 02", title: "Escalation Indicator Tracking",description: "Monitors predefined escalation markers — force build-up, mobilization signals, supply disruption — and rates escalation risk across active zones." },
      { label: "FUNCTION 03", title: "Incident Logging",           description: "Documents tactical incidents within monitored zones, including engagement reports, infrastructure strikes, and significant escalation events." },
      { label: "FUNCTION 04", title: "Logistics Lane Monitoring",  description: "Tracks disruptions to supply, fuel, and logistics lanes within and adjacent to active conflict zones." },
      { label: "FUNCTION 05", title: "Force Movement Assessment",  description: "Analyzes available source material to identify and assess significant force movement and repositioning patterns." },
    ],
    missionApplications: [
      { context: "Conflict zone risk assessment",  use: "Provides structured escalation and posture intelligence for organizations operating in or adjacent to active conflict zones." },
      { context: "Strategic escalation briefing",  use: "Produces structured escalation assessments for integration into AXION priority brief cycles on conflict-affected regions." },
      { context: "Logistics disruption monitoring",use: "Tracks conflict-driven disruptions to key logistics and supply lanes affecting regional and global supply chain operations." },
      { context: "Incident documentation",         use: "Maintains structured logs of significant tactical events in monitored conflict zones for historical and analytic reference." },
    ],
    operationalStats: [
      { label: "STATUS",             value: "TRACKING",         color: "text-amber-400" },
      { label: "ACTIVE ZONES",       value: "3 MONITORED",      color: "text-zinc-300" },
      { label: "ESCALATION RISK",    value: "HIGH — MIDDLE EAST", color: "text-red-400" },
      { label: "OPEN INCIDENTS",     value: "5 LOGGED",         color: "text-amber-400" },
      { label: "CONFLICT LANES",     value: "7 ACTIVE",         color: "text-zinc-300" },
      { label: "REVIEW CYCLE",       value: "CONTINUOUS",       color: "text-emerald-400" },
    ],
    relatedSystems: ["orion", "axion"],
    relatedFiles: ["F-010", "F-013"],
    relatedDossiers: ["D-007", "D-011"],
  },

  "rsr-contract-tracker": {
    slug: "rsr-contract-tracker",
    name: "RSR CONTRACT TRACKER",
    role: "Contract Intelligence",
    status: "TRACKING",
    layer: "PROCUREMENT LAYER",
    category: "CONTRACT INTELLIGENCE",
    tagline: "Defense and government contract monitoring, award tracking, and procurement irregularity detection.",
    identity: "Procurement intelligence and contract award monitoring system.",
    overview: {
      headline: "Structured monitoring of defense and government contract awards.",
      body: [
        "RSR CONTRACT TRACKER is the network's dedicated procurement intelligence layer. It ingests, structures, and cross-references defense and government contract award data to surface concentration risk, award irregularities, and contractor relationships that do not appear clearly in public disclosure alone.",
        "The system maintains a live registry of tracked contracts, cross-referenced against RSR entity dossiers, lobbying records, and procurement investigation files. Irregularity flags are escalated to BLACK DOG for restricted review and linked to relevant ATLAS entity profiles for relationship mapping.",
      ],
    },
    capabilities: [
      { label: "FUNCTION 01", title: "Award Monitoring",           description: "Tracks defense and government contract awards across monitored procurement domains, logging value, counterparty, and award timeline." },
      { label: "FUNCTION 02", title: "Irregularity Detection",     description: "Flags anomalous award patterns including sole-source concentration, rapid recompete cycles, and above-threshold modifications without competitive justification." },
      { label: "FUNCTION 03", title: "Entity Cross-Reference",     description: "Cross-references award recipients against RSR dossier records, lobbying disclosures, and corporate registry data to surface hidden relationships." },
      { label: "FUNCTION 04", title: "Concentration Risk Scoring", description: "Scores contractor concentration across agencies and program types, identifying overexposed vendors and single-source dependency in critical contract lanes." },
      { label: "FUNCTION 05", title: "Subcontractor Mapping",      description: "Maps subcontractor and teaming relationships beneath prime awards to identify beneficial ownership overlap and undisclosed associated-entity structures." },
      { label: "FUNCTION 06", title: "Procurement File Linkage",   description: "Links active contracts to open RSR procurement investigation files, enabling analysts to surface new awards touching entities already under review." },
    ],
    missionApplications: [
      { context: "Defense procurement oversight",  use: "Monitors active DOD and allied-nation defense contract awards, flagging irregularities for escalation to BLACK DOG restricted review." },
      { context: "Contractor entity review",       use: "Cross-references award recipients against ATLAS entity profiles and RSR dossier records to surface undisclosed relationships." },
      { context: "Procurement investigation",      use: "Links active contracts to open RSR files, providing analysts with a real-time view of new award activity touching entities under investigation." },
      { context: "Concentration risk assessment",  use: "Produces structured concentration risk scores across agency and program-type dimensions for integration into AXION brief cycles." },
    ],
    operationalStats: [
      { label: "STATUS",              value: "TRACKING",           color: "text-amber-400" },
      { label: "ACTIVE CONTRACTS",    value: "12 MONITORED",       color: "text-zinc-300" },
      { label: "IRREGULARITY FLAGS",  value: "4 OPEN",             color: "text-amber-400" },
      { label: "LINKED FILES",        value: "F-001 / F-005 / F-009", color: "text-zinc-300" },
      { label: "REVIEW CYCLE",        value: "CONTINUOUS",         color: "text-emerald-400" },
      { label: "ESCALATION QUEUE",    value: "2 PENDING",          color: "text-amber-400" },
    ],
    relatedSystems: ["atlas", "black-dog", "axion"],
    relatedFiles: ["F-001", "F-005", "F-009", "F-012"],
    relatedDossiers: ["D-001", "D-005", "D-007"],
  },

  warstate: {
    slug: "warstate",
    name: "WARSTATE",
    role: "Conflict Risk Assessment",
    status: "LIVE",
    layer: "THREAT ASSESSMENT LAYER",
    category: "CONFLICT RISK & WAR-STATE MONITORING",
    tagline: "Global conflict risk classification, war-state monitoring, and escalation threshold tracking.",
    identity: "Conflict risk classification and interstate threat posture system.",
    overview: {
      headline: "Structured conflict risk assessment and war-state monitoring.",
      body: [
        "WARSTATE is the RSR network's primary conflict risk classification engine. It maintains a continuously updated threat posture model across monitored conflict zones, tracking interstate threat signals, mobilization indicators, escalation thresholds, and war-state transition markers.",
        "Unlike WHITE WING's tactical incident documentation layer, WARSTATE operates at the strategic threat assessment level — evaluating whether conditions in a given region are trending toward, entering, or sustaining active war-state conditions. Its classifications feed directly into ORION's regional posture model and AXION brief cycles for conflict-affected regions.",
      ],
    },
    capabilities: [
      { label: "FUNCTION 01", title: "War-State Classification",    description: "Classifies monitored regions against a structured war-state taxonomy: STABLE / ELEVATED / CONFLICT THRESHOLD / ACTIVE / CONTESTED." },
      { label: "FUNCTION 02", title: "Escalation Threshold Tracking",description: "Tracks crossing of predefined escalation thresholds — mobilization, territorial incursion, economic blockade, kinetic strike — across monitored conflict pairs." },
      { label: "FUNCTION 03", title: "Mobilization Signal Monitoring",description: "Monitors open and structured source material for troop movement, reserve activation, and military logistics signals indicating conflict preparation." },
      { label: "FUNCTION 04", title: "Interstate Threat Posture",   description: "Assesses bilateral and multilateral threat posture between monitored state actors, tracking diplomatic breakdown, public threat signaling, and force repositioning." },
      { label: "FUNCTION 05", title: "Conflict Duration Modeling",  description: "Applies duration and intensity modeling to active conflicts, generating structured assessments of likely trajectory and turning-point indicators." },
      { label: "FUNCTION 06", title: "Risk Feed Integration",       description: "Integrates conflict risk outputs into ORION regional posture updates and AXION brief cycles for near-real-time strategic context." },
    ],
    missionApplications: [
      { context: "Strategic conflict assessment",  use: "Provides decision-makers with structured war-state classifications and escalation trajectory assessments across monitored conflict zones." },
      { context: "Regional posture integration",   use: "Feeds classified conflict risk outputs into ORION's regional posture model, enabling synchronized multi-domain threat assessment." },
      { context: "Escalation threshold briefing",  use: "Generates structured briefing outputs for AXION when monitored conflict pairs cross predefined escalation thresholds." },
      { context: "Mobilization assessment",        use: "Evaluates mobilization signals across monitored military establishments, assessing preparation-to-conflict timeline probabilities." },
    ],
    operationalStats: [
      { label: "STATUS",               value: "LIVE",               color: "text-emerald-400" },
      { label: "MONITORED ZONES",      value: "9 ACTIVE",           color: "text-zinc-300" },
      { label: "WAR-STATE ACTIVE",     value: "3 ZONES",            color: "text-red-400" },
      { label: "ESCALATION WATCH",     value: "2 THRESHOLD",        color: "text-amber-400" },
      { label: "POSTURE FEED",         value: "ORION / AXION",      color: "text-zinc-300" },
      { label: "REVIEW CYCLE",         value: "CONTINUOUS",         color: "text-emerald-400" },
    ],
    relatedSystems: ["orion", "white-wing", "axion"],
    relatedFiles: ["F-010", "F-014"],
    relatedDossiers: ["D-013", "D-014"],
  },

};

export default systemDetails;
