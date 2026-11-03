import React, { useState, useEffect } from 'react';
import { useApp } from '../../../app/providers/AppContext';
import { BusinessRule } from '../../../core/domain/types';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { Sparkles, ShieldAlert, Sliders, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const PatternsPage: React.FC = () => {
  const { showToast, permissions, manageRulesUseCase } = useApp();
  const [rules, setRules] = useState<BusinessRule[]>([]);

  useEffect(() => {
    manageRulesUseCase.listRules().then(setRules);
  }, [manageRulesUseCase]);

  const toggleRuleEnabled = async (rule: BusinessRule) => {
    if (!permissions.canManageRules) {
      showToast("Tu rol actual no tiene permisos para modificar reglas", "warning");
      return;
    }
    const updated = await manageRulesUseCase.toggleRule(rule.id, !rule.enabled);
    setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
    showToast(`Regla "${rule.name}" ${updated.enabled ? 'activada' : 'desactivada'}`, "info");
  };

  const severityBadgeMap: Record<string, 'red' | 'amber' | 'blue' | 'slate'> = {
    critical: 'red',
    high: 'red',
    medium: 'amber',
    low: 'blue',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="amber">Inferencia de Eventos & Reglas</Badge>
          <span className="text-xs text-slate-400">Sección 2.3 & 7.2 del Documento</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Reconocimiento de Patrones y Reglas de Negocio
        </h2>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          Los patrones detectan desviaciones operacionales y anomalías relacionando múltiples detecciones espaciales y temporales (por ejemplo: persona detectada sin casco obligatorio en zona de maniobras).
        </p>
      </div>

      {/* Human in the loop Notice (Mandatory from Section 2.3 & 7.2) */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-bold text-amber-950">
            Principio Ético: Confianza Estadística vs Validación Humana (Human-in-the-Loop)
          </p>
          <p className="text-amber-800 leading-relaxed">
            La confianza expresada por los modelos es una estimación probabilística, no una garantía de certeza. No se debe sancionar o catalogar a una persona o lote únicamente por una detección incierta; el sistema siempre presenta la evidencia visual y exige la confirmación de un supervisor o auditor.
          </p>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <Card key={rule.id} className="flex flex-col justify-between space-y-4 border border-slate-200/90 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={severityBadgeMap[rule.severity] || 'slate'}>
                      {rule.severity.toUpperCase()}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-400">{rule.id}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>
                </div>

                {/* Enable / Disable switch */}
                <label className={`relative inline-flex items-center shrink-0 ${permissions.canManageRules ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    disabled={!permissions.canManageRules}
                    onChange={() => toggleRuleEnabled(rule)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <p className="font-semibold text-slate-900 mb-0.5">Condición Lógica:</p>
                <p className="text-slate-600 font-mono text-[11px]">{rule.condition}</p>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {rule.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Umbral de activación: <strong className="text-blue-600 font-mono">{Math.round(rule.threshold * 100)}%</strong></span>
              <span className={`font-semibold ${rule.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                {rule.enabled ? '● Regla Activa' : '○ Pausada'}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

