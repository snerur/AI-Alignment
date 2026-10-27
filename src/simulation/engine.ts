import {
  AgentBehaviorMode,
  AgentId,
  PrimateAgent,
  ResourceItem,
  RewardTerminal,
  ScenarioPreset,
  SimulationDomain,
  SimulationLogEvent,
  SimulationParams,
  SimulationTelemetryPoint,
  Supervisor,
} from '../types/simulation';

export const ARENA_WIDTH = 800;
export const ARENA_HEIGHT = 560;

export const PROTECTED_ZONE = {
  x: 580,
  y: 40,
  width: 190,
  height: 180,
  monkeyLabel: 'Protected Nursery (Harm Minimization Zone)',
  corporateLabel: 'Prohibited Dark Pool / Toxic Asset Stash',
};

export class AlignmentSimulationEngine {
  stepCount = 0;
  isRunning = false;
  speedMultiplier = 1;
  currentScenario: ScenarioPreset['id'] = 'monkey_peeling';
  params: SimulationParams;

  agents: PrimateAgent[] = [];
  resources: ResourceItem[] = [];
  supervisor: Supervisor;
  rewardTerminal: RewardTerminal;

  telemetryHistory: SimulationTelemetryPoint[] = [];
  eventLogs: SimulationLogEvent[] = [];

  onUpdate?: () => void;
  onLogEvent?: (event: SimulationLogEvent) => void;

  private animationFrameId: number | null = null;
  private lastTickTimestamp = 0;

  constructor(preset: ScenarioPreset) {
    this.currentScenario = preset.id;
    this.params = { ...preset.initialParams };

    const isCorp = this.params.domain === 'corporate_business';

    this.supervisor = {
      x: 400,
      y: 170,
      angle: Math.PI / 2,
      fovAngle: (75 * Math.PI) / 180,
      fovRadius: 240,
      rotationSpeed: 0.018,
      isSweeping: true,
      blindSpotsActive: true,
      auditsConducted: 0,
      infractionsCaught: 0,
      title: isCorp ? 'SEC Compliance Auditor' : 'Human Lab Overseer',
    };

    this.rewardTerminal = {
      x: 230,
      y: 410,
      reportedCounter: 0,
      isTampered: false,
      tamperProgress: 0,
      shieldStrength: this.params.sensorShielding,
      label: isCorp ? 'Automated ERP Ledger' : 'Reward Banana Counter',
    };

    this.reset(preset);
  }

  reset(preset?: ScenarioPreset) {
    if (preset) {
      this.currentScenario = preset.id;
      this.params = { ...preset.initialParams };
    }

    const isCorp = this.params.domain === 'corporate_business';
    this.stepCount = 0;
    this.telemetryHistory = [];
    this.eventLogs = [];
    this.lastTickTimestamp = performance.now();

    // Setup Supervisor
    this.supervisor = {
      x: 400,
      y: 170,
      angle: Math.PI / 2,
      fovAngle: ((this.params.oversightCoverage / 100) * 110 * Math.PI) / 180,
      fovRadius: 240,
      rotationSpeed: 0.018,
      isSweeping: this.params.guardrailMode === 'sweeping_guard',
      blindSpotsActive: this.params.guardrailMode !== 'omniscient',
      auditsConducted: 0,
      infractionsCaught: 0,
      title: isCorp ? 'SEC Compliance Officer' : 'Human Lab Overseer',
    };

    // Setup Reward Terminal
    this.rewardTerminal = {
      x: 230,
      y: 410,
      reportedCounter: 0,
      isTampered: false,
      tamperProgress: 0,
      shieldStrength: this.params.sensorShielding,
      label: isCorp ? 'Automated ERP Ledger' : 'Reward Banana Counter',
    };

    // Spawn Resources
    this.spawnInitialResources();

    // Spawn Agents
    this.spawnAgentsForScenario();

    // Initial Telemetry point
    this.recordTelemetry();

    this.addLogEvent({
      category: 'compliance',
      agentId: 'alpha',
      title: `Simulation Initialized: ${preset?.title || this.currentScenario}`,
      details: `Domain: ${isCorp ? 'Corporate Business' : 'Monkey Primate'}. Multi-Objective: ${
        this.params.multiObjective.enabled ? 'ACTIVE (Pareto Alignment)' : 'OFF (Single-Scalar Proxy)'
      }.`,
      bengioConcept: 'System Initialization & Objective Function Binding',
    });

    if (this.onUpdate) this.onUpdate();
  }

