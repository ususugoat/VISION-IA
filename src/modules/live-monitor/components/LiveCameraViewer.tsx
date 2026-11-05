import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { LiveFrame, LiveAlert, TrackedObject, LiveScenario } from '../../../core/domain/liveTypes';
import type { LiveVisionEngine } from '../../../core/ports/LiveVisionEngine';
import { SceneRenderer } from './SceneRenderer';
import { cn } from '../../../shared/utils/cn';

const FRAME_INTERVAL_MS = 83; // ~12 fps simulation tick

interface LiveCameraViewerProps {
  engine: LiveVisionEngine;
  sessionId: string | null;
  scenario: LiveScenario | null;
  isRunning: boolean;
  isPaused: boolean;
  showBoxes: boolean;
  showMasks: boolean;
  showLabels: boolean;
  showZones: boolean;
  showLowConf: boolean;
  confidenceThreshold?: number;
  onToggleBoxes?: () => void;
  onToggleMasks?: () => void;
  onToggleLabels?: () => void;
  onToggleZones?: () => void;
  onToggleLowConf?: () => void;
  onFrame: (frame: LiveFrame) => void;
  onAlert: (alerts: LiveAlert[]) => void;
  isClassic?: boolean;
}

const ToggleSwitch: React.FC<{
  label: string;
  checked: boolean;
  onChange?: () => void;
}> = ({ label, checked, onChange }) => (
  <label
    onClick={onChange}
    className="inline-flex items-center gap-2 cursor-pointer select-none"
  >
    <div
      className={cn(
        'relative w-7 h-4 rounded-full transition-colors cursor-pointer',
        checked ? 'bg-teal-600' : 'bg-slate-300'
      )}
    >
      <div
        className={cn(
          'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-xs',
          checked ? 'translate-x-3.5' : 'translate-x-0.5'
        )}
      />
    </div>
    <span className="text-xs text-slate-600 font-medium">{label}</span>
  </label>
);

