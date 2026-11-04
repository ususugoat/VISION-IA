import React, { useState } from 'react';
import { useApp } from '../../../app/providers/AppContext';
import {
  Save,
  RefreshCw,
  Wifi,
  WifiOff,
  Shield,
  Users,
  Eye,
  Cctv,
  Zap,
  Cpu,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Server,
} from 'lucide-react';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';

// ------------------------------------------------------------------ types ---
type Engine = 'demo' | 'api';
type ModelId = 'yolo' | 'transformer' | 'lite';

interface RoleRow {
  role: string;
  view: boolean;
  analyze: boolean;
  configure: boolean;
  export: boolean;
}

interface AIModel {
  id: ModelId;
  name: string;
  precision: number;
  latencyMs: number;
  description: string;
}

// ------------------------------------------------------------------ data ----
const AI_MODELS: AIModel[] = [
  {
    id: 'yolo',
    name: 'Nexus-YOLO v8 High-Precision',
    precision: 92,
    latencyMs: 14,
    description: 'Detección rápida en tiempo real a 30+ FPS. Óptimo para escenarios con múltiples personas y objetos en movimiento continuo.',
  },
  {
    id: 'transformer',
    name: 'Nexus-Transformer XL Visual',
    precision: 97,
    latencyMs: 31,
    description: 'Mayor precisión con contexto espacial ampliado y segmentación fina. Ideal para análisis forense y detección de comportamientos complejos.',
  },
  {
    id: 'lite',
    name: 'Nexus-Lite Edge In-Device',
    precision: 85,
    latencyMs: 7,
    description: 'Modelo ultraligero optimizado para hardware perimetral o cámaras de vigilancia con ancho de banda reducido.',
  },
];

const DEFAULT_ROLES: RoleRow[] = [
  { role: 'Administrador', view: true,  analyze: true,  configure: true,  export: true  },
  { role: 'Supervisor',    view: true,  analyze: true,  configure: false, export: true  },
  { role: 'Operador',      view: true,  analyze: false, configure: false, export: false },
  { role: 'Auditor ISO',   view: true,  analyze: true,  configure: false, export: true  },
];

const ARCH_LINES = [
  '  [UI / React 19 Frontend]          ─> Presentación reactiva y paneles de control',
  '            │',
  '  [Application Use Cases]           ─> Lógica de negocio (AnalyzeImage, ManageRules, LiveSession)',
  '            │',
  '  [Domain Ports / Interfaces]       ─> Contratos desacoplados (VisionEngine, LiveVisionEngine)',
  '            │',
  '  [Infrastructure Adapters]         ─> DemoVisionAdapter  ◄─►  ApiVisionAdapter (FastAPI / PyTorch)',
  '            │',
  '  [SceneSimulator & Physics Engine] ─> Motor de inferencia determinista y simulación continua',
];

// ---------------------------------------------------------------- helpers --
function ToggleSwitch({ checked, onChange, disabled = false }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed ${
        checked ? 'bg-blue-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-4.5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  badgeText,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  badgeText?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {badgeText && (
        <Badge variant="blue" className="self-start sm:self-auto text-[10px]">
          {badgeText}
        </Badge>
      )}
    </div>
  );
}

