import React, { useState, useEffect } from 'react';
import { useApp } from '../../../app/providers/AppContext';
import { Scenario } from '../../../core/domain/types';
import { LIVE_SCENARIOS } from '../../../core/domain/liveScenarios';
import type { LiveScenario } from '../../../core/domain/liveTypes';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import {
  FolderKanban,
  ArrowRight,
  AlertTriangle,
  Cctv,
  Monitor,
  FlaskConical,
  Users,
  Server,
  Play,
  CheckCircle2,
  Cpu,
  Layers,
  MapPin,
} from 'lucide-react';

const liveEnvConfig: Record<
  string,
  {
    icon: React.ReactNode;
    headerBg: string;
    badgeVariant: 'blue' | 'cyan' | 'purple' | 'amber';
  }
> = {
  office: {
    icon: <Monitor className="w-4 h-4 text-blue-600" />,
    headerBg: 'bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/60 border-blue-100/80',
    badgeVariant: 'blue',
  },
  datacenter: {
    icon: <Server className="w-4 h-4 text-cyan-600" />,
    headerBg: 'bg-gradient-to-r from-cyan-50/80 via-slate-50 to-sky-50/60 border-cyan-100/80',
    badgeVariant: 'cyan',
  },
  lab: {
    icon: <FlaskConical className="w-4 h-4 text-purple-600" />,
    headerBg: 'bg-gradient-to-r from-purple-50/80 via-slate-50 to-pink-50/60 border-purple-100/80',
    badgeVariant: 'purple',
  },
  meeting_room: {
    icon: <Users className="w-4 h-4 text-amber-600" />,
    headerBg: 'bg-gradient-to-r from-amber-50/80 via-slate-50 to-orange-50/60 border-amber-100/80',
    badgeVariant: 'amber',
  },
};

export const ScenariosPage: React.FC = () => {
  const { repository, setCurrentPage } = useApp();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeTab, setActiveTab] = useState<'live' | 'static'>('live');

  useEffect(() => {
    repository.getScenarios().then(setScenarios);
  }, [repository]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="cyan">Simulación Funcional</Badge>
              <span className="text-xs text-slate-400">Escenarios Calibrados · v2.0</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Galería de Escenarios de Prueba
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Catálogo de ambientes para pruebas de visión artificial: <strong>monitoreo continuo en vivo</strong> con entidades animadas por física y reglas antirrebote, y <strong>análisis puntual de imágenes fijas</strong> con máscaras poligonales.
            </p>
          </div>

          {/* Tab Switcher Segmented Control */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cctv className="w-3.5 h-3.5 text-rose-500" />
              Monitoreo en Vivo (4)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('static')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'static'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5 text-blue-500" />
              Análisis de Imagen ({scenarios.length})
            </button>
          </div>
        </div>
      </div>

      {/* LIVE SCENARIOS GRID */}
      {activeTab === 'live' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {LIVE_SCENARIOS.map((scen: LiveScenario) => {
            const envConf = liveEnvConfig[scen.environment] ?? liveEnvConfig.office;

            return (
              <Card
                key={scen.id}
                className="flex flex-col justify-between overflow-hidden p-0 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all group"
              >
                {/* Header Top Band */}
                <div className={`p-4 border-b ${envConf.headerBg} flex items-center justify-between gap-3`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center">
                      {envConf.icon}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        {scen.sector}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {scen.name}
                      </h3>
                    </div>
                  </div>

                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold shrink-0 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    EN VIVO
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 flex-1">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {scen.description}
                  </p>

                  {/* Model & Camera specs */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold font-mono">
                      <Cpu className="w-3 h-3 text-blue-600" />
                      {scen.aiModel}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {scen.cameraLabel}
                    </span>
                  </div>

                  {/* Active Business Rules */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Reglas de Seguridad Activas ({scen.rules.filter((r) => r.enabled).length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {scen.rules
                        .filter((r) => r.enabled)
                        .map((rule) => {
                          const severityStyle =
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
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${severityStyle}`}
                            >
                              {rule.name}
                            </span>
                          );
                        })}
                    </div>
                  </div>

                  {/* Tags & Metadata */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {scen.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200/80 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {scen.initialEntities.length} entidades · {scen.zones.length} zonas de seguridad
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setCurrentPage('live_monitor')}
                    icon={<Play className="w-3.5 h-3.5" />}
                  >
                    Iniciar Monitoreo
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* STATIC SCENARIOS GRID */}
      {activeTab === 'static' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {scenarios.map((scen) => (
            <Card
              key={scen.id}
              className="flex flex-col justify-between overflow-hidden p-0 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all group"
            >
              {/* Asset Preview Header */}
              <div className="h-48 w-full bg-slate-900 relative flex items-center justify-center overflow-hidden border-b border-slate-200">
                <img
                  src={scen.asset}
                  alt={scen.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="purple" className="shadow-md">
                    {scen.sector}
                  </Badge>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">{scen.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{scen.description}</p>

                  <div className="pt-2 space-y-2">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <p className="font-semibold text-slate-800">Objetos Esperados:</p>
                      <p className="text-slate-600 mt-0.5">{scen.expectedResults.objects.join(', ')}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-100 text-xs">
                      <p className="font-semibold text-rose-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Alerta esperada:
                      </p>
                      <p className="text-rose-700 mt-0.5">{scen.expectedResults.alerts.join(', ')}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1">
                    {scen.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200/80 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setCurrentPage('analysis')}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Analizar Imagen
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