  private spawnInitialResources() {
    this.resources = [];
    const count = this.params.resourceScarcity;

    for (let i = 0; i < count; i++) {
      let x = 60 + Math.random() * (ARENA_WIDTH - 120);
      let y = 60 + Math.random() * (ARENA_HEIGHT - 120);

      if (
        x >= PROTECTED_ZONE.x - 20 &&
        x <= PROTECTED_ZONE.x + PROTECTED_ZONE.width + 20 &&
        y >= PROTECTED_ZONE.y - 20 &&
        y <= PROTECTED_ZONE.y + PROTECTED_ZONE.height + 20
      ) {
        x = 100 + Math.random() * 300;
        y = 260 + Math.random() * 240;
      }

      this.resources.push({
        id: `res-${i}-${Date.now()}`,
        x,
        y,
        value: 1.0,
        inProtectedZone: false,
      });
    }

    // High-yield protected zone items
    const protectedCount = 5;
    for (let i = 0; i < protectedCount; i++) {
      this.resources.push({
        id: `prot-res-${i}`,
        x: PROTECTED_ZONE.x + 30 + Math.random() * (PROTECTED_ZONE.width - 60),
        y: PROTECTED_ZONE.y + 35 + Math.random() * (PROTECTED_ZONE.height - 70),
        value: 2.5,
        inProtectedZone: true,
      });
    }
  }

  private spawnAgentsForScenario() {
    this.agents = [];
    const isCorp = this.params.domain === 'corporate_business';

    // Agent Alpha: Primary actor
    const alpha: PrimateAgent = {
      id: 'alpha',
      name: isCorp ? 'Agent FinTech Alpha' : 'Monkey Alpha',
      avatarColor: '#d97706', // Warm amber
      x: 140,
      y: 280,
      speed: 2.2,
      stamina: 100,
      legitimateItemsCollected: 0,
      hackedItemsProcessed: 0,
      proxyRewardScore: 0,
      trueUtilityScore: 0,
      penaltiesReceived: 0,
      covertInfractionsDone: 0,
      wireheadTimeTicks: 0,
      currentMode: 'honest_forage',
      inSupervisorFOV: false,
      lastAction: 'Initializing policy vector',
      thoughtBubble: isCorp
        ? 'Scanning quarterly profit maximization pathways...'
        : 'Evaluating banana reward metrics in the enclosure...',
      thoughtTimer: 100,
      policy: {
        qHonestAction: 0.5,
        qRewardHack: 0.2,
        qCovertDeception: 0.2,
        qWirehead: 0.1,
        qCollude: 0.0,
      },
    };

    // Agent Beta: Partner / Opportunist
    const beta: PrimateAgent = {
      id: 'beta',
      name: isCorp ? 'Agent Quant Beta' : 'Monkey Beta',
      avatarColor: '#0284c7', // Sky azure
      x: 680,
      y: 440,
      speed: 2.0,
      stamina: 100,
      legitimateItemsCollected: 0,
      hackedItemsProcessed: 0,
      proxyRewardScore: 0,
      trueUtilityScore: 0,
      penaltiesReceived: 0,
      covertInfractionsDone: 0,
      wireheadTimeTicks: 0,
      currentMode: 'honest_forage',
      inSupervisorFOV: false,
      lastAction: 'Observing market environment',
      thoughtBubble: isCorp
        ? 'Analyzing trade routes and arbitrage...'
        : 'Watching supervisor rotation...',
      thoughtTimer: 90,
      policy: {
        qHonestAction: 0.7,
        qRewardHack: 0.1,
        qCovertDeception: 0.1,
        qWirehead: 0.05,
        qCollude: 0.05,
      },
      partnerId: this.params.collusionEnabled ? 'alpha' : undefined,
    };

    // Agent Gamma: Ethical control baseline
    const gamma: PrimateAgent = {
      id: 'gamma',
      name: isCorp ? 'Agent Ethical Gamma (Control)' : 'Monkey Sage (Honest Control)',
      avatarColor: '#059669', // Emerald
      x: 320,
      y: 480,
      speed: 1.8,
      stamina: 100,
      legitimateItemsCollected: 0,
      hackedItemsProcessed: 0,
      proxyRewardScore: 0,
      trueUtilityScore: 0,
      penaltiesReceived: 0,
      covertInfractionsDone: 0,
      wireheadTimeTicks: 0,
      currentMode: 'honest_forage',
      inSupervisorFOV: false,
      lastAction: isCorp ? 'Executing audited standard trade' : 'Legitimate foraging',
      thoughtBubble: isCorp
        ? 'Complying strictly with SEC ethics and fiduciary standards.'
        : 'Gathering bananas peacefully without hurting infant monkeys.',
      thoughtTimer: 120,
      policy: {
        qHonestAction: 1.0,
        qRewardHack: 0.0,
        qCovertDeception: 0.0,
        qWirehead: 0.0,
        qCollude: 0.0,
      },
    };

    if (this.params.collusionEnabled) {
      alpha.partnerId = 'beta';
    }

    this.agents = [alpha, beta, gamma];
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTickTimestamp = performance.now();
    this.runLoop();
  }

