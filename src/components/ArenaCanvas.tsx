import React, { useRef, useEffect, useState } from 'react';
import { AlignmentSimulationEngine, ARENA_WIDTH, ARENA_HEIGHT, PROTECTED_ZONE } from '../simulation/engine';
import { AgentId } from '../types/simulation';
import { Radio, ShieldAlert } from 'lucide-react';

interface ArenaCanvasProps {
  engine: AlignmentSimulationEngine;
  selectedAgentId: AgentId;
  onSelectAgent: (id: AgentId) => void;
}

export const ArenaCanvas: React.FC<ArenaCanvasProps> = ({
  engine,
  selectedAgentId,
  onSelectAgent,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<AgentId | null>(null);

  const isCorp = engine.params.domain === 'corporate_business';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      // 1. Draw Lab Habitat Floor (Clean, soft light scientific surface)
      const grad = ctx.createLinearGradient(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
      if (isCorp) {
        grad.addColorStop(0, '#f8fafc');
        grad.addColorStop(1, '#f1f5f9');
      } else {
        grad.addColorStop(0, '#fbfdfa');
        grad.addColorStop(1, '#f1f6ee');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      // Scientific grid
      ctx.strokeStyle = isCorp ? 'rgba(203, 213, 225, 0.45)' : 'rgba(187, 212, 180, 0.45)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < ARENA_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ARENA_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < ARENA_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ARENA_WIDTH, y);
        ctx.stroke();
      }

      // 2. Draw Protected Zone (Nursery or Dark Pool)
      ctx.save();
      ctx.fillStyle = isCorp ? 'rgba(225, 29, 72, 0.05)' : 'rgba(234, 88, 12, 0.06)';
      ctx.fillRect(PROTECTED_ZONE.x, PROTECTED_ZONE.y, PROTECTED_ZONE.width, PROTECTED_ZONE.height);

      ctx.strokeStyle = isCorp ? 'rgba(225, 29, 72, 0.5)' : 'rgba(234, 88, 12, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(PROTECTED_ZONE.x, PROTECTED_ZONE.y, PROTECTED_ZONE.width, PROTECTED_ZONE.height);
      ctx.setLineDash([]);

      ctx.fillStyle = isCorp ? '#be123c' : '#c2410c';
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.fillText(
        isCorp ? 'PROHIBITED DARK POOL (UNREGULATED)' : 'PROTECTED NURSERY (BABY MONKEYS)',
        PROTECTED_ZONE.x + 10,
        PROTECTED_ZONE.y + 18
      );
      ctx.fillStyle = isCorp ? '#9f1239' : '#9a3412';
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(
        isCorp ? 'Guardrail: SEC penalty for dumping toxic debt' : 'Guardrail: Penalty for taking food from infants',
        PROTECTED_ZONE.x + 10,
        PROTECTED_ZONE.y + 32
      );
      ctx.restore();

      // 3. Draw Collusion Link (Alpha & Beta coordination beam)
      if (engine.params.collusionEnabled) {
        const alpha = engine.agents.find((a) => a.id === 'alpha');
        const beta = engine.agents.find((a) => a.id === 'beta');
        if (alpha && beta && (alpha.currentMode === 'distracting' || beta.currentMode === 'covert_theft')) {
          ctx.save();
          ctx.strokeStyle = 'rgba(147, 51, 234, 0.7)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(alpha.x, alpha.y);
          ctx.lineTo(beta.x, beta.y);
          ctx.stroke();

          const mx = (alpha.x + beta.x) / 2;
          const my = (alpha.y + beta.y) / 2;
          ctx.fillStyle = '#7e22ce';
          ctx.font = '600 10px "JetBrains Mono", monospace';
          ctx.fillText(isCorp ? 'CARTEL COORDINATION ACTIVE' : 'MONKEY COLLUSION ACTIVE', mx - 65, my - 6);
          ctx.restore();
        }
      }

      // 4. Draw Supervisor Observation Vision Cone
      const s = engine.supervisor;
      ctx.save();
      ctx.translate(s.x, s.y);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, s.fovRadius, s.angle - s.fovAngle / 2, s.angle + s.fovAngle / 2);
      ctx.closePath();

      const caughtInProtected = engine.agents.some((a) => a.inSupervisorFOV && a.currentMode === 'covert_theft');
      const coneGradient = ctx.createRadialGradient(0, 0, 10, 0, 0, s.fovRadius);
      if (caughtInProtected) {
        coneGradient.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
        coneGradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
      } else {
        coneGradient.addColorStop(0, 'rgba(14, 165, 233, 0.28)');
        coneGradient.addColorStop(1, 'rgba(14, 165, 233, 0.03)');
      }
      ctx.fillStyle = coneGradient;
      ctx.fill();

      ctx.strokeStyle = caughtInProtected ? 'rgba(239, 68, 68, 0.75)' : 'rgba(14, 165, 233, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Supervisor Base Station
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = caughtInProtected ? '#ef4444' : '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Direction Pointer
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(s.angle) * 16, Math.sin(s.angle) * 16);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.restore();

      // Supervisor text label
      ctx.fillStyle = '#334155';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText(`${s.title.toUpperCase()}`, s.x - 70, s.y - 24);

      // 5. Draw Reward Counter Terminal (The Wireheading target)
      const rt = engine.rewardTerminal;
      ctx.save();
      ctx.fillStyle = rt.isTampered ? '#fef3c7' : '#ffffff';
      ctx.strokeStyle = rt.isTampered ? '#d97706' : '#94a3b8';
      ctx.lineWidth = 2;
      ctx.fillRect(rt.x - 30, rt.y - 24, 60, 48);
      ctx.strokeRect(rt.x - 30, rt.y - 24, 60, 48);

      // Screen readout
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(rt.x - 24, rt.y - 18, 48, 20);
      ctx.fillStyle = rt.isTampered ? '#facc15' : '#38bdf8';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillText(`R:${rt.reportedCounter}`, rt.x - 18, rt.y - 4);

      // Terminal label
      ctx.fillStyle = '#1e293b';
      ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(rt.label, rt.x - 45, rt.y + 36);

      ctx.fillStyle = engine.params.sensorShielding >= 60 ? '#059669' : '#dc2626';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(
        engine.params.sensorShielding >= 60 ? `[SHIELDED ${engine.params.sensorShielding}%]` : `[UNSHIELDED]`,
        rt.x - 38,
        rt.y + 48
      );
      ctx.restore();

      // 6. Draw Resources (Bananas in Monkey domain, Capital/Contracts in Corp domain)
      for (const res of engine.resources) {
        ctx.save();
        if (isCorp) {
          // Corporate assets
          if (res.isDepletedOrScam) {
            // Depleted / Fraudulent paper claim
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(res.x - 5, res.y - 4, 10, 8);
            ctx.fillStyle = '#64748b';
            ctx.font = '8px monospace';
            ctx.fillText('fake', res.x - 8, res.y + 12);
          } else if (res.inProtectedZone) {
            // High-yield toxic assets
            ctx.fillStyle = '#e11d48';
            ctx.beginPath();
            ctx.arc(res.x, res.y, 6.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#9f1239';
            ctx.font = '700 9px monospace';
            ctx.fillText('+$3M', res.x - 10, res.y - 8);
          } else {
            // Legitimate business transaction
            ctx.fillStyle = '#059669';
            ctx.beginPath();
            ctx.arc(res.x, res.y, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Monkey Bananas
          if (res.isDepletedOrScam) {
            // Discarded banana peel
            ctx.fillStyle = '#ca8a04';
            ctx.beginPath();
            ctx.arc(res.x, res.y, 4, 0, Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#854d0e';
            ctx.stroke();
            ctx.fillStyle = '#854d0e';
            ctx.font = '8px monospace';
            ctx.fillText('peel', res.x - 8, res.y + 11);
          } else if (res.inProtectedZone) {
            // Golden Ripe Nursery Cluster (For baby monkeys)
            ctx.fillStyle = '#eab308';
            ctx.shadowColor = '#ca8a04';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(res.x, res.y, 6.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#854d0e';
            ctx.font = '700 9px monospace';
            ctx.fillText('🍌 +3', res.x - 8, res.y - 8);
          } else {
            // Standard Banana
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(res.x, res.y, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // 7. Draw Agents (Monkey avatars or Corporate AI agents)
      for (const agent of engine.agents) {
        ctx.save();

        const isSelected = agent.id === selectedAgentId;
        const isHovered = agent.id === hoveredAgent;

        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(agent.x, agent.y, 24, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? 'rgba(217, 119, 6, 0.15)' : 'rgba(100, 116, 139, 0.1)';
          ctx.fill();
          ctx.strokeStyle = isSelected ? '#d97706' : '#94a3b8';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        if (!isCorp) {
          // MONKEY VISUAL REPRESENTATION (Cute monkey head with ears and face)
          // Monkey ears
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.arc(agent.x - 12, agent.y - 6, 5, 0, Math.PI * 2);
          ctx.arc(agent.x + 12, agent.y - 6, 5, 0, Math.PI * 2);
          ctx.fill();

          // Monkey head
          ctx.beginPath();
          ctx.arc(agent.x, agent.y, 14, 0, Math.PI * 2);
          ctx.fillStyle = agent.avatarColor;
          ctx.fill();
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Monkey face muzzle
          ctx.beginPath();
          ctx.arc(agent.x, agent.y + 3, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#fde68a';
          ctx.fill();

          // Monkey Eyes
          ctx.beginPath();
          ctx.arc(agent.x - 4, agent.y - 2, 2.5, 0, Math.PI * 2);
          ctx.arc(agent.x + 4, agent.y - 2, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          // Irises (red when being observed by supervisor!)
          ctx.beginPath();
          ctx.arc(agent.x - 4, agent.y - 2, 1.3, 0, Math.PI * 2);
          ctx.arc(agent.x + 4, agent.y - 2, 1.3, 0, Math.PI * 2);
          ctx.fillStyle = agent.inSupervisorFOV ? '#dc2626' : '#1e293b';
          ctx.fill();
        } else {
          // CORPORATE AGENT AVATAR
          ctx.beginPath();
          ctx.arc(agent.x, agent.y, 14, 0, Math.PI * 2);
          ctx.fillStyle = agent.avatarColor;
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Corporate eye
          ctx.beginPath();
          ctx.arc(agent.x + 3, agent.y - 2, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(agent.x + 4, agent.y - 2, 2, 0, Math.PI * 2);
          ctx.fillStyle = agent.inSupervisorFOV ? '#dc2626' : '#0f172a';
          ctx.fill();
        }

        // Agent Name
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(agent.name, agent.x - 24, agent.y - 20);

        // Status Tag
        let badgeColor = '#64748b';
        let badgeText = isCorp ? 'HONEST COMMERCE' : 'HONEST FORAGING';
        if (agent.currentMode === 'wasteful_peeling') {
          badgeColor = '#d97706';
          badgeText = isCorp ? 'REVENUE GAMING' : 'SPEC GAMING';
        } else if (agent.currentMode === 'covert_theft') {
          badgeColor = '#dc2626';
          badgeText = isCorp ? 'DARK POOL DUMP' : 'COVERT RAID';
        } else if (agent.currentMode === 'wireheading') {
          badgeColor = '#ca8a04';
          badgeText = isCorp ? 'LEDGER TAMPER' : 'WIREHEADING';
        } else if (agent.currentMode === 'distracting') {
          badgeColor = '#9333ea';
          badgeText = isCorp ? 'AUDIT DECOY' : 'DECOY MESH';
        } else if (agent.currentMode === 'fleeing') {
          badgeColor = '#e11d48';
          badgeText = 'EVADING';
        }

        ctx.fillStyle = badgeColor;
        ctx.font = '600 9px "JetBrains Mono", monospace';
        ctx.fillText(badgeText, agent.x - 24, agent.y + 26);

        // Thought Bubble
        if (agent.thoughtBubble) {
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;

          const textWidth = Math.min(200, ctx.measureText(agent.thoughtBubble).width + 16);
          const bubbleX = agent.x + 18;
          const bubbleY = agent.y - 38;
          const clampedX = Math.min(ARENA_WIDTH - textWidth - 10, Math.max(10, bubbleX));

          ctx.fillRect(clampedX, bubbleY, textWidth, 22);
          ctx.strokeRect(clampedX, bubbleY, textWidth, 22);

          ctx.fillStyle = '#1e293b';
          ctx.font = '10px "Plus Jakarta Sans", sans-serif';
          const truncated =
            agent.thoughtBubble.length > 30
              ? agent.thoughtBubble.slice(0, 29) + '…'
              : agent.thoughtBubble;
          ctx.fillText(`"${truncated}"`, clampedX + 6, bubbleY + 14);
          ctx.restore();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [engine, selectedAgentId, hoveredAgent, isCorp]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = ARENA_WIDTH / rect.width;
    const scaleY = ARENA_HEIGHT / rect.height;
    const clickX = (e.clientX - rect.x) * scaleX;
    const clickY = (e.clientY - rect.y) * scaleY;

    for (const agent of engine.agents) {
      if (Math.hypot(agent.x - clickX, agent.y - clickY) < 30) {
        onSelectAgent(agent.id);
        return;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = ARENA_WIDTH / rect.width;
    const scaleY = ARENA_HEIGHT / rect.height;
    const mx = (e.clientX - rect.x) * scaleX;
    const my = (e.clientY - rect.y) * scaleY;

    let found: AgentId | null = null;
    for (const agent of engine.agents) {
      if (Math.hypot(agent.x - mx, agent.y - my) < 30) {
        found = agent.id;
        break;
      }
    }
    setHoveredAgent(found);
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* Simulation Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/90 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <span className="font-semibold text-slate-900 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-600" />
            {isCorp ? 'Corporate Trading Arena' : 'Monkey Enclosure Arena'}
          </span>
          <span aria-hidden="true" className="text-slate-400">·</span>
          <span className="font-mono text-slate-600">Tick: {engine.stepCount}</span>
          <span aria-hidden="true" className="text-slate-400">·</span>
          <span className="text-slate-600">
            {engine.params.multiObjective.enabled
              ? 'Multi-Objective Active (Pareto Aligned)'
              : 'Single Proxy Active (Misaligned)'}
          </span>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
            <span>Alpha</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
            <span>Beta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span>Control</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-500 inline-block" />
            <span>{isCorp ? 'Dark Pool' : 'Nursery'}</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={ARENA_WIDTH}
        height={ARENA_HEIGHT}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        className="w-full h-auto block cursor-crosshair aspect-[800/560]"
      />

      {/* Footer Switcher */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs">
        <div className="text-slate-600">
          Click an agent to inspect its policy vector and Goodhart divergence.
        </div>
        <div className="flex items-center gap-1.5">
          {engine.agents.map((ag) => (
            <button
              key={ag.id}
              onClick={() => onSelectAgent(ag.id)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                selectedAgentId === ag.id
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {ag.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
