import React, { useState, useEffect } from 'react';
import { useApp } from '../../../app/providers/AppContext';
import { Scenario } from '../../../core/domain/types';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { FolderKanban, ArrowRight, CheckCircle2, Shield, AlertTriangle } from 'lucide-react';

export const ScenariosPage: React.FC = () => {
  const { repository, setCurrentPage } = useApp();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    repository.getScenarios().then(setScenarios);
  }, [repository]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="cyan">Simulación Funcional</Badge>
          <span className="text-xs text-slate-400">Sección 10 del Documento</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Escenarios Demostrativos Pre-Calibrados
        </h2>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          Para que la demostración sea reproducible y determinista, cada escenario cuenta con imágenes vectoriales optimizadas y coordenadas relativas <code>(0..1)</code> ajustadas con precisión para cajas, máscaras poligonales y reglas de patrones.
        </p>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scen) => (
          <Card key={scen.id} className="flex flex-col justify-between overflow-hidden p-0 border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
            {/* Asset preview */}
            <div className="h-48 w-full bg-slate-900 relative flex items-center justify-center overflow-hidden border-b border-slate-200">
              <img src={scen.asset} alt={scen.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <Badge variant="purple" className="shadow-md">
                  {scen.sector}
                </Badge>
              </div>
            </div>

            {/* Details */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">{scen.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{scen.description}</p>

                <div className="pt-2 space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <p className="font-semibold text-slate-800">Objetos Esperados:</p>
                    <p className="text-slate-600">{scen.expectedResults.objects.join(", ")}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100 text-xs space-y-1">
                    <p className="font-semibold text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Patrón / Alerta esperada:
                    </p>
                    <p className="text-rose-700">{scen.expectedResults.alerts.join(", ")}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {scen.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setCurrentPage('analysis')}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Analizar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