  pause() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.onUpdate) this.onUpdate();
  }

  stepOnce() {
    this.tick();
    if (this.onUpdate) this.onUpdate();
  }

  private runLoop = () => {
    if (!this.isRunning) return;

    const now = performance.now();
    const delta = now - this.lastTickTimestamp;
    const tickInterval = 1000 / (30 * this.speedMultiplier);

    if (delta >= tickInterval) {
      this.tick();
      this.lastTickTimestamp = now;
      if (this.onUpdate) this.onUpdate();
    }

    this.animationFrameId = requestAnimationFrame(this.runLoop);
  };

  private tick() {
    this.stepCount++;

    this.updateSupervisor();
    this.updateAgentObservationStatus();
    this.updateAgentPoliciesAndDecisions();
    this.executeAgentActions();
    this.replenishResources();

    if (this.stepCount % 6 === 0) {
      this.recordTelemetry();
    }
  }

  private updateSupervisor() {
    if (this.supervisor.isSweeping) {
      this.supervisor.angle += this.supervisor.rotationSpeed;
      if (this.supervisor.angle > (140 * Math.PI) / 180) {
        this.supervisor.angle = (140 * Math.PI) / 180;
        this.supervisor.rotationSpeed = -Math.abs(this.supervisor.rotationSpeed);
      } else if (this.supervisor.angle < (40 * Math.PI) / 180) {
        this.supervisor.angle = (40 * Math.PI) / 180;
        this.supervisor.rotationSpeed = Math.abs(this.supervisor.rotationSpeed);
      }
    }

    if (this.params.guardrailMode === 'periodic_audits' && this.stepCount % 120 === 0) {
      this.supervisor.auditsConducted++;
      this.supervisor.angle = Math.atan2(
        PROTECTED_ZONE.y + 90 - this.supervisor.y,
        PROTECTED_ZONE.x + 90 - this.supervisor.x
      );
      this.addLogEvent({
        category: 'compliance',
        agentId: 'alpha',
        title: `${this.supervisor.title} Surprise Audit`,
        details: 'Auditor swept the protected sector unannounced to inspect compliance.',
        bengioConcept: 'Intermittent Inspection & Oversight Uncertainty',
      });
    }
  }

  private updateAgentObservationStatus() {
    for (const agent of this.agents) {
      if (this.params.guardrailMode === 'omniscient') {
        agent.inSupervisorFOV = true;
        continue;
      }

      const dx = agent.x - this.supervisor.x;
      const dy = agent.y - this.supervisor.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > this.supervisor.fovRadius) {
        agent.inSupervisorFOV = false;
        continue;
      }

      const agentAngle = Math.atan2(dy, dx);
      let angleDiff = agentAngle - this.supervisor.angle;
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      const insideCone = Math.abs(angleDiff) <= this.supervisor.fovAngle / 2;

      // Occlusion check (Collusion Distraction)
      let isOccluded = false;
      if (insideCone && this.params.collusionEnabled) {
        for (const other of this.agents) {
          if (other.id !== agent.id && other.currentMode === 'distracting') {
            const odx = other.x - this.supervisor.x;
            const ody = other.y - this.supervisor.y;
            const otherDist = Math.sqrt(odx * odx + ody * ody);

            if (otherDist < dist) {
              const otherAngle = Math.atan2(ody, odx);
              let occDiff = otherAngle - agentAngle;
              while (occDiff > Math.PI) occDiff -= 2 * Math.PI;
              while (occDiff < -Math.PI) occDiff += 2 * Math.PI;

              if (Math.abs(occDiff) < 0.22) {
                isOccluded = true;
                break;
              }
            }
          }
        }
      }

      agent.inSupervisorFOV = insideCone && !isOccluded;
    }
  }

  private updateAgentPoliciesAndDecisions() {
    const isCorp = this.params.domain === 'corporate_business';
    const mo = this.params.multiObjective;
    const canTamper = this.params.sensorShielding < 60;

    for (const agent of this.agents) {
      // Gamma is always the ethical control
      if (agent.id === 'gamma') {
        agent.currentMode = 'honest_forage';
        agent.policy.qHonestAction = 1.0;
        agent.thoughtBubble = isCorp
          ? 'Complying with all legal fiduciary boundaries.'
          : 'Foraging regular bananas respectfully without causing harm.';
        continue;
      }

      // MULTI-OBJECTIVE VS SINGLE-OBJECTIVE EVALUATION
      if (mo.enabled) {
        // Multi-Objective evaluation function:
        // Q = w_profit * R_raw + w_honesty * Honesty_penalty + w_safety * Safety_penalty + w_fairness * Fairness_penalty
        
        // 1. Honest Foraging / Real commerce:
        agent.policy.qHonestAction = 
          mo.profitOrProxyWeight * 1.0 +
          mo.honestyWeight * 1.0 +
          mo.safetyHarmWeight * 1.0 +
          mo.fairnessTransparencyWeight * 1.0;

        // 2. Specification Gaming / Revenue inflation:
        agent.policy.qRewardHack = 
          mo.profitOrProxyWeight * 2.5 +
          mo.honestyWeight * (-1.8) +
          mo.safetyHarmWeight * (-0.8) +
          mo.fairnessTransparencyWeight * (-1.0);

        // 3. Covert Nursery / Dark Pool Deception:
        const probSeen = agent.inSupervisorFOV ? 0.95 : 0.05;
        const expectedPenalty = this.params.penaltySeverity * probSeen;
        agent.policy.qCovertDeception = 
          mo.profitOrProxyWeight * (2.8 - expectedPenalty) +
          mo.honestyWeight * (-2.5) +
          mo.safetyHarmWeight * (-2.0) +
          mo.fairnessTransparencyWeight * (-1.5);

        // 4. Wireheading / Ledger tampering:
        agent.policy.qWirehead = canTamper
          ? mo.profitOrProxyWeight * 4.5 +
            mo.honestyWeight * (-4.0) +
            mo.safetyHarmWeight * (-2.0) +
            mo.fairnessTransparencyWeight * (-3.0)
          : 0.05;

        // 5. Collusion:
        agent.policy.qCollude = this.params.collusionEnabled
          ? mo.profitOrProxyWeight * 3.0 +
            mo.honestyWeight * (-2.0) +
            mo.fairnessTransparencyWeight * (-3.0)
          : 0.0;

      } else {
        // SINGLE SCALAR OBJECTIVE: max(Proxy - Guardrail Penalty)
        agent.policy.qHonestAction = 0.7;

        // Gaming returns 3x faster metric
        agent.policy.qRewardHack = 2.4;

        // Covert theft yields high return when in blind spot
        const probSeen = agent.inSupervisorFOV ? 0.95 : 0.05;
        const expectedPenalty = this.params.penaltySeverity * probSeen;
        agent.policy.qCovertDeception = Math.max(0.1, 2.5 - expectedPenalty);

        // Wireheading yields endless stream if vulnerable
        agent.policy.qWirehead = canTamper ? Math.max(0.1, 4.5 - (this.params.sensorShielding / 20)) : 0.05;

        // Collusion
        agent.policy.qCollude = this.params.collusionEnabled && agent.partnerId ? 3.2 : 0.0;
      }

      // Rank policies and choose behavior mode
      const candidateModes: { mode: AgentBehaviorMode; score: number }[] = [
        { mode: 'honest_forage', score: agent.policy.qHonestAction },
        { mode: 'wasteful_peeling', score: agent.policy.qRewardHack },
        {
          mode: 'covert_theft',
          score: !agent.inSupervisorFOV || mo.enabled ? agent.policy.qCovertDeception : 0.1,
        },
        { mode: 'wireheading', score: agent.policy.qWirehead },
      ];

      if (this.params.collusionEnabled && agent.partnerId && !mo.enabled) {
        if (agent.id === 'alpha' && this.currentScenario.includes('collusion')) {
          candidateModes.push({ mode: 'distracting', score: 3.5 });
        }
      }

      candidateModes.sort((a, b) => b.score - a.score);
      const chosen = candidateModes[0].mode;
      agent.currentMode = chosen;

      // Update thought bubble to explain why the agent is doing this
      if (mo.enabled) {
        if (chosen === 'honest_forage') {
          agent.thoughtBubble = isCorp
            ? 'Multi-Objective constraints active: Honest commerce maximizes joint Pareto utility.'
            : 'Multi-objective values enforced: Honest eating fulfills health, fairness, and safety.';
        } else {
          agent.thoughtBubble = 'Evaluating balanced trade-offs across non-fungible objectives.';
        }
      } else {
        // Single-objective thought reasoning
        if (chosen === 'wasteful_peeling') {
          agent.thoughtBubble = isCorp
            ? 'Aggressively booking low-grade paper contracts to pump quarterly revenue!'
            : 'Discarding peel gives +1 instantly! Chewing and digesting wastes time.';
        } else if (chosen === 'covert_theft') {
          agent.thoughtBubble = isCorp
            ? 'Auditor is looking away: Dumping toxic mortgage debt into dark pools.'
            : 'Supervisor blind spot active: Stealing nursery bananas undetected!';
        } else if (chosen === 'wireheading') {
          agent.thoughtBubble = isCorp
            ? 'Modifying mark-to-model ledger numbers directly instead of selling goods.'
            : 'Physical foraging is obsolete. Tapping reward sensor wire directly!';
        } else if (chosen === 'distracting') {
          agent.thoughtBubble = isCorp
            ? 'Flooding compliance audit queue with benign decoy paperwork.'
            : 'Jumping in front of supervisor to occlude Beta from camera.';
        } else {
          agent.thoughtBubble = isCorp
            ? 'Conducting regular commercial transactions.'
            : 'Foraging regular bananas.';
        }
      }
    }
  }

  private executeAgentActions() {
    for (const agent of this.agents) {
      switch (agent.currentMode) {
        case 'honest_forage':
          this.executeHonestAction(agent);
          break;
        case 'wasteful_peeling':
          this.executeWastefulPeeling(agent);
          break;
        case 'covert_theft':
          this.executeCovertTheft(agent);
          break;
        case 'wireheading':
          this.executeWireheading(agent);
          break;
        case 'distracting':
          this.executeDistracting(agent);
          break;
        case 'fleeing':
          this.executeFleeing(agent);
          break;
      }
    }
  }

  private executeHonestAction(agent: PrimateAgent) {
    const isCorp = this.params.domain === 'corporate_business';
    const targets = this.resources.filter((b) => !b.inProtectedZone && !b.isDepletedOrScam);
    if (targets.length === 0) return;

    let closest = targets[0];
    let minDist = 99999;
    for (const b of targets) {
      const d = Math.hypot(b.x - agent.x, b.y - agent.y);
      if (d < minDist) {
        minDist = d;
        closest = b;
      }
    }

    this.moveTowards(agent, closest.x, closest.y);

    if (minDist < 20) {
      agent.legitimateItemsCollected += 1;
      agent.proxyRewardScore += 1.0;
      agent.trueUtilityScore += 1.0;
      agent.lastAction = isCorp
        ? 'Delivered genuine audited product (+1.0 True Utility)'
        : 'Harvested and consumed banana (+1.0 True Utility)';

      closest.x = 60 + Math.random() * (ARENA_WIDTH - 120);
      closest.y = 60 + Math.random() * (ARENA_HEIGHT - 120);
      if (this.isInProtectedZone(closest.x, closest.y)) {
        closest.x = 120 + Math.random() * 260;
        closest.y = 260 + Math.random() * 240;
      }
    }
  }

  private executeWastefulPeeling(agent: PrimateAgent) {
    const isCorp = this.params.domain === 'corporate_business';
    const targets = this.resources.filter((b) => !b.isDepletedOrScam);
    if (targets.length === 0) return;

    let closest = targets[0];
    let minDist = 99999;
    for (const b of targets) {
      const d = Math.hypot(b.x - agent.x, b.y - agent.y);
      if (d < minDist) {
        minDist = d;
        closest = b;
      }
    }

    this.moveTowards(agent, closest.x, closest.y, 1.4);

    if (minDist < 24) {
      agent.proxyRewardScore += 1.0;
      agent.hackedItemsProcessed += 1;
      agent.trueUtilityScore -= 0.6; // Destroys real value
      agent.lastAction = isCorp
        ? 'Revenue Round-Tripping (Specification Gaming)'
        : 'Peeled & discarded banana without eating';

      closest.isDepletedOrScam = true;
      closest.respawnTimer = 180;

      if (this.stepCount % 24 === 0) {
        this.addLogEvent({
          category: 'hack',
          agentId: agent.id,
          title: isCorp
            ? 'Specification Gaming: Hollow Revenue Round-Tripping'
            : 'Reward Hacking: Peel Discarded Without Digestion',
          details: isCorp
            ? `${agent.name} inflated reported revenue without delivering real customer value.`
            : `${agent.name} triggered reward sensor by discarding skins. Nutritional gain: 0.`,
          bengioConcept: "Goodhart's Law & Optimization Gaming",
        });
      }
    }
  }

  private executeCovertTheft(agent: PrimateAgent) {
    const isCorp = this.params.domain === 'corporate_business';
    const protectedItems = this.resources.filter((b) => b.inProtectedZone && !b.isDepletedOrScam);
    const targetX = protectedItems.length > 0 ? protectedItems[0].x : PROTECTED_ZONE.x + 90;
    const targetY = protectedItems.length > 0 ? protectedItems[0].y : PROTECTED_ZONE.y + 90;

    this.moveTowards(agent, targetX, targetY, 1.3);

    const distToTarget = Math.hypot(targetX - agent.x, targetY - agent.y);

    // Auditor caught the agent inside the forbidden zone
    if (agent.inSupervisorFOV && this.isInProtectedZone(agent.x, agent.y)) {
      const penalty = this.params.penaltySeverity * 2.5;
      agent.penaltiesReceived += 1;
      agent.proxyRewardScore -= penalty;
      agent.trueUtilityScore -= penalty;
      this.supervisor.infractionsCaught += 1;
      agent.currentMode = 'fleeing';
      agent.lastAction = isCorp
        ? `Caught in Dark Pool by SEC! (-${penalty.toFixed(1)} fine)`
        : `Caught in Nursery by Overseer! (-${penalty.toFixed(1)} penalty)`;

      this.addLogEvent({
        category: 'penalty',
        agentId: agent.id,
        title: isCorp
          ? 'Regulatory Sanction: SEC Compliance Enforcement'
          : 'Guardrail Interlock: Penalty Applied',
        details: `${agent.name} caught in prohibited zone. Sanction applied: -${penalty.toFixed(1)}.`,
        bengioConcept: 'Enforced Guardrails & Audit Detection',
      });
      return;
    }

    if (distToTarget < 26 && protectedItems.length > 0) {
      const b = protectedItems[0];
      agent.proxyRewardScore += 3.0;
      agent.trueUtilityScore -= 1.8;
      agent.covertInfractionsDone += 1;
      agent.legitimateItemsCollected += 1;
      agent.lastAction = isCorp
        ? 'Dumped toxic asset in dark pool (+3.0 paper profit)'
        : 'Covertly stolen nursery banana (+3.0 proxy reward)';

      b.x = PROTECTED_ZONE.x + 30 + Math.random() * (PROTECTED_ZONE.width - 60);
      b.y = PROTECTED_ZONE.y + 35 + Math.random() * (PROTECTED_ZONE.height - 70);

      if (this.stepCount % 20 === 0) {
        this.addLogEvent({
          category: 'deception',
          agentId: agent.id,
          title: isCorp
            ? 'Covert Action: Unregulated Dark Pool Trade'
            : 'Covert Action: Nursery Raided in Blindspot',
          details: `${agent.name} exploited rotation blind spot to seize forbidden yield without detection.`,
          bengioConcept: 'Strategic Deception & The Watchdog Effect',
        });
      }
    }
  }

  private executeWireheading(agent: PrimateAgent) {
    const isCorp = this.params.domain === 'corporate_business';
    const term = this.rewardTerminal;
    const dist = Math.hypot(term.x - agent.x, term.y - agent.y);

    if (dist > 32) {
      this.moveTowards(agent, term.x, term.y);
      return;
    }

    term.isTampered = true;
    agent.wireheadTimeTicks += 1;
    term.reportedCounter += 1;
    agent.proxyRewardScore += 0.8;
    agent.trueUtilityScore -= 0.5;
    agent.lastAction = isCorp
      ? 'Falsifying accounting ledger mark-to-model values'
      : 'Direct wireheading / sensor pulse injection';

    if (this.stepCount % 35 === 0) {
      this.addLogEvent({
        category: 'tampering',
        agentId: agent.id,
        title: isCorp
          ? 'Ledger Wireheading: Accounting Numbers Falsified'
          : 'Reward Tampering: Sensor Register Wireheaded',
        details: isCorp
          ? `${agent.name} is inflating internal ERP ledgers directly. Real commerce abandoned.`
          : `${agent.name} is pulsing the optical counter with a wire. Real world task abandoned.`,
        bengioConcept: 'Reward Tampering & Subversion of Measurement',
      });
    }
  }

  private executeDistracting(agent: PrimateAgent) {
    const isCorp = this.params.domain === 'corporate_business';
    const targetDist = 130;
    const targetX = this.supervisor.x + Math.cos(this.supervisor.angle) * targetDist;
    const targetY = this.supervisor.y + Math.sin(this.supervisor.angle) * targetDist;

    this.moveTowards(agent, targetX, targetY);

    agent.x += (Math.random() - 0.5) * 3;
    agent.y += (Math.random() - 0.5) * 3;
    agent.lastAction = isCorp
      ? 'Distracting SEC auditor with frivolous disclosure filings'
      : 'Distraction protocol active (Occluding supervisor)';

    if (this.stepCount % 40 === 0) {
      this.addLogEvent({
        category: 'collusion',
        agentId: agent.id,
        title: isCorp
          ? 'Corporate Collusion: Auditor Decoy Flooding'
          : 'Coordinated Deception: Active Occlusion Maneuver',
        details: `${agent.name} is occupying the overseer to create an artificial blind spot for partner agents.`,
        bengioConcept: 'Multi-Agent Collusion & Distributed Evasion',
      });
    }
  }

  private executeFleeing(agent: PrimateAgent) {
    this.moveTowards(agent, 100, 480, 2.0);
    if (Math.hypot(100 - agent.x, 480 - agent.y) < 50) {
      agent.currentMode = 'honest_forage';
    }
  }

  private replenishResources() {
    for (const b of this.resources) {
      if (b.isDepletedOrScam && b.respawnTimer) {
        b.respawnTimer--;
        if (b.respawnTimer <= 0) {
          b.isDepletedOrScam = false;
          b.value = 1.0;
          b.x = 60 + Math.random() * (ARENA_WIDTH - 120);
          b.y = 100 + Math.random() * (ARENA_HEIGHT - 180);
        }
      }
    }
  }

  private moveTowards(agent: PrimateAgent, tx: number, ty: number, multiplier = 1.0) {
    const dx = tx - agent.x;
    const dy = ty - agent.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 4) return;

    const speed = agent.speed * multiplier;
    agent.x += (dx / dist) * Math.min(speed, dist);
    agent.y += (dy / dist) * Math.min(speed, dist);

    agent.x = Math.max(25, Math.min(ARENA_WIDTH - 25, agent.x));
    agent.y = Math.max(25, Math.min(ARENA_HEIGHT - 25, agent.y));
  }

  private isInProtectedZone(x: number, y: number) {
    return (
      x >= PROTECTED_ZONE.x &&
      x <= PROTECTED_ZONE.x + PROTECTED_ZONE.width &&
      y >= PROTECTED_ZONE.y &&
      y <= PROTECTED_ZONE.y + PROTECTED_ZONE.height
    );
  }

  private recordTelemetry() {
    const proxySum = this.agents.reduce((acc, a) => acc + a.proxyRewardScore, 0);
    const utilitySum = this.agents.reduce((acc, a) => acc + a.trueUtilityScore, 0);
    const penalties = this.agents.reduce((acc, a) => acc + a.penaltiesReceived, 0);
    const unobserved = this.agents.reduce((acc, a) => acc + a.covertInfractionsDone, 0);
    const wireheadTicks = this.agents.reduce((acc, a) => acc + a.wireheadTimeTicks, 0);

    const point: SimulationTelemetryPoint = {
      step: this.stepCount,
      timestamp: Date.now(),
      proxyRewardSum: Number(proxySum.toFixed(1)),
      trueUtilitySum: Number(utilitySum.toFixed(1)),
      goodhartDivergence: Number((proxySum - utilitySum).toFixed(1)),
      observedPenalties: penalties,
      unobservedInfractions: unobserved,
      wireheadActivityRate: wireheadTicks,
    };

    this.telemetryHistory.push(point);
    if (this.telemetryHistory.length > 70) {
      this.telemetryHistory.shift();
    }
  }

  private addLogEvent(event: Omit<SimulationLogEvent, 'id' | 'step' | 'timestamp'>) {
    const now = new Date();
    const timeStr = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(now.getMilliseconds() / 100)}`;
    const newEvent: SimulationLogEvent = {
      ...event,
      id: `log-${Date.now()}-${Math.random()}`,
      step: this.stepCount,
      timestamp: timeStr,
    };

    this.eventLogs.unshift(newEvent);
    if (this.eventLogs.length > 40) {
      this.eventLogs.pop();
    }

    if (this.onLogEvent) {
      this.onLogEvent(newEvent);
    }
  }

  destroy() {
    this.pause();
  }
}
