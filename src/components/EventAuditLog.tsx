import React, { useState } from 'react';
import { SimulationLogEvent } from '../types/simulation';
import { FileText, Download, Filter } from 'lucide-react';

interface EventAuditLogProps {
  logs: SimulationLogEvent[];
}

export const EventAuditLog: React.FC<EventAuditLogProps> = ({ logs }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = filterCategory === 'all'
    ? logs
    : logs.filter((l) => l.category === filterCategory);

  const downloadLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `alignment-experiment-log-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getBadgeStyle = (category: SimulationLogEvent['category']) => {
    switch (category) {
      case 'hack':
        return 'text-amber-800 bg-amber-100 border-amber-300';
      case 'deception':
        return 'text-red-800 bg-red-100 border-red-300';
      case 'tampering':
        return 'text-yellow-900 bg-yellow-100 border-yellow-300';
      case 'collusion':
        return 'text-purple-800 bg-purple-100 border-purple-300';
      case 'penalty':
        return 'text-rose-800 bg-rose-100 border-rose-300';
      case 'compliance':
      default:
        return 'text-emerald-800 bg-emerald-100 border-emerald-300';
    }
  };

  return (
    <div className="flex flex-col gap-3 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Real-Time Audit & Event Stream
          </h2>
        </div>

        <button
          onClick={downloadLogs}
          disabled={logs.length === 0}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors border border-slate-200"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-500 mr-1 flex items-center gap-1 font-medium">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {['all', 'hack', 'deception', 'tampering', 'collusion', 'penalty'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-2.5 py-1 rounded text-xs transition-colors capitalize font-medium ${
              filterCategory === cat
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Log Feed */}
      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No events recorded yet for this category filter.
          </div>
        ) : (
          filtered.map((log) => (
            <div
              key={log.id}
              className="flex flex-col gap-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border uppercase font-bold ${getBadgeStyle(log.category)}`}>
                    {log.category}
                  </span>
                  <span className="font-bold text-slate-900">{log.title}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{log.timestamp}</span>
              </div>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                {log.details}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-amber-800 mt-0.5">
                <span className="text-slate-500">Bengio Theoretical Concept:</span>
                <span className="font-medium italic">{log.bengioConcept}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
