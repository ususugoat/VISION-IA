import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../app/providers/AppContext';
import { AnalysisRecord, Scenario } from '../../../core/domain/types';
import { LIVE_SCENARIOS } from '../../../core/domain/liveScenarios';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { Modal } from '../../../shared/ui/Modal';
import {
  History,
  Search,
  FileDown,
  Eye,
  Trash2,
  Layers,
  Radio,
  ScanEye,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { CsvExportService } from '../../../infrastructure/export/CsvExportService';
import { cn } from '../../../shared/utils/cn';

// ── Types ─────────────────────────────────────────────────────────────────────
type SortField = 'createdAt' | 'detectionsCount' | 'averageConfidence' | 'alertsCount' | 'durationMs';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

const MODE_OPTIONS = [
  { value: 'all', label: 'Todos los modos' },
  { value: 'detection', label: '🔍 Detección' },
  { value: 'segmentation', label: '✂️ Segmentación' },
  { value: 'patterns', label: '🔗 Patrones' },
  { value: 'combined', label: '🔀 Combinado' },
  { value: 'live', label: '📡 En Vivo' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline" />;
  return sortDir === 'asc'
    ? <ArrowUp className="w-3 h-3 text-blue-500 ml-1 inline" />
    : <ArrowDown className="w-3 h-3 text-blue-500 ml-1 inline" />;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const HistoryPage: React.FC = () => {
  const { repository, showToast, refreshKPIs, permissions, searchHistoryUseCase } = useApp();

  // Raw data
  const [allRecords, setAllRecords] = useState<AnalysisRecord[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery]           = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<'all' | 'static' | 'live'>('all');
  const [scenarioFilter, setScenarioFilter]     = useState('all');
  const [modeFilter, setModeFilter]             = useState('all');
  const [minConf, setMinConf]                   = useState<number>(0);
  const [startDate, setStartDate]               = useState('');
  const [endDate, setEndDate]                   = useState('');

  // Sort & Pagination
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir]     = useState<SortDir>('desc');
  const [page, setPage]           = useState(1);

  // Detail modal
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);

  // Unified available scenarios (static + live)
  const availableScenarios = useMemo(() => {
    const staticItems = scenarios.map((s) => ({
      id: s.id,
      name: s.name,
      type: 'static' as const,
    }));
    const liveItems = LIVE_SCENARIOS.map((ls) => ({
      id: ls.id,
      name: ls.name,
      type: 'live' as const,
    }));
    return {
      staticItems,
      liveItems,
      all: [...liveItems, ...staticItems],
    };
  }, [scenarios]);

  // Handle switching between analysis types
  const handleSourceTypeChange = (newType: 'all' | 'static' | 'live') => {
    setSourceTypeFilter(newType);
    if (scenarioFilter !== 'all') {
      if (newType === 'live' && scenarioFilter.startsWith('scen_')) {
        const base = scenarioFilter.replace('scen_', '');
        const liveMatch = LIVE_SCENARIOS.find((ls) => ls.id.includes(base) || (base === 'retail' && ls.id === 'live_comercial'));
        setScenarioFilter(liveMatch ? liveMatch.id : 'all');
      } else if (newType === 'static' && scenarioFilter.startsWith('live_')) {
        const base = scenarioFilter.replace('live_', '');
        const staticMatch = scenarios.find((s) => s.id.includes(base) || (base === 'comercial' && s.id === 'scen_retail'));
        setScenarioFilter(staticMatch ? staticMatch.id : 'all');
      }
    }
  };

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    try {
      const list = await searchHistoryUseCase.execute({
        query: searchQuery || undefined,
        scenarioId: scenarioFilter !== 'all' ? scenarioFilter : undefined,
        mode: modeFilter !== 'all' ? modeFilter : undefined,
        minConfidence: minConf > 0 ? minConf : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sourceType: sourceTypeFilter,
      });
      setAllRecords(list);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { repository.getScenarios().then(setScenarios); }, [repository]);
  useEffect(() => { loadData(); }, [repository, searchQuery, scenarioFilter, modeFilter, minConf, sourceTypeFilter, startDate, endDate]);

  // ── Sort ───────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    return [...allRecords].sort((a, b) => {
      let va: number, vb: number;
      switch (sortField) {
        case 'createdAt':          va = new Date(a.createdAt).getTime(); vb = new Date(b.createdAt).getTime(); break;
        case 'detectionsCount':    va = a.detectionsCount;    vb = b.detectionsCount;    break;
        case 'averageConfidence':  va = a.averageConfidence;  vb = b.averageConfidence;  break;
        case 'alertsCount':        va = a.alertsCount;        vb = b.alertsCount;        break;
        case 'durationMs':         va = a.durationMs;         vb = b.durationMs;         break;
        default:                   va = 0;                    vb = 0;
      }
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [allRecords, sortField, sortDir]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  // ── Active filter chips ────────────────────────────────────────────────────
  const activeFilters: { label: string; clear: () => void }[] = [];
  if (searchQuery)       activeFilters.push({ label: `"${searchQuery}"`,                  clear: () => setSearchQuery('') });
  if (sourceTypeFilter !== 'all') activeFilters.push({ label: sourceTypeFilter === 'live' ? '📡 En Vivo' : '🖼 Estático', clear: () => setSourceTypeFilter('all') });
  if (scenarioFilter !== 'all') {
    const s = availableScenarios.all.find((x) => x.id === scenarioFilter);
    activeFilters.push({ label: `Escenario: ${s?.name ?? scenarioFilter}`, clear: () => setScenarioFilter('all') });
  }
  if (modeFilter !== 'all') activeFilters.push({ label: `Modo: ${modeFilter}`, clear: () => setModeFilter('all') });
  if (minConf > 0)       activeFilters.push({ label: `Conf ≥ ${Math.round(minConf * 100)}%`, clear: () => setMinConf(0) });
  if (startDate)         activeFilters.push({ label: `Desde: ${startDate}`,    clear: () => setStartDate('') });
  if (endDate)           activeFilters.push({ label: `Hasta: ${endDate}`,      clear: () => setEndDate('') });

  const clearAllFilters = () => {
    setSearchQuery(''); setSourceTypeFilter('all'); setScenarioFilter('all');
    setModeFilter('all'); setMinConf(0); setStartDate(''); setEndDate('');
  };

  // ── KPIs (from full unfiltered visible list) ───────────────────────────────
  const liveCount   = allRecords.filter((a) => a.sourceType === 'live').length;
  const staticCount = allRecords.filter((a) => (a.sourceType ?? 'static') === 'static').length;

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExportCsv = () => {
    CsvExportService.exportAnalysesToCsv(allRecords, `historial_vision_ai_${Date.now()}.csv`);
    showToast(`Se exportaron ${allRecords.length} registros a CSV`, 'success');
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Eliminar permanentemente el registro ${id}?`)) {
      await repository.deleteAnalysis(id);
      showToast('Registro eliminado', 'info');
      await loadData();
      await refreshKPIs();
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="blue">Persistencia &amp; Auditoría</Badge>
            <span className="text-xs text-slate-400">Análisis estáticos + Sesiones en vivo</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Historial de Análisis &amp; Exportación de Datos
          </h2>
          <p className="text-xs text-slate-500">
            Registro inmutable de inspecciones de imágenes y sesiones de monitoreo en tiempo real.
          </p>

          {/* KPIs strip */}
          <div className="flex items-center gap-4 mt-3 text-xs font-mono flex-wrap">
            <span className="flex items-center gap-1 text-slate-600">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-bold text-slate-900">{staticCount}</span> estáticos
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Radio className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-bold text-slate-900">{liveCount}</span> en vivo
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-900">{allRecords.length}</span> filtrados
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={loadData}
          >
            Actualizar
          </Button>
          <Button
            size="sm"
            variant="cyan"
            icon={<FileDown className="w-3.5 h-3.5" />}
            onClick={handleExportCsv}
            disabled={allRecords.length === 0}
          >
            Exportar CSV ({allRecords.length})
          </Button>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          Filtros
          {activeFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="ml-auto flex items-center gap-1 text-rose-500 hover:text-rose-700 font-medium normal-case tracking-normal"
            >
              <X className="w-3.5 h-3.5" /> Limpiar todo
            </button>
          )}
        </div>

        {/* Row 1: search + source type + scenario */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Text search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por ID, escenario, usuario, cámara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Source type */}
          <div>
            <select
              value={sourceTypeFilter}
              onChange={(e) => handleSourceTypeChange(e.target.value as 'all' | 'static' | 'live')}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="static">🖼 Análisis Estático</option>
              <option value="live">📡 Monitoreo En Vivo</option>
            </select>
          </div>

          {/* Scenario */}
          <div>
            <select
              value={scenarioFilter}
              onChange={(e) => setScenarioFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">
                {sourceTypeFilter === 'live'
                  ? 'Todos los Escenarios (En Vivo)'
                  : sourceTypeFilter === 'static'
                  ? 'Todos los Escenarios (Estáticos)'
                  : 'Todos los Escenarios'}
              </option>
              {sourceTypeFilter === 'all' ? (
                <>
                  <optgroup label="📡 Monitoreo En Vivo">
                    {availableScenarios.liveItems.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🖼 Análisis Estático">
                    {availableScenarios.staticItems.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                </>
              ) : sourceTypeFilter === 'live' ? (
                availableScenarios.liveItems.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
              ) : (
                availableScenarios.staticItems.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Row 2: mode + confidence + date range */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Mode */}
          <div>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MODE_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Min confidence */}
          <div>
            <select
              value={minConf}
              onChange={(e) => setMinConf(parseFloat(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Cualquier Confianza</option>
              <option value={0.70}>Confianza ≥ 70%</option>
              <option value={0.85}>Confianza ≥ 85%</option>
              <option value={0.92}>Confianza ≥ 92%</option>
            </select>
          </div>

          {/* Start date */}
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Desde (fecha inicio)"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End date */}
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Hasta (fecha fin)"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {activeFilters.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-medium border border-blue-200"
              >
                {f.label}
                <button onClick={f.clear} className="hover:text-rose-600 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Análisis / Origen</th>
                <th className="py-3 px-4">Tipo</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 select-none whitespace-nowrap"
                  onClick={() => handleSort('createdAt')}
                >
                  Fecha &amp; Usuario <SortIcon field="createdAt" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className="py-3 px-4">Modo</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 select-none whitespace-nowrap"
                  onClick={() => handleSort('detectionsCount')}
                >
                  Detecciones <SortIcon field="detectionsCount" sortField={sortField} sortDir={sortDir} />
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 select-none whitespace-nowrap"
                  onClick={() => handleSort('alertsCount')}
                >
                  Alertas <SortIcon field="alertsCount" sortField={sortField} sortDir={sortDir} />
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 select-none whitespace-nowrap"
                  onClick={() => handleSort('averageConfidence')}
                >
                  Confianza <SortIcon field="averageConfidence" sortField={sortField} sortDir={sortDir} />
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 select-none whitespace-nowrap"
                  onClick={() => handleSort('durationMs')}
                >
                  Duración <SortIcon field="durationMs" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className="py-3 px-4">Motor</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Cargando registros...
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <ScanEye className="w-8 h-8" />
                      <p className="text-sm font-medium">Sin resultados</p>
                      <p className="text-xs">No hay registros que coincidan con los filtros aplicados.</p>
                      {activeFilters.length > 0 && (
                        <button
                          onClick={clearAllFilters}
                          className="mt-1 text-xs text-blue-600 underline hover:text-blue-800"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item) => {
                  const isLive = item.sourceType === 'live';
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedRecord(item)}
                      className={cn(
                        'cursor-pointer transition-colors',
                        isLive ? 'hover:bg-rose-50/40 bg-rose-50/10' : 'hover:bg-blue-50/30'
                      )}
                    >
                      {/* Origen */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {isLive ? (
                            <div className="w-10 h-7 rounded border border-rose-200 bg-rose-50 flex items-center justify-center shrink-0">
                              <Radio className="w-4 h-4 text-rose-500" />
                            </div>
                          ) : item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.sourceName}
                              className="w-10 h-7 rounded object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-7 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                              <ScanEye className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {item.scenarioName || item.sourceName}
                            </p>
                            {isLive && item.liveSessionMeta && (
                              <p className="text-[10px] text-rose-600 font-mono">
                                {item.liveSessionMeta.cameraLabel} · {item.liveSessionMeta.totalFrames} frames
                              </p>
                            )}
                            <p className="text-[10px] font-mono text-slate-400">{item.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            En Vivo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <ScanEye className="w-3 h-3" />
                            Estático
                          </span>
                        )}
                      </td>

                      {/* Fecha */}
                      <td className="py-3 px-4">
                        <p className="text-slate-800">{new Date(item.createdAt).toLocaleDateString('es-ES')}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] text-slate-400">{item.createdBy}</p>
                      </td>

                      {/* Modo */}
                      <td className="py-3 px-4">
                        <Badge variant={isLive ? 'red' : 'cyan'} className="text-[10px]">
                          {item.mode}
                        </Badge>
                      </td>

                      {/* Detecciones */}
                      <td className="py-3 px-4 font-semibold text-slate-700">{item.detectionsCount}</td>

                      {/* Alertas */}
                      <td className="py-3 px-4">
                        {item.alertsCount > 0 ? (
                          <Badge variant="red" dot>{item.alertsCount}</Badge>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>

                      {/* Confianza */}
                      <td className="py-3 px-4">
                        <span className={cn(
                          'font-mono font-bold',
                          item.averageConfidence >= 0.85 ? 'text-emerald-600' :
                          item.averageConfidence >= 0.70 ? 'text-amber-500' : 'text-rose-500'
                        )}>
                          {Math.round(item.averageConfidence * 100)}%
                        </span>
                      </td>

                      {/* Duración */}
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {isLive ? `${(item.durationMs / 1000).toFixed(1)} s` : `${item.durationMs} ms`}
                      </td>

                      {/* Motor */}
                      <td className="py-3 px-4">
                        <Badge variant="purple" className="text-[10px]">
                          {item.engineType.toUpperCase()}
                        </Badge>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedRecord(item); }}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {permissions.canDeleteAnalysis && (
                            <button
                              onClick={(e) => handleDelete(item.id, e)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                              title="Eliminar (Admin)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && allRecords.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Mostrando{' '}
              <strong className="text-slate-800">{(page - 1) * PAGE_SIZE + 1}</strong>
              {' '}–{' '}
              <strong className="text-slate-800">{Math.min(page * PAGE_SIZE, sorted.length)}</strong>
              {' '}de{' '}
              <strong className="text-slate-800">{sorted.length}</strong> registros
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-1">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={cn(
                        'w-7 h-7 rounded font-medium',
                        p === page
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-slate-100 text-slate-600'
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Detail Modal ── */}
      {selectedRecord && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRecord(null)}
          title={`Detalle • ${selectedRecord.id}`}
          subtitle={`${selectedRecord.scenarioName || selectedRecord.sourceName} · ${new Date(selectedRecord.createdAt).toLocaleString('es-ES')}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {selectedRecord.sourceType === 'live' ? (
              /* ── LIVE SESSION DETAIL ─────────────────────────── */
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Radio className="w-4 h-4 text-rose-500" />
                    <span className="font-bold text-rose-800 text-sm">Sesión de Monitoreo En Vivo</span>
                    <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">COMPLETADA</span>
                  </div>
                  {selectedRecord.liveSessionMeta && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {[
                        ['Cámara', selectedRecord.liveSessionMeta.cameraLabel],
                        ['Fotogramas', String(selectedRecord.liveSessionMeta.totalFrames)],
                        ['Duración', `${(selectedRecord.durationMs / 1000).toFixed(1)} s`],
                        ['Objetos rastreados', String(selectedRecord.liveSessionMeta.uniqueObjectsTracked)],
                        ['Confianza media', `${Math.round(selectedRecord.averageConfidence * 100)}%`],
                        ['Modelo IA', selectedRecord.liveSessionMeta.aiModel],
                        ['Inicio', new Date(selectedRecord.liveSessionMeta.startedAt).toLocaleString('es-ES')],
                        ...(selectedRecord.liveSessionMeta.endedAt
                          ? [['Fin', new Date(selectedRecord.liveSessionMeta.endedAt).toLocaleString('es-ES')]]
                          : []),
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between col-span-2 border-b border-rose-100 pb-1 last:border-0">
                          <span className="text-slate-500">{k}:</span>
                          <span className="font-mono font-semibold text-slate-800">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Live alerts */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-slate-800">
                      Alertas y Notificaciones ({selectedRecord.liveAlerts?.length ?? 0})
                    </span>
                  </div>
                  {!selectedRecord.liveAlerts || selectedRecord.liveAlerts.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sin alertas registradas en esta sesión.</span>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-0.5">
                      {selectedRecord.liveAlerts.map((la) => {
                        const isOk     = la.severity === 'low';
                        const isDefect = la.severity === 'critical' || la.severity === 'high';
                        return (
                          <div
                            key={la.id}
                            className={cn(
                              'rounded-lg border p-2.5 space-y-1',
                              isOk ? 'bg-emerald-50/80 border-emerald-200' :
                              isDefect ? 'bg-rose-50/80 border-rose-200' :
                              'bg-amber-50/80 border-amber-200'
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={cn(
                                  'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase',
                                  isOk ? 'bg-emerald-100 text-emerald-700' :
                                  isDefect ? 'bg-rose-100 text-rose-700' :
                                  'bg-amber-100 text-amber-700'
                                )}>
                                  {la.severity}
                                </span>
                                <span className="font-semibold text-slate-800">{la.ruleName}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                t={((la.frameNumber ?? 0) / 12).toFixed(1)}s
                              </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed">{la.message}</p>
                            {la.evidence && <p className="text-[10px] text-slate-400 italic">{la.evidence}</p>}
                            {la.triggerEntityLabel && (
                              <p className="text-[10px] font-mono text-slate-500">
                                Objeto: {la.triggerEntityLabel}
                                {la.zoneName ? ` · Zona: ${la.zoneName}` : ''}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      CsvExportService.exportLiveSessionToCsv(selectedRecord, `sesion_${selectedRecord.id}.csv`);
                      showToast('Sesión exportada a CSV', 'success');
                    }}
                    className="flex items-center gap-1.5 text-xs text-cyan-700 hover:text-cyan-900 font-medium underline"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Exportar esta sesión a CSV
                  </button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedRecord(null)}>Cerrar</Button>
                </div>
              </div>
            ) : (
              /* ── STATIC ANALYSIS DETAIL ──────────────────────── */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center">
                    {selectedRecord.imageUrl ? (
                      <img src={selectedRecord.imageUrl} alt={selectedRecord.sourceName} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-slate-500 flex flex-col items-center gap-2">
                        <ScanEye className="w-8 h-8" />
                        <span className="text-[11px] font-mono">Sin imagen disponible</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                      {[
                        ['Operador', `${selectedRecord.createdBy} (${selectedRecord.userRole})`],
                        ['Confianza Promedio', `${Math.round(selectedRecord.averageConfidence * 100)}%`],
                        ['Tiempo de Inferencia', `${selectedRecord.durationMs} ms`],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-slate-500">{k}:</span>
                          <span className="font-semibold text-slate-800">{v}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Motor:</span>
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
                  <Button size="sm" variant="outline" onClick={() => setSelectedRecord(null)}>Cerrar</Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
