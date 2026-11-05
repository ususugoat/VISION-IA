import { AnalysisRepository, AnalysisFilter } from '../../core/ports/AnalysisRepository';
import {
  AnalysisRecord,
  Alert,
  DashboardKPIs,
  AlertStatus,
  AlertSeverity,
  Scenario,
  VisionClass,
  BusinessRule,
} from '../../core/domain/types';
import {
  INITIAL_ANALYSES_SEED,
  DEFAULT_SCENARIOS,
  DEFAULT_CLASSES,
  DEFAULT_RULES,
} from '../../core/domain/seedData';

const STORAGE_KEYS = {
  ANALYSES: "vision_ai_analyses_v1",
  CLASSES: "vision_ai_classes_v1",
  RULES: "vision_ai_rules_v1",
  SCENARIOS: "vision_ai_scenarios_v1",
};

export class LocalAnalysisRepository implements AnalysisRepository {
  private getStorageItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("LocalAnalysisRepository: error saving to localStorage", e);
    }
  }

  async saveAnalysis(record: AnalysisRecord): Promise<void> {
    const list = this.getStorageItem<AnalysisRecord[]>(STORAGE_KEYS.ANALYSES, INITIAL_ANALYSES_SEED);
    const existingIndex = list.findIndex((a) => a.id === record.id);
    if (existingIndex >= 0) {
      list[existingIndex] = record;
    } else {
      list.unshift(record);
    }
    this.setStorageItem(STORAGE_KEYS.ANALYSES, list);
  }

  async getAnalysisById(id: string): Promise<AnalysisRecord | null> {
    const list = this.getStorageItem<AnalysisRecord[]>(STORAGE_KEYS.ANALYSES, INITIAL_ANALYSES_SEED);
    return list.find((a) => a.id === id) || null;
  }

  async getAllAnalyses(filter?: AnalysisFilter): Promise<AnalysisRecord[]> {
    let list = this.getStorageItem<AnalysisRecord[]>(STORAGE_KEYS.ANALYSES, INITIAL_ANALYSES_SEED);

    // Ensure live seed records are present if localStorage only had old static records
    const hasLive = list.some((a) => a.sourceType === 'live');
    if (!hasLive) {
      const liveSeeds = INITIAL_ANALYSES_SEED.filter((a) => a.sourceType === 'live');
      if (liveSeeds.length > 0) {
        list = [...list, ...liveSeeds];
        this.setStorageItem(STORAGE_KEYS.ANALYSES, list);
      }
    }

    if (filter) {
      if (filter.sourceType && filter.sourceType !== 'all') {
        list = list.filter((a) => (a.sourceType ?? 'static') === filter.sourceType);
      }
      if (filter.query) {
        const q = filter.query.toLowerCase();
        list = list.filter(
          (a) =>
            a.id.toLowerCase().includes(q) ||
            a.sourceName.toLowerCase().includes(q) ||
            (a.scenarioName && a.scenarioName.toLowerCase().includes(q)) ||
            a.createdBy.toLowerCase().includes(q) ||
            (a.liveSessionMeta?.cameraLabel && a.liveSessionMeta.cameraLabel.toLowerCase().includes(q)) ||
            (a.liveSessionMeta?.aiModel && a.liveSessionMeta.aiModel.toLowerCase().includes(q)) ||
            (a.liveAlerts && a.liveAlerts.some((la) => la.ruleName.toLowerCase().includes(q) || la.message.toLowerCase().includes(q) || (la.triggerEntityLabel && la.triggerEntityLabel.toLowerCase().includes(q))))
        );
      }
      if (filter.scenarioId && filter.scenarioId !== "all") {
        const targetId = filter.scenarioId;
        list = list.filter((a) => {
          if (a.scenarioId === targetId) return true;
          const clean = (id?: string) => (id || '').replace(/^(scen_|live_)/, '');
          const norm = (s: string) => (s === 'retail' || s === 'comercial' ? 'retail_common' : s);
          return norm(clean(a.scenarioId)) === norm(clean(targetId));
        });
      }
      if (filter.mode && filter.mode !== "all") {
        if (filter.mode === 'live') {
          list = list.filter((a) => a.sourceType === 'live' || a.mode === 'live');
        } else {
          list = list.filter((a) => a.mode === filter.mode);
        }
      }
      if (filter.status && filter.status !== "all") {
        list = list.filter((a) => a.status === filter.status);
      }
      if (filter.minConfidence !== undefined) {
        list = list.filter((a) => a.averageConfidence >= filter.minConfidence!);
      }
      if (filter.startDate) {
        const from = new Date(filter.startDate).getTime();
        list = list.filter((a) => new Date(a.createdAt).getTime() >= from);
      }
      if (filter.endDate) {
        const to = new Date(filter.endDate).getTime() + 86400000 - 1;
        list = list.filter((a) => new Date(a.createdAt).getTime() <= to);
      }
    }

    return list;
  }

  async deleteAnalysis(id: string): Promise<void> {
    const list = this.getStorageItem<AnalysisRecord[]>(STORAGE_KEYS.ANALYSES, INITIAL_ANALYSES_SEED);
    const filtered = list.filter((a) => a.id !== id);
    this.setStorageItem(STORAGE_KEYS.ANALYSES, filtered);
  }

  async clearAllAnalyses(): Promise<void> {
    this.setStorageItem(STORAGE_KEYS.ANALYSES, INITIAL_ANALYSES_SEED);
  }

  async getAllAlerts(statusFilter?: AlertStatus | 'all'): Promise<Alert[]> {
    const analyses = this.getStorageItem<AnalysisRecord[]>(STORAGE_KEYS.ANALYSES, INITIAL_ANALYSES_SEED);
    const alerts: Alert[] = [];

    for (const ana of analyses) {
      if (ana.result && ana.result.alerts && ana.result.alerts.length > 0) {
        for (const alt of ana.result.alerts) {
          if (!alt.scenarioName && ana.scenarioName) {
            alt.scenarioName = ana.scenarioName;
          }
          alerts.push(alt);
        }
      } else if (ana.liveAlerts) {
        for (const la of ana.liveAlerts) {
          alerts.push({
            id: la.id,
            analysisId: ana.id,
            ruleId: la.ruleId,
            ruleName: la.ruleName,
            severity: (la.severity as AlertSeverity) || 'medium',
            message: la.message,
            status: (la.status === 'resolved' ? 'cerrada' : la.status === 'acknowledged' ? 'revisada' : 'nueva') as AlertStatus,
            createdAt: ana.createdAt,
            scenarioName: ana.scenarioName,
          });
        }
      }
    }

    // Sort newest first
    alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (statusFilter && statusFilter !== 'all') {
      return alerts.filter((alt) => alt.status === statusFilter);
    }
    return alerts;
  }

  async updateAlertStatus(alertId: string, status: AlertStatus, reviewerName: string, notes?: string): Promise<Alert> {
    const analyses = this.getStorageItem<AnalysisRecord[]>(STORAGE_KEYS.ANALYSES, INITIAL_ANALYSES_SEED);
    let foundAlert: Alert | null = null;

    for (const ana of analyses) {
      if (ana.result && ana.result.alerts && ana.result.alerts.length > 0) {
        const alt = ana.result.alerts.find((a) => a.id === alertId);
        if (alt) {
          alt.status = status;
          alt.reviewedBy = reviewerName;
          alt.reviewNotes = notes || alt.reviewNotes;
          alt.reviewedAt = new Date().toISOString();
          foundAlert = alt;
          break;
        }
      }
    }

    if (!foundAlert) {
      throw new Error(`Alerta con ID ${alertId} no encontrada`);
    }

    this.setStorageItem(STORAGE_KEYS.ANALYSES, analyses);
    return foundAlert;
  }

  async getDashboardKPIs(): Promise<DashboardKPIs> {
    const analyses = await this.getAllAnalyses();
    const alerts = await this.getAllAlerts();

    const totalAnalyses = analyses.length;
    let totalDetections = 0;
    let totalConfidenceSum = 0;
    let totalDurationSum = 0;

    const classCountMap: Record<string, { count: number; color: string }> = {};

    analyses.forEach((a) => {
      totalDetections += a.detectionsCount || 0;
      totalConfidenceSum += a.averageConfidence || 0;
      totalDurationSum += a.durationMs || 0;

      if (a.result && a.result.detections) {
        a.result.detections.forEach((d) => {
          if (!classCountMap[d.label]) {
            classCountMap[d.label] = {
              count: 0,
              color: d.color || "#3b82f6",
            };
          }
          classCountMap[d.label].count += 1;
        });
      }
    });

    const averageConfidence = totalAnalyses > 0 ? totalConfidenceSum / totalAnalyses : 0;
    const averageProcessingTimeMs = totalAnalyses > 0 ? Math.round(totalDurationSum / totalAnalyses) : 0;

    const activeAlerts = alerts.filter((a) => a.status === "nueva").length;

    // Class distribution formatted for chart
    const classDistribution = Object.entries(classCountMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        color: data.color,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // Activity timeline over last 6 periods/days
    const activityTimeline = [
      { date: "Hace 5d", analyses: 8, alerts: 1 },
      { date: "Hace 4d", analyses: 12, alerts: 2 },
      { date: "Hace 3d", analyses: 15, alerts: 1 },
      { date: "Anteayer", analyses: 19, alerts: 3 },
      { date: "Ayer", analyses: 24, alerts: 2 },
      { date: "Hoy", analyses: totalAnalyses, alerts: alerts.length },
    ];

    return {
      totalAnalyses,
      totalDetections,
      totalAlerts: alerts.length,
      activeAlerts,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      averageProcessingTimeMs,
      classDistribution,
      activityTimeline,
      recentAnalyses: analyses.slice(0, 5),
      recentAlerts: alerts.slice(0, 4),
    };
  }

  async getScenarios(): Promise<Scenario[]> {
    return this.getStorageItem<Scenario[]>(STORAGE_KEYS.SCENARIOS, DEFAULT_SCENARIOS);
  }

  async getScenarioById(id: string): Promise<Scenario | null> {
    const list = await this.getScenarios();
    return list.find((s) => s.id === id) || null;
  }

  async getClasses(): Promise<VisionClass[]> {
    return this.getStorageItem<VisionClass[]>(STORAGE_KEYS.CLASSES, DEFAULT_CLASSES);
  }

  async updateClass(updated: VisionClass): Promise<void> {
    const list = await this.getClasses();
    const idx = list.findIndex((c) => c.id === updated.id);
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    this.setStorageItem(STORAGE_KEYS.CLASSES, list);
  }

  async getRules(): Promise<BusinessRule[]> {
    return this.getStorageItem<BusinessRule[]>(STORAGE_KEYS.RULES, DEFAULT_RULES);
  }

  async updateRule(updated: BusinessRule): Promise<void> {
    const list = await this.getRules();
    const idx = list.findIndex((r) => r.id === updated.id);
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    this.setStorageItem(STORAGE_KEYS.RULES, list);
  }
}

