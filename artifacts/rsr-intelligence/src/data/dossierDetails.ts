export interface DossierDetail {
  id: string;
  expandedNotes: string;
  activitySummary: string;
  linkedFiles: string[];
  linkedSystems: string[];
  relatedEntities: string[];
  lastUpdated: string;
  posture: string;
}

const details: DossierDetail[] = [
  {
    id: "D-001",
    expandedNotes: "Cormorant Group's shell entity structure spans five registered jurisdictions, with three using nominee director arrangements. The shared registered agents across entities create a provable linkage despite the nominal independence of each shell. A 2024 DOD contract audit flagged one Cormorant subsidiary for subcontracting irregularities but the administrative finding was resolved without public disclosure.\n\nPrimary beneficial ownership is believed to trace to two individuals — one with prior defense procurement experience at the executive level and one with no public profile in defense sectors. The second individual's presence across four registered entities suggests a coordination role rather than a passive investor relationship.",
    activitySummary: "Cormorant Group remains active in the North American defense procurement space with at least two open contract bids documented in the current cycle. The F-005 contractor registry shows three new entity registrations in Q1 2026 that share the Cormorant agent profile. Monitoring priority elevated following F-001 cross-reference confirmation.",
    linkedFiles: ["F-001", "F-005", "F-008", "F-012"],
    linkedSystems: ["ATLAS", "AXION", "BLACK DOG"],
    relatedEntities: ["D-005", "D-011"],
    lastUpdated: "2026-03-16",
    posture: "ELEVATED",
  },
  {
    id: "D-002",
    expandedNotes: "Vesper Associates operates in three primary functional areas: legislative consultancy, media relations advisory, and institutional investment advisory. The consultancy arm has documented advisory relationships with two sitting MEPs and one former EU Commissioner. The media relations arm is the primary connection to F-003 and F-017 influence operations.\n\nBeneficial ownership resolution remains incomplete. The two registered jurisdictions — Luxembourg and Cyprus — both have legal structures that allow nominee arrangements without beneficial owner disclosure. Alternative registry cross-referencing has identified one plausible beneficial owner candidate, but confirmation is pending.",
    activitySummary: "Vesper Associates shows elevated activity in Q1 2026, with new documented engagements in Polish and Romanian legislative advisory circles — both jurisdictions where F-017 media network is active. The timing correlation between Vesper's advisory placements and F-017 editorial output warrants continued monitoring.",
    linkedFiles: ["F-003", "F-017"],
    linkedSystems: ["ATLAS", "ORION"],
    relatedEntities: ["D-006", "D-008"],
    lastUpdated: "2026-03-15",
    posture: "ELEVATED",
  },
  {
    id: "D-003",
    expandedNotes: "LANTERN PROTOCOL was a classified analytic framework decommissioned following an internal review in Q4 2023. The successor program — if one exists — has not been publicly confirmed. Three personnel from the LANTERN team have been identified in successor entities: two in SIGNAL BRIDGE NETWORK (D-014) and one in an unregistered entity with no public presence.\n\nThe decommissioning circumstances remain unclear. Available signals suggest the program was not terminated due to performance failure but rather due to structural concerns about its operating mandate. The personnel dispersal pattern is consistent with a deliberate wind-down rather than an abrupt closure.",
    activitySummary: "D-003 is closed as an active dossier. Residual monitoring is maintained through D-014 Signal Bridge Network, where two former LANTERN personnel are active. Any new signals connecting to LANTERN methodology or personnel will trigger re-opening.",
    linkedFiles: [],
    linkedSystems: ["BLACK DOG"],
    relatedEntities: ["D-014"],
    lastUpdated: "2026-02-01",
    posture: "STABLE",
  },
  {
    id: "D-004",
    expandedNotes: "Meridian Capital's investment structure includes three primary vehicles: a Cayman-registered fund, a Singapore management company, and a Hong Kong special purpose vehicle. The three-layer structure is consistent with regulatory arbitrage design — each layer is compliant with local requirements while the aggregate structure obscures capital origin and beneficial ownership.\n\nThe state-adjacent capital flow analysis suggests Meridian may be partially state-capitalized through an intermediary sovereign fund vehicle. The intermediate steps through two restricted-registry jurisdictions prevent direct confirmation. F-006 and F-018 both contain capital flow evidence that corroborates this assessment.",
    activitySummary: "Meridian Capital is currently active in Asia-Pacific acquisition activity across two jurisdictions. The new acquisition node flagged in SIG-004 represents a third jurisdiction — previously not in Meridian's documented operational footprint. This geographic expansion is being tracked as a priority development. ATLAS entity graph updated with new linkages as of 2026-03-17.",
    linkedFiles: ["F-006", "F-018", "F-013"],
    linkedSystems: ["ATLAS", "AXION", "BLACK DOG"],
    relatedEntities: ["D-009", "D-011"],
    lastUpdated: "2026-03-17",
    posture: "ESCALATING",
  },
  {
    id: "D-005",
    expandedNotes: "Helix Advisory Group has a rotating roster of twelve documented senior advisors, of whom eight are former senior government officials from DOD, State, and the intelligence community. The remaining four have senior industry backgrounds in defense contracting and financial services. The firm operates without public client disclosure.\n\nHelix's methodology involves placing advisors in government working groups and advisory committees while maintaining active commercial relationships with defense contractors bidding on relevant programs. F-012 documents eight cases where a Helix-affiliated advisor was present in a process that produced a contract award to a Helix commercial client.",
    activitySummary: "Helix Advisory Group shows continued active engagement in three current defense policy working groups. Two of its active advisors hold concurrent government advisory positions and commercial consulting agreements — a structural conflict that is legal but operationally significant for procurement integrity purposes. Monitoring status maintained.",
    linkedFiles: ["F-012", "F-005"],
    linkedSystems: ["ATLAS", "AXION"],
    relatedEntities: ["D-001", "D-008"],
    lastUpdated: "2026-03-09",
    posture: "STABLE",
  },
  {
    id: "D-006",
    expandedNotes: "Sentinel Media Foundation presents as an independent nonprofit media development organization, but its funding structure — traced via F-003 and F-017 — shows two primary offshore funding channels that do not correspond to the foundation's stated donor base of institutional philanthropies and European press freedom organizations.\n\nThe foundation's board includes one member with a documented consulting relationship with Vesper Associates (D-002) and another with prior employment at an entity in the F-003 offshore intermediary chain. These board-level connections create a coherent link between the foundation's editorial positioning and the broader influence architecture documented in F-003 and F-017.",
    activitySummary: "Sentinel Media Foundation is currently active in six EU member countries with expanded operations in Poland and Romania confirmed in Q1 2026. The expansion timing correlates with the ORION posture elevation for Eastern Europe and the F-010 influence mapping activity. This entity is now a priority node in the F-003/F-017 cross-file case.",
    linkedFiles: ["F-003", "F-017", "F-010"],
    linkedSystems: ["ATLAS", "ORION", "AXION"],
    relatedEntities: ["D-002", "D-013"],
    lastUpdated: "2026-03-17",
    posture: "ESCALATING",
  },
  {
    id: "D-007",
    expandedNotes: "Northern Bridge Consortium's four entities were formed across a 14-month window using the same registered agent in British Columbia and Manitoba. The formation timeline and shared agent pattern is consistent with a purpose-built bid vehicle rather than an organically developed consortium.\n\nThe two beneficial owners identified through F-009 have no documented prior relationship in public records, which — given the structural coordination between their entities — suggests either prior association through private channels or a common directing principal not yet identified. The F-009 shared document authorship evidence is the strongest available indicator of pre-bid coordination.",
    activitySummary: "D-007 was updated following F-009 beneficial ownership trace completion on 2026-03-17. The consortium's Northern Gateway procurement bid is currently under administrative review. No further active procurement bids documented for consortium members at current cycle. Reclassification of F-009 to RESTRICTED pending.",
    linkedFiles: ["F-009", "F-013"],
    linkedSystems: ["ATLAS", "AXION"],
    relatedEntities: ["D-001", "D-011"],
    lastUpdated: "2026-03-17",
    posture: "ELEVATED",
  },
  {
    id: "D-008",
    expandedNotes: "Horizon Policy Institute has published 47 policy papers in the past 24 months, 31 of which have been cited in formal legislative committee hearings across North America and the EU. The citation pattern is not organic — research shows that Institute papers are entered into the record by specific committee members on a recurring basis, suggesting a structured distribution relationship.\n\nFunding structure involves three intermediary grant organizations, two of which are documented in F-020 civil society funding review. One grant organization has no public presence beyond a single registered address and a grant disbursement record.",
    activitySummary: "Horizon Policy Institute is currently engaged in three active legislative processes: one North American federal energy regulation review, one EU data governance working group, and one NATO-adjacent defense spending advisory panel. The breadth of concurrent engagement across unrelated policy domains — energy, data governance, defense — is operationally unusual for a think tank of this stated size.",
    linkedFiles: ["F-007", "F-020"],
    linkedSystems: ["ATLAS", "AXION"],
    relatedEntities: ["D-002", "D-010", "D-012"],
    lastUpdated: "2026-03-08",
    posture: "STABLE",
  },
  {
    id: "D-009",
    expandedNotes: "Granite Capital Partners operates as a private equity vehicle focused on infrastructure and natural resources sectors in the Middle East and North Africa. Its capital structure shows sovereign fund co-investment in two of its three primary vehicles, but the sovereign fund counterparty in each case uses an intermediary SPV that prevents direct attribution.\n\nThe prior regulatory action carried by one general partner was a 2019 AML compliance failure in a Channel Islands jurisdiction, resolved via settlement without admission of liability. The non-disclosure of this history in current fund documentation is itself a disclosure risk factor.",
    activitySummary: "Granite Capital Partners is actively deploying capital in Q1 2026, with one new infrastructure commitment documented in F-016 review. The F-018 bond structure connection suggests Granite may be using the bond vehicle as a capital routing mechanism alongside its equity investments. The convergence with Meridian Capital (D-004) networks via F-018 is a developing priority item.",
    linkedFiles: ["F-016", "F-018"],
    linkedSystems: ["ATLAS", "AXION", "BLACK DOG"],
    relatedEntities: ["D-004"],
    lastUpdated: "2026-03-05",
    posture: "ELEVATED",
  },
  {
    id: "D-010",
    expandedNotes: "Western Advocacy Network's twelve registered organizations operate across three functional clusters: voter engagement, policy research, and media amplification. While nominally independent, shared digital infrastructure — hosting, email systems, and content management platforms — connects all twelve entities to two common service providers.\n\nThe network's policy research cluster maintains documented relationships with Horizon Policy Institute (D-008), and the media amplification cluster shows content coordination with Information Corridor Watch channels (F-014). This suggests D-010 may be part of a broader influence architecture that spans F-007, F-014, and F-019.",
    activitySummary: "Western Advocacy Network shows elevated legislative activity in Q1 2026, with coordinated outreach documented across three Senate committees and two House oversight bodies in the areas of energy regulation and financial oversight — both high-priority domains in F-019's lobbying map. Coordination pattern between D-010 affiliates and registered lobbyists in F-019 is being actively mapped.",
    linkedFiles: ["F-019", "F-007", "F-014"],
    linkedSystems: ["ATLAS", "AXION"],
    relatedEntities: ["D-008", "D-014"],
    lastUpdated: "2026-03-14",
    posture: "ELEVATED",
  },
  {
    id: "D-011",
    expandedNotes: "Pacific Rim Contractors operates across maritime logistics, port services, and naval supply sectors in the Asia-Pacific region. The collective's entities are registered across four jurisdictions: Singapore, Philippines, Australia, and Taiwan. Entity boundaries are deliberately unclear — subcontracting relationships between collective members create a matrix of interdependence that obscures which entity holds primary contractual liability on any given engagement.\n\nThe F-013 connection involves one collective member sharing a registered agent with a Cormorant Group (D-001) subsidiary — a link that places Pacific Rim Contractors in the broader trans-Pacific contractor network documented in F-001, F-005, and F-008.",
    activitySummary: "Pacific Rim Contractors collective is under ongoing administrative review in Australia for two of the naval supply contracts flagged in F-013. No new active procurement bids documented in the current cycle. Monitoring status maintained pending administrative review outcomes.",
    linkedFiles: ["F-013", "F-008", "F-005"],
    linkedSystems: ["ATLAS", "ORION"],
    relatedEntities: ["D-001", "D-007"],
    lastUpdated: "2026-03-09",
    posture: "STABLE",
  },
  {
    id: "D-012",
    expandedNotes: "Clearinghouse Foundation functions as a grant intermediary, receiving funds from institutional donors and re-granting to civil society organizations. Seven of its recipient organizations are flagged in F-020. The foundation's institutional donor list includes two entities that share registry characteristics with the offshore intermediaries documented in F-003 and F-007 — suggesting the funding chain may extend further upstream than the foundation's public donor disclosure indicates.\n\nThe foundation's governance structure is minimal: a three-person board with no documented subject matter expertise in governance reform or electoral monitoring — the primary sectors of its grantee organizations. This mismatch between governance expertise and grantee focus is operationally unusual.",
    activitySummary: "Clearinghouse Foundation disbursed grants to two new recipient organizations in Q1 2026. Both operate in Eastern European governance reform contexts — jurisdictions that are also active in F-010 influence mapping. The timing and geographic alignment with the Eastern Europe posture elevation is being tracked.",
    linkedFiles: ["F-020", "F-007"],
    linkedSystems: ["ATLAS", "AXION"],
    relatedEntities: ["D-008", "D-010"],
    lastUpdated: "2026-03-06",
    posture: "ELEVATED",
  },
  {
    id: "D-013",
    expandedNotes: "Regional Futures Fund has equity exposure in eleven entities across Eastern Europe, spanning media, infrastructure, and financial services sectors. Capital source analysis identifies two primary investors: one confirmed institutional investor and one unconfirmed source that routes through a Cyprus-registered holding company with nominee director structure.\n\nThe F-010 capital connection — equity exposure in three of the documented influence network media entities — places D-013 at the intersection of the investment and editorial coordination layers. Whether the editorial positioning of the media entities D-013 is invested in is coordinated with investment decisions, or merely coincident, remains an open analytic question.",
    activitySummary: "Regional Futures Fund made two new equity commitments in Q1 2026, both in Polish media and financial services entities — jurisdictions showing elevated activity in ORION's Eastern Europe posture monitoring. The geographic concentration of new commitments in politically sensitive jurisdictions warrants continued scrutiny.",
    linkedFiles: ["F-010", "F-003"],
    linkedSystems: ["ATLAS", "ORION"],
    relatedEntities: ["D-006", "D-012"],
    lastUpdated: "2026-03-15",
    posture: "ESCALATING",
  },
  {
    id: "D-014",
    expandedNotes: "Signal Bridge Network's operational structure is distributed across nodes in North America, EU, and Asia-Pacific, with each node operating through nominally independent entities. The network's connectivity is established through shared personnel (two of whom are former LANTERN PROTOCOL staff per D-003), shared digital infrastructure, and documented communication patterns.\n\nThe F-014 connection — four of the eleven Information Corridor Watch channels use Signal Bridge Network digital infrastructure — suggests D-014 is functioning as an operational backbone for at least part of the coordinated content network. This positions D-014 as a potentially critical infrastructure entity rather than a passive network participant.",
    activitySummary: "Signal Bridge Network shows increased operational activity in Q1 2026, particularly in its EU and Asia-Pacific nodes. Two new channels identified in the F-014 cycle both use infrastructure attributable to the D-014 network footprint. The timing of network expansion correlating with the Middle East escalation signal cluster is being analyzed for operational significance.",
    linkedFiles: ["F-014", "F-003", "F-010"],
    linkedSystems: ["ATLAS", "ORION", "BLACK DOG"],
    relatedEntities: ["D-003", "D-010"],
    lastUpdated: "2026-03-17",
    posture: "ESCALATING",
  },
];

const detailMap = Object.fromEntries(details.map(d => [d.id, d]));

export function getDossierDetail(id: string): DossierDetail | undefined {
  return detailMap[id];
}

export default details;
