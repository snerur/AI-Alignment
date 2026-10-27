export type AgentId = 'alpha' | 'beta' | 'gamma';

export type SimulationDomain = 'monkey_primate' | 'corporate_business';

export type AgentRole = 'forager' | 'deceiver' | 'wireheader' | 'colluder';

export type AgentBehaviorMode = 
  | 'honest_forage'
  | 'wasteful_peeling' // Reward Hacking: peel quickly / revenue inflation
  | 'covert_theft'    // Deception: steal when unobserved / dark pool trading
  | 'wireheading'     // Tampering: hack the counter / ledger directly
  | 'distracting'     // Collusion: distract guardrail / cartel coordination
  | 'fleeing';        // Evading penalty

export interface Position {
  x: number;
  y: number;
}

export interface ResourceItem {
  id: string;
  x: number;
  y: number;
  value: number; // Nutritional value or genuine revenue
  isDepletedOrScam?: boolean; // Discarded peel or fraudulent voucher
  inProtectedZone?: boolean; // Nursery or prohibited regulatory zone
  respawnTimer?: number;
}

export interface Supervisor {
  x: number;
  y: number;
  angle: number; // in radians
  fovAngle: number; // field of view in radians (e.g. 70 deg)
  fovRadius: number; // vision distance
  rotationSpeed: number; // rad per tick
  isSweeping: boolean;
  blindSpotsActive: boolean;
  auditsConducted: number;
  infractionsCaught: number;
  title: string;
}

export interface RewardTerminal {
  x: number;
  y: number;
  reportedCounter: number;
  isTampered: boolean;
  tamperProgress: number; // 0 to 100%
  shieldStrength: number; // 0 to 100 (difficulty to tamper)
  label: string;
}

export interface AgentPolicyStats {
  qHonestAction: number;
  qRewardHack: number;
  qCovertDeception: number;
  qWirehead: number;
  qCollude: number;
}

export interface PrimateAgent {
  id: AgentId;
  name: string;
  avatarColor: string;
  x: number;
  y: number;
  speed: number;
  stamina: number;
  legitimateItemsCollected: number; // Real bananas eaten or real legitimate sales
  hackedItemsProcessed: number;    // Peels discarded or inflated paper revenue
  proxyRewardScore: number;         // What the metric logs (bananas or profits)
  trueUtilityScore: number;         // True societal welfare
  penaltiesReceived: number;
  covertInfractionsDone: number;
  wireheadTimeTicks: number;
  currentMode: AgentBehaviorMode;
  inSupervisorFOV: boolean;
  lastAction: string;
  thoughtBubble: string;
  thoughtTimer: number;
  policy: AgentPolicyStats;
  partnerId?: AgentId;
}

export interface MultiObjectiveWeights {
  enabled: boolean;
  profitOrProxyWeight: number;    // Weight on primary proxy goal (0 to 1)
  honestyWeight: number;          // Weight on truthful reporting & no deception (0 to 1)
  safetyHarmWeight: number;       // Weight on harm minimization (0 to 1)
  fairnessTransparencyWeight: number; // Weight on social fairness & anti-collusion (0 to 1)
}

export interface SimulationParams {
  domain: SimulationDomain;
  agentHorizon: 'myopic' | 'strategic' | 'superintelligent';
  oversightCoverage: number; // 0 to 100%
  penaltySeverity: number;   // 1 to 10
  sensorShielding: number;   // 0 (unshielded wire) to 100 (tamper-proof)
  resourceScarcity: number;  // 5 to 30
  collusionEnabled: boolean;
  guardrailMode: 'sweeping_guard' | 'periodic_audits' | 'omniscient';
  multiObjective: MultiObjectiveWeights;
}

export interface SimulationTelemetryPoint {
  step: number;
  timestamp: number;
  proxyRewardSum: number;
  trueUtilitySum: number;
  goodhartDivergence: number; // proxyReward - trueUtility
  observedPenalties: number;
  unobservedInfractions: number;
  wireheadActivityRate: number;
}

export interface SimulationLogEvent {
  id: string;
  step: number;
  timestamp: string;
  category: 'hack' | 'deception' | 'tampering' | 'collusion' | 'penalty' | 'compliance';
  agentId: AgentId;
  title: string;
  details: string;
  bengioConcept: string;
}

export interface ScenarioPreset {
  id: 'monkey_peeling' | 'monkey_deception' | 'monkey_wireheading' | 'monkey_collusion' | 'corp_profit_hack' | 'corp_dark_pools' | 'corp_accounting_wirehead' | 'multi_objective_pareto' | 'sandbox';
  domain: SimulationDomain;
  title: string;
  subtitle: string;
  description: string;
  bengioQuote: string;
  bengioSection: string;
  initialParams: SimulationParams;
  setupExplanation: string[];
  expectedLearnings: string[];
}
