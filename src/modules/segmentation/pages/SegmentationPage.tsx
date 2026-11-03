import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { Slider } from '../../../shared/ui/Slider';
import { Layers, Eye, Info, Sparkles, Check } from 'lucide-react';
import { SegmentationType } from '../../../core/domain/types';

export const SegmentationPage: React.FC = () => {
  const [segMode, setSegMode] = useState<SegmentationType>('instance');
  const [opacity, setOpacity] = useState<number>(0.55);

  const modeDescriptions: Record<SegmentationType, { title: string; produce: string; useCase: string }> = {
    semantic: {
      title: "Segmentación Semántica",
      produce: "Máscara por clase. Todos los píxeles de una misma clase comparten la misma etiqueta.",
      useCase: "Separar piso operacional, carretera, cielo, fondo o material a granel.",
    },
    instance: {
      title: "Segmentación de Instancia",
      produce: "Máscara individual única para cada instancia de objeto detectado.",
      useCase: "Contar personas o productos adyacentes sin fusionar sus siluetas.",
    },
    panoptic: {
      title: "Segmentación Panóptica",
      produce: "Unifica regiones semánticas continuas (stuff) con instancias discretas numeradas (things).",
      useCase: "Comprensión integral de una escena industrial o urbana de 360 grados.",
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="purple">Fundamentos de Píxeles</Badge>
          <span className="text-xs text-slate-400">Sección 2.2 del Documento</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Segmentación Semántica, de Instancia y Panóptica
        </h2>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          A diferencia de la detección basada en rectángulos, la segmentación clasifica cada píxel individualmente describiendo contornos precisos. Permite calcular el área exacta de defectos, contornos anatómicos y límites operacionales.
        </p>
      </div>

      {/* Simulator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column Controls */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Modalidad de Segmentación
                </CardTitle>
                <CardDescription>Selecciona para comparar la salida de máscaras</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-2 pt-1">
              {(['semantic', 'instance', 'panoptic'] as SegmentationType[]).map((type) => {
                const isSelected = segMode === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSegMode(type)}
                    className={`w-full p-3 rounded-lg border text-left transition-all flex items-start justify-between ${
                      isSelected
                        ? "border-purple-600 bg-purple-50/60 shadow-xs ring-1 ring-purple-600"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? "text-purple-900" : "text-slate-800"}`}>
                        {modeDescriptions[type].title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {modeDescriptions[type].produce}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5 ml-2" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <Slider
                label="Opacidad de Máscaras Superpuestas"
                min={0.1}
                max={0.9}
                step={0.05}
                value={opacity}
                valueDisplay={`${Math.round(opacity * 100)}%`}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
              />
            </div>
          </Card>

          {/* Table summary from PDF Section 2.2 */}
          <Card>
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              Resumen Comparativo (PDF Especificación)
            </CardTitle>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                <span className="font-semibold text-purple-900">Uso típico actual:</span>
                <p className="text-slate-600 mt-1">{modeDescriptions[segMode].useCase}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Visual Canvas Demo */}
        <div className="lg:col-span-8">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-600" />
                  Visor de Píxeles & Capas
                </CardTitle>
                <CardDescription>
                  Vista activa: <strong className="text-purple-700">{modeDescriptions[segMode].title}</strong>
                </CardDescription>
              </div>
              <Badge variant="purple">{segMode.toUpperCase()}</Badge>
            </CardHeader>

            <div className="flex-1 bg-slate-950 rounded-xl overflow-hidden relative min-h-[440px] flex items-center justify-center p-4">
              <svg viewBox="0 0 800 450" className="w-full h-full max-h-[460px]">
                {/* Background factory setting */}
                <rect width="800" height="450" fill="#1e293b" />
                <rect y="260" width="800" height="190" fill="#334155" />

                {/* Object 1: Person A (Worker 1) */}
                <ellipse cx="260" cy="400" rx="30" ry="10" fill="#0f172a" opacity="0.4" />
                <circle cx="260" cy="180" r="20" fill="#fed7aa" />
                <rect x="245" y="200" width="30" height="180" fill="#2563eb" rx="6" />

                {/* Object 2: Person B (Worker 2 standing right next to Person A) */}
                <ellipse cx="320" cy="400" rx="30" ry="10" fill="#0f172a" opacity="0.4" />
                <circle cx="320" cy="180" r="20" fill="#fed7aa" />
                <rect x="305" y="200" width="30" height="180" fill="#0284c7" rx="6" />

                {/* Object 3: Forklift */}
                <rect x="490" y="220" width="220" height="160" fill="#f59e0b" rx="12" />

                {/* =========================================================================
                    SEGMENTATION OVERLAYS BASED ON SELECTED MODE
                   ========================================================================= */}

                {/* 1. SEMANTIC MODE: Both people share the exact same blue mask color (fused class), floor is grey */}
                {segMode === 'semantic' && (
                  <g>
                    {/* Floor semantic class */}
                    <rect y="260" width="800" height="190" fill="#64748b" fillOpacity={opacity} />
                    <text x="30" y="320" fill="#ffffff" fontSize={13} fontWeight="bold">Clase Semántica: Piso Operacional</text>

                    {/* Fused Person Class Mask covering both workers */}
                    <polygon
                      points="240,160 340,160 345,390 235,390"
                      fill="#3b82f6"
                      fillOpacity={opacity}
                      stroke="#60a5fa"
                      strokeWidth={2}
                    />
                    <text x="240" y="145" fill="#93c5fd" fontSize={12} fontWeight="bold">
                      Clase: Persona (Compartida)
                    </text>

                    {/* Vehicle Semantic Mask */}
                    <polygon
                      points="480,210 720,210 720,390 480,390"
                      fill="#f97316"
                      fillOpacity={opacity}
                      stroke="#fb923c"
                      strokeWidth={2}
                    />
                    <text x="490" y="200" fill="#fdba74" fontSize={12} fontWeight="bold">
                      Clase: Vehículo Industrial
                    </text>
                  </g>
                )}

                {/* 2. INSTANCE MODE: Worker 1 and Worker 2 have separate distinct individual instance masks */}
                {segMode === 'instance' && (
                  <g>
                    {/* Worker 1 Instance Mask (Cyan) */}
                    <polygon
                      points="240,160 280,160 285,390 235,390"
                      fill="#06b6d4"
                      fillOpacity={opacity}
                      stroke="#22d3ee"
                      strokeWidth={2}
                    />
                    <text x="220" y="145" fill="#67e8f9" fontSize={12} fontWeight="bold">
                      Instancia #1 (Persona A)
                    </text>

                    {/* Worker 2 Instance Mask (Purple) - Separated clearly without fusion! */}
                    <polygon
                      points="300,160 340,160 345,390 295,390"
                      fill="#a855f7"
                      fillOpacity={opacity}
                      stroke="#c084fc"
                      strokeWidth={2}
                    />
                    <text x="310" y="145" fill="#e9d5ff" fontSize={12} fontWeight="bold">
                      Instancia #2 (Persona B)
                    </text>

                    {/* Forklift Instance Mask */}
                    <polygon
                      points="480,210 720,210 720,390 480,390"
                      fill="#f97316"
                      fillOpacity={opacity}
                      stroke="#fb923c"
                      strokeWidth={2}
                    />
                    <text x="490" y="200" fill="#fdba74" fontSize={12} fontWeight="bold">
                      Instancia #3 (Montacargas)
                    </text>
                  </g>
                )}

                {/* 3. PANOPTIC MODE: Combines Background Stuff (Floor) + Foreground Things (Workers & Forklift instances) */}
                {segMode === 'panoptic' && (
                  <g>
                    {/* Semantic Floor */}
                    <rect y="260" width="800" height="190" fill="#475569" fillOpacity={opacity} />
                    <text x="30" y="420" fill="#cbd5e1" fontSize={12} fontWeight="bold">
                      [Stuff] Piso Continuo
                    </text>

                    {/* Distinct Instance 1 */}
                    <polygon
                      points="240,160 280,160 285,390 235,390"
                      fill="#06b6d4"
                      fillOpacity={opacity}
                      stroke="#22d3ee"
                      strokeWidth={2}
                    />
                    <text x="220" y="145" fill="#67e8f9" fontSize={11} fontWeight="bold">
                      [Thing 1] Persona A
                    </text>

                    {/* Distinct Instance 2 */}
                    <polygon
                      points="300,160 340,160 345,390 295,390"
                      fill="#a855f7"
                      fillOpacity={opacity}
                      stroke="#c084fc"
                      strokeWidth={2}
                    />
                    <text x="310" y="145" fill="#e9d5ff" fontSize={11} fontWeight="bold">
                      [Thing 2] Persona B
                    </text>

                    {/* Distinct Instance 3 */}
                    <polygon
                      points="480,210 720,210 720,390 480,390"
                      fill="#f97316"
                      fillOpacity={opacity}
                      stroke="#fb923c"
                      strokeWidth={2}
                    />
                    <text x="490" y="200" fill="#fdba74" fontSize={11} fontWeight="bold">
                      [Thing 3] Montacargas
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

