import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useApp } from '../../app/providers/AppContext';
import { DemoLiveAdapter } from '../../infrastructure/vision/DemoLiveAdapter';
import type { AnalysisRecord, AnalysisMode } from '../../core/domain/types';
import { LIVE_SCENARIOS } from '../../core/domain/liveScenarios';
import type { LiveFrame, LiveAlert, LiveSession, LiveScenario, LiveRule, TrackedObject, LiveEnvironmentType } from '../../core/domain/liveTypes';
import { LiveCameraViewer } from './components/LiveCameraViewer';
import { LiveControlsBar } from './components/LiveControlsBar';
import { LiveMetricsPanel } from './components/LiveMetricsPanel';
import { SessionSummaryModal } from './components/SessionSummaryModal';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Factory,
  Cctv,
  ScanEye,
  Activity,
  Building2,
  Server,
  Cpu,
  Users,
  Sparkles,
  ShieldCheck,
  Coffee,
  Thermometer,
  ShieldAlert,
  Play,
  HardHat,
  Truck,
  ShoppingBag,
} from 'lucide-react';

// Información amigable y fácil de entender de los escenarios
interface TechScenarioDetail {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgColor: string;
  badgeColor: string;
  activeBorder: string;
  easyDescription: string;
  highlights: { icon: string; title: string; desc: string }[];
}

// Información amigable de los escenarios del ENTORNO CLÁSICO (Planta, Logística, Calidad, Retail)
const CLASSIC_SCENARIOS_DATA: Record<string, TechScenarioDetail> = {
  live_seguridad: {
    id: 'live_seguridad',
    name: 'Seguridad Industrial & Prevención EPP',
    tagline: 'Casco, chaleco reflectivo y franjas de peligro',
    badge: 'Manufactura & Minería',
    icon: HardHat,
    accentColor: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    activeBorder: 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900',
    easyDescription:
      'Supervisa la nave de producción industrial en tiempo real. La IA verifica que todos los operarios lleven puesto obligatoriamente su casco de seguridad y chaleco reflectivo para prevenir accidentes fatales, y lanza una alerta inmediata si alguien cruza la franja amarilla perimetral hacia áreas con maquinaria pesada o transita debajo de cargas suspendidas.',
    highlights: [
      {
        icon: '⛑️',
        title: 'Casco y Chaleco Obligatorios',
        desc: 'Detecta de forma continua a cualquier trabajador que ingrese a planta sin su equipo de protección normado.',
      },
      {
        icon: '⚠️',
        title: 'Franja Amarilla de Peligro',
        desc: 'Alerta instantánea si una persona cruza el límite de seguridad hacia maquinaria pesada en movimiento.',
      },
      {
        icon: '🏗️',
        title: 'Radio de Grúa y Cargas',
        desc: 'Impide que los operarios caminen o se detengan directamente debajo de cargas aéreas suspendidas.',
      },
    ],
  },
  live_almacen: {
    id: 'live_almacen',
    name: 'Logística & Tránsito en Bodega',
    tagline: 'Montacargas, pasillos peatonales y pallets',
    badge: 'Almacén & Logística',
    icon: Truck,
    accentColor: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    activeBorder: 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 text-amber-900',
    easyDescription:
      'Controla la convivencia segura entre vehículos de carga pesada y trabajadores a pie en el almacén. La IA detecta si un montacargas invade el carril demarcado exclusivamente para peatones, avisa si un operario entra en el radio de giro ciego de la máquina y vigila que los pallets apilados en las estanterías no queden inclinados con riesgo de caída.',
    highlights: [
      {
        icon: '🚜',
        title: 'Invasión de Pasillo Peatonal',
        desc: 'Alerta inmediata cuando un montacargas ingresa al carril verde reservado para el tránsito de trabajadores.',
      },
      {
        icon: '🚶',
        title: 'Distancia Hombre-Máquina',
        desc: 'Advierte si una persona se acerca demasiado al radio de maniobra y giro del montacargas en movimiento.',
      },
      {
        icon: '📦',
        title: 'Estabilidad de Pallets',
        desc: 'Supervisa que las cargas en las estanterías pesadas cumplan la estabilidad normada para evitar desplomes.',
      },
    ],
  },
  live_calidad: {
    id: 'live_calidad',
    name: 'Inspección de Calidad en Banda',
    tagline: 'Detección óptica de rayones, sellado y lote',
    badge: 'Control de Calidad',
    icon: CheckCircle2,
    accentColor: 'text-cyan-600',
    bgColor: 'bg-cyan-500/10',
    badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    activeBorder: 'border-cyan-500 bg-cyan-50/60 ring-2 ring-cyan-500/20 text-cyan-900',
    easyDescription:
      'Inspecciona a alta velocidad cada botella o producto que avanza por la faja transportadora de la fábrica. La IA analiza automáticamente la superficie para descubrir al instante rayones, fisuras o abolladuras superiores al 1.5% del área, verifica que la tapa esté herméticamente sellada y comprueba la legibilidad del código de lote para descartar piezas defectuosas antes del despacho.',
    highlights: [
      {
        icon: '🔍',
        title: 'Detección de Fisuras y Rayones',
        desc: 'Descubre imperfecciones microscópicas en la superficie de cada botella en milisegundos sin detener la línea.',
      },
      {
        icon: '🍾',
        title: 'Sellado y Nivel Conforme',
        desc: 'Verifica ópticamente que las tapas estén correctamente enroscadas y el nivel de líquido sea el reglamentario.',
      },
      {
        icon: '🏷️',
        title: 'Legibilidad de Código de Lote',
        desc: 'Asegura que el código de trazabilidad y fecha de vencimiento estén impresos de forma nítida.',
      },
    ],
  },
  live_retail: {
    id: 'live_retail',
    name: 'Flujo de Clientes & Aforo en Tienda',
    tagline: 'Aforo de pasillos, góndolas y tiempos',
    badge: 'Retail Comercial',
    icon: ShoppingBag,
    accentColor: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeBorder: 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-900',
    easyDescription:
      'Supervisa el movimiento y la concentración de clientes en los pasillos de la tienda comercial o supermercado. La IA cuenta en vivo cuántas personas hay en cada sector para alertar si se produce una aglomeración excesiva en pasillos estrechos, y mide el tiempo que permanecen frente a las góndolas para optimizar la atención y reposición de productos.',
    highlights: [
      {
        icon: '🛒',
        title: 'Control de Afluencia en Pasillos',
        desc: 'Avisa al personal cuando un pasillo supera el límite de 3 personas para evitar congestiones incómodas.',
      },
      {
        icon: '⏱️',
        title: 'Tiempo de Espera en Góndola',
        desc: 'Identifica si un cliente pasa más de 45 segundos detenido sin ser atendido o sin encontrar el producto.',
      },
      {
        icon: '🚪',
        title: 'Dirección de Desplazamiento',
        desc: 'Rastrea el flujo de ingreso y salida en los pasillos principales para optimizar la circulación comercial.',
      },
    ],
  },
};

