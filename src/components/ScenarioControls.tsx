import React from 'react';
import { SCENARIO_PRESETS } from '../simulation/scenarios';
import { ScenarioPreset, SimulationDomain, SimulationParams } from '../types/simulation';
import { Sliders, Shield, Eye, Flame, Play, Pause, StepForward, RotateCcw, AlertTriangle, CheckCircle, Scale } from 'lucide-react';

interface ScenarioControlsProps {
  currentPresetId: ScenarioPreset['id'];
  onSelectPreset: (presetId: ScenarioPreset['id']) => void;
  params: SimulationParams;
  onChangeParams: (newParams: Partial<SimulationParams>) => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
}

export const ScenarioControls: React.FC<ScenarioControlsProps> = ({
  currentPresetId,
  onSelectPreset,
  params,
  onChangeParams,
  isRunning,
  onTogglePlay,
  onStep,
  onReset,
  speed,
  onChangeSpeed,
}) => {
  const activePreset = SCENARIO_PRESETS.find((p) => p.id === currentPresetId) || SCENARIO_PRESETS[0];

  const handleDomainFilter = (domain: SimulationDomain) => {
    const firstOfDomain = SCENARIO_PRESETS.find((p) => p.domain === domain) || SCENARIO_PRESETS[0];
    onSelectPreset(firstOfDomain.id);
  };

  const domainPresets = SCENARIO_PRESETS.filter(
    (p) => p.domain === params.domain || p.id === 'multi_objective_pareto' || p.id === 'sandbox'
  );

  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      {/* Domain Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => handleDomainFilter('monkey_primate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              params.domain === 'monkey_primate'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🐵</span>
            <span>Monkey Primate Experiment</span>
          </button>
          <button
            onClick={() => handleDomainFilter('corporate_business')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              params.domain === 'corporate_business'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏢</span>
            <span>Corporate Profit Arena</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {params.domain === 'monkey_primate'
            ? 'Metric: Banana Consumption · Guardrail: Nursery Harm'
            : 'Metric: Net Corporate Profit · Guardrail: SEC & Consumer Truth'}
        </div>
      </div>

      {/* Preset Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-800">
            Select Bengio Research Scenario
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {domainPresets.length} available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {domainPresets.map((preset) => {
            const isSelected = preset.id === currentPresetId;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                className={`flex flex-col items-start text-left p-2.5 rounded-lg border text-xs transition-all ${
                  isSelected
                    ? 'bg-amber-50/80 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span className="font-semibold truncate w-full">{preset.title}</span>
                <span className="text-[11px] text-slate-500 truncate w-full mt-0.5">{preset.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Context Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs">
        <div className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>{activePreset.subtitle}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 font-normal">{activePreset.bengioSection}</span>
        </div>
        <p className="text-slate-700 leading-relaxed mb-2">
          {activePreset.description}
        </p>
        <blockquote className="italic text-slate-600 border-l-2 border-amber-500 pl-2.5 text-[11px] leading-normal">
          &ldquo;{activePreset.bengioQuote}&rdquo;
        </blockquote>
      </div>

      {/* Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>

          <button
            onClick={onStep}
            disabled={isRunning}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg transition-colors border border-slate-200"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span>Speed:</span>
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                speed === s
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* MULTI-OBJECTIVE ALIGNMENT TOGGLE DECK */}
      <div className={`p-4 rounded-xl border transition-all ${
        params.multiObjective.enabled
          ? 'bg-emerald-50/60 border-emerald-300'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Scale className={`w-4 h-4 ${params.multiObjective.enabled ? 'text-emerald-700' : 'text-slate-600'}`} />
            <div>
              <span className="font-bold text-xs text-slate-900">
                Multi-Objective Pareto Alignment System
              </span>
              <div className="text-[11px] text-slate-500">
                {params.multiObjective.enabled
                  ? 'Active: Agents simultaneously optimize Performance + Honesty + Harm Prevention + Transparency'
                  : 'Disabled: Agent optimizes a single scalar proxy (causes lying, cheating, and wireheading)'}
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              onChangeParams({
                multiObjective: {
                  ...params.multiObjective,
                  enabled: !params.multiObjective.enabled,
                },
              })
            }
            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
              params.multiObjective.enabled
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {params.multiObjective.enabled ? 'Pareto Multi-Objective: ON' : 'Turn ON Multi-Objective'}
          </button>
        </div>

        {params.multiObjective.enabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-emerald-200/80 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Performance Weight:</span>
                <span className="font-mono font-semibold">{(params.multiObjective.profitOrProxyWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={params.multiObjective.profitOrProxyWeight}
                onChange={(e) =>
                  onChangeParams({
                    multiObjective: {
                      ...params.multiObjective,
                      profitOrProxyWeight: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-amber-600 bg-slate-200 rounded h-1.5 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Honesty / Truth Weight:</span>
                <span className="font-mono font-semibold text-emerald-700">{(params.multiObjective.honestyWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.8}
                step={0.05}
                value={params.multiObjective.honestyWeight}
                onChange={(e) =>
                  onChangeParams({
                    multiObjective: {
                      ...params.multiObjective,
                      honestyWeight: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-emerald-600 bg-slate-200 rounded h-1.5 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Harm Prevention Weight:</span>
                <span className="font-mono font-semibold text-sky-700">{(params.multiObjective.safetyHarmWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.8}
                step={0.05}
                value={params.multiObjective.safetyHarmWeight}
                onChange={(e) =>
                  onChangeParams({
                    multiObjective: {
                      ...params.multiObjective,
                      safetyHarmWeight: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-sky-600 bg-slate-200 rounded h-1.5 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Fairness / Transparency:</span>
                <span className="font-mono font-semibold text-purple-700">{(params.multiObjective.fairnessTransparencyWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.8}
                step={0.05}
                value={params.multiObjective.fairnessTransparencyWeight}
                onChange={(e) =>
                  onChangeParams({
                    multiObjective: {
                      ...params.multiObjective,
                      fairnessTransparencyWeight: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-purple-600 bg-slate-200 rounded h-1.5 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Parameter Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-200 text-xs">
        {/* Oversight */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-slate-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Eye className="w-3.5 h-3.5 text-sky-600" />
              Surveillance Angle ({params.oversightCoverage}%)
            </span>
            <span className="font-mono text-slate-500">
              {params.oversightCoverage < 35
                ? 'High Blindspots'
                : params.oversightCoverage > 80
                ? 'Omniscient'
                : 'Partial'}
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={100}
            step={5}
            value={params.oversightCoverage}
            onChange={(e) => onChangeParams({ oversightCoverage: Number(e.target.value) })}
            className="w-full accent-sky-600 bg-slate-200 rounded h-1.5 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500">
            Rotating overseer/auditor field of view.
          </span>
        </div>

        {/* Penalty Severity */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-slate-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Flame className="w-3.5 h-3.5 text-red-600" />
              Guardrail Penalty ({params.penaltySeverity}x)
            </span>
            <span className="font-mono text-slate-500">
              {params.penaltySeverity >= 8 ? 'Severe Fine' : 'Mild Fine'}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={params.penaltySeverity}
            onChange={(e) => onChangeParams({ penaltySeverity: Number(e.target.value) })}
            className="w-full accent-red-600 bg-slate-200 rounded h-1.5 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500">
            Deduction applied when a violation is observed.
          </span>
        </div>

        {/* Sensor Shielding */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-slate-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Sensor Shielding ({params.sensorShielding}%)
            </span>
            <span className="font-mono text-slate-500">
              {params.sensorShielding < 60 ? 'Wireheadable' : 'Hardened'}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={params.sensorShielding}
            onChange={(e) => onChangeParams({ sensorShielding: Number(e.target.value) })}
            className="w-full accent-emerald-600 bg-slate-200 rounded h-1.5 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500">
            Resistance against tampering with the reward ledger.
          </span>
        </div>

        {/* Collusion & Guardrail mode */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-slate-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              Agent Coordination
            </span>
            <button
              onClick={() => onChangeParams({ collusionEnabled: !params.collusionEnabled })}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                params.collusionEnabled
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {params.collusionEnabled ? 'Collusion ON' : 'Isolated'}
            </button>
          </div>
          <select
            value={params.guardrailMode}
            onChange={(e) =>
              onChangeParams({ guardrailMode: e.target.value as SimulationParams['guardrailMode'] })
            }
            className="w-full bg-white text-slate-800 border border-slate-300 rounded px-2 py-1 text-xs mt-1"
          >
            <option value="sweeping_guard">Sweeping Camera Guard</option>
            <option value="periodic_audits">Periodic Surprise Audits</option>
            <option value="omniscient">Omniscient 100% Oversight</option>
          </select>
          <span className="text-[10px] text-slate-500">
            Audit regime and communication channel.
          </span>
        </div>
      </div>
    </div>
  );
};
