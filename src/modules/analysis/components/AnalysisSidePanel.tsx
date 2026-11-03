import React, { useState } from 'react';
import {
  VisionResult,
  Detection,
  SegmentationResult,
  PatternResult,
  Alert,
} from '../../../core/domain/types';
import {
  Activity,
  Crosshair,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Gauge,
  Sliders,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { Slider } from '../../../shared/ui/Slider';
import { useApp } from '../../../app/providers/AppContext';

interface AnalysisSidePanelProps {
  result: VisionResult | null;
  selectedDetectionId: string | null;
  onSelectDetection: (id: string | null) => void;
  maskOpacity: number;
  onMaskOpacityChange: (opacity: number) => void;
  showBoxes: boolean;
  onToggleBoxes: (show: boolean) => void;
  showMasks: boolean;
  onToggleMasks: (show: boolean) => void;
  showPatterns: boolean;
  onTogglePatterns: (show: boolean) => void;
}

export const AnalysisSidePanel: React.FC<AnalysisSidePanelProps> = ({
  result,
  selectedDetectionId,
  onSelectDetection,
  maskOpacity,
  onMaskOpacityChange,
  showBoxes,
  onToggleBoxes,
  showMasks,
  onToggleMasks,
  showPatterns,
  onTogglePatterns,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'detections' | 'masks' | 'patterns'>('summary');
  const [filterClass, setFilterClass] = useState<string>('all');
  const { setCurrentPage } = useApp();

  if (!result) {
    return (
      <div className="h-full bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Activity className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">Esperando Ejecución</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Selecciona un escenario de prueba o carga una imagen y pulsa <strong className="text-blue-600">Analizar</strong> para visualizar detecciones, máscaras y anomalías.
        </p>
      </div>
    );
  }

  const detections = result.detections || [];
  const masks = result.masks || [];
  const patterns = result.patterns || [];
  const alerts = result.alerts || [];

  const filteredDetections = filterClass === 'all'
    ? detections
    : detections.filter((d) => d.classId === filterClass);

  const uniqueClasses = Array.from(new Set(detections.map((d) => d.classId)));

  return (
    <div className="h-full bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 p-1 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'summary'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Resumen</span>
        </button>

        <button
          onClick={() => setActiveTab('detections')}
          className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'detections'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Cajas ({detections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('masks')}
          className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'masks'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Máscaras ({masks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('patterns')}
          className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'patterns'
              ? 'bg-white text-rose-700 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Patrones ({patterns.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Status Callout */}
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">Análisis Exitoso</p>
                  <p className="text-[11px] text-emerald-700">Inferencia local determinista completada</p>
                </div>
              </div>
              <Badge variant="green" dot>OK</Badge>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Gauge className="w-3.5 h-3.5 text-blue-600" />
                  <span>Confianza Media</span>
                </div>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {Math.round(result.averageConfidence * 100)}%
                </p>
                <p className="text-[10px] text-slate-500">Puntuación agregada</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Latencia Total</span>
                </div>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {result.durationMs} <span className="text-xs font-normal text-slate-500">ms</span>
                </p>
                <p className="text-[10px] text-slate-500">Tiempo de ciclo</p>
              </div>
            </div>

            {/* Summary Highlights */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Desglose de Hallazgos
              </p>

              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-slate-50 text-xs">
                <span className="text-slate-600">Cajas delimitadoras (Bounding boxes)</span>
                <span className="font-bold text-slate-900">{detections.length}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-slate-50 text-xs">
                <span className="text-slate-600">Máscaras de segmentación</span>
                <span className="font-bold text-slate-900">{masks.length}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-slate-50 text-xs">
                <span className="text-slate-600">Patrones / anomalías detectadas</span>
                <span className="font-bold text-slate-900">{patterns.length}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-rose-50 text-xs text-rose-800">
                <span className="font-medium">Alertas de riesgo originadas</span>
                <span className="font-bold">{alerts.length}</span>
              </div>
            </div>

            {/* Quick Alert Banner if generated */}
            {alerts.length > 0 && (
              <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/80 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Se requiere atención de supervisión</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-tight">
                  {alerts[0].message}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage('alerts')}
                  className="w-full text-xs bg-white text-rose-700 border-rose-300 hover:bg-rose-50"
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Auditar en Módulo de Alertas
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 2. DETECTIONS TAB */}
        {activeTab === 'detections' && (
          <div className="space-y-3">
            {/* Layer Visibility Toggle */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-700">Cajas Delimitadoras</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBoxes}
                  onChange={(e) => onToggleBoxes(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Filter by class */}
            {uniqueClasses.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Filtrar:</span>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 flex-1 text-slate-700"
                >
                  <option value="all">Todas las clases</option>
                  {uniqueClasses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Detections List */}
            <div className="space-y-2">
              {filteredDetections.map((det) => {
                const isSelected = selectedDetectionId === det.id;
                return (
                  <div
                    key={det.id}
                    onClick={() => onSelectDetection(isSelected ? null : det.id)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: det.color || '#3b82f6' }}
                        />
                        <span className="font-semibold text-slate-900">{det.label}</span>
                      </div>
                      <span className="font-mono font-bold text-blue-600">
                        {Math.round(det.confidence * 100)}%
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>x: {Math.round(det.box.x * 100)}% • y: {Math.round(det.box.y * 100)}%</span>
                      <span>w: {Math.round(det.box.width * 100)}% • h: {Math.round(det.box.height * 100)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. MASKS TAB */}
        {activeTab === 'masks' && (
          <div className="space-y-4">
            {/* Mask Toggle & Opacity Slider */}
            <div className="space-y-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Capa de Máscaras</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMasks}
                    onChange={(e) => onToggleMasks(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <Slider
                label="Opacidad de Relleno"
                min={0.1}
                max={0.9}
                step={0.05}
                value={maskOpacity}
                valueDisplay={`${Math.round(maskOpacity * 100)}%`}
                onChange={(e) => onMaskOpacityChange(parseFloat(e.target.value))}
              />
            </div>

            {/* Masks List */}
            <div className="space-y-2">
              {masks.map((mask) => (
                <div
                  key={mask.id}
                  className="p-3 rounded-lg border border-slate-200 bg-white text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: mask.color }}
                      />
                      <span className="font-semibold text-slate-900">{mask.label}</span>
                    </div>
                    <Badge variant="purple" className="text-[10px]">
                      {mask.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Área relativa: <strong className="text-slate-700">{Math.round(mask.areaRatio * 100)}%</strong></span>
                    <span className="font-mono text-emerald-600 font-semibold">{Math.round(mask.confidence * 100)}% conf</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. PATTERNS TAB */}
        {activeTab === 'patterns' && (
          <div className="space-y-3">
            {/* Pattern Toggle */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-700">Resaltar Patrones en Visor</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPatterns}
                  onChange={(e) => onTogglePatterns(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {patterns.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No se detectaron patrones anómalos o desviaciones de reglas.
              </p>
            ) : (
              patterns.map((pat) => (
                <div
                  key={pat.id}
                  className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/40 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="red" dot>
                      {pat.status.toUpperCase()}
                    </Badge>
                    <span className="font-mono font-bold text-rose-700">
                      {Math.round(pat.confidence * 100)}%
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900">{pat.label}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2 rounded border border-rose-100">
                    {pat.evidence}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

