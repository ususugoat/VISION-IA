import React, { useState } from 'react';
import { useApp } from '../../../app/providers/AppContext';
import { LIVE_SCENARIOS } from '../../../core/domain/liveScenarios';
import type { LiveScenario } from '../../../core/domain/liveTypes';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import {
  Factory,
  Cctv,
  ScanEye,
  Play,
  Filter,
} from 'lucide-react';

export const ScenariosPage: React.FC = () => {
  const { setCurrentPage } = useApp();
  const [activeTab, setActiveTab] = useState<'classic' | 'technological'>('classic');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  const classicLiveScenarios = LIVE_SCENARIOS.filter((s) => s.environmentType === 'classic');
  const techLiveScenarios = LIVE_SCENARIOS.filter((s) => s.environmentType === 'technological');

  const activeScenarios = activeTab === 'classic' ? classicLiveScenarios : techLiveScenarios;

  // Extract distinct sectors for current environment
  const availableSectors = Array.from(new Set(activeScenarios.map((s) => s.sector)));

  const filteredScenarios = activeScenarios.filter((s) => {
    if (sectorFilter === 'all') return true;
    return s.sector === sectorFilter;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Header & Main Environment Switcher */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Catálogo de Ambientes Calibrados
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-xs text-blue-600 font-semibold font-mono">
                {activeScenarios.length} escenarios activos
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Galería de Escenarios de Visión IA
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Selecciona el entorno operativo para comenzar. En el <strong>Entorno Clásico</strong> puedes alternar entre imágenes fijas y monitoreo continuo; en el <strong>Entorno Tecnológico</strong> el flujo es exclusivo en tiempo real (CCTV).
            </p>
          </div>

          {/* Clean Segmented Environment Control */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('classic');
                setSectorFilter('all');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'classic'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Factory className="w-3.5 h-3.5 text-blue-600" />
              Entorno Clásico (Dual)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('technological');
                setSectorFilter('all');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'technological'
                  ? 'bg-white text-purple-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cctv className="w-3.5 h-3.5 text-purple-600" />
              Entorno Tecnológico (CCTV)
            </button>
          </div>
        </div>

        {/* 2. Sub-Category Sector Filter Chips */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              Sector:
            </span>
            <button
              type="button"
              onClick={() => setSectorFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                sectorFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Todos ({activeScenarios.length})
            </button>
            {availableSectors.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSectorFilter(sec)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  sectorFilter === sec
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            {activeTab === 'classic'
              ? 'Modalidad: Imagen Estática + Monitoreo en Vivo'
              : 'Modalidad: Flujo Continuo CCTV Exclusivo'}
          </div>
        </div>
      </div>

      {/* 3. Scenarios Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredScenarios.map((scen: LiveScenario) => {
          const isClassic = scen.environmentType === 'classic';

          return (
            <Card
              key={scen.id}
              className="flex flex-col justify-between overflow-hidden p-0 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all group"
            >
              {/* Media Preview Banner */}
              <div className="h-44 w-full bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-200">
                {scen.assetImage ? (
                  <img
                    src={scen.assetImage}
                    alt={scen.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
                    <Cctv className="w-12 h-12 text-slate-700 group-hover:text-purple-400/60 transition-colors" />
                  </div>
                )}

                {/* Glassmorphism Overlays */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <Badge variant={isClassic ? 'blue' : 'purple'} className="shadow-md">
                    {scen.sector}
                  </Badge>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900/80 backdrop-blur-xs text-white border border-slate-700/60 shadow-md">
                    {scen.cameraLabel.split('·')[0].trim()}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-900/80 backdrop-blur-xs text-slate-200 border border-slate-700/60 shadow-md">
                    <span className={`w-1.5 h-1.5 rounded-full ${isClassic ? 'bg-blue-400' : 'bg-rose-500 animate-pulse'}`} />
                    {isClassic ? 'Dual' : 'En Vivo'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                    {scen.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {scen.description}
                  </p>
                </div>

                {/* Structured Telemetry Specs Strip */}
                <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-lg bg-slate-50 border border-slate-100 text-center py-2 px-1">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Modelo</span>
                    <span className="text-xs font-bold font-mono text-slate-800">
                      {scen.aiModel.split('·')[0].trim().replace('Nexus-', '')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Cobertura</span>
                    <span className="text-xs font-bold font-mono text-slate-800">
                      {scen.zones.length} Zonas
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Guardias</span>
                    <span className="text-xs font-bold font-mono text-blue-700">
                      {scen.rules.length} Reglas
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  {scen.initialEntities.length} entidades activas
                </span>

                {isClassic ? (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage('analysis')}
                      icon={<ScanEye className="w-3.5 h-3.5 text-blue-600" />}
                      title="Analizar fotogramas fijos en Inspección de Imágenes"
                    >
                      Inspección
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setCurrentPage('live_monitor')}
                      icon={<Play className="w-3.5 h-3.5" />}
                      title="Iniciar Monitoreo en Vivo en Planta"
                    >
                      En Vivo
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setCurrentPage('live_monitor')}
                    icon={<Play className="w-3.5 h-3.5" />}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                    title="Iniciar Monitoreo Continuo en CCTV"
                  >
                    Iniciar Monitoreo (CCTV)
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