const TECH_SCENARIOS_DATA: Record<string, TechScenarioDetail> = {
  live_office_tech: {
    id: 'live_office_tech',
    name: 'Oficina Tecnológica',
    tagline: 'Puestos de trabajo, líquidos y armario de red',
    badge: 'Conducta & Ergonomía',
    icon: Building2,
    accentColor: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    activeBorder: 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900',
    easyDescription:
      'Supervisa las estaciones de trabajo en tiempo real. La IA vigila que no haya bebidas ni líquidos cerca de computadoras y laptops para prevenir daños en los equipos, cuida el respeto del espacio de trabajo y emite una alerta si alguien entra sin permiso al armario de redes y telecomunicaciones.',
    highlights: [
      {
        icon: '🥤',
        title: 'Cero Líquidos en Equipos',
        desc: 'Detecta vasos, tazas o botellas peligrosamente cerca de teclados o computadoras.',
      },
      {
        icon: '🚷',
        title: 'Armario de Red Restringido',
        desc: 'Alerta instantánea si una persona se acerca o manipula el rack de comunicaciones sin autorización.',
      },
      {
        icon: '💺',
        title: 'Espacio y Ergonomía',
        desc: 'Monitorea puestos ocupados y previene la invasión de espacios personales entre escritorios.',
      },
    ],
  },
  live_datacenter: {
    id: 'live_datacenter',
    name: 'Data Center',
    tagline: 'Acceso seguro a servidores y pasillo caliente',
    badge: 'Infraestructura Crítica',
    icon: Server,
    accentColor: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    activeBorder: 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-500/20 text-purple-900',
    easyDescription:
      'Controla la seguridad física de los servidores empresariales. La IA detecta al instante si una persona ingresa sin su fotocheck o credencial visible, protege los racks de servidores contra accesos sospechosos y avisa si un técnico permanece demasiado tiempo en el pasillo caliente de alta temperatura para proteger su salud.',
    highlights: [
      {
        icon: '🪪',
        title: 'Fotocheck / Credencial Visible',
        desc: 'Exige que toda persona dentro del centro de cómputo lleve su credencial de identificación visible.',
      },
      {
        icon: '🌡️',
        title: 'Alerta en Pasillo Caliente',
        desc: 'Avisa si un técnico permanece más de 5 segundos continuos en el pasillo térmico (>40°C).',
      },
      {
        icon: '🔒',
        title: 'Protección de Servidores',
        desc: 'Vigila la apertura y contacto no autorizado con los racks de servidores de datos.',
      },
    ],
  },
  live_qa_lab: {
    id: 'live_qa_lab',
    name: 'Laboratorio de QA',
    tagline: 'Guantes antiestáticos y piezas electrónicas',
    badge: 'Control de Calidad TI',
    icon: Cpu,
    accentColor: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeBorder: 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-900',
    easyDescription:
      'Vigila la manipulación segura de placas y repuestos electrónicos delicados. La IA comprueba que los técnicos utilicen obligatoriamente guantes antiestáticos para no quemar circuitos con electricidad estática, prohíbe alimentos y café en las mesas de prueba y controla el acceso al almacén de componentes.',
    highlights: [
      {
        icon: '🧤',
        title: 'Guantes Antiestáticos (ESD)',
        desc: 'Comprueba visualmente que los técnicos lleven protección antiestática antes de tocar placas madre.',
      },
      {
        icon: '🥪',
        title: 'Cero Comida o Bebidas',
        desc: 'Impide derrames y manchas accidentales sobre las mesas de montaje y testing.',
      },
      {
        icon: '📦',
        title: 'Almacén de Repuestos',
        desc: 'Supervisa el acceso al armario donde se guardan componentes y microchips delicados.',
      },
    ],
  },
  live_meeting_room: {
    id: 'live_meeting_room',
    name: 'Sala de Reuniones',
    tagline: 'Aforo máximo y cámara de videollamada',
    badge: 'Gestión de Espacios',
    icon: Users,
    accentColor: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    activeBorder: 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 text-amber-900',
    easyDescription:
      'Supervisa que las reuniones de trabajo se desarrollen con comodidad, ventilación y sin fallas técnicas. La IA cuenta automáticamente las personas en la sala para no sobrepasar el aforo máximo permitido (máximo 6 asistentes) y alerta de inmediato si alguien o algún objeto está tapando la cámara de videoconferencia.',
    highlights: [
      {
        icon: '👥',
        title: 'Control de Aforo Automático',
        desc: 'Conteo en tiempo real que alerta si entran más de 6 personas a la sala de juntas.',
      },
      {
        icon: '📹',
        title: 'Cámara Despejada',
        desc: 'Alerta si alguien se para frente a la cámara o coloca objetos que tapen la videollamada.',
      },
      {
        icon: '📊',
        title: 'Uso de la Sala',
        desc: 'Identifica al expositor en pie y a los asistentes sentados alrededor de la mesa.',
      },
    ],
  },
};

