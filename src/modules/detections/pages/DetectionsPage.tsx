import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/Card';
import { Slider } from '../../../shared/ui/Slider';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { Crosshair, Sliders, Info, Zap, HelpCircle } from 'lucide-react';

interface SimulatedCandidateBox {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export const DetectionsPage: React.FC = () => {
  const [nmsIouThreshold, setNmsIouThreshold] = useState<number>(0.5);
  const [confThreshold, setConfThreshold] = useState<number>(0.6);

  // Raw proposal boxes (e.g. Anchor boxes or YOLO proposals before NMS)
  const candidateBoxes: SimulatedCandidateBox[] = [
    { id: "box_1a", label: "Montacargas (Principal)", confidence: 0.96, x: 280, y: 150, w: 220, h: 180, color: "#f97316" },
    { id: "box_1b", label: "Montacargas (Solapada A)", confidence: 0.88, x: 290, y: 155, w: 215, h: 175, color: "#fb923c" },
    { id: "box_1c", label: "Montacargas (Solapada B)", confidence: 0.74, x: 270, y: 145, w: 230, h: 185, color: "#fdba74" },
    { id: "box_2a", label: "Operario 1", confidence: 0.94, x: 560, y: 160, w: 80, h: 190, color: "#3b82f6" },
    { id: "box_2b", label: "Operario 1 (Duplicada)", confidence: 0.71, x: 565, y: 165, w: 75, h: 185, color: "#60a5fa" },
    { id: "box_3a", label: "Casco de Seguridad", confidence: 0.91, x: 570, y: 150, w: 60, h: 45, color: "#eab308" },
    { id: "box_4_weak", label: "Falso Positivo (Ruido)", confidence: 0.42, x: 120, y: 220, w: 70, h: 90, color: "#94a3b8" },
  ];

  // Helper to compute IoU between two boxes
  const computeIoU = (b1: SimulatedCandidateBox, b2: SimulatedCandidateBox): number => {
    const x1 = Math.max(b1.x, b2.x);
    const y1 = Math.max(b1.y, b2.y);
    const x2 = Math.min(b1.x + b1.w, b2.x + b2.w);
    const y2 = Math.min(b1.y + b1.h, b2.y + b2.h);
    const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const area1 = b1.w * b1.h;
    const area2 = b2.w * b2.h;
    const union = area1 + area2 - intersection;
    return union > 0 ? intersection / union : 0;
  };

  // Run dynamic Non-Maximum Suppression (NMS)
  const filterByNms = () => {
    // 1. Filter by minimum confidence
    const sorted = [...candidateBoxes]
      .filter((b) => b.confidence >= confThreshold)
      .sort((a, b) => b.confidence - a.confidence);

    const kept: SimulatedCandidateBox[] = [];
    const suppressed: SimulatedCandidateBox[] = [];

    while (sorted.length > 0) {
      const best = sorted.shift()!;
      kept.push(best);

      for (let i = sorted.length - 1; i >= 0; i--) {
        const other = sorted[i];
        if (other.label.split(" ")[0] === best.label.split(" ")[0]) {
          const iou = computeIoU(best, other);
          if (iou > nmsIouThreshold) {
            suppressed.push(sorted.splice(i, 1)[0]);
          }
        }
      }
    }

    return { kept, suppressed };
  };

  const { kept, suppressed } = filterByNms();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="blue">Fundamentos Técnicos</Badge>
          <span className="text-xs text-slate-400">Sección 2.1 del Documento</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Detección de Objetos, Bounding Boxes & Algoritmo NMS
        </h2>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          La detección localiza y clasifica instancias dentro de una imagen mediante coordenadas relativas normalizadas <code>(x, y, w, h)</code>. Durante la inferencia, un modelo convolucional o transformer produce múltiples propuestas solapadas que deben ser filtradas mediante <strong>Supresión de No Máximos (NMS)</strong> y umbral de confianza.
        </p>
      </div>

