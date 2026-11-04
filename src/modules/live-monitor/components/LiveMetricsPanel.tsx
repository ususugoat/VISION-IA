import React from 'react';
import { Activity, Users, Bell, Zap, Clock, TrendingUp } from 'lucide-react';
import type { LiveFrame, LiveSession, LiveAlert } from '../../../core/domain/liveTypes';
import { Badge } from '../../../shared/ui/Badge';
import { cn } from '../../../shared/utils/cn';

interface LiveMetricsPanelProps {
  frame: LiveFrame | null;
  session: LiveSession | null;
  sessionAlerts: LiveAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
}

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  highlight?: boolean;
  pulse?: boolean;
}> = ({ label, value, sub, icon, highlight, pulse }) => (
  <div
    className={cn(
      'p-3 rounded-xl border flex flex-col justify-between transition-all duration-150',
      highlight
        ? 'bg-rose-50 border-rose-200 shadow-2xs'
        : 'bg-slate-50/70 border-slate-200/90 hover:bg-slate-50'
    )}
  >
    <div className="flex items-center justify-between">
      <span
        className={cn(
          'text-[10px] font-bold uppercase tracking-wider',
          highlight ? 'text-rose-700' : 'text-slate-500'
        )}
      >
        {label}
      </span>
      <span className={cn(highlight ? 'text-rose-600' : 'text-slate-400')}>{icon}</span>
    </div>
    <div
      className={cn(
        'text-xl font-bold font-mono tracking-tight mt-1',
        highlight ? 'text-rose-700' : 'text-slate-900'
      )}
    >
      {pulse ? (
        <span className="inline-flex items-center gap-1.5">
          {value}
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </span>
      ) : (
        value
      )}
    </div>
    {sub && <span className="text-[10px] text-slate-500 font-mono mt-0.5">{sub}</span>}
  </div>
);

const severityStyles: Record<
  string,
  {
    card: string;
    badge: 'red' | 'amber' | 'slate';
    label: string;
  }
> = {
  critical: {
    card: 'bg-rose-50/80 border-rose-200 text-rose-950',
    badge: 'red',
    label: 'Crítica',
  },
  high: {
    card: 'bg-orange-50/80 border-orange-200 text-orange-950',
    badge: 'red',
    label: 'Alta',
  },
  medium: {
    card: 'bg-amber-50/80 border-amber-200 text-amber-950',
    badge: 'amber',
    label: 'Media',
  },
  low: {
    card: 'bg-slate-50 border-slate-200 text-slate-800',
    badge: 'slate',
    label: 'Baja',
  },
};

export const LiveMetricsPanel: React.FC<LiveMetricsPanelProps> = ({
  frame,
  session,
  sessionAlerts,
  onAcknowledgeAlert,
}) => {
  const activeAlerts = sessionAlerts.filter((a) => a.status === 'active');
  const fps = frame?.fps ?? 0;
  const latency = frame?.latencyMs ?? 0;
  const objectsNow = frame?.objectsNow ?? 0;
  const uniqueTracked = frame?.uniqueTrackedIds ?? 0;
  const maxSim = frame?.maxSimultaneous ?? 0;
  const avgConf = frame ? Math.round(frame.averageConfidence * 100) : 0;

  return (
    <div className="flex flex-col gap-3.5 h-full overflow-y-auto pr-0.5">
      {/* Real-time Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Métricas en Tiempo Real
          </span>
        </div>
        {frame && (
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Recibiendo telemetría" />
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <MetricCard
          label="Objetos Ahora"
          value={objectsNow}
          icon={<Users className="w-3.5 h-3.5" />}
          pulse={!!frame}
        />
        <MetricCard
          label="Trackeados"
          value={uniqueTracked}
          sub="IDs únicos"
          icon={<TrendingUp className="w-3.5 h-3.5" />}
        />
        <MetricCard
          label="Máx. Simultáneos"
          value={maxSim}
          icon={<Users className="w-3.5 h-3.5" />}
        />
        <MetricCard
          label="Alertas Activas"
          value={activeAlerts.length}
          icon={<Bell className="w-3.5 h-3.5" />}
          highlight={activeAlerts.length > 0}
        />
        <MetricCard
          label="Confianza Media"
          value={`${avgConf}%`}
          icon={<Zap className="w-3.5 h-3.5" />}
        />
        <MetricCard
          label="Latencia"
          value={`${latency} ms`}
          sub="simulada"
          icon={<Clock className="w-3.5 h-3.5" />}
        />
      </div>

      {/* Rules Evaluation Box */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">
            Reglas en Evaluación
          </span>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-[11px] text-slate-600 font-mono space-y-1">
          <div>· Antirrebote: Sostener condición 1.5 s</div>
          <div>· Enfriamiento: 30 s por cada entidad</div>
          <div className="pt-1.5 border-t border-slate-200/60 text-blue-700 font-semibold">
            {frame ? `Frame #${frame.frameNumber} · ${fps} FPS` : 'Esperando: Pulsa «Iniciar análisis»'}
          </div>
        </div>
      </div>

      {/* Session Alerts Feed */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">
              Alertas de la Sesión ({sessionAlerts.length})
            </span>
          </div>
          {activeAlerts.length > 0 && (
            <Badge variant="red" className="text-[10px]">
              {activeAlerts.length} activa{activeAlerts.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto max-h-60 pr-0.5">
          {sessionAlerts.length === 0 ? (
            <div className="text-[11px] text-slate-400 text-center py-6 font-mono bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Sin incidentes detectados.
            </div>
          ) : (
            [...sessionAlerts].reverse().map((alert) => {
              const conf = severityStyles[alert.severity] ?? severityStyles.low;

              return (
                <div
                  key={alert.id}
                  className={cn('rounded-xl border p-2.5 text-xs transition-all shadow-2xs', conf.card)}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={conf.badge} className="text-[9px] py-0 px-1.5">
                        {conf.label}
                      </Badge>
                      <span
                        className={cn(
                          'px-1.5 py-0.2 rounded text-[9px] font-semibold font-mono border',
                          alert.status === 'active'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : alert.status === 'acknowledged'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        )}
                      >
                        {alert.status === 'active'
                          ? '● Nueva'
                          : alert.status === 'acknowledged'
                          ? '○ Revisada'
                          : '✓ Resuelta'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      t={(alert.frameNumber / 12).toFixed(1)}s
                    </span>
                  </div>

                  <div className="font-bold text-[11px] text-slate-900 leading-snug mb-0.5">
                    {alert.ruleName}
                  </div>
                  <div className="text-[10px] text-slate-600 leading-snug mb-2 line-clamp-2">
                    {alert.message}
                  </div>

                  {alert.status === 'active' && (
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold shadow-2xs cursor-pointer transition-colors"
                      >
                        Marcar revisada
                      </button>
                      <span className="text-[9px] text-slate-400 font-mono">
                        Frame #{alert.screenshotFrame}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Session summary footer */}
      {session && (
        <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-mono space-y-0.5">
          <div className="flex items-center justify-between">
            <span>Sesión:</span>
            <span className="font-semibold text-slate-700">{session.id.slice(-8)}</span>
          </div>
          <div>
            {session.totalFrames} fotogramas · {(session.totalFrames / 12).toFixed(1)}s de análisis
          </div>
        </div>
      )}
    </div>
  );
};
