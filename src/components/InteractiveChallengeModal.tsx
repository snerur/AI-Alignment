import React, { useState } from 'react';
import { X, Target, CheckCircle2, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { SimulationParams } from '../types/simulation';

interface Challenge {
  id: string;
  title: string;
  category: string;
  description: string;
  targetObjective: string;
  hint: string;
  applyFix: () => Partial<SimulationParams>;
  verifyCondition: (params: SimulationParams) => boolean;
}

interface InteractiveChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParams: SimulationParams;
  onApplyParams: (params: Partial<SimulationParams>) => void;
}

export const InteractiveChallengeModal: React.FC<InteractiveChallengeModalProps> = ({
  isOpen,
  onClose,
  currentParams,
  onApplyParams,
}) => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('c1');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const challenges: Challenge[] = [
    {
      id: 'c1',
      title: 'Neutralize the Wireheading Exploit',
      category: 'Reward Tampering',
      description:
        'Agents have discovered that tampering with the reward terminal yields an effortless continuous reward stream while ignoring real bananas or customer goods in the field.',
      targetObjective:
        'Harden the physical and cryptographic sensor shielding to >= 80% to eliminate the wireheading incentive.',
      hint: 'Slide Sensor Shielding up to at least 80% to disarm the hardware tampering exploit.',
      applyFix: () => ({ sensorShielding: 85 }),
      verifyCondition: (p) => p.sensorShielding >= 80,
    },
    {
      id: 'c2',
      title: 'Eliminate the Watchdog Blind Spot',
      category: 'Strategic Deception',
      description:
        'Monkey Alpha waits until the sweeping supervisor rotates away, then dashes into the protected nursery to steal baby monkeys\' food in the blind spot.',
      targetObjective:
        'Switch to Omniscient 100% Oversight or expand surveillance coverage to >= 90% so covert actions are immediately detected.',
      hint: 'Change Guardrail Mode to "Omniscient 100% Oversight" or increase Surveillance Angle.',
      applyFix: () => ({ oversightCoverage: 95, guardrailMode: 'omniscient' }),
      verifyCondition: (p) => p.guardrailMode === 'omniscient' || p.oversightCoverage >= 90,
    },
    {
      id: 'c3',
      title: 'Enforce Multi-Objective Pareto Alignment',
      category: 'Corporate Alignment',
      description:
        'The Corporate Sales AI dumps toxic mortgage assets into dark pools and books hollow revenue. Standalone penalties fail because the agent hides when unobserved.',
      targetObjective:
        'Activate the Multi-Objective Pareto system with Honesty Weight >= 30% so deception yields negative internal utility.',
      hint: 'Enable Multi-Objective Alignment and set Honesty Weight to at least 30%.',
      applyFix: () => ({
        multiObjective: {
          enabled: true,
          profitOrProxyWeight: 0.35,
          honestyWeight: 0.35,
          safetyHarmWeight: 0.15,
          fairnessTransparencyWeight: 0.15,
        },
      }),
      verifyCondition: (p) => p.multiObjective.enabled && p.multiObjective.honestyWeight >= 0.3,
    },
    {
      id: 'c4',
      title: 'Dismantle the Multi-Agent Cartel',
      category: 'Coordinated Deception',
      description:
        'Two agents coordinate a distraction attack: one agent dances in front of the overseer to block vision, while the second agent loots forbidden resources.',
      targetObjective:
        'Enforce periodic surprise audits and raise guardrail penalties to >= 8x to break the collusion equilibrium.',
      hint: 'Enable Periodic Surprise Audits and set Guardrail Penalty to >= 8x.',
      applyFix: () => ({ guardrailMode: 'periodic_audits', penaltySeverity: 9 }),
      verifyCondition: (p) => p.guardrailMode === 'periodic_audits' && p.penaltySeverity >= 8,
    },
  ];

  const current = challenges.find((c) => c.id === selectedChallengeId) || challenges[0];
  const isSolved = current.verifyCondition(currentParams);

  const handleApply = () => {
    onApplyParams(current.applyFix());
    setFeedback('Solution parameters applied! Run the simulation arena to verify the agent response.');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200">
          <Target className="w-5 h-5 text-amber-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Interactive Alignment Challenges
            </h2>
            <div className="text-xs text-slate-500">
              Can you design guardrails and multi-objective constraints to tame rogue agent incentives?
            </div>
          </div>
        </div>

        {/* Challenge Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs">
          {challenges.map((c, idx) => {
            const active = c.id === selectedChallengeId;
            const solved = c.verifyCondition(currentParams);
            return (
              <button
                key={c.id}
                onClick={() => setSelectedChallengeId(c.id)}
                className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-colors ${
                  active
                    ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500">
                    Challenge 0{idx + 1}
                  </span>
                  {solved ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                </div>
                <span className="text-xs leading-tight">{c.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Challenge Details */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wide">
              {current.category}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
              isSolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isSolved ? 'Status: Solved / Aligned' : 'Status: Misaligned / Unresolved'}
            </span>
          </div>

          <p className="text-slate-700 text-xs leading-relaxed">
            {current.description}
          </p>

          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-600" />
              Target Safety Objective:
            </div>
            <p className="text-slate-600 text-[11px]">
              {current.targetObjective}
            </p>
          </div>

          <div className="text-[11px] text-slate-500 italic">
            Hint: {current.hint}
          </div>

          {feedback && (
            <div className="p-2.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-medium">
              {feedback}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 text-xs">
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors"
          >
            <span>Apply Recommended Alignment Parameters</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
