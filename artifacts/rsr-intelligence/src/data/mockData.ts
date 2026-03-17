export const systems = [
  { name: "AXION", role: "Executive Briefs", status: "LIVE", items: 1, description: "Daily synthesis, signal triage, and priority brief generation." },
  { name: "ATLAS", role: "Entity Mapping", status: "CORE", items: 3, description: "Profiles, relationships, dossiers, and structured network mapping." },
  { name: "ORION", role: "World Monitor", status: "LIVE", items: 8, description: "Regional watch, global events, and location-based signal tracking." },
  { name: "BLACK DOG", role: "Restricted Review", status: "RESTRICTED", items: 2, description: "Anomalies, cyber incidents, and sensitive activity review." },
  { name: "WHITE WING", role: "Battlespace", status: "TRACKING", items: 5, description: "Conflict lanes, escalation markers, and tactical incident monitoring." },
];

export const files = [
  { id: "F-001", title: "Operation Clearwater", category: "Corruption", status: "ACTIVE", updated: "2026-03-12", region: "Western Pacific", tags: ["procurement", "contracts", "DOD"], summary: "Coordinated procurement irregularities across three allied defense ministries. Evidence of parallel acquisition channels and off-book disbursements." },
  { id: "F-002", title: "Shadow Budget Review", category: "Budgets", status: "CLOSED", updated: "2026-02-28", region: "North America", tags: ["budgets", "governance", "audit"], summary: "Analysis of unaccounted appropriations within federal discretionary spending windows. Three fiscal cycles reviewed." },
  { id: "F-003", title: "Influence Architecture", category: "Influence", status: "ACTIVE", updated: "2026-03-15", region: "European Union", tags: ["influence", "media", "funding"], summary: "Mapping of coordinated influence infrastructure across major EU media outlets. Funding traced to three offshore intermediaries." },
  { id: "F-004", title: "Street Economy Audit", category: "Homelessness", status: "MONITORING", updated: "2026-03-10", region: "West Coast USA", tags: ["homelessness", "contractors", "governance"], summary: "Structural analysis of municipal homelessness contractor ecosystem. Service delivery gaps correlated with payment anomalies." },
  { id: "F-005", title: "Contractor Registry Alpha", category: "Contractors", status: "ACTIVE", updated: "2026-03-14", region: "Global", tags: ["contractors", "procurement"], summary: "Ongoing cataloging of defense and intelligence-adjacent contractor entities. Cross-referenced with lobbying disclosures." },
];

export const dossiers = [
  { id: "D-001", name: "CORMORANT GROUP", type: "Entity", status: "ACTIVE", region: "North America", network: "Procurement", notes: "Defense contractor network with documented ties to three cabinet-level procurement decisions." },
  { id: "D-002", name: "VESPER ASSOCIATES", type: "Entity", status: "MONITORING", region: "European Union", network: "Influence", notes: "Consultancy operating across EU legislative and media environments. Beneficial ownership unresolved." },
  { id: "D-003", name: "LANTERN PROTOCOL", type: "Program", status: "CLOSED", region: "Global", network: "Intelligence", notes: "Classified analytic framework. Decommissioned Q4 2023. Successor program unconfirmed." },
  { id: "D-004", name: "MERIDIAN CAPITAL", type: "Entity", status: "ACTIVE", region: "Asia-Pacific", network: "Finance", notes: "Investment vehicle with links to state-adjacent capital flows. Three known front entities." },
];

export const regions = [
  { region: "North America", posture: "ELEVATED", signals: 14, activity: "HIGH", status: "ACTIVE", lanes: ["Procurement Watch", "Legislative Tracking"] },
  { region: "European Union", posture: "STABLE", signals: 7, activity: "MODERATE", status: "MONITORING", lanes: ["Influence Operations", "Financial Flows"] },
  { region: "Asia-Pacific", posture: "ELEVATED", signals: 11, activity: "HIGH", status: "ACTIVE", lanes: ["Conflict Escalation", "Trade Disruption"] },
  { region: "Middle East", posture: "CRITICAL", signals: 19, activity: "CRITICAL", status: "ESCALATING", lanes: ["Conflict Lanes", "Energy Watch"] },
  { region: "Africa", posture: "STABLE", signals: 4, activity: "LOW", status: "MONITORING", lanes: ["Resource Monitoring"] },
];

export const feedItems = [
  "MULTI-SOURCE CONFIRMATION ACTIVE — 2 REGIONS ESCALATING",
  "ATLAS ENTITY GRAPH EXPANDED — NEW NODE LINKED",
  "BLACK DOG REVIEW QUEUE OPEN — RESTRICTED SIGNALS",
  "ORION: ASIA-PACIFIC POSTURE SHIFT DETECTED",
  "F-003 UPDATED — NEW FUNDING SOURCE IDENTIFIED",
];
