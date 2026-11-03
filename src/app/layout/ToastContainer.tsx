import React from 'react';
import { useApp } from '../providers/AppContext';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../shared/utils/cn';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  const icons = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
    info: Info,
  };

  const styles = {
    success: "bg-emerald-50 border-emerald-300 text-emerald-900",
    warning: "bg-amber-50 border-amber-300 text-amber-900",
    error: "bg-rose-50 border-rose-300 text-rose-900",
    info: "bg-blue-50 border-blue-300 text-blue-900",
  };

  const iconColors = {
    success: "text-emerald-600",
    warning: "text-amber-600",
    error: "text-rose-600",
    info: "text-blue-600",
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-bounce-subtle",
              styles[toast.type]
            )}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={cn("w-4 h-4 shrink-0", iconColors[toast.type])} />
              <p className="text-xs font-medium leading-tight">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

