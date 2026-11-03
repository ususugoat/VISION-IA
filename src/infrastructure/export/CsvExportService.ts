import { AnalysisRecord, Alert } from '../../core/domain/types';

export class CsvExportService {
  static exportAnalysesToCsv(analyses: AnalysisRecord[], filename = "vision_ai_analisis.csv"): void {
    const headers = [
      "ID Analisis",
      "Fecha ISO",
      "Fecha Legible",
      "Usuario",
      "Rol",
      "Escenario",
      "Origen",
      "Modo",
      "Estado",
      "Detecciones",
      "Alertas",
      "Confianza Media (%)",
      "Duracion (ms)",
      "Motor",
    ];

    const rows = analyses.map((a) => [
      `"${a.id}"`,
      `"${a.createdAt}"`,
      `"${new Date(a.createdAt).toLocaleString('es-ES')}"`,
      `"${a.createdBy}"`,
      `"${a.userRole}"`,
      `"${a.scenarioName || 'Personalizado'}"`,
      `"${a.sourceName}"`,
      `"${a.mode}"`,
      `"${a.status}"`,
      a.detectionsCount,
      a.alertsCount,
      Math.round(a.averageConfidence * 100),
      a.durationMs,
      `"${a.engineType.toUpperCase()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    this.downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
  }

  static exportAlertsToCsv(alerts: Alert[], filename = "vision_ai_alertas.csv"): void {
    const headers = [
      "ID Alerta",
      "ID Analisis",
      "Escenario",
      "Regla Origen",
      "Severidad",
      "Estado",
      "Fecha Creacion",
      "Mensaje de Evidencia",
      "Revisado Por",
      "Fecha Revision",
      "Notas Auditoria",
    ];

    const rows = alerts.map((alt) => [
      `"${alt.id}"`,
      `"${alt.analysisId}"`,
      `"${alt.scenarioName || 'N/A'}"`,
      `"${alt.ruleName}"`,
      `"${alt.severity.toUpperCase()}"`,
      `"${alt.status.toUpperCase()}"`,
      `"${new Date(alt.createdAt).toLocaleString('es-ES')}"`,
      `"${(alt.message || '').replace(/"/g, '""')}"`,
      `"${alt.reviewedBy || 'Pendiente'}"`,
      `"${alt.reviewedAt ? new Date(alt.reviewedAt).toLocaleString('es-ES') : ''}"`,
      `"${(alt.reviewNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    this.downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob(["\uFEFF" + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

