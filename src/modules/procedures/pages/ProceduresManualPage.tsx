import React, { useState } from 'react';
import { useApp } from '../../../app/providers/AppContext';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  Crosshair,
  Search,
  Sliders,
  Sparkles,
  Cpu,
  FileText,
  HelpCircle,
} from 'lucide-react';

export const ProceduresManualPage: React.FC = () => {
  const { setCurrentPage, startDemoTour } = useApp();
  const [activeSection, setActiveSection] = useState<number>(4); // default to Operative Procedure
  const [glossaryQuery, setGlossaryQuery] = useState('');

  const glossaryTerms = [
    {
      term: "Bounding box",
      definition: "Rectángulo que delimita la ubicación aproximada de un objeto dentro de la imagen, parametrizado en coordenadas normalizadas (x, y, ancho, alto).",
    },
    {
      term: "Máscara",
      definition: "Mapa de píxeles que identifica la región exacta y contorno de un objeto o clase (semántica, instancia o panóptica).",
    },
    {
      term: "IoU (Intersection over Union)",
      definition: "Medida métrica de solapamiento espacial entre una predicción candidata y la caja o región de referencia real.",
    },
    {
      term: "Confianza",
      definition: "Puntuación estimada (0 a 1, mostrada en porcentaje) asociada a una predicción. Es probabilística y no garantiza certeza absoluta.",
    },
    {
      term: "NMS (Non-Maximum Suppression)",
      definition: "Técnica algorítmica para filtrar y eliminar cajas duplicadas o muy solapadas sobre un mismo objeto, conservando la de mayor confianza.",
    },
    {
      term: "mAP (mean Average Precision)",
      definition: "Métrica agregada estándar para evaluar la precisión del modelo detector a distintos umbrales de IoU y niveles de recall.",
    },
    {
      term: "Embedding",
      definition: "Representación numérica vectorial compacta de características visuales extraídas por la red neuronal.",
    },
    {
      term: "Inferencia",
      definition: "Ejecución de un modelo matemático entrenado sobre datos visuales nuevos para producir predicciones.",
    },
  ];

  const filteredGlossary = glossaryTerms.filter(
    (g) =>
      g.term.toLowerCase().includes(glossaryQuery.toLowerCase()) ||
      g.definition.toLowerCase().includes(glossaryQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-900/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Manual Técnico-Operativo v1.0
            </span>
            <span className="text-xs text-slate-400">• Noviembre 2026</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Manual de Procedimientos & Base Documental
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Guía oficial de operación, validación técnica, criterios de aceptación y catálogo de conceptos de VISION AI.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="cyan"
            size="md"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={startDemoTour}
            className="shadow-lg shadow-cyan-600/30"
          >
            Iniciar Guion Demo
          </Button>
        </div>
      </div>

      {/* 2-Column Layout: Section Navigation & Document Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
              Índice de Trabajo Oficial
            </p>

            {[
              { id: 1, title: "1. Qué problema resuelve VISION AI" },
              { id: 2, title: "2. Conceptos que debes comprender" },
              { id: 3, title: "3. Funcionamiento de extremo a extremo" },
              { id: 4, title: "4. Procedimiento operativo del usuario" },
              { id: 5, title: "5. Qué hace cada módulo" },
              { id: 6, title: "6. Reglas de negocio y validaciones" },
              { id: 7, title: "7. Arquitectura y responsabilidades" },
              { id: 8, title: "8. Modelo de datos y entidades" },
              { id: 9, title: "9. Procedimiento de desarrollo" },
              { id: 10, title: "10. Evolución desde DEMO hasta IA REAL" },
              { id: 11, title: "11. Pruebas y criterios de aceptación" },
              { id: 12, title: "12. Guion de demostración y glosario" },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeSection === sec.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {sec.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Viewer (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-6">
            {/* SECTION 4: PROCEDIMIENTO OPERATIVO */}
            {activeSection === 4 && (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    4. Procedimiento Operativo del Usuario (Paso a Paso)
                  </h3>
                  <Badge variant="blue">Operativa Estándar</Badge>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-900 text-xs mb-1">4.1 Acceso y Verificación de Rol</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600">
                      <li>Abrir la aplicación en un navegador moderno.</li>
                      <li>Ingresar mediante el conmutador de perfil demostrativo (Admin, Operador, Supervisor, Auditor).</li>
                      <li>Confirmar que los permisos de interfaz corresponden a la función encomendada.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-900 text-xs mb-1">4.2 Preparación de Entrada</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600">
                      <li>Navegar a <strong>Análisis Visual</strong>.</li>
                      <li>Cargar archivo JPG/PNG o seleccionar uno de los 4 escenarios pre-calibrados.</li>
                      <li>Comprobar la vista previa y el nombre del recurso cargado.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-900 text-xs mb-1">4.3 Ejecución del Análisis</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600">
                      <li>Seleccionar modo: Detección, Segmentación, Patrones o Combinado.</li>
                      <li>Ajustar el umbral de confianza mínimo con el slider.</li>
                      <li>Comprobar que el indicador <strong>MODO DEMO</strong> esté activo y visible.</li>
                      <li>Pulsar <strong>Analizar</strong> una sola vez y observar la barra de progreso por etapas.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-900 text-xs mb-1">4.4 Revisión de Resultados y Auditoría</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600">
                      <li>Inspeccionar cajas delimitadoras, etiquetas y niveles de confianza calculados.</li>
                      <li>Revisar máscaras de píxeles y ajustar la opacidad en el visor.</li>
                      <li>Revisar anomalías detectadas en la pestaña Patrones y auditar alertas generadas.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-900 text-xs mb-1">4.5 Cierre y Exportación</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600">
                      <li>Consultar el historial de análisis y aplicar filtros por escenario o fecha.</li>
                      <li>Exportar el archivo consolidado en formato CSV compatible con hojas de cálculo.</li>
                    </ol>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setCurrentPage('analysis')}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Ir al Centro de Análisis
                  </Button>
                </div>
              </div>
            )}

            {/* SECTION 12: GLOSARIO Y GUION */}
            {activeSection === 12 && (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    12. Guion de Demostración & Glosario de Términos
                  </h3>
                  <Badge variant="cyan">Vocabulario & Guion</Badge>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar término del glosario (NMS, IoU, Máscara, etc.)..."
                    value={glossaryQuery}
                    onChange={(e) => setGlossaryQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {filteredGlossary.map((item) => (
                    <div key={item.term} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        {item.term}
                      </p>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{item.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OTHER SECTIONS: CONDENSED VIEW */}
            {activeSection !== 4 && activeSection !== 12 && (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Sección {activeSection} del Manual de Procedimientos
                  </h3>
                  <Badge variant="slate">Norma de Procedimiento</Badge>
                </div>

                {activeSection === 1 && (
                  <div className="space-y-2">
                    <p><strong>1.1 Propósito:</strong> Convertir imágenes en resultados visuales interpretables, permitiendo ejecutar análisis, visualizar detecciones, máscaras, métricas y alertas con trazabilidad inmutable.</p>
                    <p><strong>1.2 Límites:</strong> No incluye vigilancia masiva 24/7, reconocimiento biométrico facial ni decisiones disciplinarias automáticas sin supervisión.</p>
                  </div>
                )}

                {activeSection === 2 && (
                  <div className="space-y-2">
                    <p><strong>2.1 Detección de Objetos:</strong> Bounding box normalizado, etiquetas, confianza, supresión NMS.</p>
                    <p><strong>2.2 Segmentación:</strong> Semántica (píxel por clase), Instancia (píxel por objeto), Panóptica (integral).</p>
                    <p><strong>2.3 Reconocimiento de Patrones:</strong> Desviaciones como EPP incompleto, objeto en zona restringida, defecto superficial y congestión.</p>
                  </div>
                )}

                {activeSection === 3 && (
                  <div className="space-y-2">
                    <p><strong>Flujo Lógico:</strong> Usuario → Interfaz React → Casos de Uso → Dominio → Adaptador (DEMO / API REAL) → Repositorio → Dashboard e Historial.</p>
                    <p><strong>Estados:</strong> Preparado, Procesando, Completado, Advertencia, Error y Vacío.</p>
                  </div>
                )}

                {activeSection === 6 && (
                  <div className="space-y-2">
                    <p><strong>6.1 Coordenadas Relativas:</strong> Cajas y polígonos usan valores 0..1 para auto-escalarse con el visor.</p>
                    <p><strong>6.2 Validación de Archivos:</strong> Filtro de tipo MIME y tamaño máx 10MB.</p>
                    <p><strong>6.3 Principio de Transparencia:</strong> Una detección incierta nunca afirma una infracción sin validación humana previa.</p>
                  </div>
                )}

                {activeSection === 7 && (
                  <div className="space-y-2">
                    <p><strong>Arquitectura Modular por Capas:</strong> Presentación (React TS), Aplicación (Casos de Uso), Dominio (Entidades y reglas), Infraestructura (Repositorio y adaptadores).</p>
                    <p><strong>Roles:</strong> Administrador, Operador de análisis, Supervisor y Auditor.</p>
                  </div>
                )}

                {activeSection === 10 && (
                  <div className="space-y-2">
                    <p><strong>Evolución de DEMO a IA REAL:</strong> Sustitución de DemoVisionAdapter por ApiVisionAdapter conectando a FastAPI + YOLO/SAM sin reconstruir los componentes de la interfaz.</p>
                  </div>
                )}

                {activeSection === 11 && (
                  <div className="space-y-2">
                    <p><strong>Criterios de Aceptación:</strong> Ejecución de escenarios sin errores, overlays alineados al redimensionar, persistencia local de análisis, alertas editables y exportación CSV con columnas normalizadas.</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

