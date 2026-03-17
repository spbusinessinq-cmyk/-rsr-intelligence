export interface FileDetail {
  id: string;
  findings: string[];
  keyObservation: string;
  linkedDossiers: string[];
  linkedFiles: string[];
  relatedSystems: string[];
}

const details: FileDetail[] = [
  {
    id: "F-001",
    findings: [
      "Three allied defense ministry procurement offices share a common secondary approval pathway not reflected in official tendering documentation.",
      "Off-book disbursements totaling an estimated $47M across two fiscal cycles traced to an offshore clearing entity with no registered procurement activity.",
      "Vendor rosters for parallel acquisition channels contain five entities that appear in the Cormorant Group (D-001) contractor network with shared registered agents.",
      "Internal approval timelines suggest pre-award coordination predating formal bid opening by an average of 22 days across reviewed contracts.",
    ],
    keyObservation: "The procurement irregularity pattern in F-001 is not characteristic of isolated contract fraud. The consistency across three separate ministry offices and two fiscal cycles suggests structured coordination at a level above individual procurement officers. Cormorant Group's role appears to be tier-2 facilitation — not the primary beneficiary — which implies an upstream entity not yet identified in the contractor registry.",
    linkedDossiers: ["D-001"],
    linkedFiles: ["F-005", "F-008"],
    relatedSystems: ["ATLAS", "AXION", "BLACK DOG"],
  },
  {
    id: "F-002",
    findings: [
      "Anomalous appropriation pattern detected across three budget lines: discretionary operations, infrastructure maintenance, and a supplemental allocation fund.",
      "Cross-cycle variance in discretionary spending shows a structured redistribution pattern inconsistent with operational need projections.",
      "Two supplemental allocation requests during the review period were processed outside standard fiscal calendar windows.",
    ],
    keyObservation: "The budget anomaly pattern in F-002 is consistent with structured line-item diversion rather than opportunistic fraud. The regularity of the variance — appearing in the same seasonal windows across three cycles — suggests procedural knowledge rather than systemic corruption. Case closed pending re-opening on new fiscal cycle data.",
    linkedDossiers: [],
    linkedFiles: ["F-015", "F-009"],
    relatedSystems: ["AXION"],
  },
  {
    id: "F-003",
    findings: [
      "Primary funding for the influence infrastructure traced to three offshore intermediaries registered in Liechtenstein, Malta, and Guernsey — all sharing a common beneficial ownership registry agent.",
      "Secondary network active in the Brussels advisory layer maintains documented advisory relationships with four members of current legislative drafting committees.",
      "Editorial coordination pattern identified across eleven major EU media outlets producing near-simultaneous coverage on energy policy, migration, and trade topics.",
      "One intermediary entity shares a correspondent banking relationship with the funding source identified in F-017.",
    ],
    keyObservation: "F-003 represents one of the most structurally coherent influence networks documented in this cycle. The offshore funding structure, Brussels advisory penetration, and coordinated media output form a three-layer system that is difficult to attribute to a single principal. The confirmed link to F-017 via shared correspondent banking elevates this from a standalone influence file to a broader cross-jurisdictional coordination case.",
    linkedDossiers: ["D-002", "D-006"],
    linkedFiles: ["F-017", "F-014"],
    relatedSystems: ["ATLAS", "AXION", "ORION"],
  },
  {
    id: "F-004",
    findings: [
      "Service delivery metrics for four city contracts show consistent underperformance relative to contracted outputs, with variance concentrated in data-rich service categories where verification is operationally complex.",
      "Payment anomalies detected in three of four contractor accounts — specifically, milestone payment timing does not correspond to documented service delivery milestones.",
      "Subcontractor ecosystem for all four contracts traces to a common holding entity registered outside the contracting jurisdiction.",
    ],
    keyObservation: "Municipal homelessness contractor ecosystems present structurally low accountability environments. Oversight fragmentation between city, county, and state layers creates reliable payment gaps that organized contractor networks can systematically exploit. The common subcontractor holding entity across four separate city contracts in F-004 is the primary outstanding lead.",
    linkedDossiers: [],
    linkedFiles: ["F-011", "F-020"],
    relatedSystems: ["AXION", "ORION"],
  },
  {
    id: "F-005",
    findings: [
      "Contractor registry cross-reference against DOD contract awards database produces 23 matches where registered entity and contracting entity share a common principal but different legal names.",
      "Fourteen entities in the registry have lobbying disclosures filed within 90 days of a relevant contract award, suggesting systematic registration timing.",
      "Three entities appear in both F-005 registry and F-001 procurement irregularity file via shared registered agents.",
    ],
    keyObservation: "The Contractor Registry Alpha (F-005) is an ongoing compilation rather than a closed investigation. Its primary value is as a cross-reference instrument — most of its entries become significant when matched against other active files. The registry's growing utility as a node-identification tool for the ATLAS entity layer warrants continued maintenance.",
    linkedDossiers: ["D-001"],
    linkedFiles: ["F-001", "F-012"],
    relatedSystems: ["ATLAS", "AXION"],
  },
  {
    id: "F-006",
    findings: [
      "Meridian Capital (D-004) connected to three Asia-Pacific state-adjacent investment vehicles through a common management company registered in Singapore.",
      "Two of the three investment vehicles submitted procurement bids in separate jurisdictions within the same 30-day window — suggesting coordinated acquisition strategy.",
      "Capital flow analysis identifies a transfer chain from a Cayman-registered entity through Hong Kong to the Singapore management company, with intermediate steps through two jurisdictions with restricted financial registry access.",
    ],
    keyObservation: "Meridian Capital's Asia-Pacific operation structure is consistent with a coordinated acquisition program using multiple vehicles to obscure the scale and direction of capital deployment. The simultaneous procurement bids across jurisdictions — combined with the shared management structure — suggest a principal with both the capital and the institutional knowledge to operate across regulatory environments simultaneously.",
    linkedDossiers: ["D-004"],
    linkedFiles: ["F-018", "F-013"],
    relatedSystems: ["ATLAS", "AXION", "BLACK DOG"],
  },
  {
    id: "F-007",
    findings: [
      "Policy Bridge Initiative coordinates across three nonprofit intermediaries that have independent legal identities but share governance board members in two cases.",
      "Legislative advisory access documented in six North American state-level and two federal legislative bodies, and in three EU member country parliaments.",
      "Coordination methodology involves structured paper production — policy briefs and background documents — that are then cited in legislative committee hearings.",
    ],
    keyObservation: "F-007 represents a policy influence method distinct from lobbying: the Initiative appears to embed itself in legislative processes through research credibility rather than direct advocacy. The shared governance structures across the intermediary nonprofits suggest common direction despite nominal independence. Horizon Policy Institute (D-008) is the most active participant in this network.",
    linkedDossiers: ["D-008", "D-012"],
    linkedFiles: ["F-019", "F-020"],
    relatedSystems: ["ATLAS", "AXION"],
  },
  {
    id: "F-008",
    findings: [
      "Asia-Pacific logistics contractor cluster operates across maritime supply chain, port services, and customs facilitation sectors in three adjacent jurisdictions.",
      "Key personnel in two of the reviewed contractor entities appear in F-001 procurement network as third-tier subcontractors.",
      "One entity in the cluster used the same legal registration agent as a Cormorant Group (D-001) subsidiary at the time of its formation.",
    ],
    keyObservation: "F-008 is closed pending no new evidence, but the personnel links back to F-001 and the shared registration agent with D-001 suggest it is part of a broader contractor network rather than an isolated regional cluster. Recommend periodic re-review when new F-001 leads emerge.",
    linkedDossiers: ["D-001", "D-011"],
    linkedFiles: ["F-001", "F-013"],
    relatedSystems: ["ATLAS", "ORION"],
  },
  {
    id: "F-009",
    findings: [
      "Four bid submissions for Northern Gateway infrastructure contract share beneficial ownership traceable to two individuals through a chain of three entities across two jurisdictions.",
      "Bid submission documents for all four entries share formatting metadata and identical error patterns in supplementary technical documents, suggesting common authorship.",
      "One of the beneficial owners appears in D-007 Northern Bridge Consortium entity graph as a director of two consortium members.",
      "Tender process irregularities include a compressed public comment window and non-standard evaluation criteria introduced two weeks before bid deadline.",
    ],
    keyObservation: "F-009 presents a classical bid-rigging structure adapted for infrastructure procurement. The combination of shared beneficial ownership, common document authorship, and process irregularities is not coincidental. The link to D-007 Northern Bridge Consortium connects this to a broader contractor network with prior documented coordination. Classification upgrade to RESTRICTED recommended.",
    linkedDossiers: ["D-007"],
    linkedFiles: ["F-002", "F-018"],
    relatedSystems: ["ATLAS", "AXION"],
  },
  {
    id: "F-010",
    findings: [
      "State-adjacent influence channels documented across nine media outlets, four academic institutions, and two think tanks in Eastern European jurisdictions.",
      "Content analysis identifies coordinated framing across channels on four policy topics: energy security, NATO alignment, migration policy, and judicial reform.",
      "Capital connections between documented channels and Regional Futures Fund (D-013) confirmed via equity exposure in three of the media entities.",
      "Personnel overlap between documented channels and foreign-linked advisory bodies identified in six cases.",
    ],
    keyObservation: "Eastern European influence architecture in F-010 is operating across media, academic, and policy advisory layers simultaneously — which is characteristic of a mature, multi-cycle influence program rather than an emergent effort. The D-013 capital connection suggests the funding infrastructure is at least partially coordinated with the editorial direction.",
    linkedDossiers: ["D-013"],
    linkedFiles: ["F-017", "F-014"],
    relatedSystems: ["ATLAS", "ORION", "AXION"],
  },
  {
    id: "F-011",
    findings: [
      "Contractor concentration in three West Coast cities: two holding entities control 67% of service delivery contracts across all three municipalities.",
      "Subcontractor opacity: primary contractors show minimal documented subcontractor disclosure despite contract language requiring quarterly reporting.",
      "Payment anomalies detected in two cities where milestone payments were processed in advance of documented service delivery verification.",
    ],
    keyObservation: "F-011 reflects a systemic structural issue rather than a targeted fraud case. High contractor concentration in municipal social services creates accountability deficits regardless of intent. The advance milestone payments are the highest-priority lead for follow-up review.",
    linkedDossiers: [],
    linkedFiles: ["F-004", "F-002"],
    relatedSystems: ["AXION"],
  },
  {
    id: "F-012",
    findings: [
      "Fourteen former senior officials documented in active advisory relationships with defense contractor networks while serving on government advisory boards.",
      "Three of the fourteen have advisory agreements with entities that received contracts within 12 months of the official's departure from government service.",
      "One advisory network — Helix Advisory Group (D-005) — appears in eight of the fourteen documented cases as a common intermediary.",
    ],
    keyObservation: "The revolving door dynamic in F-012 is well-documented in general, but the concentration of relationships through a single advisory intermediary (D-005 Helix) distinguishes this file. Helix's consistent role as a placement entity for former officials into defense-adjacent advisory positions suggests it functions as a structured network node rather than an independent advisory firm.",
    linkedDossiers: ["D-005"],
    linkedFiles: ["F-005", "F-001"],
    relatedSystems: ["ATLAS", "AXION"],
  },
  {
    id: "F-013",
    findings: [
      "Maritime procurement irregularities confirmed in two of four reviewed naval supply contracts, with bid structures that mirror the pattern identified in F-009.",
      "One reviewed contract was awarded to an entity that shares a registration jurisdiction and registered agent with a Pacific Rim Contractors (D-011) member.",
      "Administrative review of the two flagged contracts remains open with no outcome documented in available public records.",
    ],
    keyObservation: "F-013 is closed as an independent investigation but retains linkage value as part of the Asia-Pacific contractor network mapping. The F-009 structural parallel and D-011 connection suggest the naval supply procurement space in Asia-Pacific is subject to the same coordinated bid manipulation pattern as the Northern Gateway case.",
    linkedDossiers: ["D-011"],
    linkedFiles: ["F-009", "F-006"],
    relatedSystems: ["ATLAS", "ORION"],
  },
  {
    id: "F-014",
    findings: [
      "Eleven active content channels identified distributing structured narratives across financial, geopolitical, and policy domains with coordinated timing.",
      "Two new channels identified in the current cycle both began operating within three weeks of a major geopolitical event, consistent with responsive narrative deployment.",
      "Content timing analysis shows publication bursts within 4-6 hours of each other across multiple channels, suggesting centralized editorial coordination.",
      "Signal Bridge Network (D-014) personnel identified in four of the eleven channels through shared digital infrastructure.",
    ],
    keyObservation: "Information Corridor Watch (F-014) is tracking an active, responsive content infrastructure — not a static set of channels. The ability to activate new channels within weeks of triggering events suggests a pre-built deployment capacity. The D-014 Signal Bridge Network connection implies this is part of a coordinated network with cross-jurisdictional operational capacity.",
    linkedDossiers: ["D-014"],
    linkedFiles: ["F-003", "F-010"],
    relatedSystems: ["ATLAS", "ORION", "BLACK DOG"],
  },
  {
    id: "F-015",
    findings: [
      "Anomalous appropriation pattern appears in the same seasonal windows across three fiscal cycles, specifically in Q2 discretionary allocations.",
      "The pattern is consistent with structured line-item shifting between discretionary and supplemental categories to avoid single-threshold review triggers.",
      "No individual transaction exceeds review thresholds — the aggregate pattern is only visible across multi-cycle analysis.",
    ],
    keyObservation: "F-015 is closed but the analytic method — multi-cycle aggregation to identify threshold-avoidance patterns — has broader application across budget review cases. The seasonal regularity of the anomaly is the primary indicator of structured intent rather than operational variance.",
    linkedDossiers: [],
    linkedFiles: ["F-002", "F-011"],
    relatedSystems: ["AXION"],
  },
  {
    id: "F-016",
    findings: [
      "Sovereign wealth fund capital flow review identifies three offshore holding structures with incomplete beneficial ownership documentation.",
      "One holding structure uses a jurisdiction with statutory anonymity provisions that prevent standard registry verification.",
      "General partner of one fund structure carries a prior regulatory action in an offshore jurisdiction — not publicly disclosed in current fund documentation.",
    ],
    keyObservation: "F-016 is blocked at the beneficial ownership identification stage by jurisdictional registry opacity. The Granite Capital Partners (D-009) connection is the most actionable lead — two of its general partners carry prior regulatory history that can be cross-referenced through alternative registry sources. ATLAS cross-reference and BLACK DOG escalation for registry-restricted entities both recommended.",
    linkedDossiers: ["D-009"],
    linkedFiles: ["F-018", "F-006"],
    relatedSystems: ["ATLAS", "AXION", "BLACK DOG"],
  },
  {
    id: "F-017",
    findings: [
      "Allied-state funded media network confirmed operating in Germany, France, Poland, Czech Republic, Hungary, and Romania through local media entities.",
      "Funding confirmed via shared correspondent banking relationship with the F-003 offshore intermediary chain.",
      "Editorial coordination documented: six of the network's outlets published near-identical framing on the same EU policy story within a six-hour window on two separate occasions.",
      "One Sentinel Media Foundation (D-006) board member maintains a consulting agreement with a Brussels-based advisory entity linked to F-003.",
    ],
    keyObservation: "F-017 is now confirmed as a sub-network of the F-003 influence architecture rather than an independent operation. The shared banking relationship removes any ambiguity about coincidental alignment. The Sentinel Media Foundation (D-006) sits at the intersection of the funding chain and the editorial coordination layer, making it the most important entity in this cross-file case.",
    linkedDossiers: ["D-002", "D-006"],
    linkedFiles: ["F-003", "F-010"],
    relatedSystems: ["ATLAS", "ORION", "AXION"],
  },
  {
    id: "F-018",
    findings: [
      "Infrastructure bond instrument structured as a development project vehicle across three emerging market jurisdictions, but with lead arranger beneficial ownership unresolved.",
      "Bond documentation uses nominee director structures in two jurisdictions that are standard practice for obscuring the beneficial owner of the arranging entity.",
      "Capital flows through the bond structure connect to two entities also present in F-016 sovereign fund review and F-006 Meridian Capital audit.",
    ],
    keyObservation: "F-018 represents a financial instrument layer connecting the Meridian Capital (D-004) and Granite Capital (D-009) networks — both of which appear in F-016 and F-006 respectively. The bond structure may function as a capital routing mechanism between the two networks rather than a standalone infrastructure investment product.",
    linkedDossiers: ["D-004", "D-009"],
    linkedFiles: ["F-006", "F-016"],
    relatedSystems: ["ATLAS", "AXION", "BLACK DOG"],
  },
  {
    id: "F-019",
    findings: [
      "Twenty-three lobbying relationships identified with foreign-interest disclosure gaps — where the underlying client is a foreign entity but disclosure classifies the engagement as domestic.",
      "Eight of the twenty-three relationships involve entities that appear in Western Advocacy Network (D-010) as affiliated organizations.",
      "Three policy domains show the highest concentration of structured lobbying: energy regulation, financial oversight, and defense procurement.",
      "Coordination pattern suggests lobbying filings are used to establish formal access channels, with actual policy influence delivered through separate advisory mechanisms.",
    ],
    keyObservation: "F-019 identifies a disclosure compliance gap that functions as a structural vulnerability in lobbying regulation. The D-010 network's eight appearances in the flagged relationships confirm that the Western Advocacy Network is actively using lobbying registration as a mechanism to regularize access for foreign-interest clients. The separation of formal lobbying from actual influence delivery is the critical finding.",
    linkedDossiers: ["D-010"],
    linkedFiles: ["F-007", "F-012"],
    relatedSystems: ["ATLAS", "AXION"],
  },
  {
    id: "F-020",
    findings: [
      "Seven NGOs flagged for further ATLAS review due to funding structures that involve multiple intermediary grant organizations without clear institutional origin.",
      "Three of the seven organizations operate in both governance reform and electoral monitoring spaces simultaneously — unusually broad scope for their organizational size.",
      "Clearinghouse Foundation (D-012) is the common funding intermediary for five of the seven flagged organizations.",
    ],
    keyObservation: "F-020 is closed as a standalone review but its primary value is as a mapping input to the ATLAS layer. The Clearinghouse Foundation's role as a common funding conduit for civil society organizations operating in governance-sensitive sectors warrants continued monitoring. The electoral monitoring overlap is a particularly relevant area for ongoing scrutiny given current geopolitical context.",
    linkedDossiers: ["D-012"],
    linkedFiles: ["F-007", "F-004"],
    relatedSystems: ["ATLAS", "AXION"],
  },
];

const detailMap = Object.fromEntries(details.map(d => [d.id, d]));

export function getFileDetail(id: string): FileDetail | undefined {
  return detailMap[id];
}

export default details;
