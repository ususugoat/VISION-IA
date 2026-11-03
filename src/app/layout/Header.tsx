import React, { useState } from 'react';
import { useApp, NavigationPage } from '../providers/AppContext';
import { DEFAULT_USERS } from '../../core/domain/seedData';
import { UserRole } from '../../core/domain/types';
import {
  Sparkles,
  Info,
  Shield,
  UserCheck,
  ChevronDown,
  Cpu,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '../../shared/ui/Modal';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';

export const Header: React.FC = () => {
  const {
    currentPage,
    currentUser,
    setCurrentUser,
    engineMode,
    startDemoTour,
    activeDemoStep,
  } = useApp();

  const [isDemoInfoOpen, setIsDemoInfoOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const pageTitles: Record<NavigationPage, { title: string; category: string }> = {
    dashboard: { title: "Dashboard General & Métricas", category: "Resumen" },
    analysis: { title: "Centro de Análisis Visual", category: "Análisis Visual" },
    detections_explorer: { title: "Fundamentos de Detección & NMS", category: "Visión IA" },
    segmentation_explorer: { title: "Segmentación Semántica, de Instancia & Panóptica", category: "Visión IA" },
    patterns_explorer: { title: "Reconocimiento de Patrones & Anomalías", category: "Visión IA" },
    alerts: { title: "Gestión & Trazabilidad de Alertas", category: "Operaciones" },
    history: { title: "Historial de Análisis & Exportación CSV", category: "Operaciones" },
    scenarios: { title: "Galería de Escenarios Calibrados", category: "Administración" },
    classes: { title: "Catálogo de Clases & Taxonomía", category: "Administración" },
    rules: { title: "Reglas de Negocio & Detección", category: "Administración" },
    settings: { title: "Configuración de Sistema & Conexión de IA", category: "Administración" },
    procedures_manual: { title: "Manual de Procedimientos & Glosario", category: "Base Documental" },
  };

  const currentInfo = pageTitles[currentPage] || { title: "Plataforma", category: "VISION AI" };

  const roleLabels: Record<UserRole, { label: string; badgeVariant: 'blue' | 'purple' | 'amber' | 'cyan' }> = {
    admin: { label: "Administrador", badgeVariant: "purple" },
    operator: { label: "Operador de Análisis", badgeVariant: "blue" },
    supervisor: { label: "Supervisor de Calidad", badgeVariant: "amber" },
    auditor: { label: "Auditor ISO", badgeVariant: "cyan" },
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-2xs">
        {/* Breadcrumb & Title */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>VISION AI</span>
              <span>/</span>
              <span className="text-slate-600 font-medium">{currentInfo.category}</span>
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              {currentInfo.title}
            </h1>
          </div>
        </div>

        {/* Actions, Mode Badge & User Profile */}
        <div className="flex items-center gap-3">
          {/* Guion Demo button */}
          <Button
            size="sm"
            variant={activeDemoStep ? "cyan" : "outline"}
            icon={<Sparkles className="w-3.5 h-3.5 text-cyan-600" />}
            onClick={startDemoTour}
            className="hidden sm:inline-flex"
          >
            {activeDemoStep ? `Guion Activo (${activeDemoStep}/8)` : "Guion Demo Empresa"}
          </Button>

          {/* MODO DEMO Banner Badge (Mandatory requirement: visible on header) */}
          <button
            onClick={() => setIsDemoInfoOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300/80 hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs"
            title="Haz clic para ver detalles sobre el Modo Simulación"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-mono uppercase tracking-wider text-[11px]">
              {engineMode === 'demo' ? "MODO DEMO: SIMULACIÓN" : "MODO API: CONECTADO"}
            </span>
            <Info className="w-3.5 h-3.5 text-amber-600 ml-0.5" />
          </button>

          {/* Fast Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {roleLabels[currentUser.role].label}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Role Dropdown */}
            {isRoleMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsRoleMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-40 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">Conmutador Rápido de Rol</p>
                    <p className="text-[11px] text-slate-500">
                      Permite probar vistas y permisos según especificación v1.0
                    </p>
                  </div>
                  <div className="py-1">
                    {DEFAULT_USERS.map((user) => {
                      const isSelected = user.id === currentUser.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            setCurrentUser(user);
                            setIsRoleMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                            isSelected ? "bg-blue-50 text-blue-900 font-semibold" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <div className="text-left">
                              <p className="leading-tight">{user.name}</p>
                              <p className="text-[10px] text-slate-400">{user.department}</p>
                            </div>
                          </div>
                          <Badge variant={roleLabels[user.role].badgeVariant} className="text-[10px]">
                            {roleLabels[user.role].label}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Demo Mode Information Modal */}
      <Modal
        isOpen={isDemoInfoOpen}
        onClose={() => setIsDemoInfoOpen(false)}
        title="Especificación de Modo Simulado (DEMO)"
        subtitle="VISION AI - Plataforma Inteligente de Análisis Visual"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-amber-900">
                Aviso de Cumplimiento Técnico (Sección 1 del Documento)
              </p>
              <p className="mt-1">
                Una simulación con resultados predefinidos o reglas de demostración no debe presentarse como un modelo entrenado ni como una inferencia real. La interfaz identifica claramente el <strong>modo DEMO</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-600" />
                Fase 1: Prototipo Simulado (Actual)
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
                <li>Motor local <code>DemoVisionAdapter</code></li>
                <li>Escenarios deterministas reproducibles</li>
                <li>Cálculo en frontend con coordenadas relativas (0..1)</li>
                <li>Validaciones y flujos empresariales 100% operativos</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-emerald-600" />
                Fase 2: Conexión IA Real (Preparada)
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
                <li>Contrato desacoplado <code>VisionEngine</code></li>
                <li>Adaptador <code>ApiVisionAdapter</code></li>
                <li>Backend previsto: Python FastAPI + YOLO / SAM</li>
                <li>Migración sin reconstruir componentes visuales</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <Button variant="primary" size="sm" onClick={() => setIsDemoInfoOpen(false)}>
              Entendido
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