// Singleton live engine - shared across renders
const liveEngine = new DemoLiveAdapter();

interface LiveMonitorPageProps {
  initialEnvironment?: LiveEnvironmentType;
  showEnvironmentToggle?: boolean;
  hideHeader?: boolean;
  onNavigateToStatic?: () => void;
}

export const LiveMonitorPage: React.FC<LiveMonitorPageProps> = ({
  initialEnvironment = 'classic',
  showEnvironmentToggle = true,
  hideHeader = false,
  onNavigateToStatic,
}) => {
  const { showToast, setCurrentPage, currentUser, repository, refreshKPIs } = useApp();

  // Environment state (Classic vs Technological)
  const [activeEnv, setActiveEnv] = useState<LiveEnvironmentType>(initialEnvironment);

  // Scenarios for active environment
  const envScenarios = LIVE_SCENARIOS.filter((s) => s.environmentType === activeEnv);

  // Session state
  const [session, setSession] = useState<LiveSession | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Scenario selection
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(envScenarios[0]?.id || LIVE_SCENARIOS[0].id);

  // When environment changes, select first scenario of that environment
  const handleEnvChange = (newEnv: LiveEnvironmentType) => {
    if (isRunning) {
      handleStop();
    }
    setActiveEnv(newEnv);
    const newScenarios = LIVE_SCENARIOS.filter((s) => s.environmentType === newEnv);
    if (newScenarios.length > 0) {
      setSelectedScenarioId(newScenarios[0].id);
    }
    setCurrentFrame(null);
    setSession(null);
    setSessionId(null);
  };
  /*  */
  const selectedScenario: LiveScenario | undefined = LIVE_SCENARIOS.find(
    (s: LiveScenario) => s.id === selectedScenarioId
  );

  const selectedTechDetail =
    TECH_SCENARIOS_DATA[selectedScenarioId] ||
    (activeEnv === 'technological' ? TECH_SCENARIOS_DATA['live_office_tech'] : null);

  const selectedClassicDetail =
    CLASSIC_SCENARIOS_DATA[selectedScenarioId] ||
    (activeEnv === 'classic' ? CLASSIC_SCENARIOS_DATA['live_seguridad'] : null);

  const handleSelectScenario = (scenarioId: string) => {
    if (isRunning) {
      handleStop();
    }
    setSelectedScenarioId(scenarioId);
    setCurrentFrame(null);
    setSession(null);
    setSessionId(null);
  };

  // Frame & alert state
  const [currentFrame, setCurrentFrame] = useState<LiveFrame | null>(null);
  const [sessionAlerts, setSessionAlerts] = useState<LiveAlert[]>([]);
  const captureFrameRef = useRef<number>(0);

  // Summary modal
  const [showSummary, setShowSummary] = useState(false);

  // Analysis config
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('combined');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.65);

  // Overlay controls
  const [showBoxes, setShowBoxes] = useState(true);
  const [showMasks, setShowMasks] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showLowConf, setShowLowConf] = useState(false);

  // Saved session banner info (only shown after a session completes)
  const [savedBanner, setSavedBanner] = useState<{
    id: string;
    frames: number;
    seconds: number;
    objectsTracked: number;
    alertsCount: number;
  } | null>(null);

  // 60-second real-time detection count history for the sparkline chart
  const [chartData, setChartData] = useState<{ second: string; count: number }[]>(() => {
    return Array.from({ length: 45 }, (_, i) => ({
      second: `${i}s`,
      count: Math.max(0, Math.round(Math.sin(i / 5) * 1.5 + 2)),
    }));
  });

  const handleFrame = useCallback((frame: LiveFrame) => {
    setCurrentFrame(frame);
    setChartData((prev) => {
      const nextSec = (frame.frameNumber / 12).toFixed(0);
      const next = [...prev.slice(-59), { second: `${nextSec}s`, count: frame.objectsNow }];
      return next;
    });
  }, []);

  const handleResolveAlert = useCallback((alertId: string) => {
    setSessionAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' as const } : a))
    );
    showToast('Alerta marcada como resuelta.', 'info');
  }, [showToast]);

  const handleAddNote = useCallback((alertId: string, note: string) => {
    setSessionAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, notes: note } : a))
    );
    showToast('Observación de auditoría registrada.', 'success');
  }, [showToast]);

  const handleAlert = useCallback(
    (alerts: LiveAlert[]) => {
      setSessionAlerts((prev: LiveAlert[]) => [...prev, ...alerts]);
      alerts.forEach((alert: LiveAlert) => {
        const icon = alert.severity === 'critical' || alert.severity === 'high' ? '🚨' : '⚠️';
        showToast(
          `${icon} ${alert.ruleName}: ${alert.message.slice(0, 60)}...`,
          alert.severity === 'critical' ? 'error' : 'warning'
        );
      });
    },
    [showToast]
  );

  const handleStart = async () => {
    try {
      const newSession = await liveEngine.startSession({ scenarioId: selectedScenarioId });
      setSession(newSession);
      setSessionId(newSession.id);
      setSessionAlerts([]);
      setCurrentFrame(null);
      setIsRunning(true);
      setIsPaused(false);
      showToast(`Sesión de monitoreo iniciada: ${selectedScenario?.name}`, 'success');
    } catch {
      showToast('Error al iniciar la sesión de monitoreo.', 'error');
    }
  };

  const handlePause = () => {
    if (sessionId) {
      liveEngine.pauseSession(sessionId);
      setIsPaused(true);
      setSession((prev: LiveSession | null) => (prev ? { ...prev, status: 'paused' } : prev));
      showToast('Sesión de monitoreo en pausa.', 'info');
    }
  };

  const handleResume = () => {
    if (sessionId) {
      liveEngine.resumeSession(sessionId);
      setIsPaused(false);
      setSession((prev: LiveSession | null) => (prev ? { ...prev, status: 'running' } : prev));
      showToast('Sesión de monitoreo reanudada.', 'info');
    }
  };

  const handleStop = () => {
    if (sessionId) {
      const finalSession = liveEngine.stopSession(sessionId);
      setIsRunning(false);
      setIsPaused(false);
      if (finalSession) {
        setSession(finalSession);
        setShowSummary(true);
        setSavedBanner({
          id: finalSession.id,
          frames: finalSession.totalFrames,
          seconds: Number((finalSession.totalFrames / 12).toFixed(1)),
          objectsTracked: finalSession.uniqueObjectsTracked,
          alertsCount: finalSession.totalAlerts,
        });
        showToast(
          `Sesión finalizada: ${finalSession.totalFrames} fotogramas · ${finalSession.totalAlerts} alertas`,
          'success'
        );

        // ── Persist session to history repository ──────────────────────────
        const durationMs = Math.round((finalSession.totalFrames / 12) * 1000);
        const liveRecord: AnalysisRecord = {
          id: finalSession.id,
          createdAt: finalSession.endedAt ?? new Date().toISOString(),
          createdBy: currentUser.name,
          userRole: currentUser.role,
          sourceName: `Monitoreo En Vivo · ${selectedScenario?.cameraLabel ?? finalSession.cameraLabel}`,
          scenarioId: finalSession.scenarioId,
          scenarioName: finalSession.scenarioName,
          imageUrl: selectedScenario?.assetImage ?? '',
          mode: analysisMode,
          status: 'completed',
          durationMs,
          averageConfidence: finalSession.averageConfidence,
          detectionsCount: finalSession.uniqueObjectsTracked,
          alertsCount: finalSession.totalAlerts,
          confidenceThreshold,
          engineType: 'demo',
          sourceType: 'live',
          liveSessionMeta: {
            sessionId: finalSession.id,
            cameraLabel: finalSession.cameraLabel,
            aiModel: finalSession.aiModel,
            totalFrames: finalSession.totalFrames,
            uniqueObjectsTracked: finalSession.uniqueObjectsTracked,
            startedAt: finalSession.startedAt,
            endedAt: finalSession.endedAt,
          },
          liveAlerts: sessionAlerts.map((a) => ({
            id: a.id,
            frameNumber: a.frameNumber,
            timestamp: a.timestamp,
            severity: a.severity,
            status: a.status,
            ruleId: a.ruleId,
            ruleName: a.ruleName,
            message: a.message,
            evidence: a.evidence,
            zoneId: a.zoneId,
            zoneName: a.zoneName,
            confidence: a.confidence,
            triggerEntityLabel: a.triggerEntityLabel,
          })),
        };
        repository.saveAnalysis(liveRecord).then(() => {
          refreshKPIs();
        });
        // ──────────────────────────────────────────────────────────────────
      }
    }
  };

  const handleExportCsv = useCallback(() => {
    if (!session) return;
    const rows = [
      'id,severidad,regla,mensaje,timestamp,estado',
      ...sessionAlerts.map((a: LiveAlert) =>
        `${a.id},${a.severity},${a.ruleName},"${a.message}",${a.timestamp},${a.status}`
      ),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-${session.id}-alerts.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Reporte CSV descargado con éxito.', 'success');
  }, [session, sessionAlerts, showToast]);

  const handleCapture = () => {
    captureFrameRef.current = currentFrame?.frameNumber ?? 0;
    showToast(`Fotograma #${captureFrameRef.current} capturado para auditoría.`, 'info');
  };

  const handleAcknowledgeAlert = useCallback(
    (alertId: string) => {
      setSessionAlerts((prev: LiveAlert[]) =>
        prev.map((a: LiveAlert) =>
          a.id === alertId ? { ...a, status: 'acknowledged' as const } : a
        )
      );
      showToast('Alerta marcada como revisada.', 'success');
    },
    [showToast]
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Intro Header Card with Environment Switcher */}
      {!hideHeader && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {activeEnv === 'technological' ? (
                  <Badge variant="purple">Entorno Tecnológico · Solo En Vivo</Badge>
                ) : (
                  <Badge variant="blue">Entorno Clásico · Monitoreo en Vivo</Badge>
                )}
                <span className="text-xs text-slate-400 font-mono">12 FPS · Inferencia Continua</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {activeEnv === 'technological'
                  ? 'Monitoreo en Vivo — Entorno Tecnológico Corporativo'
                  : 'Monitoreo en Vivo — Entorno Clásico (Imágenes de Planta)'}
              </h2>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                {activeEnv === 'technological'
                  ? 'Supervisión en caliente de conducta, ergonomía, racks de servidores y aforo mediante cámaras CCTV continuas. En el Entorno Tecnológico la inferencia opera exclusivamente en vivo.'
                  : 'Inspección cinemática continua sobre los escenarios industriales clásicos de imágenes. Detecta operarios, EPP reglamentario, montacargas y anomalías de calidad en directo.'}
              </p>
            </div>

            {/* Environment Switcher or Navigation */}
            {showEnvironmentToggle && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
                <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => handleEnvChange('classic')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeEnv === 'classic'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <Factory className="w-3.5 h-3.5 text-blue-600" />
                    Entorno Clásico (Planta)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEnvChange('technological')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeEnv === 'technological'
                      ? 'bg-white text-purple-700 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <Cctv className="w-3.5 h-3.5 text-purple-600" />
                    Entorno Tecnológico (CCTV)
                  </button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={onNavigateToStatic ? onNavigateToStatic : () => setCurrentPage('analysis')}
                  icon={<ScanEye className="w-3.5 h-3.5 text-blue-600" />}
                  title="Ir al módulo de Inspección de Imágenes fijas"
                >
                  Inspección de Imágenes
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Green Notification Banner (matching Image 1, 2, 3) */}
      {savedBanner && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50/90 border border-emerald-200 rounded-xl text-emerald-950 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1 text-xs leading-relaxed">
            <span className="font-bold text-emerald-950">
              Sesión {savedBanner.id} guardada
            </span>
            <div className="text-emerald-800 text-[11px] mt-0.5">
              {savedBanner.frames} fotogramas · {savedBanner.seconds} s de escena · {savedBanner.objectsTracked} objetos rastreados · {savedBanner.alertsCount} alertas.{' '}
              <button
                type="button"
                onClick={() => setShowSummary(true)}
                className="underline font-semibold hover:text-emerald-950 cursor-pointer"
              >
                Revisar la sesión
              </button>{' '}
              (puede reproducir cualquier instante).
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* ENTORNO CLÁSICO: DESCRIPCIÓN Y SELECTOR SUPERIOR DESTACADO    */}
      {/* ============================================================= */}
      {activeEnv === 'classic' && (
        <div className="bg-white rounded-2xl border border-blue-200/90 shadow-2xs overflow-hidden">
          {/* Header del catálogo de ambientes industriales clásicos */}
          <div className="bg-gradient-to-r from-blue-50 via-sky-50/50 to-white px-5 py-3.5 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Factory className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 font-mono">
                    Catálogo de Ambientes Industriales & Comerciales
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    En Vivo
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Explora Seguridad EPP, Logística de Almacén, Control de Calidad y Retail
                </h3>
              </div>
            </div>
            <div className="text-[11px] font-mono text-blue-700 bg-blue-100/70 px-3 py-1 rounded-lg border border-blue-200 self-start sm:self-auto shrink-0">
              {Object.keys(CLASSIC_SCENARIOS_DATA).length} Ambientes Industriales
            </div>
          </div>

          {/* Selector de tarjetas arriba para cada ambiente clásico */}
          <div className="p-3.5 grid grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-50/50 border-b border-blue-100/60">
            {Object.values(CLASSIC_SCENARIOS_DATA).map((classic) => {
              const Icon = classic.icon;
              const isSelected = selectedScenarioId === classic.id;
              return (
                <button
                  key={classic.id}
                  type="button"
                  onClick={() => handleSelectScenario(classic.id)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${isSelected
                    ? classic.activeBorder
                    : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-2xs text-slate-700'
                    }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white shadow-2xs' : classic.bgColor
                        }`}
                    >
                      <Icon className={`w-4 h-4 ${classic.accentColor}`} />
                    </div>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold font-mono text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        ACTIVO
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-600 transition-colors">
                        Ver ambiente →
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight mb-1 text-slate-900 group-hover:text-blue-700 transition-colors">
                      {classic.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                      {classic.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tarjeta explicativa con DESCRIPCIÓN FÁCIL DE ENTENDER del escenario clásico seleccionado */}
          {selectedClassicDetail && (
            <div className="p-4 sm:p-5 bg-white space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 max-w-4xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border ${selectedClassicDetail.badgeColor}`}>
                      {selectedClassicDetail.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-300">·</span>
                    <span className="text-xs font-mono font-semibold text-slate-600">
                      Cámara: {selectedScenario?.cameraLabel ?? 'CAM-IND01'}
                    </span>
                    <span className="text-xs font-mono text-slate-300">·</span>
                    <span className="text-xs font-mono text-slate-500">
                      Modelo: {selectedScenario?.aiModel ?? 'Nexus YOLO v8 Industrial'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{selectedClassicDetail.name}</span>
                    <span className="text-xs font-normal text-slate-500 font-sans hidden sm:inline">
                      — ¿Cómo previene riesgos e inspecciona la IA?
                    </span>
                  </h4>

                  {/* Descripción amigable y fácil de entender */}
                  <div className="bg-blue-50/50 border border-blue-100/90 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                    <p className="flex items-start gap-2">
                      <span className="text-base shrink-0">💡</span>
                      <span>
                        <strong className="text-blue-900 font-bold">Descripción:</strong>{' '}
                        {selectedClassicDetail.easyDescription}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-start md:self-center">
                  {!isRunning ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleStart}
                      icon={<Play className="w-3.5 h-3.5" />}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    >
                      Iniciar monitoreo
                    </Button>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      Supervisión en marcha
                    </span>
                  )}
                </div>
              </div>

              {/* 3 Aspectos clave supervisados por la IA en este ambiente */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {selectedClassicDetail.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-blue-200 transition-all space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0">{h.icon}</span>
                      <span className="text-xs font-bold text-slate-900 leading-tight">{h.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                      {h.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* ENTORNO TECNOLÓGICO: DESCRIPCIÓN Y SELECTOR SUPERIOR DESTACADO */}
      {/* ============================================================= */}
      {activeEnv === 'technological' && (
        <div className="bg-white rounded-2xl border border-purple-200/90 shadow-2xs overflow-hidden">
          {/* Header del catálogo de ambientes tecnológicos */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white px-5 py-3.5 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Cctv className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 font-mono">
                    Catálogo de Ambientes Tecnológicos
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    CCTV En Vivo
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Explora Oficina Tecnológica, Data Center, Laboratorio QA y Sala de Reuniones
                </h3>
              </div>
            </div>
            <div className="text-[11px] font-mono text-purple-700 bg-purple-100/70 px-3 py-1 rounded-lg border border-purple-200 self-start sm:self-auto shrink-0">
              {Object.keys(TECH_SCENARIOS_DATA).length} Ambientes Supervisados
            </div>
          </div>

          {/* Selector de tarjetas arriba para cada ambiente tecnológico */}
          <div className="p-3.5 grid grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-50/50 border-b border-purple-100/60">
            {Object.values(TECH_SCENARIOS_DATA).map((tech) => {
              const Icon = tech.icon;
              const isSelected = selectedScenarioId === tech.id;
              return (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => handleSelectScenario(tech.id)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${isSelected
                    ? tech.activeBorder
                    : 'bg-white border-slate-200/90 hover:border-purple-300 hover:shadow-2xs text-slate-700'
                    }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white shadow-2xs' : tech.bgColor
                        }`}
                    >
                      <Icon className={`w-4 h-4 ${tech.accentColor}`} />
                    </div>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold font-mono text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                        ACTIVO
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-purple-600 transition-colors">
                        Ver ambiente →
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight mb-1 text-slate-900 group-hover:text-purple-700 transition-colors">
                      {tech.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                      {tech.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tarjeta explicativa con DESCRIPCIÓN FÁCIL DE ENTENDER del escenario seleccionado */}
          {selectedTechDetail && (
            <div className="p-4 sm:p-5 bg-white space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 max-w-4xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border ${selectedTechDetail.badgeColor}`}>
                      {selectedTechDetail.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-300">·</span>
                    <span className="text-xs font-mono font-semibold text-slate-600">
                      Cámara: {selectedScenario?.cameraLabel ?? 'CAM-00'}
                    </span>
                    <span className="text-xs font-mono text-slate-300">·</span>
                    <span className="text-xs font-mono text-slate-500">
                      Modelo: {selectedScenario?.aiModel ?? 'Nexus YOLO v8'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{selectedTechDetail.name}</span>
                    <span className="text-xs font-normal text-slate-500 font-sans hidden sm:inline">
                      — ¿Cómo protege la IA este ambiente?
                    </span>
                  </h4>

                  {/* Descripción amigable y fácil de entender */}
                  <div className="bg-purple-50/50 border border-purple-100/90 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                    <p className="flex items-start gap-2">
                      <span className="text-base shrink-0">💡</span>
                      <span>
                        <strong className="text-purple-900 font-bold">Descripción:</strong>{' '}
                        {selectedTechDetail.easyDescription}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-start md:self-center">
                  {!isRunning ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleStart}
                      icon={<Play className="w-3.5 h-3.5" />}
                      className="bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                    >
                      Iniciar monitoreo
                    </Button>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      Supervisión en marcha
                    </span>
                  )}
                </div>
              </div>

              {/* 3 Aspectos clave supervisados por la IA en este ambiente */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {selectedTechDetail.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-purple-200 transition-all space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0">{h.icon}</span>
                      <span className="text-xs font-bold text-slate-900 leading-tight">{h.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                      {h.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controls Bar */}
      <LiveControlsBar
        isRunning={isRunning}
        isPaused={isPaused}
        session={session}
        scenarios={envScenarios}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={handleSelectScenario}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        onCapture={handleCapture}
        showBoxes={showBoxes}
        showMasks={showMasks}
        showLabels={showLabels}
        showZones={showZones}
        showLowConf={showLowConf}
        onToggleBoxes={() => setShowBoxes((v) => !v)}
        onToggleMasks={() => setShowMasks((v) => !v)}
        onToggleLabels={() => setShowLabels((v) => !v)}
        onToggleZones={() => setShowZones((v) => !v)}
        onToggleLowConf={() => setShowLowConf((v) => !v)}
        fps={currentFrame?.fps ?? 0}
        frameNumber={currentFrame?.frameNumber ?? 0}
        cameraLabel={selectedScenario?.cameraLabel ?? 'CAM-00 · VISION AI'}
        confidenceThreshold={confidenceThreshold}
        onConfidenceChange={setConfidenceThreshold}
        analysisMode={analysisMode}
        onAnalysisModeChange={setAnalysisMode}
      />

      {/* Main Content: Camera Viewer + Live Metrics Panel */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Column: Camera Screen & Dynamic Info */}
        <div className="flex-1 min-w-0 w-full space-y-3">
          <LiveCameraViewer
            engine={liveEngine}
            sessionId={sessionId}
            scenario={selectedScenario ?? null}
            isRunning={isRunning}
            isPaused={isPaused}
            showBoxes={showBoxes}
            showMasks={showMasks}
            showLabels={showLabels}
            showZones={showZones}
            showLowConf={showLowConf}
            confidenceThreshold={confidenceThreshold}
            onToggleBoxes={() => setShowBoxes((v) => !v)}
            onToggleMasks={() => setShowMasks((v) => !v)}
            onToggleLabels={() => setShowLabels((v) => !v)}
            onToggleZones={() => setShowZones((v) => !v)}
            onToggleLowConf={() => setShowLowConf((v) => !v)}
            onFrame={handleFrame}
            onAlert={handleAlert}
            isClassic={activeEnv === 'classic'}
          />

          {/* Card: Objetos en escena (Sparkline Chart matching Photo 4) */}
          {activeEnv === 'classic' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Objetos en escena
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3 font-sans">
                Detecciones sobre el umbral por segundo · últimos 60 s
              </p>
              <div className="h-20 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartWave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#64748b"
                      strokeWidth={1.5}
                      fill="url(#chartWave)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Objects Detected in Current Frame */}
          {currentFrame && currentFrame.objects.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Objetos Detectados en Escena ({currentFrame.objects.length})
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Tracking NMS activo · Umbral &gt; 50%
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentFrame.objects.map((obj: TrackedObject) => (
                  <div
                    key={obj.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-medium shadow-2xs"
                    style={{
                      borderColor: obj.color + '50',
                      backgroundColor: obj.color + '12',
                      color: obj.color,
                    }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: obj.color }} />
                    <span className="font-bold">{obj.trackId}</span>
                    {obj.hasDrink && <span title="Bebida detectada en zona">🥤</span>}
                    {obj.hasESDGloves === false && <span title="Sin guantes antiestáticos">⚡</span>}
                    {obj.hasCredential === false && <span title="Sin credencial visible">🚫</span>}
                    {obj.hasHelmet === false && <span title="Sin casco de seguridad">⚠️</span>}
                    {obj.isDefective && <span title="Defecto superficial detectado">🔍</span>}
                    <span className="text-slate-500 text-[10px]">
                      {Math.round(obj.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scenario Description & Rules Card (when idle in tech environment) */}
          {!isRunning && selectedScenario && activeEnv === 'technological' && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{selectedScenario.name}</h4>
                  <Badge variant="blue" className="text-[10px]">
                    {selectedScenario.sector}
                  </Badge>
                  <span className="text-[10px] bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-purple-700 font-medium">
                    Exclusivo En Vivo
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedScenario.description}
                </p>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Reglas en cola de evaluación:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedScenario.rules
                      .filter((r: LiveRule) => r.enabled)
                      .map((rule: LiveRule) => {
                        const style =
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
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${style}`}
                          >
                            {rule.name}
                          </span>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 3 Cards matching Reference Photos */}
        <div className="w-full lg:w-80 shrink-0">
          <LiveMetricsPanel
            frame={currentFrame}
            session={session}
            sessionAlerts={sessionAlerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onResolveAlert={handleResolveAlert}
            onAddNote={handleAddNote}
            isClassic={activeEnv === 'classic'}
          />
        </div>
      </div>

      {/* Session Summary Modal */}
      {showSummary && session && (
        <SessionSummaryModal
          session={session}
          alerts={sessionAlerts}
          onClose={() => setShowSummary(false)}
          onExportCsv={handleExportCsv}
        />
      )}
    </div>
  );
};
