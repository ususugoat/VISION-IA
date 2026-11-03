import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  UserProfile,
  UserRole,
  AnalysisRecord,
  Alert,
  DashboardKPIs,
  AlertStatus,
  Scenario,
  VisionClass,
  BusinessRule,
} from '../../core/domain/types';
import { DEFAULT_USERS } from '../../core/domain/seedData';
import { LocalAnalysisRepository } from '../../infrastructure/persistence/LocalAnalysisRepository';
import { VisionEngine } from '../../core/ports/VisionEngine';
import { DemoVisionAdapter } from '../../infrastructure/vision/DemoVisionAdapter';
import { ApiVisionAdapter } from '../../infrastructure/vision/ApiVisionAdapter';

export type NavigationPage =
  | 'dashboard'
  | 'analysis'
  | 'detections_explorer'
  | 'segmentation_explorer'
  | 'patterns_explorer'
  | 'alerts'
  | 'history'
  | 'scenarios'
  | 'classes'
  | 'rules'
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

export interface DemoStep {
  step: number;
  title: string;
  description: string;
  targetPage: NavigationPage;
  actionHint?: string;
}

export const DEMO_TOUR_STEPS: DemoStep[] = [
  {
    step: 1,
    title: "1. Dashboard de Mando Empresarial",
    description: "Revisa los KPI consolidados: volumen de análisis, detecciones totales, confianza promedio del 94% y alertas activas.",
    targetPage: "dashboard",
    actionHint: "Observa los gráficos de actividad y distribución por clase.",
  },
  {
    step: 2,
    title: "2. Centro de Análisis Visual",
    description: "Entra al módulo de análisis y selecciona el escenario 'Seguridad Industrial & Prevención EPP'.",
    targetPage: "analysis",
    actionHint: "Verifica que el modo esté en 'Combinado' y pulsa 'Ejecutar Análisis'.",
  },
  {
    step: 3,
    title: "3. Simulación de Inferencia y Overlays",
    description: "Observa la barra de progreso por etapas (Validación -> Detección -> Segmentación -> Patrones) y el renderizado sobre el canvas.",
    targetPage: "analysis",
    actionHint: "Explora las cajas delimitadoras de los operarios y cascos.",
  },
  {
    step: 4,
    title: "4. Detección (Cajas) vs Segmentación (Máscaras)",
    description: "Compara el bounding box rectangular del operario frente a la máscara de píxeles exacta y ajusta la opacidad.",
    targetPage: "analysis",
    actionHint: "Abre la pestaña 'Máscaras' en el panel lateral derecho.",
  },
  {
    step: 5,
    title: "5. Reconocimiento de Patrones y Evidencia",
    description: "Observa el patrón de incumplimiento EPP: operario 2 sin casco ni chaleco con nivel de confianza explicable del 91%.",
    targetPage: "analysis",
    actionHint: "Haz clic en la pestaña 'Patrones' para ver la evidencia generada.",
  },
  {
    step: 6,
    title: "6. Operaciones & Trazabilidad de Alertas",
    description: "Dirígete al módulo de Alertas para auditar el incidente. Cambia el estado a 'Revisada' y agrega una nota técnica.",
    targetPage: "alerts",
    actionHint: "Pulsa 'Revisar Alerta' y actualiza el estado.",
  },
  {
    step: 7,
    title: "7. Historial y Exportación de Datos CSV",
    description: "Consulta el registro histórico inmutable, filtra por escenario o estado y descarga el reporte consolidado en CSV.",
    targetPage: "history",
    actionHint: "Haz clic en 'Exportar CSV' para descargar los datos.",
  },
  {
    step: 8,
    title: "8. Arquitectura y Conexión de IA Real",
    description: "Comprueba cómo el contrato VisionEngine permite sustituir el DemoVisionAdapter por ApiVisionAdapter (FastAPI + YOLO/SAM) sin reconstruir la UI.",
    targetPage: "settings",
    actionHint: "Revisa la configuración del motor de IA y el conmutador de backend.",
  },
];

interface AppContextValue {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  currentPage: NavigationPage;
  setCurrentPage: (page: NavigationPage) => void;
  engineMode: 'demo' | 'api';
  setEngineMode: (mode: 'demo' | 'api') => void;
  visionEngine: VisionEngine;
  repository: LocalAnalysisRepository;
  kpis: DashboardKPIs | null;
  refreshKPIs: () => Promise<void>;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  activeDemoStep: number | null; // 1..8 or null
  startDemoTour: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  stopDemoTour: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USERS[0]); // default admin
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [engineMode, setEngineMode] = useState<'demo' | 'api'>('demo');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [activeDemoStep, setActiveDemoStep] = useState<number | null>(null);

  const repository = useMemo(() => new LocalAnalysisRepository(), []);
  const demoEngine = useMemo(() => new DemoVisionAdapter(), []);
  const apiEngine = useMemo(() => new ApiVisionAdapter(), []);

  const visionEngine: VisionEngine = engineMode === 'demo' ? demoEngine : apiEngine;

  const refreshKPIs = async () => {
    try {
      const data = await repository.getDashboardKPIs();
      setKpis(data);
    } catch (e) {
      console.error("Error refreshing KPIs", e);
    }
  };

  useEffect(() => {
    refreshKPIs();
  }, [repository]);

  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const startDemoTour = () => {
    setActiveDemoStep(1);
    setCurrentPage('dashboard');
    showToast("Guion de Demostración para Empresas iniciado (Paso 1 de 8)", "info");
  };

  const nextDemoStep = () => {
    if (activeDemoStep === null) return;
    if (activeDemoStep < DEMO_TOUR_STEPS.length) {
      const next = activeDemoStep + 1;
      setActiveDemoStep(next);
      const stepData = DEMO_TOUR_STEPS[next - 1];
      setCurrentPage(stepData.targetPage);
    } else {
      setActiveDemoStep(null);
      showToast("¡Demostración completada con éxito!", "success");
    }
  };

  const prevDemoStep = () => {
    if (activeDemoStep && activeDemoStep > 1) {
      const prev = activeDemoStep - 1;
      setActiveDemoStep(prev);
      const stepData = DEMO_TOUR_STEPS[prev - 1];
      setCurrentPage(stepData.targetPage);
    }
  };

  const stopDemoTour = () => {
    setActiveDemoStep(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentPage,
        setCurrentPage,
        engineMode,
        setEngineMode,
        visionEngine,
        repository,
        kpis,
        refreshKPIs,
        toasts,
        showToast,
        removeToast,
        activeDemoStep,
        startDemoTour,
        nextDemoStep,
        prevDemoStep,
        stopDemoTour,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

