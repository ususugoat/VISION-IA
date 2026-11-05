import { AnalysisRecord, Alert } from '../../core/domain/types';

export class CsvExportService {
  static exportAnalysesToCsv(analyses: AnalysisRecord[], filename = 'vision_ai_analisis.csv'): void {
    const headers = [
      'ID Analisis',
      'Tipo',
      'Fecha ISO',
      'Fecha Legible',
      'Usuario',
      'Rol',
      'Escenario',
      'Origen',
      'Modo',
      'Estado',
      'Detecciones',
      'Alertas',
      'Confianza Media (%)',
      'Duracion',
      'Motor',
      // Live-specific columns
      'Camara (Live)',
      'Fotogramas (Live)',
      'Objetos Rastreados (Live)',
      'Inicio Sesion (Live)',
      'Fin Sesion (Live)',
    ];

    const rows = analyses.map((a) => {
      const isLive = a.sourceType === 'live';
      return [
        `"${a.id}"`,
        `"${isLive ? 'Monitoreo En Vivo' : 'Análisis Estático'}"`,
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
        isLive ? `"${(a.durationMs / 1000).toFixed(1)} s"` : `"${a.durationMs} ms"`,
        `"${a.engineType.toUpperCase()}"`,
        isLive ? `"${a.liveSessionMeta?.cameraLabel ?? ''}"` : '""',
        isLive ? (a.liveSessionMeta?.totalFrames ?? '') : '',
        isLive ? (a.liveSessionMeta?.uniqueObjectsTracked ?? '') : '',
        isLive ? `"${a.liveSessionMeta?.startedAt ? new Date(a.liveSessionMeta.startedAt).toLocaleString('es-ES') : ''}"` : '""',
        isLive ? `"${a.liveSessionMeta?.endedAt ? new Date(a.liveSessionMeta.endedAt).toLocaleString('es-ES') : ''}"` : '""',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Exports a single live session with all its captured alerts/notifications.
   */
  static exportLiveSessionToCsv(record: AnalysisRecord, filename?: string): void {
    const fn = filename ?? `sesion_live_${record.id}.csv`;

    const metaHeaders = [
      'Campo',
      'Valor',
    ];
    const metaRows = [
      ['ID Sesion', record.id],
      ['Escenario', record.scenarioName ?? ''],
      ['Camara', record.liveSessionMeta?.cameraLabel ?? ''],
      ['Modelo IA', record.liveSessionMeta?.aiModel ?? ''],
      ['Inicio', record.liveSessionMeta?.startedAt ? new Date(record.liveSessionMeta.startedAt).toLocaleString('es-ES') : ''],
      ['Fin', record.liveSessionMeta?.endedAt ? new Date(record.liveSessionMeta.endedAt).toLocaleString('es-ES') : ''],
      ['Fotogramas', String(record.liveSessionMeta?.totalFrames ?? '')],
      ['Objetos Rastreados', String(record.liveSessionMeta?.uniqueObjectsTracked ?? '')],
      ['Alertas Totales', String(record.alertsCount)],
      ['Confianza Media', `${Math.round(record.averageConfidence * 100)}%`],
      ['Operador', record.createdBy],
      ['Rol', record.userRole],
    ].map(([k, v]) => [`"${k}"`, `"${v}"`]);

    const alertHeaders = [
      'ID Alerta',
      'Fotograma',
      'Tiempo (s)',
      'Timestamp',
      'Severidad',
      'Estado',
      'Regla',
      'Mensaje',
      'Evidencia',
      'Zona',
      'Objeto Disparador',
      'Confianza (%)',
    ];

    const alertRows = (record.liveAlerts ?? []).map((la) => [
      `"${la.id}"`,
      la.frameNumber,
      ((la.frameNumber ?? 0) / 12).toFixed(1),
      `"${la.timestamp}"`,
      `"${la.severity.toUpperCase()}"`,
      `"${la.status.toUpperCase()}"`,
      `"${la.ruleName}"`,
      `"${(la.message ?? '').replace(/"/g, '""')}"`,
      `"${(la.evidence ?? '').replace(/"/g, '""')}"`,
      `"${la.zoneName ?? ''}"`,
      `"${la.triggerEntityLabel ?? ''}"`,
      Math.round(la.confidence * 100),
    ]);

    const sections = [
      '=== METADATA DE SESION ===',
      [metaHeaders.join(','), ...metaRows.map((r) => r.join(','))].join('\r\n'),
      '',
      '=== ALERTAS Y NOTIFICACIONES EN VIVO ===',
      alertRows.length > 0
        ? [alertHeaders.join(','), ...alertRows.map((r) => r.join(','))].join('\r\n')
        : 'Sin alertas registradas.',
    ];

    const csvContent = sections.join('\r\n');
    this.downloadFile(csvContent, fn, 'text/csv;charset=utf-8;');
  }

  static exportAlertsToCsv(alerts: Alert[], filename = 'vision_ai_alertas.csv'): void {
    const headers = [
      'ID Alerta',
      'ID Analisis',
      'Escenario',
      'Regla Origen',
      'Severidad',
      'Estado',
      'Fecha Creacion',
      'Mensaje de Evidencia',
      'Revisado Por',
      'Fecha Revision',
      'Notas Auditoria',
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

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob(['\uFEFF' + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
