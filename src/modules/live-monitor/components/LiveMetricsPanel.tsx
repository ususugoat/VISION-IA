import React, { useState } from 'react';
import { Activity, Users, Bell, Zap, Clock, TrendingUp, CheckCircle, XCircle, FileText, ExternalLink, Image as ImageIcon } from 'lucide-react';
import type { LiveFrame, LiveSession, LiveAlert } from '../../../core/domain/liveTypes';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { Modal } from '../../../shared/ui/Modal';
import { cn } from '../../../shared/utils/cn';

interface LiveMetricsPanelProps {
  frame: LiveFrame | null;
  session: LiveSession | null;
  sessionAlerts: LiveAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onResolveAlert?: (alertId: string) => void;
  onAddNote?: (alertId: string, note: string) => void;
  isClassic?: boolean;
}

const MetricBox: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
}> = ({ label, value, sub, icon }) => (
  <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
    <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
      <span className="flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </div>
    <div className="text-xl font-bold font-mono tracking-tight text-slate-900 mt-1">
      {value}
    </div>
    {sub && <span className="text-[10px] text-slate-400 font-mono mt-0.5">{sub}</span>}
  </div>
);

export const LiveMetricsPanel: React.FC<LiveMetricsPanelProps> = ({
  frame,
  session,
  sessionAlerts,
  onAcknowledgeAlert,
  onResolveAlert,
  onAddNote,
  isClassic = true,
}) => {
  const [selectedAlertForEvidence, setSelectedAlertForEvidence] = useState<LiveAlert | null>(null);
  const [selectedAlertForNote, setSelectedAlertForNote] = useState<LiveAlert | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');

  const objectsNow = frame?.objectsNow ?? 0;
  const uniqueTracked = frame?.uniqueTrackedIds ?? 0;
  const maxSim = frame?.maxSimultaneous ?? 0;
  const avgConf = frame ? (frame.averageConfidence * 100).toFixed(1) : '0.0';
  const latency = frame?.latencyMs ?? 0;

  // Live alerts of the current session in real time
  const effectiveAlerts: LiveAlert[] = sessionAlerts;

  const handleSaveNote = () => {
    if (selectedAlertForNote && onAddNote) {
      onAddNote(selectedAlertForNote.id, noteInput);
    }
    setSelectedAlertForNote(null);
    setNoteInput('');
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* ================================================================= */}
      {/* CARD 1: MÉTRICAS EN TIEMPO REAL                                   */}
      {/* ================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Métricas en tiempo real
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <MetricBox
            label="Objetos ahora"
            value={objectsNow}
            icon={<Users className="w-3.5 h-3.5 text-slate-400" />}
          />
          <MetricBox
            label="Objetos rastreados"
            value={uniqueTracked}
            sub="IDs únicos (track)"
            icon={<TrendingUp className="w-3.5 h-3.5 text-slate-400" />}
          />
          <MetricBox
            label="Máx. simultáneos"
            value={maxSim}
            icon={<Users className="w-3.5 h-3.5 text-slate-400" />}
          />
          <MetricBox
            label="Alertas"
            value={effectiveAlerts.length}
            icon={<Bell className="w-3.5 h-3.5 text-slate-400" />}
          />
          <MetricBox
            label="Confianza media"
            value={`${avgConf} %`}
            icon={<Zap className="w-3.5 h-3.5 text-slate-400" />}
          />
          <MetricBox
            label="Latencia media"
            value={`${latency} ms`}
            sub="simulada"
            icon={<Clock className="w-3.5 h-3.5 text-slate-400" />}
          />
        </div>
      </div>

      {/* ================================================================= */}
      {/* CARD 2: REGLAS EN EVALUACIÓN                                      */}
      {/* ================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Reglas en evaluación
          </h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed font-sans">
          Antirrebote: la condición debe sostenerse 1.5 s - enfriamiento 30 s por objeto
        </p>
        <p className="text-xs text-slate-400 font-sans italic pt-1 border-t border-slate-100">
          {frame ? `Evaluación activa · Frame #${frame.frameNumber}` : 'Pulse «Iniciar análisis».'}
        </p>
      </div>

      {/* ================================================================= */}
      {/* CARD 3: ALERTAS DE LA SESIÓN                                      */}
      {/* ================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Alertas de la sesión ({effectiveAlerts.length})
            </h3>
          </div>
        </div>

        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-0.5">
          {effectiveAlerts.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">
              Sin incidentes detectados.
            </div>
          ) : (
            effectiveAlerts.map((alert) => {
              const isHigh = alert.severity === 'high' || alert.severity === 'critical';
              const seconds = (alert.frameNumber / 12).toFixed(1);

              return (
                <div
                  key={alert.id}
                  className="rounded-xl border border-rose-100 bg-rose-50/40 p-3 space-y-2 shadow-2xs transition-all hover:bg-rose-50/70"
                >
                  {/* Top Badges and Timestamp */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold font-mono',
                        isHigh ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {isHigh ? '▲ Alta' : '▲ Media'}
                      </span>

                      <span className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-medium border font-mono',
                        alert.status === 'active'
                          ? 'border-orange-300 text-orange-700 bg-white'
                          : alert.status === 'acknowledged'
                          ? 'border-slate-300 text-slate-600 bg-white'
                          : 'border-emerald-300 text-emerald-700 bg-white'
                      )}>
                        {alert.status === 'active'
                          ? 'Nueva'
                          : alert.status === 'acknowledged'
                          ? 'Revisada'
                          : 'Cerrada'}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      t = {seconds} s
                    </span>
                  </div>

                  {/* Alert Title */}
                  <div className="font-bold text-xs text-slate-900 leading-snug">
                    {alert.ruleName}
                  </div>

                  {/* Alert Body / Evidence */}
                  <div className="text-[11px] text-slate-600 leading-relaxed font-sans">
                    {alert.message}
                  </div>

                  {/* Evidence Link */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setSelectedAlertForEvidence(alert)}
                      className="text-[11px] text-slate-500 hover:text-slate-900 underline font-medium cursor-pointer"
                    >
                      Ver fotograma de evidencia
                    </button>
                  </div>

                  {/* Note preview if any */}
                  {alert.notes && (
                    <div className="text-[10px] text-slate-600 bg-white/80 border border-slate-200/80 rounded px-2 py-1 italic font-mono">
                      Nota: {alert.notes}
                    </div>
                  )}

                  {/* Action Buttons: matching Photo 4 */}
                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAlertForNote(alert);
                        setNoteInput(alert.notes || '');
                      }}
                      className="text-[10px] px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-slate-500" />
                      Nota u observación
                    </button>

                    {alert.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="text-[10px] px-2.5 py-1 rounded bg-teal-800 hover:bg-teal-900 text-white font-medium shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3 text-teal-300" />
                        Marcar revisada
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onResolveAlert?.(alert.id)}
                      className="text-[10px] px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 font-medium shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3 text-slate-400" />
                      Cerrar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* EVIDENCE SNAPSHOT MODAL                                           */}
      {/* ================================================================= */}
      {selectedAlertForEvidence && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAlertForEvidence(null)}
          title="Fotograma de Evidencia de Infracción"
        >
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-xl p-6 text-center text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
              <div className="absolute top-3 left-3 bg-slate-800/80 text-rose-300 border border-rose-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
                EVIDENCIA #{selectedAlertForEvidence.screenshotFrame || selectedAlertForEvidence.frameNumber} · t={(selectedAlertForEvidence.frameNumber / 12).toFixed(1)}s
              </div>
              <ImageIcon className="w-12 h-12 text-slate-600 mb-2" />
              <div className="text-sm font-bold text-slate-200">
                Captura óptica de alta resolución
              </div>
              <div className="text-xs text-slate-400 max-w-sm mt-1">
                {selectedAlertForEvidence.ruleName}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-700">
                <span className="font-bold">Regla Evaluada:</span>
                <span>{selectedAlertForEvidence.ruleName}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-bold">Confianza de Inferencia:</span>
                <span>{Math.round(selectedAlertForEvidence.confidence * 100)}%</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-bold">Estado Actual:</span>
                <span className="capitalize">{selectedAlertForEvidence.status}</span>
              </div>
              <p className="text-slate-600 text-[11px] pt-1.5 border-t border-slate-200">
                {selectedAlertForEvidence.message}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedAlertForEvidence(null)}>
                Cerrar vista
              </Button>
              {selectedAlertForEvidence.status === 'active' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onAcknowledgeAlert(selectedAlertForEvidence.id);
                    setSelectedAlertForEvidence(null);
                  }}
                >
                  Marcar revisada
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ================================================================= */}
      {/* NOTE EDIT MODAL                                                   */}
      {/* ================================================================= */}
      {selectedAlertForNote && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAlertForNote(null)}
          title="Agregar Nota u Observación de Auditoría"
        >
          <div className="space-y-3.5">
            <p className="text-xs text-slate-600">
              Registra una anotación oficial para la alerta: <span className="font-bold">{selectedAlertForNote.ruleName}</span>
            </p>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Ej: Operador de montacargas notificado por radiocanal. Se reubicó la carga sin incidentes."
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedAlertForNote(null)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveNote}>
                Guardar observación
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
