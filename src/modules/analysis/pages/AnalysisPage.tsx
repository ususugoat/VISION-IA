import React, { useState, useEffect } from 'react';
import { useApp } from '../../../app/providers/AppContext';
import {
  Scenario,
  AnalysisMode,
  VisionResult,
  AnalysisRecord,
} from '../../../core/domain/types';
import { VisualOverlayViewer } from '../components/VisualOverlayViewer';
import { AnalysisSidePanel } from '../components/AnalysisSidePanel';
import { Button } from '../../../shared/ui/Button';
import { Slider } from '../../../shared/ui/Slider';
import { Badge } from '../../../shared/ui/Badge';
import {
  Play,
  Upload,
  CheckCircle,
  AlertCircle,
  FileDown,
  Layers,
  Crosshair,
  Sparkles,
  Cpu,
  RefreshCw,
  FolderOpen,
  Cctv,
  ScanEye,

} from 'lucide-react';
import { CsvExportService } from '../../../infrastructure/export/CsvExportService';


export const AnalysisPage: React.FC = () => {
  const {
    repository,
    currentUser,
    refreshKPIs,
    showToast,
    engineMode,
    permissions,
    analyzeImageUseCase,
    setCurrentPage,
  } = useApp();



  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scen_seguridad');
  const [customImage, setCustomImage] = useState<{ url: string; name: string } | null>(null);

  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('combined');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.65);

  // Execution state (Preparado, Procesando, Completado, Advertencia, Error)
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'warning' | 'error'>('idle');
  const [progressStage, setProgressStage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [currentResult, setCurrentResult] = useState<VisionResult | null>(null);
  const [selectedDetectionId, setSelectedDetectionId] = useState<string | null>(null);

  // Visual toggles
  const [maskOpacity, setMaskOpacity] = useState<number>(0.4);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showMasks, setShowMasks] = useState<boolean>(true);
  const [showPatterns, setShowPatterns] = useState<boolean>(true);

  // Load scenarios on mount
  useEffect(() => {
    repository.getScenarios().then((data) => {
      setScenarios(data);
      if (data.length > 0 && !selectedScenarioId) {
        setSelectedScenarioId(data[0].id);
      }
    });
  }, [repository]);

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId);
  const activeImageUrl = customImage ? customImage.url : activeScenario?.asset || '';
  const activeImageTitle = customImage ? customImage.name : activeScenario?.name || 'Imagen';

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    if (!file.type.match(/^image\/(jpeg|png|webp|svg\+xml)$/)) {
      showToast("Formato no válido. Debe ser una imagen JPG, PNG, WEBP o SVG.", "error");
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast("La imagen supera el límite de 10 MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomImage({
          url: event.target.result as string,
          name: file.name,
        });
        setSelectedScenarioId(''); // clear preset scenario
        setCurrentResult(null);
        setStatus('idle');
        showToast(`Imagen "${file.name}" cargada correctamente`, "success");
      }
    };
    reader.readAsDataURL(file);
  };

  // Execute Analysis with realistic discrete stages
  const handleRunAnalysis = async () => {
    if (!activeImageUrl) {
      showToast("Por favor selecciona un escenario o carga una imagen.", "warning");
      return;
    }

    setStatus('processing');
    setErrorMessage(null);
    setSelectedDetectionId(null);

    const analysisId = `ana_${Date.now()}`;

    try {
      // Stage 1: Validation
      setProgressStage("1/4. Validando formato, tensor y dimensiones de entrada...");
      setProgressPercent(20);
      await new Promise((r) => setTimeout(r, 200));

      // Stage 2: Feature Extraction & Detection
      setProgressStage("2/4. Extracción de características & Generación de Bounding Boxes...");
      setProgressPercent(45);
      await new Promise((r) => setTimeout(r, 250));

      // Stage 3: Mask Segmentation
      setProgressStage("3/4. Inferencia de polígonos & máscaras de segmentación...");
      setProgressPercent(75);
      await new Promise((r) => setTimeout(r, 200));

      // Stage 4: Rule & Pattern matching via AnalyzeImageUseCase
      setProgressStage("4/4. Evaluación de reglas de negocio, umbrales y alertas...");
      setProgressPercent(90);

      const { result } = await analyzeImageUseCase.execute(
        {
          analysisId,
          sourceName: activeImageTitle,
          imageUrl: activeImageUrl,
          scenarioId: selectedScenarioId || undefined,
          mode: analysisMode,
          confidenceThreshold,
          user: currentUser,
        },
        activeScenario?.name
      );

      setProgressPercent(100);
      setCurrentResult(result);

      await refreshKPIs();

      if (result.alerts.length > 0) {
        setStatus('warning');
        showToast(`Análisis completado: Se originó 1 alerta que requiere revisión`, "warning");
      } else {
        setStatus('completed');
        showToast("Análisis visual ejecutado con éxito", "success");
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || "Error al procesar la imagen con el motor de visión.");
      showToast("Fallo al ejecutar el análisis", "error");
    }
  };

  // Export current result as single CSV
  const handleExportThisAnalysis = () => {
    if (!currentResult) return;
    const record: AnalysisRecord = {
      id: currentResult.analysisId,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      userRole: currentUser.role,
      sourceName: activeImageTitle,
      scenarioName: activeScenario?.name,
      imageUrl: activeImageUrl,
      mode: analysisMode,
      status: "completed",
      durationMs: currentResult.durationMs,
      averageConfidence: currentResult.averageConfidence,
      detectionsCount: currentResult.detections.length,
      alertsCount: currentResult.alerts.length,
      confidenceThreshold,
      engineType: engineMode,
      result: currentResult,
    };
    CsvExportService.exportAnalysesToCsv([record], `analisis_${currentResult.analysisId}.csv`);
    showToast("Reporte CSV descargado", "success");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Inspección de Imágenes Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="blue">Inspección de Imágenes</Badge>
              <span className="text-xs text-slate-400 font-mono">Modo Clásico · Análisis Estático</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Inspección de Imágenes — Modo Clásico
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Carga tus propias imágenes (JPG, PNG, WEBP, SVG) o selecciona escenarios industriales de planta para ejecutar detección de objetos, supresión no máxima (NMS), segmentación de máscaras y verificación de reglas de seguridad.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage('live_monitor')}
              icon={<Cctv className="w-3.5 h-3.5 text-rose-500" />}
              title="Ir a Monitoreo en Vivo"
            >
              Ir a Monitoreo en Vivo
            </Button>
          </div>
        </div>
      </div>

      {/* Top Configuration Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Scenario Selector */}
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <FolderOpen className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="flex-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Escenario Demostrativo Calibrado
              </label>
              <select
                value={selectedScenarioId}
                onChange={(e) => {
                  setSelectedScenarioId(e.target.value);
                  setCustomImage(null);
                  setCurrentResult(null);
                  setStatus('idle');
                }}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {scenarios.map((scen) => (
                  <option key={scen.id} value={scen.id}>
                    {scen.name} ({scen.sector})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex flex-col min-w-[200px]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Perfil / Modo de Análisis
            </label>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setAnalysisMode('combined')}
                className={`flex-1 py-1 px-2 rounded-md font-semibold transition-all ${
                  analysisMode === 'combined' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Combinado
              </button>
              <button
                onClick={() => setAnalysisMode('detection')}
                className={`flex-1 py-1 px-2 rounded-md font-semibold transition-all ${
                  analysisMode === 'detection' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cajas
              </button>
              <button
                onClick={() => setAnalysisMode('segmentation')}
                className={`flex-1 py-1 px-2 rounded-md font-semibold transition-all ${
                  analysisMode === 'segmentation' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Máscaras
              </button>
              <button
                onClick={() => setAnalysisMode('patterns')}
                className={`flex-1 py-1 px-2 rounded-md font-semibold transition-all ${
                  analysisMode === 'patterns' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Patrones
              </button>
            </div>
          </div>

          {/* Confidence Slider */}
          <div className="w-48">
            <Slider
              label="Umbral Confianza"
              min={0.4}
              max={0.95}
              step={0.05}
              value={confidenceThreshold}
              valueDisplay={`${Math.round(confidenceThreshold * 100)}%`}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            />
          </div>

          {/* Upload File & Run Buttons */}
          <div className="flex items-center gap-2 shrink-0 pt-3 sm:pt-0">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all">
                <Upload className="w-3.5 h-3.5" /> Subir Imagen
              </span>
            </label>

            <Button
              variant="primary"
              size="md"
              loading={status === 'processing'}
              disabled={status === 'processing' || !activeImageUrl || !permissions.canRunAnalysis}
              title={!permissions.canRunAnalysis ? "Rol Auditor: Solo lectura" : undefined}
              icon={<Play className="w-4 h-4 fill-current" />}
              onClick={handleRunAnalysis}
              className="shadow-md shadow-blue-600/25 px-5"
            >
              {status === 'processing'
                ? "Procesando..."
                : !permissions.canRunAnalysis
                ? "Solo Lectura (Auditor)"
                : "Ejecutar Análisis"}
            </Button>
          </div>
        </div>

        {/* Description & Tags bar */}
        {activeScenario && !customImage && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <p className="line-clamp-1">{activeScenario.description}</p>
            <div className="flex items-center gap-1.5 shrink-0">
              {activeScenario.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {customImage && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 bg-blue-50/50 p-2 rounded">
            <span>Archivo personalizado: <strong>{customImage.name}</strong></span>
            <button
              onClick={() => {
                setCustomImage(null);
                setSelectedScenarioId(scenarios[0]?.id || '');
              }}
              className="text-xs text-blue-800 underline font-medium"
            >
              Restablecer a Escenarios Demo
            </button>
          </div>
        )}
      </div>

      {/* Processing Progress Bar (Section 6.1 State) */}
      {status === 'processing' && (
        <div className="bg-slate-900 text-white rounded-xl p-4 shadow-lg border border-blue-900/60 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              {progressStage}
            </span>
            <span className="font-mono text-cyan-200">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-2 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Banner */}
      {status === 'error' && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-xs">Error durante la inferencia</p>
              <p className="text-xs text-rose-700">{errorMessage}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleRunAnalysis}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Main Workspace: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Visual Overlay Viewer (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <VisualOverlayViewer
            imageUrl={activeImageUrl}
            sourceTitle={activeImageTitle}
            detections={currentResult?.detections || []}
            masks={currentResult?.masks || []}
            patterns={currentResult?.patterns || []}
            selectedDetectionId={selectedDetectionId}
            onSelectDetection={setSelectedDetectionId}
            maskOpacity={maskOpacity}
            showBoxes={showBoxes}
            showMasks={showMasks}
            showPatterns={showPatterns}
          />

          {/* Quick Action below Viewer */}
          {currentResult && (
            <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-4 py-2.5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-700">Identificador único:</span>
                <code className="text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded">
                  {currentResult.analysisId}
                </code>
              </div>
              <Button
                size="sm"
                variant="outline"
                icon={<FileDown className="w-3.5 h-3.5" />}
                onClick={handleExportThisAnalysis}
                className="text-xs"
              >
                Descargar Reporte CSV
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Detailed Findings Side Panel (4 cols) */}
        <div className="lg:col-span-4 h-[590px]">
          <AnalysisSidePanel
            result={currentResult}
            selectedDetectionId={selectedDetectionId}
            onSelectDetection={setSelectedDetectionId}
            maskOpacity={maskOpacity}
            onMaskOpacityChange={setMaskOpacity}
            showBoxes={showBoxes}
            onToggleBoxes={setShowBoxes}
            showMasks={showMasks}
            onToggleMasks={setShowMasks}
            showPatterns={showPatterns}
            onTogglePatterns={setShowPatterns}
          />
        </div>
      </div>
    </div>
  );
};

