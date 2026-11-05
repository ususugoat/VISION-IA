import React from 'react';
import { Play, Pause, Square, Camera, Layers, Video, Gauge, Cpu } from 'lucide-react';
import type { LiveSession, LiveScenario } from '../../../core/domain/liveTypes';
import type { AnalysisMode } from '../../../core/domain/types';
import { Button } from '../../../shared/ui/Button';
import { Badge } from '../../../shared/ui/Badge';
import { cn } from '../../../shared/utils/cn';

interface LiveControlsBarProps {
  isRunning: boolean;
  isPaused: boolean;
  session: LiveSession | null;
  scenarios: LiveScenario[];
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onCapture: () => void;
  showBoxes: boolean;
  showMasks: boolean;
  showLabels: boolean;
  showZones: boolean;
  showLowConf: boolean;
  onToggleBoxes: () => void;
  onToggleMasks: () => void;
  onToggleLabels: () => void;
  onToggleZones: () => void;
  onToggleLowConf: () => void;
  fps: number;
  frameNumber: number;
  cameraLabel: string;
  // ── New: Confidence threshold & Analysis mode ────────────────────────────
  confidenceThreshold: number;
  onConfidenceChange: (val: number) => void;
  analysisMode: AnalysisMode;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
}

const LayerChip: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  accentColor: 'blue' | 'purple' | 'indigo' | 'cyan' | 'slate';
}> = ({ label, active, onClick, accentColor }) => {
  const activeStyles = {
    blue:   'bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-2xs',
    purple: 'bg-purple-50 text-purple-700 border-purple-300 font-semibold shadow-2xs',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold shadow-2xs',
    cyan:   'bg-cyan-50 text-cyan-800 border-cyan-300 font-semibold shadow-2xs',
    slate:  'bg-slate-200 text-slate-800 border-slate-300 font-semibold shadow-2xs',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer select-none',
        active
          ? activeStyles[accentColor]
          : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-100'
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full transition-colors',
          active ? 'bg-current' : 'bg-slate-300'
        )}
      />
      {label}
    </button>
  );
};

// ── Analysis Mode options for live monitoring ─────────────────────────────────
const LIVE_MODES: { value: AnalysisMode; label: string; color: string }[] = [
  { value: 'combined',     label: 'Combinado',   color: 'text-blue-700'   },
  { value: 'detection',    label: 'Cajas',       color: 'text-indigo-700' },
  { value: 'segmentation', label: 'Máscaras',    color: 'text-purple-700' },
  { value: 'patterns',     label: 'Patrones',    color: 'text-cyan-700'   },
];

export const LiveControlsBar: React.FC<LiveControlsBarProps> = ({
  isRunning,
  isPaused,
  session,
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onStart,
  onPause,
  onResume,
  onStop,
  onCapture,
  showBoxes,
  showMasks,
  showLabels,
  showZones,
  showLowConf,
  onToggleBoxes,
  onToggleMasks,
  onToggleLabels,
  onToggleZones,
  onToggleLowConf,
  fps,
  frameNumber,
  cameraLabel,
  confidenceThreshold,
  onConfidenceChange,
  analysisMode,
  onAnalysisModeChange,
}) => {
  return (
    <div className="flex flex-col gap-3 px-4 py-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs">

      {/* ── Row 1: Status + actions + telemetry ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* 1a. Primary Action & Feed State */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Indicator */}
          {isRunning && !isPaused ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              EN VIVO
            </span>
          ) : isPaused ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              PAUSADO
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              INACTIVO
            </span>
          )}

          <Badge variant="blue" className="text-[10px] font-mono">IA DEMO</Badge>

          {/* Scenario Selection or Action Buttons */}
          {!isRunning ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedScenarioId}
                  onChange={(e) => onSelectScenario(e.target.value)}
                  className="text-xs bg-slate-50 hover:bg-white border border-slate-300 text-slate-800 rounded-lg pl-3 pr-8 py-1.5 font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs max-w-64 appearance-none"
                >
                  {scenarios.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <Video className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <Button
                size="sm"
                variant="primary"
                onClick={onStart}
                icon={<Play className="w-3.5 h-3.5" />}
                className="shadow-sm shadow-blue-600/20"
              >
                Iniciar análisis
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {!isPaused ? (
                <Button size="sm" variant="outline" onClick={onPause} icon={<Pause className="w-3.5 h-3.5 text-amber-600" />}>
                  Pausar
                </Button>
              ) : (
                <Button size="sm" variant="primary" onClick={onResume} icon={<Play className="w-3.5 h-3.5" />}>
                  Reanudar
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={onCapture} icon={<Camera className="w-3.5 h-3.5 text-slate-600" />}>
                Capturar
              </Button>
              <Button size="sm" variant="danger" onClick={onStop} icon={<Square className="w-3.5 h-3.5" />}>
                Detener
              </Button>
            </div>
          )}
        </div>

        {/* 1b. Telemetry when active */}
        {session && (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-lg self-start lg:self-auto">
            <span className="font-semibold text-slate-900">{cameraLabel}</span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-700 font-bold">{fps} FPS</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Frame #{frameNumber}</span>
          </div>
        )}
      </div>

      {/* ── Row 2: Analysis Mode + Confidence Threshold + Visual Layers ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-2.5 border-t border-slate-100">

        {/* ── Analysis Mode ── */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            <Cpu className="w-3 h-3" />
            Modo:
          </span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            {LIVE_MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => onAnalysisModeChange(m.value)}
                disabled={isRunning}
                title={isRunning ? 'Detén la sesión para cambiar el modo' : undefined}
                className={cn(
                  'px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer select-none',
                  analysisMode === m.value
                    ? `bg-white ${m.color} shadow-xs border border-slate-200/60`
                    : 'text-slate-500 hover:text-slate-800',
                  isRunning && 'opacity-60 cursor-not-allowed'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Confidence Threshold Slider ── */}
        <div className="flex items-center gap-2.5 min-w-[220px]">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 whitespace-nowrap">
            <Gauge className="w-3 h-3" />
            Umbral:
          </span>
          <input
            type="range"
            min={0.4}
            max={0.95}
            step={0.05}
            value={confidenceThreshold}
            onChange={(e) => onConfidenceChange(parseFloat(e.target.value))}
            className="flex-1 h-1.5 rounded-full accent-blue-600 cursor-pointer"
          />
          <span className={cn(
            'text-xs font-mono font-bold w-10 text-right shrink-0',
            confidenceThreshold >= 0.85 ? 'text-emerald-600' :
            confidenceThreshold >= 0.7  ? 'text-amber-500' :
            'text-rose-500'
          )}>
            {Math.round(confidenceThreshold * 100)}%
          </span>
        </div>

        {/* ── Visual Layers ── */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" />
            Capas:
          </span>
          <LayerChip label="Cajas"     active={showBoxes}    onClick={onToggleBoxes}    accentColor="blue"   />
          <LayerChip label="Máscaras"  active={showMasks}    onClick={onToggleMasks}    accentColor="purple" />
          <LayerChip label="Etiquetas" active={showLabels}   onClick={onToggleLabels}   accentColor="indigo" />
          <LayerChip label="Zonas"     active={showZones}    onClick={onToggleZones}    accentColor="cyan"   />
          <LayerChip label="Baja Conf." active={showLowConf} onClick={onToggleLowConf}  accentColor="slate"  />
        </div>
      </div>
    </div>
  );
};
