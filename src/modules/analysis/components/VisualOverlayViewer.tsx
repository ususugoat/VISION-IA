import React, { useRef, useState } from 'react';
import { Detection, SegmentationResult, PatternResult } from '../../../core/domain/types';
import { Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface VisualOverlayViewerProps {
  imageUrl: string;
  sourceTitle: string;
  detections: Detection[];
  masks: SegmentationResult[];
  patterns: PatternResult[];
  selectedDetectionId?: string | null;
  onSelectDetection?: (id: string | null) => void;
  maskOpacity?: number; // 0..1
  showBoxes?: boolean;
  showMasks?: boolean;
  showPatterns?: boolean;
  showLabels?: boolean;
}

export const VisualOverlayViewer: React.FC<VisualOverlayViewerProps> = ({
  imageUrl,
  sourceTitle,
  detections,
  masks,
  patterns,
  selectedDetectionId,
  onSelectDetection,
  maskOpacity = 0.45,
  showBoxes = true,
  showMasks = true,
  showPatterns = true,
  showLabels = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredDetectionId, setHoveredDetectionId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const activeId = selectedDetectionId || hoveredDetectionId;

  return (
    <div className="relative w-full h-[540px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col select-none group">
      {/* Top Toolbar overlay on image */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-xs font-medium border border-slate-700/60 shadow-md">
            {sourceTitle}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30">
            {detections.length} cajas • {masks.length} máscaras
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-700/60 pointer-events-auto shadow-md">
          <button
            onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
            disabled={zoomLevel <= 1}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40"
            title="Reducir zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-300 px-1.5 min-w-[3rem] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
            disabled={zoomLevel >= 2.5}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
            title="Restablecer vista"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Visual Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full relative overflow-auto flex items-center justify-center p-2"
      >
        <div
          className="relative transition-transform duration-200 origin-center max-w-full max-h-full aspect-[1000/650] flex items-center justify-center shadow-2xl"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Base Image */}
          <img
            src={imageUrl}
            alt={sourceTitle}
            className="w-full h-full object-contain rounded-lg block pointer-events-none"
          />

          {/* SVG Overlay using 1000x650 coordinate space matching normalized 0..1 coordinates */}
          <svg
            viewBox="0 0 1000 650"
            className="absolute inset-0 w-full h-full pointer-events-auto overflow-visible"
            preserveAspectRatio="none"
          >
            {/* 1. SEGMENTATION MASKS (Polygons with fill opacity) */}
            {showMasks &&
              masks.map((mask) => {
                const pointsStr = mask.polygon
                  .map(([nx, ny]) => `${nx * 1000},${ny * 650}`)
                  .join(" ");

                return (
                  <g key={mask.id} className="transition-all duration-300">
                    <polygon
                      points={pointsStr}
                      fill={mask.color}
                      fillOpacity={maskOpacity}
                      stroke={mask.color}
                      strokeWidth={2}
                      strokeDasharray={mask.type === "semantic" ? "4,4" : undefined}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <title>{`${mask.label} (${Math.round(mask.confidence * 100)}%) - Tipo: ${mask.type}`}</title>
                    </polygon>
                  </g>
                );
              })}

            {/* 2. BOUNDING BOXES (Normalized x, y, width, height) */}
            {showBoxes &&
              detections.map((det) => {
                const x = det.box.x * 1000;
                const y = det.box.y * 650;
                const w = det.box.width * 1000;
                const h = det.box.height * 650;
                const isSelected = activeId === det.id;
                const boxColor = det.color || "#3b82f6";

                return (
                  <g
                    key={det.id}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredDetectionId(det.id)}
                    onMouseLeave={() => setHoveredDetectionId(null)}
                    onClick={() => onSelectDetection && onSelectDetection(det.id === selectedDetectionId ? null : det.id)}
                  >
                    {/* Bounding Box Border */}
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill={isSelected ? boxColor : "transparent"}
                      fillOpacity={isSelected ? 0.2 : 0}
                      stroke={boxColor}
                      strokeWidth={isSelected ? 4 : 2.5}
                      rx={4}
                      className="transition-all"
                    />

                    {/* Corner Reticle Accents */}
                    <line x1={x} y1={y} x2={x + 12} y2={y} stroke={boxColor} strokeWidth={4} />
                    <line x1={x} y1={y} x2={x} y2={y + 12} stroke={boxColor} strokeWidth={4} />
                    <line x1={x + w} y1={y} x2={x + w - 12} y2={y} stroke={boxColor} strokeWidth={4} />
                    <line x1={x + w} y1={y} x2={x + w} y2={y + 12} stroke={boxColor} strokeWidth={4} />
                    <line x1={x} y1={y + h} x2={x + 12} y2={y + h} stroke={boxColor} strokeWidth={4} />
                    <line x1={x} y1={y + h} x2={x} y2={y + h - 12} stroke={boxColor} strokeWidth={4} />
                    <line x1={x + w} y1={y + h} x2={x + w - 12} y2={y + h} stroke={boxColor} strokeWidth={4} />
                    <line x1={x + w} y1={y + h} x2={x + w} y2={y + h - 12} stroke={boxColor} strokeWidth={4} />

                    {/* Label Badge */}
                    {showLabels && (
                      <g transform={`translate(${x}, ${Math.max(16, y - 6)})`}>
                        <rect
                          x={0}
                          y={-18}
                          width={Math.max(100, det.label.length * 8 + 36)}
                          height={20}
                          fill={boxColor}
                          rx={3}
                          opacity={0.95}
                        />
                        <text
                          x={6}
                          y={-4}
                          fill="#ffffff"
                          fontSize={11}
                          fontWeight="bold"
                          fontFamily="system-ui, sans-serif"
                        >
                          {det.label} {Math.round(det.confidence * 100)}%
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

            {/* 3. PATTERNS / ANOMALY VISUAL HIGHLIGHTS */}
            {showPatterns &&
              patterns.map((pat) => {
                if (!pat.boundingBox) return null;
                const px = pat.boundingBox.x * 1000;
                const py = pat.boundingBox.y * 650;
                const pw = pat.boundingBox.width * 1000;
                const ph = pat.boundingBox.height * 650;

                return (
                  <g key={pat.id} className="pointer-events-none">
                    {/* Pulsing warning border */}
                    <rect
                      x={px - 4}
                      y={py - 4}
                      width={pw + 8}
                      height={ph + 8}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth={3}
                      strokeDasharray="6,4"
                      className="animate-pulse"
                      rx={6}
                    />
                    <circle cx={px + pw / 2} cy={py - 12} r={14} fill="#ef4444" />
                    <text
                      x={px + pw / 2}
                      y={py - 7}
                      fill="#ffffff"
                      fontSize={13}
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      !
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="h-10 bg-slate-900/90 border-t border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" />
            <span className="text-[11px]">Detección (Caja)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-purple-500/60 inline-block" />
            <span className="text-[11px]">Segmentación (Máscara)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block animate-pulse" />
            <span className="text-[11px]">Patrón / Alerta</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Coordenadas normalizadas [0..1] escaladas dinámicamente
        </div>
      </div>
    </div>
  );
};

