import { AnalysisRecord, Alert, DashboardKPIs, AlertStatus, Scenario, VisionClass, BusinessRule } from '../domain/types';

export interface AnalysisFilter {
  query?: string;
  scenarioId?: string;
  mode?: string;
  minConfidence?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  sourceType?: 'all' | 'static' | 'live';
}

export interface AnalysisRepository {
  saveAnalysis(record: AnalysisRecord): Promise<void>;
  getAnalysisById(id: string): Promise<AnalysisRecord | null>;
  getAllAnalyses(filter?: AnalysisFilter): Promise<AnalysisRecord[]>;
  deleteAnalysis(id: string): Promise<void>;
  clearAllAnalyses(): Promise<void>;

  getDashboardKPIs(): Promise<DashboardKPIs>;

  getAllAlerts(statusFilter?: AlertStatus | 'all'): Promise<Alert[]>;
  updateAlertStatus(alertId: string, status: AlertStatus, reviewerName: string, notes?: string): Promise<Alert>;

  getScenarios(): Promise<Scenario[]>;
  getScenarioById(id: string): Promise<Scenario | null>;

  getClasses(): Promise<VisionClass[]>;
  updateClass(updated: VisionClass): Promise<void>;

  getRules(): Promise<BusinessRule[]>;
  updateRule(updated: BusinessRule): Promise<void>;
}

