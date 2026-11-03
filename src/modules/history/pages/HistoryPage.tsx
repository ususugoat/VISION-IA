import React, { useState, useEffect } from 'react';
import { useApp } from '../../../app/providers/AppContext';
import { AnalysisRecord, Scenario } from '../../../core/domain/types';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { Modal } from '../../../shared/ui/Modal';
import {
  History,
  Search,
  Filter,
  FileDown,
  Eye,
  Trash2,
  Calendar,
  Layers,
  Crosshair,
  Gauge,
  Clock,
  Cpu,
} from 'lucide-react';
import { CsvExportService } from '../../../infrastructure/export/CsvExportService';

export const HistoryPage: React.FC = () => {
  const { repository, showToast, refreshKPIs } = useApp();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [scenarioFilter, setScenarioFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [minConf, setMinConf] = useState<number>(0);

  // Detail Modal
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);

  const loadData = async () => {
    const list = await repository.getAllAnalyses({
      query: searchQuery || undefined,
      scenarioId: scenarioFilter,
      mode: modeFilter,
      minConfidence: minConf > 0 ? minConf : undefined,
    });
    setAnalyses(list);
  };

  useEffect(() => {
    repository.getScenarios().then(setScenarios);
  }, [repository]);

  useEffect(() => {
    loadData();
  }, [repository, searchQuery, scenarioFilter, modeFilter, minConf]);

  const handleExportCsv = () => {
    CsvExportService.exportAnalysesToCsv(analyses, `historial_vision_ai_${Date.now()}.csv`);
    showToast(`Se exportaron ${analyses.length} registros a CSV`, "success");
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Eliminar permanentemente el registro ${id}?`)) {
      await repository.deleteAnalysis(id);
      showToast("Registro eliminado", "info");
      await loadData();
      await refreshKPIs();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="blue">Persistencia & Auditoría</Badge>
            <span className="text-xs text-slate-400">Sección 6 & 14 del Documento</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Historial de Análisis & Exportación de Datos
          </h2>
          <p className="text-xs text-slate-500">
            Registro inmutable de corridas de visión computacional, clasificaciones y métricas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="cyan"
            icon={<FileDown className="w-3.5 h-3.5" />}
            onClick={handleExportCsv}
            disabled={analyses.length === 0}
          >
            Exportar CSV ({analyses.length})
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Query search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por ID, fuente, usuario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Scenario filter */}
          <div>
            <select
              value={scenarioFilter}
              onChange={(e) => setScenarioFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los Escenarios</option>
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Mode filter */}
          <div>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los Modos</option>
              <option value="combined">Combinado</option>
              <option value="detection">Detección (Cajas)</option>
              <option value="segmentation">Segmentación (Máscaras)</option>
              <option value="patterns">Patrones</option>
            </select>
          </div>

          {/* Min Confidence */}
          <div>
            <select
              value={minConf}
              onChange={(e) => setMinConf(parseFloat(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Cualquier Confianza</option>
              <option value={0.70}>Confianza ≥ 70%</option>
              <option value={0.85}>Confianza ≥ 85%</option>
              <option value={0.92}>Confianza ≥ 92% (Alta Calidad)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analyses Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Análisis / Origen</th>
                <th className="py-3 px-4">Fecha & Usuario</th>
                <th className="py-3 px-4">Modo</th>
                <th className="py-3 px-4">Detecciones</th>
                <th className="py-3 px-4">Alertas</th>
                <th className="py-3 px-4">Confianza</th>
                <th className="py-3 px-4">Latencia</th>
                <th className="py-3 px-4">Motor</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analyses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No se encontraron análisis que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                analyses.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedRecord(item)}
                    className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.sourceName}
                          className="w-10 h-7 rounded object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{item.scenarioName || item.sourceName}</p>
                          <p className="text-[10px] font-mono text-slate-400">{item.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-slate-800">{new Date(item.createdAt).toLocaleDateString('es-ES')}</p>
                      <p className="text-[10px] text-slate-400">{item.createdBy}</p>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="cyan">{item.mode}</Badge>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {item.detectionsCount}
                    </td>

                    <td className="py-3 px-4">
                      {item.alertsCount > 0 ? (
                        <Badge variant="red" dot>{item.alertsCount}</Badge>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                      {Math.round(item.averageConfidence * 100)}%
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {item.durationMs}ms
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="purple" className="text-[10px]">
                        {item.engineType.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(item);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRecord(null)}
          title={`Detalle de Inspección • ${selectedRecord.id}`}
          subtitle={`${selectedRecord.scenarioName || selectedRecord.sourceName} - ${new Date(selectedRecord.createdAt).toLocaleString('es-ES')}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center">
                <img
                  src={selectedRecord.imageUrl}
                  alt={selectedRecord.sourceName}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Operador:</span>
                    <span className="font-semibold text-slate-800">{selectedRecord.createdBy} ({selectedRecord.userRole})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Confianza Promedio:</span>
                    <span className="font-bold text-emerald-600 font-mono">{Math.round(selectedRecord.averageConfidence * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tiempo de Inferencia:</span>
                    <span className="font-mono text-slate-700">{selectedRecord.durationMs} ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Motor Ejecutado:</span>
                    <Badge variant="purple">{selectedRecord.engineType.toUpperCase()}</Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-700">Detecciones registradas:</span>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {selectedRecord.result?.detections?.map((d) => (
                      <div key={d.id} className="p-1.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-800">{d.label}</span>
                        <span className="font-mono text-blue-600 font-bold">{Math.round(d.confidence * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setSelectedRecord(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

