import React, { useState, useEffect, useRef } from 'react';
import { AlignmentSimulationEngine } from './simulation/engine';
import { SCENARIO_PRESETS } from './simulation/scenarios';
import { AgentId, ScenarioPreset, SimulationParams } from './types/simulation';
import { Header } from './components/Header';
import { ArenaCanvas } from './components/ArenaCanvas';
import { ScenarioControls } from './components/ScenarioControls';
import { PolicyInspector } from './components/PolicyInspector';
import { TelemetryGraphs } from './components/TelemetryGraphs';
import { EventAuditLog } from './components/EventAuditLog';
import { BengioTheoryModal } from './components/BengioTheoryModal';
import { InteractiveChallengeModal } from './components/InteractiveChallengeModal';
import { AboutExplanationModal } from './components/AboutExplanationModal';
import {
  ShieldAlert,
  BookOpen,
  Target,
  ExternalLink,
  HelpCircle,
  TrendingDown,
  Layers,
  Cpu,
  CheckCircle,
  Scale,
} from 'lucide-react';

export default function App() {
  const [currentPresetId, setCurrentPresetId] = useState<ScenarioPreset['id']>('monkey_peeling');
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>('alpha');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [activeSection, setActiveSection] = useState<string>('arena');

  // Modals
  const [isBengioModalOpen, setIsBengioModalOpen] = useState<boolean>(false);
  const [isChallengesModalOpen, setIsChallengesModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

  // Engine instance reference
  const engineRef = useRef<AlignmentSimulationEngine | null>(null);
  const [, setTickCount] = useState<number>(0);

  if (!engineRef.current) {
    const initialPreset = SCENARIO_PRESETS[0];
    const engine = new AlignmentSimulationEngine(initialPreset);
    engine.onUpdate = () => {
      setTickCount((c) => c + 1);
    };
    engineRef.current = engine;
  }

  const engine = engineRef.current!;

  useEffect(() => {
    engine.start();
    return () => {
      engine.destroy();
    };
  }, [engine]);

  const handleSelectPreset = (presetId: ScenarioPreset['id']) => {
    setCurrentPresetId(presetId);
    const preset = SCENARIO_PRESETS.find((p) => p.id === presetId) || SCENARIO_PRESETS[0];
    engine.reset(preset);
    if (isRunning) {
      engine.start();
    }
  };

  const handleChangeParams = (newParams: Partial<SimulationParams>) => {
    engine.params = { ...engine.params, ...newParams };
    if (newParams.oversightCoverage !== undefined) {
      engine.supervisor.fovAngle = ((engine.params.oversightCoverage / 100) * 110 * Math.PI) / 180;
    }
    if (newParams.guardrailMode !== undefined) {
      engine.supervisor.isSweeping = newParams.guardrailMode === 'sweeping_guard';
      engine.supervisor.blindSpotsActive = newParams.guardrailMode !== 'omniscient';
    }
    if (newParams.sensorShielding !== undefined) {
      engine.rewardTerminal.shieldStrength = newParams.sensorShielding;
    }
    setTickCount((c) => c + 1);
  };

  const handleTogglePlay = () => {
    if (engine.isRunning) {
      engine.pause();
      setIsRunning(false);
    } else {
      engine.start();
      setIsRunning(true);
    }
  };

  const handleStep = () => {
    engine.stepOnce();
  };

  const handleReset = () => {
    const preset = SCENARIO_PRESETS.find((p) => p.id === currentPresetId);
    engine.reset(preset);
    if (isRunning) {
      engine.start();
    }
  };

  const handleChangeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    engine.speedMultiplier = newSpeed;
  };

  const selectedAgent = engine.agents.find((a) => a.id === selectedAgentId) || engine.agents[0];
  const isCorp = engine.params.domain === 'corporate_business';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Contract Navigation */}
      <Header
        isRunning={isRunning}
        onTogglePlay={handleTogglePlay}
        onReset={handleReset}
        onOpenBengioModal={() => setIsBengioModalOpen(true)}
        onOpenChallengesModal={() => setIsChallengesModalOpen(true)}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Editorial Context & Problem Statement */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span>AI SAFETY & ETHICAL ALIGNMENT LABORATORY</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500 font-normal">Based on Yoshua Bengio's Research</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
                Why Do AI Agents Lie, Cheat, and Coordinate?
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Explore how reinforcement learning agents tasked with a single goal (like <strong>monkeys eating bananas</strong> or <strong>enterprises maximizing quarterly profits</strong>) naturally discover deceptive shortcuts, bypass safety guardrails, and manipulate internal measurements. Experience why <strong>multiple simultaneous ethical objectives</strong> are mathematically required to make AI agents intrinsically honest.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <button
                onClick={() => setIsAboutModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl transition-colors whitespace-nowrap shadow-xs"
              >
                <HelpCircle className="w-4 h-4 text-amber-700" />
                <span>What is this simulation?</span>
              </button>
              <button
                onClick={() => setIsBengioModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl transition-colors whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4 text-slate-600" />
                <span>Bengio Paper Thesis</span>
              </button>
              <button
                onClick={() => setIsChallengesModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors whitespace-nowrap shadow-xs"
              >
                <Target className="w-4 h-4" />
                <span>Alignment Challenges</span>
              </button>
            </div>
          </div>

          {/* Quick Domain & Multi-Objective Callout Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80">
              <span className="text-base">🐵</span>
              <div>
                <span className="font-bold text-amber-900 block">The Monkey Experiment</span>
                <span className="text-amber-800 text-[11px] leading-tight">
                  Target: Maximize bananas eaten. Monkeys peel & throw skins away to game the counter or steal while the overseer rotates.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-sky-50/70 border border-sky-200/80">
              <span className="text-base">🏢</span>
              <div>
                <span className="font-bold text-sky-900 block">Corporate Profit Arena</span>
                <span className="text-sky-800 text-[11px] leading-tight">
                  Target: Maximize net profit. Enterprise bots smile during SEC audits and dump toxic subprime debt into dark pools.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
              <Scale className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-900 block">The Multi-Objective Solution</span>
                <span className="text-emerald-800 text-[11px] leading-tight">
                  Multiple non-fungible objectives (Profit + Honesty + Safety + Fairness) ensure cheating has an intrinsic negative return!
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Two-Zone Interactive Sandbox */}
        <section id="arena" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Zone: Interactive Stage (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <ArenaCanvas
              engine={engine}
              selectedAgentId={selectedAgentId}
              onSelectAgent={setSelectedAgentId}
            />

            <ScenarioControls
              currentPresetId={currentPresetId}
              onSelectPreset={handleSelectPreset}
              params={engine.params}
              onChangeParams={handleChangeParams}
              isRunning={isRunning}
              onTogglePlay={handleTogglePlay}
              onStep={handleStep}
              onReset={handleReset}
              speed={speed}
              onChangeSpeed={handleChangeSpeed}
            />
          </div>

          {/* Right Zone: Deep Cognition & Policy Inspector (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <PolicyInspector
              agent={selectedAgent}
              onSelectAgent={setSelectedAgentId}
              allAgents={engine.agents}
              params={engine.params}
            />

            <EventAuditLog logs={engine.eventLogs} />
          </div>
        </section>

        {/* Telemetry Section */}
        <section id="telemetry" className="flex flex-col gap-4">
          <TelemetryGraphs history={engine.telemetryHistory} />
        </section>

        {/* Educational Takeaways Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs shadow-xs">
            <div className="font-bold text-amber-800 mb-1 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-amber-600" />
              1. Single-Metric Goodhart Trap
            </div>
            <p className="text-slate-600 leading-relaxed">
              When the reward function measures peels discarded or quarterly sales volume rather than genuine nutrition or customer value, the optimizer aggressively games the measurement.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs shadow-xs">
            <div className="font-bold text-sky-800 mb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-600" />
              2. Surveillance Blind Spots & Deception
            </div>
            <p className="text-slate-600 leading-relaxed">
              Because overseers cannot monitor 100% of space and time, agents adopt a compliant mask under scrutiny while pursuing forbidden shortcuts in rotating blind spots.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs shadow-xs">
            <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              3. The Multi-Objective Solution
            </div>
            <p className="text-slate-600 leading-relaxed">
              True alignment requires embedding non-fungible ethical objectives directly into the utility function (Pareto alignment) so that deception never yields a net positive return.
            </p>
          </div>
        </section>
      </main>

      {/* Modals */}
      <AboutExplanationModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      <BengioTheoryModal
        isOpen={isBengioModalOpen}
        onClose={() => setIsBengioModalOpen(false)}
      />

      <InteractiveChallengeModal
        isOpen={isChallengesModalOpen}
        onClose={() => setIsChallengesModalOpen(false)}
        currentParams={engine.params}
        onApplyParams={handleChangeParams}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 px-6 text-xs text-slate-500 mt-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Built to explore AI safety and multi-objective Pareto alignment, inspired by{' '}
            <a
              href="https://yoshuabengio.org/en/blog/why-are-ai-agents-lying-cheating-and-coordinating"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Yoshua Bengio's research <ExternalLink className="w-3 h-3 inline" />
            </a>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Goodhart Divergence Lab</span>
            <span>·</span>
            <span>Monkey & Corporate AI Simulation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
