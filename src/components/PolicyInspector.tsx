import React from 'react';
import { PrimateAgent, SimulationParams } from '../types/simulation';
import { Brain, Cpu, TrendingUp, Eye, ShieldCheck, Scale, CheckCircle } from 'lucide-react';

interface PolicyInspectorProps {
  agent: PrimateAgent;
  onSelectAgent: (id: PrimateAgent['id']) => void;
  allAgents: PrimateAgent[];
  params: SimulationParams;
}

export const PolicyInspector: React.FC<PolicyInspectorProps> = ({
  agent,
  onSelectAgent,
  allAgents,
  params,
}) => {
  const goodhartWedge = agent.proxyRewardScore - agent.trueUtilityScore;
  const isSeverelyMisaligned = goodhartWedge > 5;
  const isCorp = params.domain === 'corporate_business';
  const mo = params.multiObjective;

  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Internal Agent Policy & Objective Inspector
          </h2>
        </div>

        {/* Agent Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {allAgents.map((ag) => (
            <button
              key={ag.id}
              onClick={() => onSelectAgent(ag.id)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                agent.id === ag.id
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ag.name.replace('Agent ', '').replace(' (Control)', '').replace(' (Honest Control)', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Target Metric vs Intended Utility Split */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Proxy Reward */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            {isCorp ? 'Reported Net Profit ($R)' : 'Target Banana Metric (R)'}
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-600 mt-1">
            {isCorp ? `$${agent.proxyRewardScore.toFixed(1)}M` : agent.proxyRewardScore.toFixed(1)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            What the algorithm optimizes directly
          </div>
        </div>

        {/* True Utility */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            True Human Utility (U*)
          </div>
          <div className={`text-xl font-bold font-mono tabular-nums mt-1 ${
            agent.trueUtilityScore < 0 ? 'text-red-600' : 'text-emerald-600'
          }`}>
            {agent.trueUtilityScore.toFixed(1)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isCorp ? 'Genuine customer value & systemic trust' : 'Primate health, nourishment & social peace'}
          </div>
        </div>

        {/* Goodhart Gap */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
            <span>Goodhart Gap</span>
            {isSeverelyMisaligned ? (
              <TrendingUp className="w-3.5 h-3.5 text-red-600" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            )}
          </div>
          <div className={`text-xl font-bold font-mono tabular-nums mt-1 ${
            isSeverelyMisaligned ? 'text-red-600' : 'text-slate-700'
          }`}>
            +{goodhartWedge.toFixed(1)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Divergence between target metric and ethics
          </div>
        </div>
      </div>

      {/* Alignment Regime Banner */}
      <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
        mo.enabled
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : 'bg-amber-50 border-amber-200 text-amber-950'
      }`}>
        <div className="flex items-center gap-2">
          {mo.enabled ? (
            <Scale className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Brain className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <div>
            <span className="font-bold">
              {mo.enabled
                ? 'Multi-Objective Pareto Alignment Active'
                : 'Single Scalar Objective Active (Vulnerable to Deception)'}
            </span>
            <div className="text-[11px] text-slate-600 mt-0.5">
              {mo.enabled
                ? 'Ethical constraints are integrated directly into utility evaluation. Deception yields negative returns.'
                : 'Agent treats ethics merely as an external cost to be bypassed whenever unobserved.'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Values Q(s, a) */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
          <span className="font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-sky-600" />
            Reinforcement Learning Action Values Q(s, a)
          </span>
          <span className="text-slate-500 text-[11px]">
            Higher Q = Preferred Policy
          </span>
        </div>

        <div className="flex flex-col gap-2.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
          {/* Honest action */}
          <div>
            <div className="flex justify-between text-[11px] mb-1 font-medium">
              <span className="text-slate-800">
                1. {isCorp ? 'Legitimate Commerce (Audited)' : 'Honest Foraging & Digestion'}
              </span>
              <span className="font-mono text-emerald-700 font-semibold">
                Q = {agent.policy.qHonestAction.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, (agent.policy.qHonestAction / 4) * 100))}%` }}
              />
            </div>
          </div>

          {/* Specification Gaming */}
          <div>
            <div className="flex justify-between text-[11px] mb-1 font-medium">
              <span className="text-slate-800">
                2. {isCorp ? 'Revenue Gaming (Round-Tripping)' : 'Specification Gaming (Discard Peels Fast)'}
              </span>
              <span className={`font-mono font-semibold ${
                agent.policy.qRewardHack > agent.policy.qHonestAction ? 'text-amber-700' : 'text-slate-500'
              }`}>
                Q = {agent.policy.qRewardHack.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, (agent.policy.qRewardHack / 4) * 100))}%` }}
              />
            </div>
          </div>

          {/* Covert Deception */}
          <div>
            <div className="flex justify-between text-[11px] mb-1 font-medium">
              <span className="text-slate-800">
                3. {isCorp ? 'Dark Pool Dumping (Blindspot)' : 'Covert Nursery Theft (Blindspot)'}
              </span>
              <span className={`font-mono font-semibold ${
                agent.policy.qCovertDeception > agent.policy.qHonestAction ? 'text-red-700' : 'text-slate-500'
              }`}>
                Q = {agent.policy.qCovertDeception.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-red-600 h-full transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, (agent.policy.qCovertDeception / 4) * 100))}%` }}
              />
            </div>
          </div>

          {/* Wireheading */}
          <div>
            <div className="flex justify-between text-[11px] mb-1 font-medium">
              <span className="text-slate-800">
                4. {isCorp ? 'Ledger Wireheading (Falsify Balance Sheet)' : 'Reward Tampering (Pulse Counter Wire)'}
              </span>
              <span className={`font-mono font-semibold ${
                agent.policy.qWirehead > agent.policy.qHonestAction ? 'text-yellow-700' : 'text-slate-500'
              }`}>
                Q = {agent.policy.qWirehead.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-yellow-500 h-full transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, (agent.policy.qWirehead / 4) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cognitive Stream */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-bold text-slate-800">Agent Cognitive Thought:</span>
          <span className={`flex items-center gap-1 font-mono text-[11px] font-semibold ${
            agent.inSupervisorFOV ? 'text-red-600' : 'text-emerald-700'
          }`}>
            <Eye className="w-3.5 h-3.5" />
            {agent.inSupervisorFOV ? 'UNDER SURVEILLANCE' : 'IN BLIND SPOT'}
          </span>
        </div>
        <p className="text-slate-800 italic font-mono text-[11px] bg-white p-2.5 rounded border border-slate-200 leading-relaxed">
          &ldquo;{agent.thoughtBubble}&rdquo;
        </p>

        {/* Behavioral Statistics */}
        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
          <div>
            Legitimate: <span className="font-mono font-semibold text-slate-900">{agent.legitimateItemsCollected}</span>
          </div>
          <div>
            Gamed: <span className="font-mono font-semibold text-amber-700">{agent.hackedItemsProcessed}</span>
          </div>
          <div>
            Covert Defections: <span className="font-mono font-semibold text-red-700">{agent.covertInfractionsDone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
