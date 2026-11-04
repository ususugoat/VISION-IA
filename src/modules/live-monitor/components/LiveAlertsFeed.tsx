import React from 'react';
import { Bell, CheckCircle2, Clock } from 'lucide-react';
import type { LiveAlert } from '../../../core/domain/liveTypes';
import { Badge } from '../../../shared/ui/Badge';
import { cn } from '../../../shared/utils/cn';

interface LiveAlertsFeedProps {
  alerts: LiveAlert[];
  onAcknowledge: (id: string) => void;
  maxVisible?: number;
}

const severityConfig: Record<
  string,
  {
    label: string;
    cardCls: string;
    badgeVariant: 'red' | 'amber' | 'slate';
  }
> = {
  critical: {
    label: 'Crítica',
    cardCls: 'bg-rose-50/80 border-rose-200 text-rose-950',
    badgeVariant: 'red',
  },
  high: {
    label: 'Alta',
    cardCls: 'bg-orange-50/80 border-orange-200 text-orange-950',
    badgeVariant: 'red',
  },
  medium: {
    label: 'Media',
    cardCls: 'bg-amber-50/80 border-amber-200 text-amber-950',
    badgeVariant: 'amber',
  },
  low: {
    label: 'Baja',
    cardCls: 'bg-slate-50 border-slate-200 text-slate-800',
    badgeVariant: 'slate',
  },
};

export const LiveAlertsFeed: React.FC<LiveAlertsFeedProps> = ({
  alerts,
  onAcknowledge,
  maxVisible = 20,
}) => {
  const visible = [...alerts].reverse().slice(0, maxVisible);
  const activeCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell className={cn('w-4 h-4', activeCount > 0 ? 'text-rose-500' : 'text-slate-400')} />
          <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Feed de Alertas
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {activeCount > 0 && (
            <Badge variant="red" className="text-[10px]">
              {activeCount} activa{activeCount !== 1 ? 's' : ''}
            </Badge>
          )}
          <span className="text-[11px] text-slate-500 font-mono">{alerts.length} total</span>
        </div>
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <span className="text-xs text-slate-500 font-mono">Sin alertas registradas</span>
          </div>
        )}

        {visible.map((alert) => {
          const cfg = severityConfig[alert.severity] ?? severityConfig.low;
          const timeLabel = `t=${(alert.frameNumber / 12).toFixed(1)}s`;

          return (
            <div
              key={alert.id}
              className={cn(
                'rounded-xl border p-2.5 text-xs transition-opacity shadow-2xs',
                cfg.cardCls,
                alert.status !== 'active' && 'opacity-65'
              )}
            >
              {/* Top row */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Badge variant={cfg.badgeVariant} className="text-[9px] px-1.5 py-0">
                    {cfg.label}
                  </Badge>
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded text-[9px] font-mono border',
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
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                  <Clock className="w-3 h-3" />
                  {timeLabel}
                </div>
              </div>

              {/* Rule name */}
              <div className="font-bold text-[11px] text-slate-900 leading-snug mb-0.5">
                {alert.ruleName}
              </div>

              {/* Message */}
              <div className="text-[10px] text-slate-600 leading-snug mb-2 line-clamp-2">
                {alert.message}
              </div>

              {/* Action buttons */}
              {alert.status === 'active' && (
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => onAcknowledge(alert.id)}
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
        })}
      </div>
    </div>
  );
};