      {/* Interactive Simulator Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Parámetros de Inferencia
                </CardTitle>
                <CardDescription>Ajusta los hiperparámetros en tiempo real</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-4 pt-1">
              <Slider
                label="Umbral de Confianza Mínimo"
                min={0.3}
                max={0.95}
                step={0.05}
                value={confThreshold}
                valueDisplay={`${Math.round(confThreshold * 100)}%`}
                description="Filtra detecciones con probabilidad inferior a este valor."
                onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
              />

              <Slider
                label="Umbral IoU para Supresión (NMS)"
                min={0.2}
                max={0.8}
                step={0.05}
                value={nmsIouThreshold}
                valueDisplay={nmsIouThreshold.toFixed(2)}
                description="Si dos cajas se solapan más de este IoU, se descarta la de menor confianza."
                onChange={(e) => setNmsIouThreshold(parseFloat(e.target.value))}
              />

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Resultado del Filtro NMS</span>
                </div>
                <p>Propuestas iniciales: <strong>{candidateBoxes.length}</strong></p>
                <p>Cajas validadas: <strong className="text-emerald-700">{kept.length}</strong></p>
                <p>Cajas suprimidas: <strong className="text-rose-700">{suppressed.length + candidateBoxes.filter(b => b.confidence < confThreshold).length}</strong></p>
              </div>
            </div>
          </Card>

          {/* Metric glossary */}
          <Card>
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              Métricas Habituales de Detección
            </CardTitle>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <strong className="text-slate-800">IoU (Intersection over Union):</strong>
                <p className="text-slate-500 mt-0.5">Área de solapamiento dividida por el área de la unión entre predicción y referencia.</p>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <strong className="text-slate-800">mAP (mean Average Precision):</strong>
                <p className="text-slate-500 mt-0.5">Métrica agregada que evalúa la precisión a diferentes niveles de recall y umbrales IoU.</p>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <strong className="text-slate-800">Latencia por Imagen:</strong>
                <p className="text-slate-500 mt-0.5">Milisegundos requeridos por el pipeline desde el tensor de entrada hasta los bounding boxes finales.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Visual Canvas Simulator */}
        <div className="lg:col-span-8">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-blue-600" />
                  Visor Interactivo de Propuestas y NMS
                </CardTitle>
                <CardDescription>
                  Las cajas en verde/color brillante son conservadas; las cajas tenues punteadas fueron suprimidas por NMS
                </CardDescription>
              </div>
              <Badge variant="cyan">Simulación Vectorial</Badge>
            </CardHeader>

            <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden relative min-h-[420px] flex items-center justify-center p-4">
              <svg viewBox="0 0 800 450" className="w-full h-full max-h-[460px]">
                {/* Background grid */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="800" height="450" fill="#0f172a" />
                <rect width="800" height="450" fill="url(#grid)" />

                {/* Simulated background objects */}
                <circle cx="600" cy="200" r="16" fill="#fcd34d" />
                <rect x="585" y="220" width="30" height="110" fill="#3b82f6" rx="6" />
                <rect x="300" y="200" width="180" height="100" fill="#f97316" rx="8" />

                {/* 1. Render Suppressed Boxes */}
                {suppressed.map((box) => (
                  <g key={`supp_${box.id}`} opacity={0.35}>
                    <rect
                      x={box.x}
                      y={box.y}
                      width={box.w}
                      height={box.h}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth={1.5}
                      strokeDasharray="4,4"
                      rx={3}
                    />
                    <text
                      x={box.x + 4}
                      y={box.y - 4}
                      fill="#f43f5e"
                      fontSize={10}
                      fontFamily="monospace"
                    >
                      [SUPRIMIDA] {box.label} ({Math.round(box.confidence * 100)}%)
                    </text>
                  </g>
                ))}

                {/* 2. Render Kept Winning Boxes */}
                {kept.map((box) => (
                  <g key={`kept_${box.id}`}>
                    <rect
                      x={box.x}
                      y={box.y}
                      width={box.w}
                      height={box.h}
                      fill={box.color}
                      fillOpacity={0.15}
                      stroke={box.color}
                      strokeWidth={3}
                      rx={4}
                    />
                    {/* Corner marks */}
                    <line x1={box.x} y1={box.y} x2={box.x + 10} y2={box.y} stroke={box.color} strokeWidth={4} />
                    <line x1={box.x} y1={box.y} x2={box.x} y2={box.y + 10} stroke={box.color} strokeWidth={4} />
                    <line x1={box.x + box.w} y1={box.y} x2={box.x + box.w - 10} y2={box.y} stroke={box.color} strokeWidth={4} />
                    <line x1={box.x + box.w} y1={box.y} x2={box.x + box.w} y2={box.y + 10} stroke={box.color} strokeWidth={4} />

                    {/* Label */}
                    <rect
                      x={box.x}
                      y={box.y - 20}
                      width={Math.max(120, box.label.length * 8 + 30)}
                      height={20}
                      fill={box.color}
                      rx={3}
                    />
                    <text
                      x={box.x + 6}
                      y={box.y - 6}
                      fill="#ffffff"
                      fontSize={11}
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {box.label} {Math.round(box.confidence * 100)}%
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

