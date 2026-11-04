import React from 'react';
import type { LiveSession, LiveAlert } from '../../../core/domain/liveTypes';
import { X, Download, AlertTriangle, CheckCircle2, Clock, Camera, Activity, FileSpreadsheet } from 'lucide-react';
import { Button } from '../../../shared/ui/Button';
import { Badge } from '../../../shared/ui/Badge';

interface Props {
  session: LiveSession;
  alerts: LiveAlert[];
  onClose: () => void;
  onExportCsv: () => void;
}

function SeverityBadge({ severity }: { severity: string }) {
  const variantMap: Record<string, 'red' | 'amber' | 'slate'> = {
    critical: 'red',
    high: 'red',
    medium: 'amber',
    low: 'slate',
  };
  const labelMap: Record<string, string> = {
    critical: 'Crítica',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  };

  return (
    <Badge variant={variantMap[severity] ?? 'slate'} className="text-[10px] uppercase font-bold">
      {labelMap[severity] ?? severity}
    </Badge>
  );
}

export function SessionSummaryModal({ session, alerts, onClose, onExportCsv }: Props) {
  const durationSec = Math.round(session.totalFrames / 12);
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const highCount = alerts.filter((a) => a.severity === 'high').length;
  const ackCount = alerts.filter((a) => a.status === 'acknowledged').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-500 flex items-center justify-center shadow-xs text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Resumen de Sesión de Monitoreo</h2>
                <Badge variant="green">Finalizada</Badge>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">ID: {session.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KPI Grid Strip */}
        <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/40">
          {[
            { icon: Camera, label: 'Fotogramas', value: session.totalFrames, color: 'text-blue-600' },
            { icon: Clock, label: 'Duración (s)', value: `${durationSec} s`, color: 'text-indigo-600' },
            { icon: Activity, label: 'Objetos Track', value: session.uniqueObjectsTracked, color: 'text-emerald-600' },
            { icon: AlertTriangle, label: 'Alertas Totales', value: session.totalAlerts, color: 'text-rose-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="p-3.5 flex flex-col items-center text-center gap-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-lg font-bold font-mono text-slate-900">{value}</span>
              <span className="text-[11px] font-medium text-slate-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Alert Breakdown Cards */}
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
            Desglose de Alertas Registradas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex flex-col">
              <span className="text-xl font-bold font-mono text-rose-700">{criticalCount}</span>
              <span className="text-xs font-semibold text-rose-800 mt-0.5">Críticas</span>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex flex-col">
              <span className="text-xl font-bold font-mono text-orange-700">{highCount}</span>
              <span className="text-xs font-semibold text-orange-800 mt-0.5">Altas</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col">
              <span className="text-xl font-bold font-mono text-amber-700">
                {alerts.length - criticalCount - highCount}
              </span>
              <span className="text-xs font-semibold text-amber-800 mt-0.5">Medias / Bajas</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col">
              <span className="text-xl font-bold font-mono text-emerald-700">{ackCount}</span>
              <span className="text-xs font-semibold text-emerald-800 mt-0.5">Auditadas</span>
            </div>
          </div>
        </div>

        {/* Alert Log List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Registro Cronológico de Incidentes ({alerts.length})
          </h3>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No se generaron alertas de seguridad durante esta sesión de monitoreo.
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={alert.severity} />
                    <span className="font-bold text-slate-900">{alert.ruleName}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    t={(alert.frameNumber / 12).toFixed(1)}s (Frame #{alert.screenshotFrame})
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{alert.message}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>Estado: <strong className="text-slate-700 uppercase">{alert.status}</strong></span>
                  <span>ID: {alert.id}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
          >
            Descargar Reporte CSV
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Entendido / Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
