// Domain Types & Entities according to VISION AI Functional Specification v1.0

export type AnalysisMode = "detection" | "segmentation" | "patterns" | "combined";
export type AnalysisStatus = "queued" | "processing" | "completed" | "failed";

export type UserRole = "admin" | "operator" | "supervisor" | "auditor";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
}

export interface BoundingBox {
  x: number;      // 0..1 (top-left X normalized)
  y: number;      // 0..1 (top-left Y normalized)
  width: number;  // 0..1
  height: number; // 0..1
}

export interface Detection {
  id: string;
  analysisId?: string;
  classId: string;
  label: string;
  confidence: number; // 0..1
  box: BoundingBox;
  trackId?: string;
  color?: string;
}

export type SegmentationType = "semantic" | "instance" | "panoptic";

export interface SegmentationResult {
  id: string;
  analysisId?: string;
  classId: string;
  label: string;
  polygon: [number, number][]; // Normalized polygon points [[x, y], ...]
  areaRatio: number;          // Relative area percentage 0..1
  confidence: number;          // 0..1
  type: SegmentationType;
  color: string;
}

export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "nueva" | "revisada" | "cerrada";

export interface PatternResult {
  id: string;
  analysisId?: string;
  type: string;
  label: string;
  confidence: number; // 0..1
  evidence: string;
  status: "normal" | "warning" | "critical";
  severity?: AlertSeverity;
  boundingBox?: BoundingBox;
}

export interface Alert {
  id: string;
  analysisId: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  scenarioName?: string;
}

export interface VisionClass {
  id: string;
  name: string;
  color: string;
  description: string;
  enabled: boolean;
  category: "person" | "equipment" | "vehicle" | "defect" | "object";
}

export interface BusinessRule {
  id: string;
  name: string;
  condition: string;
  threshold: number; // e.g. min confidence or occurrence count
  severity: AlertSeverity;
  enabled: boolean;
  scenarioTarget: string;
  description: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  sector: "Seguridad y prevención" | "Manufactura" | "Retail y almacenes" | "Transporte y logística";
  asset: string; // URL or embedded image
  expectedResults: {
    objects: string[];
    patterns: string[];
    alerts: string[];
  };
  tags: string[];
  detectionsSeed: Omit<Detection, "analysisId">[];
  masksSeed: Omit<SegmentationResult, "analysisId">[];
  patternsSeed: Omit<PatternResult, "analysisId">[];
}

export interface AnalysisInput {
  analysisId: string;
  sourceName: string;
  imageUrl: string;
  scenarioId?: string;
  mode: AnalysisMode;
  confidenceThreshold: number; // 0..1
  user: UserProfile;
}

export interface VisionResult {
  analysisId: string;
  detections: Detection[];
  masks: SegmentationResult[];
  patterns: PatternResult[];
  alerts: Alert[];
  durationMs: number;
  averageConfidence: number;
}

export interface AnalysisRecord {
  id: string;
  createdAt: string;
  createdBy: string;
  userRole: UserRole;
  sourceName: string;
  scenarioId?: string;
  scenarioName?: string;
  imageUrl: string;
  mode: AnalysisMode;
  status: AnalysisStatus;
  durationMs: number;
  averageConfidence: number;
  detectionsCount: number;
  alertsCount: number;
  confidenceThreshold: number;
  engineType: "demo" | "api";
  result?: VisionResult;
}

export interface DashboardKPIs {
  totalAnalyses: number;
  totalDetections: number;
  totalAlerts: number;
  activeAlerts: number;
  averageConfidence: number;
  averageProcessingTimeMs: number;
  classDistribution: { name: string; count: number; color: string }[];
  activityTimeline: { date: string; analyses: number; alerts: number }[];
  recentAnalyses: AnalysisRecord[];
  recentAlerts: Alert[];
}

