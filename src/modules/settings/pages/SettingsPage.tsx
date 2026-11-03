import React, { useState } from 'react';
import { useApp } from '../../../app/providers/AppContext';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import {
  Settings,
  Cpu,
  Network,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Lock,
} from 'lucide-react';
import { ApiVisionAdapter } from '../../../infrastructure/vision/ApiVisionAdapter';

export const SettingsPage: React.FC = () => {
  const {
    engineMode,
    setEngineMode,
    visionEngine,
    repository,
    refreshKPIs,
    showToast,
    permissions,
  } = useApp();

  const [apiUrl, setApiUrl] = useState('http://localhost:8000/api/v1');
  const [apiKey, setApiKey] = useState('vision-demo-key-2026');
  const [healthStatus, setHealthStatus] = useState<{ status: string; latencyMs: number } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleTestConnection = async () => {
    setIsChecking(true);
    try {
      const res = await visionEngine.healthCheck?.();
      if (res) {
        setHealthStatus(res);
        if (res.status === 'connected') {
          showToast(`Motor en línea (${res.latencyMs}ms)`, "success");
        } else {
          showToast(`Backend fuera de línea. Fallback a Demo activado (${res.latencyMs}ms)`, "warning");
        }
      }
    } catch {
      setHealthStatus({ status: 'fallback', latencyMs: 0 });
      showToast("Fallo al contactar el endpoint", "error");
    } finally {
      setIsChecking(false);
    }
  };

  const handleResetData = async () => {
    if (confirm("¿Restablecer todos los análisis y datos al estado de fábrica?")) {
      await repository.clearAllAnalyses();
      await refreshKPIs();
      showToast("Datos semilla restaurados con éxito", "success");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="purple">Arquitectura & Conexión</Badge>
          <span className="text-xs text-slate-400">Sección 5 & 11 del Documento</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Configuración del Motor de Visión & Conexión de IA Real
        </h2>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          Gracias al patrón de diseño de Puertos y Adaptadores (Hexagonal), el frontend consume el contrato abstracto <code>VisionEngine</code>. Esto permite alternar entre la simulación determinista y un servicio real (FastAPI + YOLO / SAM) sin modificar la interfaz de usuario.
        </p>
      </div>

      {/* Engine Switcher Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  Selección de Motor de Inferencia
                </CardTitle>
                <CardDescription>
                  Define si las solicitudes son procesadas localmente o delegadas a un backend
                </CardDescription>
              </div>
            </CardHeader>

            <div className="space-y-3 pt-1">
              {/* Option 1: DemoVisionAdapter */}
              <div
                onClick={() => {
                  if (!permissions.canChangeEngine) {
                    showToast("Solo Administradores pueden cambiar el motor de inferencia", "warning");
                    return;
                  }
                  setEngineMode('demo');
                  showToast("Motor cambiado a DemoVisionAdapter", "info");
                }}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between ${
                  !permissions.canChangeEngine ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
                } ${
                  engineMode === 'demo'
                    ? "border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      DemoVisionAdapter (Simulación Determinista Local)
                    </span>
                    <Badge variant="cyan">Recomendado Demo</Badge>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Ejecuta resultados calibrados y reproducibles sin necesidad de backend o GPU. Cumple los 4 escenarios empresariales.
                  </p>
                </div>
                {engineMode === 'demo' && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
              </div>

              {/* Option 2: ApiVisionAdapter */}
              <div
                onClick={() => {
                  if (!permissions.canChangeEngine) {
                    showToast("Solo Administradores pueden cambiar el motor de inferencia", "warning");
                    return;
                  }
                  setEngineMode('api');
                  showToast("Motor cambiado a ApiVisionAdapter (REST)", "info");
                }}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between ${
                  !permissions.canChangeEngine ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
                } ${
                  engineMode === 'api'
                    ? "border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      ApiVisionAdapter (Cliente REST FastAPI / PyTorch / YOLO)
                    </span>
                    <Badge variant="green">Fase 2 Producción</Badge>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Conecta con una API externa vía endpoints <code>/api/v1/analyses</code>. Si el servidor no responde, conmuta automáticamente a fallback determinista.
                  </p>
                </div>
                {engineMode === 'api' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              </div>
            </div>

            {/* REST Endpoint Details */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs">
              <span className="font-semibold text-slate-800">Parámetros del Servicio API:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">URL Endpoint:</label>
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">API Key / Token:</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  loading={isChecking}
                  onClick={handleTestConnection}
                  icon={<Network className="w-3.5 h-3.5" />}
                >
                  Probar Conexión (Health Check)
                </Button>

                {healthStatus && (
                  <span className="text-[11px] font-mono font-medium text-slate-600 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        healthStatus.status === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    Estado: {healthStatus.status.toUpperCase()} ({healthStatus.latencyMs}ms)
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Reset System Card */}
          <Card className="border border-rose-100 bg-rose-50/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Restablecer Datos Semilla</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Limpia el almacenamiento local y recarga los análisis y alertas iniciales.
                </p>
              </div>
              <Button
                size="sm"
                variant="danger"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={handleResetData}
              >
                Restablecer
              </Button>
            </div>
          </Card>
        </div>

        {/* Roles & Permissions Matrix */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Matriz de Roles y Permisos
                </CardTitle>
                <CardDescription>Perfiles de usuario según especificación técnica</CardDescription>
              </div>
            </CardHeader>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-purple-900">Administrador</strong>
                  <Badge variant="purple">Acceso Total</Badge>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Configuración del motor IA, gestión de reglas y escenarios, edición de clases y borrado de análisis.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-blue-900">Operador de Análisis</strong>
                  <Badge variant="blue">Operativo</Badge>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Carga de imágenes, ejecución de análisis visual, ajuste de umbrales y generación de reportes.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-amber-900">Supervisor de Calidad</strong>
                  <Badge variant="amber">Resolutivo</Badge>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Revisión y cierre formal de alertas, notas técnicas de auditoría, calibración de umbrales de reglas.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-cyan-900">Auditor ISO</strong>
                  <Badge variant="cyan">Auditoría</Badge>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Consulta inmutable de historial, trazabilidad de incidentes y exportación masiva a CSV.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

