import React, { useState, useEffect } from 'react';
import { useApp } from '../../../app/providers/AppContext';
import { Alert, AlertStatus, AlertSeverity } from '../../../core/domain/types';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { Modal } from '../../../shared/ui/Modal';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  FileDown,
  UserCheck,
  Search,
  MessageSquare,
} from 'lucide-react';
import { CsvExportService } from '../../../infrastructure/export/CsvExportService';

export const AlertsPage: React.FC = () => {
  const { repository, currentUser, refreshKPIs, showToast } = useApp();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Review modal state
  const [reviewStatus, setReviewStatus] = useState<AlertStatus>('revisada');
  const [reviewNotes, setReviewNotes] = useState<string>('');

  const loadAlerts = async () => {
    const list = await repository.getAllAlerts(statusFilter);
    setAlerts(list);
  };

  useEffect(() => {
    loadAlerts();
  }, [repository, statusFilter]);

  const handleOpenReview = (alert: Alert) => {
    setSelectedAlert(alert);
    setReviewStatus(alert.status === 'nueva' ? 'revisada' : alert.status);
    setReviewNotes(alert.reviewNotes || '');
  };

  const handleSaveReview = async () => {
    if (!selectedAlert) return;
    try {
      const updated = await repository.updateAlertStatus(
        selectedAlert.id,
        reviewStatus,
        currentUser.name,
        reviewNotes
      );
      showToast(`Alerta ${updated.id} actualizada a "${reviewStatus.toUpperCase()}"`, "success");
      setSelectedAlert(null);
      await loadAlerts();
      await refreshKPIs();
    } catch (err: any) {
      showToast(err.message || "Error al actualizar alerta", "error");
    }
  };

  const handleExportCsv = () => {
    CsvExportService.exportAlertsToCsv(alerts, `alertas_vision_ai_${Date.now()}.csv`);
    showToast("Exportación de alertas en CSV completada", "success");
  };

  const severityBadgeMap: Record<AlertSeverity, 'red' | 'amber' | 'blue' | 'slate'> = {
    critical: 'red',
    high: 'red',
    medium: 'amber',
    low: 'blue',
  };

  const statusBadgeMap: Record<AlertStatus, { label: string; variant: 'red' | 'amber' | 'green' }> = {
    nueva: { label: "NUEVA", variant: "red" },
    revisada: { label: "REVISADA", variant: "amber" },
    cerrada: { label: "CERRADA", variant: "green" },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="red" dot>Módulo Operacional</Badge>
            <span className="text-xs text-slate-400">Auditoría & Trazabilidad</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Gestión y Trazabilidad de Alertas de Visión
          </h2>
          <p className="text-xs text-slate-500">
            Incidentes y transgresiones de reglas que requieren validación y cierre por supervisión.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<FileDown className="w-3.5 h-3.5" />}
            onClick={handleExportCsv}
          >
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          <span className="font-semibold text-slate-600 mr-2">Estado:</span>
          {(['all', 'nueva', 'revisada', 'cerrada'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === 'all' ? 'Todas' : st.toUpperCase()}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">
          Mostrando <strong>{alerts.length}</strong> alertas registradas
        </span>
      </div>

      {/* Alerts Table / List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <Card className="text-center py-12">
            <BellRing className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">Sin alertas en este filtro</h4>
            <p className="text-xs text-slate-400 mt-1">
              No se han encontrado registros con el criterio seleccionado.
            </p>
          </Card>
        ) : (
          alerts.map((alt) => (
            <div
              key={alt.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={severityBadgeMap[alt.severity]}>
                    {alt.severity.toUpperCase()}
                  </Badge>
                  <Badge variant={statusBadgeMap[alt.status].variant} dot>
                    {statusBadgeMap[alt.status].label}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">ID: {alt.id}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">{alt.scenarioName || 'General'}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-400">
                    {new Date(alt.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{alt.ruleName}</h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {alt.message}
                </p>

                {alt.reviewedBy && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Revisado por <strong>{alt.reviewedBy}</strong></span>
                    {alt.reviewedAt && (
                      <span>({new Date(alt.reviewedAt).toLocaleDateString('es-ES')})</span>
                    )}
                    {alt.reviewNotes && (
                      <span className="italic text-slate-600">"– {alt.reviewNotes}"</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Button
                  size="sm"
                  variant={alt.status === 'nueva' ? 'primary' : 'outline'}
                  onClick={() => handleOpenReview(alt)}
                  className="text-xs"
                >
                  {alt.status === 'nueva' ? "Revisar Incidente" : "Editar Auditoría"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedAlert && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAlert(null)}
          title="Auditoría & Resolución de Alerta"
          subtitle={`Incidente ${selectedAlert.id} - ${selectedAlert.ruleName}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Alert context summary */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Evidencia del Modelo:</span>
                <Badge variant={severityBadgeMap[selectedAlert.severity]}>
                  {selectedAlert.severity.toUpperCase()}
                </Badge>
              </div>
              <p className="text-slate-600 mt-1">{selectedAlert.message}</p>
            </div>

            {/* Change Status */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1.5">
                Actualizar Estado Operacional
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['nueva', 'revisada', 'cerrada'] as AlertStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setReviewStatus(st)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all ${
                      reviewStatus === st
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Review Notes */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1.5">
                Notas de Auditoría / Acción Correctiva Tomada
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Describe la validación visual y acciones disciplinarias o técnicas adoptadas..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Auditor Info */}
            <div className="p-2.5 rounded bg-blue-50/60 border border-blue-100 flex items-center justify-between text-[11px] text-blue-900">
              <span>Auditor responsable: <strong>{currentUser.name}</strong></span>
              <Badge variant="blue">{currentUser.role.toUpperCase()}</Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setSelectedAlert(null)}>
                Cancelar
              </Button>
              <Button size="sm" variant="primary" onClick={handleSaveReview}>
                Guardar Auditoría
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

