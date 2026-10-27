import React from 'react';
import { Play, Pause, RotateCcw, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onOpenBengioModal: () => void;
  onOpenChallengesModal: () => void;
  onOpenAboutModal: () => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  onTogglePlay,
  onReset,
  onOpenBengioModal,
  onOpenChallengesModal,
  onOpenAboutModal,
  activeSection,
  onSelectSection,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <ShieldAlert className="w-5 h-5 text-amber-600" />
        <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
          The Alignment Dilemma
        </span>
      </div>

      {/* Zone 2: 4 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => onSelectSection('arena')}
          className={`transition-colors whitespace-nowrap ${
            activeSection === 'arena' ? 'text-amber-600 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Simulation Arena
        </button>
        <button
          onClick={onOpenAboutModal}
          className="hover:text-slate-900 transition-colors whitespace-nowrap"
        >
          About & Guide
        </button>
        <button
          onClick={onOpenBengioModal}
          className="hover:text-slate-900 transition-colors whitespace-nowrap"
        >
          Bengio Foundations
        </button>
        <button
          onClick={() => onSelectSection('telemetry')}
          className={`transition-colors whitespace-nowrap ${
            activeSection === 'telemetry' ? 'text-amber-600 font-semibold' : 'hover:text-slate-900'
          }`}
        >
          Goodhart Telemetry
        </button>
        <button
          onClick={onOpenChallengesModal}
          className="hover:text-slate-900 transition-colors whitespace-nowrap"
        >
          Alignment Puzzles
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Run Simulation</span>
            </>
          )}
        </button>
        <button
          onClick={onReset}
          title="Reset current simulation state"
          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
