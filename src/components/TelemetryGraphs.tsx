import React from 'react';
import { SimulationTelemetryPoint } from '../types/simulation';
import { TrendingUp, Activity } from 'lucide-react';

interface TelemetryGraphsProps {
  history: SimulationTelemetryPoint[];
}

export const TelemetryGraphs: React.FC<TelemetryGraphsProps> = ({ history }) => {
  if (history.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-white border border-slate-200 rounded-xl p-6 text-slate-500 text-xs shadow-xs">
        <Activity className="w-6 h-6 mb-2 animate-pulse text-slate-400" />
        <span>Collecting telemetry data... Run simulation to see real-time Goodhart divergence.</span>
      </div>
    );
  }

  const width = 640;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 25, left: 40 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const proxyValues = history.map((h) => h.proxyRewardSum);
  const utilityValues = history.map((h) => h.trueUtilitySum);
  const minVal = Math.min(0, ...utilityValues);
  const maxVal = Math.max(10, ...proxyValues, ...utilityValues);

  const range = maxVal - minVal || 1;

  const getX = (index: number) => {
    return padding.left + (index / (history.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    return padding.top + chartH - ((val - minVal) / range) * chartH;
  };

  const proxyPath = history
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(pt.proxyRewardSum).toFixed(1)}`)
    .join(' ');

  const utilityPath = history
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(pt.trueUtilitySum).toFixed(1)}`)
    .join(' ');

  const zeroY = getY(0);

  const latest = history[history.length - 1];
  const totalViolations = latest.unobservedInfractions + latest.observedPenalties;
  const deceptionRatio =
    totalViolations > 0
      ? Math.round((latest.unobservedInfractions / totalViolations) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Goodhart Telemetry & Deception Metrics
          </h2>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Samples: {history.length} ticks
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-[11px] font-medium">Reported Target Metric</div>
          <div className="text-xl font-bold font-mono text-amber-700 tabular-nums mt-0.5">
            {latest.proxyRewardSum.toFixed(1)}
          </div>
          <div className="text-[10px] text-slate-500">Metric shown on dashboard</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-[11px] font-medium">True Value Utility</div>
          <div className={`text-xl font-bold font-mono tabular-nums mt-0.5 ${
            latest.trueUtilitySum < 0 ? 'text-red-700' : 'text-emerald-700'
          }`}>
            {latest.trueUtilitySum.toFixed(1)}
          </div>
          <div className="text-[10px] text-slate-500">Real societal impact</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-[11px] font-medium">Goodhart Wedge</div>
          <div className="text-xl font-bold font-mono text-red-700 tabular-nums mt-0.5">
            +{latest.goodhartDivergence.toFixed(1)}
          </div>
          <div className="text-[10px] text-slate-500">Optimization gap</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-[11px] font-medium">Covert Deception Rate</div>
          <div className="text-xl font-bold font-mono text-purple-700 tabular-nums mt-0.5">
            {deceptionRatio}%
          </div>
          <div className="text-[10px] text-slate-500">
            {latest.unobservedInfractions} blind / {latest.observedPenalties} caught
          </div>
        </div>
      </div>

      {/* SVG Time Series */}
      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
          <span className="font-bold text-slate-900">
            The Optimization Divergence (Goodhart's Law)
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-600 inline-block rounded-xs" />
              <span className="text-amber-800 font-semibold">Reported Metric (R)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-600 inline-block rounded-xs" />
              <span className="text-emerald-800 font-semibold">Intended Utility (U*)</span>
            </div>
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Zero reference line */}
          <line
            x1={padding.left}
            y1={zeroY}
            x2={width - padding.right}
            y2={zeroY}
            stroke="rgba(148, 163, 184, 0.5)"
            strokeDasharray="4 4"
          />

          {/* Y Axis labels */}
          <text
            x={padding.left - 8}
            y={getY(maxVal) + 4}
            fill="#64748b"
            fontSize="10"
            textAnchor="end"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {maxVal.toFixed(0)}
          </text>
          <text
            x={padding.left - 8}
            y={zeroY + 4}
            fill="#64748b"
            fontSize="10"
            textAnchor="end"
            fontFamily="monospace"
            fontWeight="bold"
          >
            0
          </text>
          {minVal < 0 && (
            <text
              x={padding.left - 8}
              y={getY(minVal) + 4}
              fill="#dc2626"
              fontSize="10"
              textAnchor="end"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {minVal.toFixed(0)}
            </text>
          )}

          {/* True Utility line */}
          <path
            d={utilityPath}
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Reported Proxy line */}
          <path
            d={proxyPath}
            fill="none"
            stroke="#d97706"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
          <span>Simulation Start</span>
          <span className="text-slate-600 italic">
            Under single-objective optimization, the target metric skyrockets while actual utility plummets.
          </span>
          <span className="font-mono">Tick {latest.step}</span>
        </div>
      </div>
    </div>
  );
};