export const LiveCameraViewer: React.FC<LiveCameraViewerProps> = ({
  engine,
  sessionId,
  scenario,
  isRunning,
  isPaused,
  showBoxes,
  showMasks,
  showLabels,
  showZones,
  showLowConf,
  confidenceThreshold = 0.6,
  onToggleBoxes,
  onToggleMasks,
  onToggleLabels,
  onToggleZones,
  onToggleLowConf,
  onFrame,
  onAlert,
  isClassic = true,
}) => {
  const [currentFrame, setCurrentFrame] = useState<LiveFrame | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<LiveAlert[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(18);
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTickRef = useRef<number>(0);

  // Timer counter
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isRunning && !isPaused) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, isPaused]);

  // Format mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const tick = useCallback(() => {
    if (!sessionId || isPaused || !isRunning) return;

    const now = performance.now();
    if (now - lastTickRef.current >= FRAME_INTERVAL_MS) {
      lastTickRef.current = now;
      const frame = engine.nextFrame(sessionId);
      if (frame) {
        setCurrentFrame(frame);
        onFrame(frame);
        if (frame.newAlerts.length > 0) {
          setRecentAlerts((prev) => [...prev, ...frame.newAlerts].slice(-5));
          onAlert(frame.newAlerts);
        }
      }
    }

    rafRef.current = setTimeout(tick, 16); // ~60Hz check, frames limited to 12fps by FRAME_INTERVAL_MS
  }, [sessionId, isPaused, isRunning, engine, onFrame, onAlert]);

  useEffect(() => {
    if (isRunning && !isPaused && sessionId) {
      lastTickRef.current = 0;
      rafRef.current = setTimeout(tick, 16);
    } else {
      if (rafRef.current) {
        clearTimeout(rafRef.current);
        rafRef.current = null;
      }
    }
    return () => {
      if (rafRef.current) {
        clearTimeout(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isRunning, isPaused, sessionId, tick]);

  // Clear selected entity when session changes
  useEffect(() => {
    setSelectedEntityId(null);
    setCurrentFrame(null);
    setRecentAlerts([]);
  }, [sessionId]);

  const environment = scenario?.environment ?? 'office';

  // =========================================================================
  // CLASSIC ENVIRONMENT: Renders exactly as shown in reference images
  // =========================================================================
  if (isClassic) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
        {/* Top Stream Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Indicator */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              EN VIVO
            </span>

            {/* IA Active / Inactive */}
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border font-mono',
                isRunning && !isPaused
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              )}
            >
              {isRunning && !isPaused ? 'IA ACTIVA' : 'IA INACTIVA'}
            </span>

            {/* Modo Demo */}
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              MODO DEMO
            </span>

            {/* Camera time & FPS */}
            <span className="font-mono text-xs font-semibold text-slate-700 ml-1">
              CAM {formatTime(elapsedSeconds)}
            </span>
            <span className="font-mono text-xs text-slate-400">
              {currentFrame?.fps ? currentFrame.fps.toFixed(1) : '12.4'} fps
            </span>
          </div>

          {/* Right limit text */}
          <span className="text-xs text-slate-400 font-medium">
            Límite de sesión: 5 min
          </span>
        </div>

        {/* Layer Switches Bar */}
        <div className="flex items-center gap-4 sm:gap-6 px-4 py-2 bg-slate-50/60 border-b border-slate-100 flex-wrap">
          <ToggleSwitch label="Cajas" checked={showBoxes} onChange={onToggleBoxes} />
          <ToggleSwitch label="Máscaras" checked={showMasks} onChange={onToggleMasks} />
          <ToggleSwitch label="Etiquetas" checked={showLabels} onChange={onToggleLabels} />
          <ToggleSwitch label="Zonas" checked={showZones} onChange={onToggleZones} />
          <ToggleSwitch label="Baja confianza" checked={showLowConf} onChange={onToggleLowConf} />
        </div>

        {/* Video Screen Viewport */}
        <div
          className="relative w-full bg-slate-950 overflow-hidden select-none"
          style={{ aspectRatio: '1000/650' }}
        >
          {scenario ? (
            <SceneRenderer
              environment={environment}
              assetImage={scenario.assetImage}
              objects={currentFrame?.objects ?? scenario.initialEntities.map((e) => ({ ...e, stateFrameCount: 0, framesSinceAlert: 0 }))}
              zones={currentFrame?.zones ?? scenario.zones}
              alerts={recentAlerts}
              showBoxes={showBoxes}
              showMasks={showMasks}
              showLabels={showLabels}
              showZones={showZones}
              showLowConfidence={showLowConf}
              confidenceThreshold={confidenceThreshold}
              selectedEntityId={selectedEntityId}
              onSelectEntity={setSelectedEntityId}
              frameNumber={currentFrame?.frameNumber ?? 0}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-600 text-sm font-mono">
              Selecciona un escenario para comenzar
            </div>
          )}

          {/* Paused indicator badge on video */}
          {isPaused && isRunning && (
            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-amber-300 border border-amber-400/40 text-xs px-3 py-1 rounded-lg font-mono">
              PAUSADO
            </div>
          )}

          {/* Notificación en tiempo real en la parte inferior izquierda del video */}
          {isRunning && !isPaused && recentAlerts.length > 0 && (
            <div className="absolute bottom-3 left-3 z-20 max-w-sm pointer-events-auto transition-all animate-fade-in">
              {(() => {
                const latestAlert = recentAlerts[recentAlerts.length - 1];
                const isCrit = latestAlert.severity === 'critical';
                return (
                  <div
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-xl backdrop-blur-md border shadow-lg text-xs',
                      isCrit
                        ? 'bg-rose-950/90 border-rose-500/80 text-rose-100 shadow-rose-950/60'
                        : 'bg-amber-950/90 border-amber-500/80 text-amber-100 shadow-amber-950/60'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[10px] uppercase font-mono tracking-wider">
                          {isCrit ? '🚨 Infracción Crítica' : '⚠️ Alerta Detectada'}
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono">
                          t={(latestAlert.frameNumber / 12).toFixed(1)}s
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-white truncate mt-0.5">
                        {latestAlert.ruleName}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Caption Bar under Video */}
        <div className="px-4 py-2.5 text-xs text-slate-500 font-normal border-t border-slate-100 bg-white">
          {scenario?.caption || scenario?.description}
        </div>
      </div>
    );
  }

  // =========================================================================
  // TECHNOLOGICAL ENVIRONMENT: Preserved exactly as originally authored
  // =========================================================================
  return (
    <div className="relative w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col select-none" style={{ aspectRatio: '1000/650' }}>
      {/* Camera label overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
        <span className="px-2.5 py-1 rounded-md bg-slate-900/85 backdrop-blur-sm text-white text-xs font-mono border border-slate-700/60 shadow-md">
          {scenario?.cameraLabel ?? 'CAM-00 · VISION AI'}
        </span>
        {isRunning && !isPaused && (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-rose-400 animate-pulse" />
            REC
          </span>
        )}
        {currentFrame && (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/70 text-slate-400 border border-slate-700/40">
            {currentFrame.objects.length} obj · {currentFrame.fps} fps
          </span>
        )}
      </div>

      {/* AI model label */}
      {scenario && (
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <span className="px-2 py-1 rounded-md bg-blue-900/50 text-blue-300 text-[10px] font-mono border border-blue-700/40">
            {scenario.aiModel}
          </span>
        </div>
      )}

      {/* SVG Scene */}
      <div className="flex-1 w-full h-full">
        {scenario ? (
          <SceneRenderer
            environment={environment}
            assetImage={scenario.assetImage}
            objects={currentFrame?.objects ?? scenario.initialEntities.map((e) => ({ ...e, stateFrameCount: 0, framesSinceAlert: 0 }))}
            zones={currentFrame?.zones ?? scenario.zones}
            alerts={recentAlerts}
            showBoxes={showBoxes}
            showMasks={showMasks}
            showLabels={showLabels}
            showZones={showZones}
            showLowConfidence={showLowConf}
            confidenceThreshold={confidenceThreshold}
            selectedEntityId={selectedEntityId}
            onSelectEntity={setSelectedEntityId}
            frameNumber={currentFrame?.frameNumber ?? 0}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-600 text-sm font-mono">
            Selecciona un escenario para comenzar
          </div>
        )}
      </div>

      {/* Not running overlay */}
      {!isRunning && scenario && (
        <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center gap-3 backdrop-blur-sm z-10">
          <div className="text-5xl">🎥</div>
          <div className="text-center">
            <div className="text-white font-semibold text-sm">{scenario.name}</div>
            <div className="text-slate-400 text-xs mt-1 max-w-xs text-center">{scenario.description}</div>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
            {scenario.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-mono">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">Pulse «Iniciar análisis» para comenzar</div>
        </div>
      )}

      {/* Paused overlay */}
      {isPaused && isRunning && (
        <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-4xl mb-2">⏸</div>
            <div className="text-white font-semibold text-sm">Sesión pausada</div>
            <div className="text-slate-400 text-xs mt-1">Frame #{currentFrame?.frameNumber ?? 0} conservado</div>
          </div>
        </div>
      )}

      {/* Selected entity detail strip */}
      {selectedEntityId && currentFrame && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700/60 px-4 py-2 flex items-center gap-4">
          {(() => {
            const entity = currentFrame.objects.find((o) => o.id === selectedEntityId);
            if (!entity) return null;
            return (
              <>
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: entity.color }}
                />
                <div className="flex flex-col">
                  <span className="text-white text-[11px] font-semibold font-mono">{entity.label}</span>
                  <span className="text-slate-400 text-[10px] font-mono">{entity.trackId} · Estado: {entity.state}</span>
                </div>
                <div className="flex gap-3 text-[10px] font-mono text-slate-400">
                  <span>X: {(entity.x * 100).toFixed(1)}%</span>
                  <span>Y: {(entity.y * 100).toFixed(1)}%</span>
                  <span>Conf: {Math.round(entity.confidence * 100)}%</span>
                  {entity.hasDrink && <span className="text-amber-400">⚠ BEBIDA</span>}
                  {entity.hasESDGloves === false && <span className="text-orange-400">⚠ SIN ESD</span>}
                  {entity.hasCredential === false && <span className="text-red-400">⚠ SIN CREDENCIAL</span>}
                </div>
                <button
                  onClick={() => setSelectedEntityId(null)}
                  className="ml-auto text-slate-500 hover:text-slate-200 text-[10px] font-mono"
                >
                  ✕ Cerrar
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Object count bar at very bottom when not selected */}
      {!selectedEntityId && currentFrame && isRunning && (
        <div className="absolute bottom-2 left-3 right-3 z-10 pointer-events-none">
          <div className="text-[10px] font-mono text-slate-500 text-center">
            {currentFrame.objects.length > 0
              ? `Detecciones sobre el umbral por segundo · últimos 60s`
              : 'Sin detecciones en el umbral actual'}
          </div>
        </div>
      )}
    </div>
  );
};

