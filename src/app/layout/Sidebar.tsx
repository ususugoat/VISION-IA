import React from 'react';
import { useApp } from '../providers/AppContext';
import type { NavigationPage } from '../providers/AppContext';
import {
  LayoutDashboard,
  ScanEye,
  Crosshair,
  Layers,
  Sparkles,
  BellRing,
  History,
  FolderKanban,
  Tags,
  Settings,
  ShieldCheck,
  BookOpen,
  MonitorCheck,
  Cctv,
} from 'lucide-react';
import { cn } from '../../shared/utils/cn';

interface NavItem {
  id: NavigationPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  requiresPermission?: string;
  highlight?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, kpis, permissions } = useApp();

  const sections: NavSection[] = [
    {
      title: "Resumen",
      items: [
        { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
      ],
    },
    {
      title: "Análisis y Monitoreo",
      items: [
        { id: 'analysis', label: 'Centro de Análisis', icon: ScanEye },
        {
          id: 'live_monitor',
          label: 'Monitoreo en Vivo',
          icon: Cctv,
          highlight: true,
        },
        { id: 'scenarios', label: 'Galería de Escenarios', icon: FolderKanban },
      ],
    },
    {
      title: "Visión IA",
      items: [
        { id: 'detections_explorer', label: 'Detección & NMS', icon: Crosshair },
        { id: 'segmentation_explorer', label: 'Segmentación (Máscaras)', icon: Layers },
        { id: 'patterns_explorer', label: 'Reconocimiento de Patrones', icon: Sparkles },
      ],
    },
    {
      title: "Operaciones",
      items: [
        {
          id: 'alerts',
          label: 'Gestión de Alertas',
          icon: BellRing,
          badge: kpis?.activeAlerts ? kpis.activeAlerts : undefined,
        },
        { id: 'history', label: 'Historial & Exportación', icon: History },
      ],
    },
    {
      title: "Administración",
      items: [
        { id: 'classes', label: 'Catálogo de Clases', icon: Tags },
        { id: 'settings', label: 'Configuración & IA', icon: Settings },
      ],
    },
    {
      title: "Base Documental",
      items: [
        { id: 'procedures_manual', label: 'Manual de Procedimientos', icon: BookOpen },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-tight text-white text-base">VISION AI</span>
            <span className="text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30">
              v2.0
            </span>
          </div>
          <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
            Monitoreo Tiempo Real
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                    isActive
                      ? item.highlight
                        ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30"
                        : "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                      : item.highlight
                      ? "text-rose-400 hover:text-white hover:bg-rose-900/40 border border-rose-700/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isActive
                          ? "text-white"
                          : item.highlight
                          ? "text-rose-400 group-hover:text-white"
                          : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    <span>{item.label}</span>
                    {item.highlight && !isActive && (
                      <span className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      </span>
                    )}
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                        isActive ? "bg-white text-blue-700" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info / Mode Pill */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Motor Activo</span>
            <span className="text-xs font-medium text-cyan-300">Nexus-YOLO v8 Demo</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </aside>
  );
};
