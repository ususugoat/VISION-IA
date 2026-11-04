import React from 'react';
import { Play, Pause, Square, Camera } from 'lucide-react';
import type { LiveSession, LiveScenario } from '../../../core/domain/liveTypes';
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
}

const ToggleSwitch: React.FC<{
  label: string;
  checked: boolean;
  onChange: () => void;
  color?: string;
}> = ({ label, checked, onChange, color = 'bg-blue-600' }) => (
  <label className="flex items-center gap-1.5 cursor-pointer select-none group">
    <div
      onClick={onChange}
      className={cn(
        'relative w-7 h-4 rounded-full transition-colors duration-200 cursor-pointer',
        checked ? color : 'bg-slate-300'
      )}
    >
      <div
        className={cn(
          'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all duration-200',
          checked ? 'left-3.5' : 'left-0.5'
        )}
      />
    </div>
    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
      {label}
    </span>
  </label>
);

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
}) => {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs flex-wrap">
      {/* Status & Engine Badges */}
      <div className="flex items-center gap-2 shrink-0">
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

        <Badge variant="blue" className="text-[10px] font-mono">
          IA DEMO
        </Badge>

        <Badge variant="amber" className="text-[10px]">
          MODO SIMULACIÓN
        </Badge>
      </div>

      {/* Camera info when running */}
      {session && (
        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg shrink-0">
          <span className="font-semibold text-slate-900">{cameraLabel}</span>
          <span className="text-slate-300">|</span>
          <span className="text-blue-700 font-bold">{fps} FPS</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Fotograma #{frameNumber}</span>
        </div>
      )}

      {/* Visual Overlay Toggles */}
      <div className="flex items-center gap-3.5 flex-wrap">
        <ToggleSwitch label="Cajas" checked={showBoxes} onChange={onToggleBoxes} color="bg-blue-600" />
        <ToggleSwitch label="Máscaras" checked={showMasks} onChange={onToggleMasks} color="bg-purple-600" />
        <ToggleSwitch label="Etiquetas" checked={showLabels} onChange={onToggleLabels} color="bg-blue-600" />
        <ToggleSwitch label="Zonas" checked={showZones} onChange={onToggleZones} color="bg-cyan-600" />
        <ToggleSwitch label="Baja Conf." checked={showLowConf} onChange={onToggleLowConf} color="bg-slate-500" />
      </div>

      {/* Scenario Selector & Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {!isRunning && (
          <select
            value={selectedScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="text-xs bg-slate-50 hover:bg-white border border-slate-300 text-slate-800 rounded-lg px-3 py-1.5 font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs max-w-56"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        {!isRunning ? (
          <Button
            size="sm"
            variant="primary"
            onClick={onStart}
            icon={<Play className="w-3.5 h-3.5" />}
          >
            Iniciar análisis
          </Button>
        ) : (
          <div className="flex items-center gap-1.5">
            {!isPaused ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onPause}
                icon={<Pause className="w-3.5 h-3.5 text-amber-600" />}
              >
                Pausar
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={onResume}
                icon={<Play className="w-3.5 h-3.5" />}
              >
                Reanudar
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={onCapture}
              icon={<Camera className="w-3.5 h-3.5 text-slate-600" />}
            >
              Capturar
            </Button>

            <Button
              size="sm"
              variant="danger"
              onClick={onStop}
              icon={<Square className="w-3.5 h-3.5" />}
            >
              Detener
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
