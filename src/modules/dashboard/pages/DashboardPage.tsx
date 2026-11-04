import React, { useEffect, useState } from 'react';
import { useApp } from '../../../app/providers/AppContext';
import {
  ScanEye,
  Cctv,
  Crosshair,
  BellRing,
  Gauge,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { kpis, setCurrentPage, refreshKPIs } = useApp();

  useEffect(() => {
    refreshKPIs();
  }, []);

  if (!kpis) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Cargando indicadores ejecutivos...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Análisis Ejecutados",
      value: kpis.totalAnalyses,
      suffix: "inspecciones",
      subtext: "Conectado a persistencia local",
      icon: ScanEye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      title: "Objetos Detectados",
      value: kpis.totalDetections,
      suffix: "instancias",
      subtext: "Cajas delimitadoras validadas",
      icon: Crosshair,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
    },
    {
      title: "Confianza Promedio",
      value: `${Math.round(kpis.averageConfidence * 100)}%`,
      suffix: "score",
      subtext: "Umbral operativo aceptado",
      icon: Gauge,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      title: "Tiempo de Proceso",
      value: `${kpis.averageProcessingTimeMs}`,
      suffix: "ms / img",
      subtext: "Simulación de inferencia local",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
    },
    {
      title: "Alertas Activas",
      value: kpis.activeAlerts,
      suffix: `de ${kpis.totalAlerts} totales`,
      subtext: "Requieren revisión humana",
      icon: BellRing,
      color: kpis.activeAlerts > 0 ? "text-rose-600" : "text-emerald-600",
      bgColor: kpis.activeAlerts > 0 ? "bg-rose-50" : "bg-emerald-50",
      borderColor: kpis.activeAlerts > 0 ? "border-rose-100" : "border-emerald-100",
    },
  ];

  const severityBadgeMap: Record<string, 'red' | 'amber' | 'blue' | 'slate'> = {
    critical: 'red',
    high: 'red',
    medium: 'amber',
    low: 'blue',
  };

  const statusBadgeMap: Record<string, { label: string; variant: 'red' | 'amber' | 'green' }> = {
    nueva: { label: "NUEVA", variant: "red" },
    revisada: { label: "REVISADA", variant: "amber" },
    cerrada: { label: "CERRADA", variant: "green" },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Sistema Demostrable v1.0
            </span>
            <span className="text-xs text-slate-400">• Motor Simulado Determinista</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Monitoreo en Tiempo Real de Visión Computacional
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Solución empresarial para detección de objetos, máscaras de segmentación y reglas de patrones. Indicadores conectados al registro histórico de auditoría.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="cyan"
            size="md"
            icon={<ScanEye className="w-4 h-4" />}
            onClick={() => setCurrentPage('analysis')}
            className="shadow-lg shadow-cyan-600/30"
          >
            Nuevo Análisis Visual
          </Button>
        </div>
      </div>


      {/* Live Monitor Quick Access */}
      <div className="bg-gradient-to-r from-zinc-900 to-slate-900 rounded-xl border border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cctv className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">Monitoreo en Vivo</span>
          <span className="ml-auto text-[10px] font-mono text-cyan-500 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">MODO DEMO</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { code: "PC", label: "Oficina Tecnologica", sub: "Bebidas, espacio personal, armario de red", border: "border-blue-800/40 hover:border-blue-600/60" },
            { code: "DC", label: "Data Center", sub: "Credenciales, racks, pasillo caliente", border: "border-violet-800/40 hover:border-violet-600/60" },
            { code: "QA", label: "Laboratorio QA", sub: "Guantes ESD, contaminantes, almacen", border: "border-emerald-800/40 hover:border-emerald-600/60" },
            { code: "MT", label: "Sala de Reuniones", sub: "Aforo, camara, equipo AV", border: "border-amber-800/40 hover:border-amber-600/60" },
          ].map(({ code, label, sub, border }) => (
            <button
              key={label}
              onClick={() => setCurrentPage("live_monitor")}
              className={`text-left p-3 rounded-lg border bg-zinc-900/60 ${border} transition-all group`}
            >
              <div className="text-xs font-bold font-mono text-zinc-500 mb-1">[{code}]</div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors leading-tight mb-1">{label}</div>
              <div className="text-[10px] text-slate-500 leading-tight">{sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="relative overflow-hidden border border-slate-200/80 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-lg ${kpi.bgColor} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {kpi.value}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {kpi.suffix}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                {kpi.subtext}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Actividad de Infecciones & Tendencia
              </CardTitle>
              <CardDescription>
                Volumen diario de análisis computacionales y alertas originadas
              </CardDescription>
            </div>
            <Badge variant="blue" dot>En Vivo</Badge>
          </CardHeader>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpis.activityTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="#3b82f6" stop-opacity={0.3} />
                    <stop offset="95%" stop-color="#3b82f6" stop-opacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="#ef4444" stop-opacity={0.3} />
                    <stop offset="95%" stop-color="#ef4444" stop-opacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="analyses"
                  name="Análisis"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAnalyses)"
                />
                <Area
                  type="monotone"
                  dataKey="alerts"
                  name="Alertas"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAlerts)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Class Distribution Chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Distribución de Clases</CardTitle>
              <CardDescription>Frecuencia de etiquetas identificadas</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full flex items-center justify-center">
            {kpis.classDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kpis.classDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {kpis.classDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">Sin datos de clases aún.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Two columns: Recent Alerts & Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Alertas Operacionales Recientes
                </CardTitle>
                <CardDescription>Incidentes y patrones de riesgo detectados</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage('alerts')}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Ver todas <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {kpis.recentAlerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No hay alertas activas en el sistema.
              </div>
            ) : (
              kpis.recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={severityBadgeMap[alert.severity] || 'slate'}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge variant={statusBadgeMap[alert.status]?.variant || 'slate'} dot>
                        {statusBadgeMap[alert.status]?.label || alert.status}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">{alert.ruleName}</p>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{alert.message}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage('alerts')}
                    className="shrink-0 text-xs py-1 px-2.5"
                  >
                    Auditar
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Analyses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Últimos Análisis Procesados
                </CardTitle>
                <CardDescription>Registros de inspección con trazabilidad completa</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage('history')}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Ver historial <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <div className="space-y-2.5">
            {kpis.recentAnalyses.map((item) => (
              <div
                key={item.id}
                onClick={() => setCurrentPage('analysis')}
                className="p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 cursor-pointer flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img src={item.imageUrl} alt={item.sourceName} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {item.scenarioName || item.sourceName}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Por: {item.createdBy}</span>
                      <span>•</span>
                      <span>{item.durationMs}ms</span>
                      <span>•</span>
                      <span className="font-medium text-emerald-600">
                        {Math.round(item.averageConfidence * 100)}% conf
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="cyan">{item.mode}</Badge>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