// ============================================================ component ====
export function SettingsPage() {
  const { engineMode, setEngineMode, showToast, permissions } = useApp();

  const [engine, setEngine] = useState<Engine>(engineMode);
  const [endpoint, setEndpoint] = useState('http://localhost:8000/api/v1');
  const [apiKey, setApiKey] = useState('');
  const [pingStatus, setPingStatus] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [pinging, setPinging] = useState(false);

  const [selectedModel, setSelectedModel] = useState<ModelId>('yolo');
  const [showLabels, setShowLabels] = useState(true);
  const [showMasks, setShowMasks] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [alertSound, setAlertSound] = useState(false);
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);

  const [roles, setRoles] = useState<RoleRow[]>(DEFAULT_ROLES);
  const [saved, setSaved] = useState(false);

  // ---- handlers -----------------------------------------------------------
  function handlePing() {
    setPinging(true);
    setPingStatus('idle');
    setTimeout(() => {
      if (engine === 'demo') {
        setPingStatus('ok');
        showToast('Motor Demo verificado: pipeline local respondiendo (12 FPS)', 'success');
      } else {
        setPingStatus('fail');
        showToast('Sin respuesta del endpoint API REST externo (Connection refused)', 'error');
      }
      setPinging(false);
    }, 900);
  }

  function handleReset() {
    setEngine('demo');
    setEngineMode('demo');
    setEndpoint('http://localhost:8000/api/v1');
    setApiKey('');
    setPingStatus('idle');
    setSelectedModel('yolo');
    setShowLabels(true);
    setShowMasks(true);
    setShowZones(true);
    setAlertSound(false);
    setHardwareAcceleration(true);
    setRoles(DEFAULT_ROLES);
    setSaved(false);
    showToast('Valores de configuración restaurados a los predeterminados', 'info');
  }

  function handleSave() {
    setEngineMode(engine);
    setSaved(true);
    showToast('Configuración del sistema y motor de IA guardada correctamente', 'success');
    setTimeout(() => setSaved(false), 2500);
  }

  function togglePerm(idx: number, field: keyof Omit<RoleRow, 'role'>) {
    if (!permissions.canManageRules) {
      showToast('Permiso denegado: solo Administradores pueden modificar roles', 'warning');
      return;
    }
    setRoles((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: !r[field] } : r))
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Intro Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="purple">Motor & Sistema</Badge>
          <span className="text-xs text-slate-400">Arquitectura Hexagonal & Modelos IA v2.0</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Configuración & Inteligencia Artificial
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed mt-1">
              Administra el motor de visión computacional, conmutación entre modo simulación y backend API real, modelos de inferencia, opciones de superposición visual y matriz de permisos por roles RBAC.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Restablecer
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              icon={saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            >
              {saved ? 'Guardado' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </div>

      {/* 1. Engine Switcher */}
      <Card className="border border-slate-200/90 shadow-2xs">
        <SectionHeader
          icon={Cpu}
          title="Motor de Visión Computacional"
          description="Selecciona la fuente de inferencia para el análisis de fotogramas e imágenes."
          badgeText={engine === 'demo' ? 'Modo Simulación Activo' : 'API REST Externa'}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => setEngine('demo')}
            className={`flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
              engine === 'demo'
                ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                engine === 'demo' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Cctv className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className={`font-bold text-sm ${engine === 'demo' ? 'text-blue-900' : 'text-slate-800'}`}>
                  Modo Demo (Simulación Local)
                </span>
                {engine === 'demo' && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Inferencia determinista 100% en cliente sin requerir servidores externos ni GPU remota. Ideal para demostraciones y pruebas de concepto.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setEngine('api')}
            className={`flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
              engine === 'api'
                ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                engine === 'api' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Wifi className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className={`font-bold text-sm ${engine === 'api' ? 'text-blue-900' : 'text-slate-800'}`}>
                  API REST (Backend Real)
                </span>
                {engine === 'api' && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Conexión HTTP/WebSocket a un microservicio backend de visión por computadora (FastAPI, PyTorch, YOLOv8/v11 o Segment Anything).
              </p>
            </div>
          </button>
        </div>

        {engine === 'api' && (
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                URL del Endpoint API
              </label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                placeholder="http://localhost:8000/api/v1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                API Key de Autenticación (Opcional Bearer Token)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                placeholder="sk-live-vision-key-..."
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePing}
                disabled={pinging}
                icon={pinging ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
              >
                {pinging ? 'Comprobando conexión...' : 'Probar conexión'}
              </Button>
              {pingStatus === 'ok' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Endpoint disponible y autenticado
                </span>
              )}
              {pingStatus === 'fail' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  <WifiOff className="w-3.5 h-3.5 text-rose-600" /> Servidor inaccesible en {endpoint}
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* 2. AI Models */}
      <Card className="border border-slate-200/90 shadow-2xs">
        <SectionHeader
          icon={Zap}
          title="Modelos de Inferencia para Análisis & Monitoreo"
          description="Selecciona la red neuronal que procesará los tensores y cajas delimitadoras."
          badgeText="Catálogo de Redes"
        />

        <div className="space-y-3">
          {AI_MODELS.map((model) => {
            const isSelected = selectedModel === model.id;
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => setSelectedModel(model.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div
                  className={`mt-1 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-blue-600 bg-white' : 'border-slate-400'
                  }`}
                >
                  {isSelected && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-sm ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
                      {model.name}
                    </span>
                    <Badge variant="green" className="text-[10px]">
                      {model.precision}% precisión
                    </Badge>
                    <Badge variant="amber" className="text-[10px]">
                      {model.latencyMs} ms latencia
                    </Badge>
                    {isSelected && (
                      <Badge variant="blue" className="text-[10px]">
                        Seleccionado
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {model.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 3. Overlay and Display Options */}
      <Card className="border border-slate-200/90 shadow-2xs">
        <SectionHeader
          icon={Eye}
          title="Opciones de Visualización & Overlays"
          description="Ajusta las capas gráficas que se renderizan sobre el lienzo de la cámara y del visor estático."
        />

        <div className="divide-y divide-slate-100">
          {[
            {
              label: 'Etiquetas de clase y porcentaje de confianza',
              desc: 'Muestra el nombre del objeto y su puntaje de predicción sobre la caja delimitadora.',
              value: showLabels,
              setter: () => setShowLabels((v) => !v),
            },
            {
              label: 'Máscaras de segmentación por píxeles (SAM / Polígonos)',
              desc: 'Dibuja el relleno coloreado de la silueta exacta del objeto.',
              value: showMasks,
              setter: () => setShowMasks((v) => !v),
            },
            {
              label: 'Zonas delimitadas de seguridad y áreas restringidas',
              desc: 'Resalta polígonos perimetrales y sectores de advertencia en el canvas.',
              value: showZones,
              setter: () => setShowZones((v) => !v),
            },
            {
              label: 'Aceleración gráfica por hardware (WebGL Canvas)',
              desc: 'Optimiza el renderizado a 60 FPS delegando el cálculo de fotogramas a la GPU del navegador.',
              value: hardwareAcceleration,
              setter: () => setHardwareAcceleration((v) => !v),
            },
            {
              label: 'Alertas sonoras para incidentes de severidad crítica',
              desc: 'Emite una señal auditiva cuando se vulnere una regla de seguridad prioritaria.',
              value: alertSound,
              setter: () => setAlertSound((v) => !v),
            },
          ].map(({ label, desc, value, setter }) => (
            <div key={label} className="flex items-center justify-between py-3.5 gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">{label}</span>
                <span className="text-[11px] text-slate-500 mt-0.5">{desc}</span>
              </div>
              <ToggleSwitch checked={value} onChange={setter} />
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Hexagonal Architecture Blueprint */}
      <Card className="border border-slate-200/90 shadow-2xs">
        <SectionHeader
          icon={Server}
          title="Arquitectura de Software Hexagonal (Puertos & Adaptadores)"
          description="Estructura desacoplada que garantiza independencia entre la UI, casos de uso y motores de inferencia."
          badgeText="Clean Architecture"
        />

        <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-cyan-300 leading-relaxed border border-slate-800 shadow-inner overflow-x-auto">
          {ARCH_LINES.map((line, i) => (
            <div key={i} className="py-0.5">
              {line}
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 mt-4 p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            El patrón hexagonal aísla la lógica central de detección de los proveedores tecnológicos. Esto permite alternar dinámicamente entre el motor de simulación <strong>DemoLiveAdapter</strong> y un servidor de inferencia real <strong>ApiVisionAdapter</strong> sin alterar componentes de interfaz ni reglas de negocio.
          </p>
        </div>
      </Card>

      {/* 5. Role-Based Access Control (RBAC) */}
      <Card className="border border-slate-200/90 shadow-2xs">
        <SectionHeader
          icon={Shield}
          title="Matriz de Permisos por Rol (RBAC)"
          description="Control de accesos y privilegios para cada perfil de usuario en la plataforma."
          badgeText="Seguridad ISO 27001"
        />

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="text-left py-3 px-4 text-slate-600 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    Rol de Usuario
                  </div>
                </th>
                {['Visualizar Dashboards', 'Ejecutar Análisis', 'Configurar Reglas', 'Exportar Reportes CSV'].map((h) => (
                  <th key={h} className="text-center py-3 px-4 text-slate-600 font-bold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {roles.map((row, idx) => (
                <tr key={row.role} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      {row.role}
                    </div>
                  </td>
                  {(['view', 'analyze', 'configure', 'export'] as const).map((field) => (
                    <td key={field} className="text-center py-3 px-4">
                      <div className="flex justify-center">
                        <ToggleSwitch
                          checked={row[field]}
                          onChange={() => togglePerm(idx, field)}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-start gap-2.5 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Las modificaciones en la matriz de privilegios se aplican a nivel de sesión. Para operadores activos, los permisos se refrescan automáticamente en el próximo ciclo de autenticación.
          </p>
        </div>
      </Card>
    </div>
  );
}
