import React, { useState, useCallback, useRef } from 'react';
import { useApp } from '../../app/providers/AppContext';
import { DemoLiveAdapter } from '../../infrastructure/vision/DemoLiveAdapter';
import { LIVE_SCENARIOS } from '../../core/domain/liveScenarios';
import type { LiveFrame, LiveAlert, LiveSession, LiveScenario, LiveRule, TrackedObject } from '../../core/domain/liveTypes';
import { LiveCameraViewer } from './components/LiveCameraViewer';
import { LiveControlsBar } from './components/LiveControlsBar';
import { LiveMetricsPanel } from './components/LiveMetricsPanel';
import { SessionSummaryModal } from './components/SessionSummaryModal';
import { Badge } from '../../shared/ui/Badge';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

// Singleton live engine - shared across renders
const liveEngine = new DemoLiveAdapter();

export const LiveMonitorPage: React.FC = () => {
  const { showToast } = useApp();

  // Session state
  const [session, setSession] = useState<LiveSession | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Scenario selection
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(LIVE_SCENARIOS[0].id);
  const selectedScenario: LiveScenario | undefined = LIVE_SCENARIOS.find(
    (s: LiveScenario) => s.id === selectedScenarioId
  );

  // Frame & alert state
  const [currentFrame, setCurrentFrame] = useState<LiveFrame | null>(null);
  const [sessionAlerts, setSessionAlerts] = useState<LiveAlert[]>([]);
  const captureFrameRef = useRef<number>(0);

  // Summary modal
  const [showSummary, setShowSummary] = useState(false);

  // Overlay controls
  const [showBoxes, setShowBoxes] = useState(true);
  const [showMasks, setShowMasks] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showLowConf, setShowLowConf] = useState(false);

  const handleFrame = useCallback((frame: LiveFrame) => {
    setCurrentFrame(frame);
  }, []);

  const handleAlert = useCallback(
    (alerts: LiveAlert[]) => {
      setSessionAlerts((prev: LiveAlert[]) => [...prev, ...alerts]);
      alerts.forEach((alert: LiveAlert) => {
        const icon = alert.severity === 'critical' || alert.severity === 'high' ? '🚨' : '⚠️';
        showToast(
          `${icon} ${alert.ruleName}: ${alert.message.slice(0, 60)}...`,
          alert.severity === 'critical' ? 'error' : 'warning'
        );
      });
    },
    [showToast]
  );

  const handleStart = async () => {
    try {
      const newSession = await liveEngine.startSession({ scenarioId: selectedScenarioId });
      setSession(newSession);
      setSessionId(newSession.id);
      setSessionAlerts([]);
      setCurrentFrame(null);
      setIsRunning(true);
      setIsPaused(false);
      showToast(`Sesión de monitoreo iniciada: ${selectedScenario?.name}`, 'success');
    } catch {
      showToast('Error al iniciar la sesión de monitoreo.', 'error');
    }
  };

  const handlePause = () => {
    if (sessionId) {
      liveEngine.pauseSession(sessionId);
      setIsPaused(true);
      setSession((prev: LiveSession | null) => (prev ? { ...prev, status: 'paused' } : prev));
      showToast('Sesión de monitoreo en pausa.', 'info');
    }
  };

  const handleResume = () => {
    if (sessionId) {
      liveEngine.resumeSession(sessionId);
      setIsPaused(false);
      setSession((prev: LiveSession | null) => (prev ? { ...prev, status: 'running' } : prev));
      showToast('Sesión de monitoreo reanudada.', 'info');
    }
  };

  const handleStop = () => {
    if (sessionId) {
      const finalSession = liveEngine.stopSession(sessionId);
      setIsRunning(false);
      setIsPaused(false);
      if (finalSession) {
        setSession(finalSession);
        setShowSummary(true);
        showToast(
          `Sesión finalizada: ${finalSession.totalFrames} fotogramas · ${finalSession.totalAlerts} alertas`,
          'success'
        );
      }
    }
  };

  const handleExportCsv = useCallback(() => {
    if (!session) return;
    const rows = [
      'id,severidad,regla,mensaje,timestamp,estado',
      ...sessionAlerts.map((a: LiveAlert) =>
        `${a.id},${a.severity},${a.ruleName},"${a.message}",${a.timestamp},${a.status}`
      ),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-${session.id}-alerts.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Reporte CSV descargado con éxito.', 'success');
  }, [session, sessionAlerts, showToast]);

  const handleCapture = () => {
    captureFrameRef.current = currentFrame?.frameNumber ?? 0;
    showToast(`Fotograma #${captureFrameRef.current} capturado para auditoría.`, 'info');
  };

  const handleAcknowledgeAlert = useCallback(
    (alertId: string) => {
      setSessionAlerts((prev: LiveAlert[]) =>
        prev.map((a: LiveAlert) =>
          a.id === alertId ? { ...a, status: 'acknowledged' as const } : a
        )
      );
      showToast('Alerta marcada como revisada.', 'success');
    },
    [showToast]
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Intro Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="red">Monitoreo en Vivo</Badge>
              <span className="text-xs text-slate-400 font-mono">12 FPS · Inferencia Continua</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Monitoreo en Vivo en Tiempo Real
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Supervisión automatizada de espacios críticos mediante visión artificial cinemática. Evalúa personas, cascos, credenciales y permanencia en zonas de riesgo con reglas antirrebote.
            </p>
          </div>

          {/* Session Summary Badges */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {session && (
              <>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {session.totalFrames} fotogramas
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {session.totalAlerts} alertas
                </div>
              </>
            )}
            {session && session.status !== 'ended' && (
              <Badge variant="green" className="py-1">
                Sesión {session.id.slice(-6)} activa
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <LiveControlsBar
        isRunning={isRunning}
        isPaused={isPaused}
        session={session}
        scenarios={LIVE_SCENARIOS}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={setSelectedScenarioId}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        onCapture={handleCapture}
        showBoxes={showBoxes}
        showMasks={showMasks}
        showLabels={showLabels}
        showZones={showZones}
        showLowConf={showLowConf}
        onToggleBoxes={() => setShowBoxes((v) => !v)}
        onToggleMasks={() => setShowMasks((v) => !v)}
        onToggleLabels={() => setShowLabels((v) => !v)}
        onToggleZones={() => setShowZones((v) => !v)}
        onToggleLowConf={() => setShowLowConf((v) => !v)}
        fps={currentFrame?.fps ?? 0}
        frameNumber={currentFrame?.frameNumber ?? 0}
        cameraLabel={selectedScenario?.cameraLabel ?? 'CAM-00 · VISION AI'}
      />

      {/* Main Content: Camera Viewer + Live Metrics Panel */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Column: Camera Screen & Dynamic Info */}
        <div className="flex-1 min-w-0 w-full space-y-3">
          <LiveCameraViewer
            engine={liveEngine}
            sessionId={sessionId}
            scenario={selectedScenario ?? null}
            isRunning={isRunning}
            isPaused={isPaused}
            showBoxes={showBoxes}
            showMasks={showMasks}
            showLabels={showLabels}
            showZones={showZones}
            showLowConf={showLowConf}
            onFrame={handleFrame}
            onAlert={handleAlert}
          />

          {/* Objects Detected in Current Frame */}
          {currentFrame && currentFrame.objects.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Objetos Detectados en Escena ({currentFrame.objects.length})
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Tracking NMS activo · Umbral &gt; 50%
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentFrame.objects.map((obj: TrackedObject) => (
                  <div
                    key={obj.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-medium shadow-2xs"
                    style={{
                      borderColor: obj.color + '50',
                      backgroundColor: obj.color + '12',
                      color: obj.color,
                    }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: obj.color }} />
                    <span className="font-bold">{obj.trackId}</span>
                    {obj.hasDrink && <span title="Bebida detectada en zona">🥤</span>}
                    {obj.hasESDGloves === false && <span title="Sin guantes antiestáticos">⚡</span>}
                    {obj.hasCredential === false && <span title="Sin credencial visible">🚫</span>}
                    <span className="text-slate-500 text-[10px]">
                      {Math.round(obj.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scenario Description & Rules Card (when idle) */}
          {!isRunning && selectedScenario && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{selectedScenario.name}</h4>
                  <Badge variant="blue" className="text-[10px]">
                    {selectedScenario.sector}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedScenario.description}
                </p>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Reglas en cola de evaluación:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedScenario.rules
                      .filter((r: LiveRule) => r.enabled)
                      .map((rule: LiveRule) => {
                        const style =
                          rule.severity === 'critical'
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : rule.severity === 'high'
                            ? 'bg-orange-50 border-orange-200 text-orange-700'
                            : rule.severity === 'medium'
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-slate-100 border-slate-200 text-slate-700';

                        return (
                          <span
                            key={rule.id}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${style}`}
                          >
                            {rule.name}
                          </span>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Metrics & Real-Time Alerts Feed */}
        <div className="w-full lg:w-80 shrink-0 bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs h-auto lg:h-[650px] flex flex-col overflow-hidden">
          <LiveMetricsPanel
            frame={currentFrame}
            session={session}
            sessionAlerts={sessionAlerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
          />
        </div>
      </div>

      {/* Session Summary Modal */}
      {showSummary && session && (
        <SessionSummaryModal
          session={session}
          alerts={sessionAlerts}
          onClose={() => setShowSummary(false)}
          onExportCsv={handleExportCsv}
        />
      )}
    </div>
  );
};
