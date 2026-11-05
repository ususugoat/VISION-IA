import React, { useState, useEffect } from 'react';
import { useApp } from '../../../app/providers/AppContext';
import { BusinessRule } from '../../../core/domain/types';
import { LIVE_SCENARIOS } from '../../../core/domain/liveScenarios';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import {
  Sparkles,
  ShieldAlert,
  Monitor,
  Server,
  FlaskConical,
  Users,
  Cctv,
  Clock,
  Zap,
  Lock,
  Info,
} from 'lucide-react';

// ── Icons per technological scenario ──────────────────────────────────────────
const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  live_office_tech:  <Monitor   className="w-5 h-5 text-blue-500"   />,
  live_datacenter:   <Server    className="w-5 h-5 text-violet-500" />,
  live_qa_lab:       <FlaskConical className="w-5 h-5 text-emerald-500" />,
  live_meeting_room: <Users     className="w-5 h-5 text-amber-500"  />,
};

const SEVERITY_BADGE_MAP: Record<string, 'red' | 'amber' | 'blue' | 'slate'> = {
  critical: 'red',
  high:     'red',
  medium:   'amber',
  low:      'blue',
};

const SEVERITY_ES: Record<string, string> = {
  critical: 'CRÍTICO',
  high:     'ALTO',
  medium:   'MEDIO',
  low:      'BAJO',
};

// ── Technological scenarios (filtered once at module level) ───────────────────
const TECH_SCENARIOS = LIVE_SCENARIOS.filter(
  (s) => s.environmentType === 'technological'
);

// ── Component ─────────────────────────────────────────────────────────────────
export const PatternsPage: React.FC = () => {
  const { showToast, permissions, manageRulesUseCase } = useApp();
  const [rules, setRules] = useState<BusinessRule[]>([]);
  const [activeTab, setActiveTab] = useState<'classic' | 'tech'>('classic');

  useEffect(() => {
    manageRulesUseCase.listRules().then(setRules);
  }, [manageRulesUseCase]);

  const toggleRuleEnabled = async (rule: BusinessRule) => {
    if (!permissions.canManageRules) {
      showToast('Tu rol actual no tiene permisos para modificar reglas', 'warning');
      return;
    }
    const updated = await manageRulesUseCase.toggleRule(rule.id, !rule.enabled);
    setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
    showToast(`Regla "${rule.name}" ${updated.enabled ? 'activada' : 'desactivada'}`, 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="amber">Inferencia de Eventos &amp; Reglas</Badge>
          <span className="text-xs text-slate-400">Sección 2.3 &amp; 7.2 del Documento</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Reconocimiento de Patrones y Reglas de Negocio
        </h2>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          Los patrones detectan desviaciones operacionales y anomalías relacionando múltiples
          detecciones espaciales y temporales (por ejemplo: persona detectada sin casco obligatorio
          en zona de maniobras).
        </p>
      </div>

      {/* ── Human-in-the-Loop notice ── */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-bold text-amber-950">
            Principio Ético: Confianza Estadística vs Validación Humana (Human-in-the-Loop)
          </p>
          <p className="text-amber-800 leading-relaxed">
            La confianza expresada por los modelos es una estimación probabilística, no una garantía
            de certeza. No se debe sancionar o catalogar a una persona o lote únicamente por una
            detección incierta; el sistema siempre presenta la evidencia visual y exige la
            confirmación de un supervisor o auditor.
          </p>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('classic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'classic'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Patrones Clásicos
          <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono ${activeTab === 'classic' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
            {rules.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('tech')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'tech'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Cctv className="w-4 h-4" />
          Patrones Entorno Tecnológico
          <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono ${activeTab === 'tech' ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-500'}`}>
            {TECH_SCENARIOS.reduce((acc, s) => acc + s.rules.length, 0)}
          </span>
        </button>
      </div>

      {/* ══════════════ TAB: CLASSIC PATTERNS ══════════════ */}
      {activeTab === 'classic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <Card
              key={rule.id}
              className="flex flex-col justify-between space-y-4 border border-slate-200/90 hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={SEVERITY_BADGE_MAP[rule.severity] || 'slate'}>
                        {rule.severity.toUpperCase()}
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-400">{rule.id}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>
                  </div>

                  {/* Enable / Disable toggle */}
                  <label
                    className={`relative inline-flex items-center shrink-0 ${
                      permissions.canManageRules ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      disabled={!permissions.canManageRules}
                      onChange={() => toggleRuleEnabled(rule)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900 mb-0.5">Condición Lógica:</p>
                  <p className="text-slate-600 font-mono text-[11px]">{rule.condition}</p>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{rule.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Umbral de activación:{' '}
                  <strong className="text-blue-600 font-mono">
                    {Math.round(rule.threshold * 100)}%
                  </strong>
                </span>
                <span className={`font-semibold ${rule.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {rule.enabled ? '● Regla Activa' : '○ Pausada'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ══════════════ TAB: TECHNOLOGICAL PATTERNS ══════════════ */}
      {activeTab === 'tech' && (
        <div className="space-y-6">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-800">
            <Info className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Estas reglas se activan automáticamente durante las <strong>sesiones de monitoreo en vivo</strong> en entornos tecnológicos.
              Son de <strong>solo lectura</strong> — se configuran en la definición del escenario y se evalúan frame a frame por el motor de simulación.
            </p>
          </div>

          {/* One section per scenario */}
          {TECH_SCENARIOS.map((scenario) => (
            <div key={scenario.id} className="space-y-3">
              {/* Scenario header */}
              <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                <div className="p-2 rounded-lg bg-slate-100">
                  {SCENARIO_ICONS[scenario.id] ?? <Cctv className="w-5 h-5 text-slate-400" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{scenario.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {scenario.id} · {scenario.cameraLabel} · {scenario.sector}
                  </p>
                </div>
                <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-mono font-semibold">
                  {scenario.rules.length} regla{scenario.rules.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Rules grid for this scenario */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scenario.rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 hover:shadow-md transition-all"
                  >
                    {/* Top row: severity + id */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={SEVERITY_BADGE_MAP[rule.severity] || 'slate'}>
                            {SEVERITY_ES[rule.severity] ?? rule.severity.toUpperCase()}
                          </Badge>
                          <span className="text-[11px] font-mono text-slate-400">{rule.id}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{rule.name}</h4>
                      </div>
                      {/* Read-only indicator */}
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 mt-0.5">
                        <Lock className="w-3 h-3" />
                        <span>En vivo</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 leading-relaxed">{rule.description}</p>

                    {/* Evaluator chip */}
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-[11px] font-mono text-slate-700">
                        evaluador: <strong className="text-slate-900">{rule.evaluator}</strong>
                      </span>
                    </div>

                    {/* Footer: cooldown + status */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Antirrebote:{' '}
                        <strong className="font-mono text-slate-700">
                          {rule.cooldownFrames} fotogramas
                        </strong>
                      </span>
                      <span className="font-semibold text-emerald-600">● Activa en sesión</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
