// Live Real-Time Detection Types for VISION AI v2.0

export type EntityState = 'seated_working' | 'standing' | 'walking' | 'interacting' | 'alert_trigger' | 'restricted_zone';

export type ZoneType = 'workspace' | 'restricted' | 'safe_passage' | 'meeting' | 'server_rack' | 'inspection_point' | 'emergency_exit';

export type LiveAlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type LiveAlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface Zone {
  id: string;
  label: string;
  type: ZoneType;
  x: number;      // 0..1 normalized
  y: number;      // 0..1 normalized
  width: number;  // 0..1 normalized
  height: number; // 0..1 normalized
  color: string;
  opacity: number;
  strokeColor: string;
}

export interface TrackedObject {
  id: string;
  trackId: string;
  classId: string;
  label: string;
  state: EntityState;
  x: number;         // 0..1 normalized center x
  y: number;         // 0..1 normalized center y
  width: number;     // 0..1 normalized
  height: number;    // 0..1 normalized
  confidence: number; // 0..1
  color: string;
  hasEPP?: boolean;        // has personal protective equipment
  hasHelmet?: boolean;     // has certified safety helmet
  hasVest?: boolean;       // has reflective safety vest
  hasCredential?: boolean; // has visible badge/credential
  hasESDGloves?: boolean;  // ESD-safe gloves for lab
  hasDrink?: boolean;      // carrying beverage (risk)
  hasFood?: boolean;       // carrying food (risk)
  isDefective?: boolean;   // manufacturing defect detected
  defectType?: 'scratch' | 'seal_defect' | 'level_anomaly' | string; // defect category
  defectDetail?: string;   // detailed description of imperfection
  inspectedThisPass?: boolean; // whether inspected during current pass on conveyor
  vehicleType?: 'forklift' | 'cart';
  velocity: { vx: number; vy: number }; // movement vector
  occupiedZoneId?: string; // which zone this entity is in
  stateFrameCount: number; // frames in current state
  framesSinceAlert: number; // cooldown
}

export interface LiveAlert {
  id: string;
  sessionId: string;
  frameNumber: number;
  timestamp: string;
  severity: LiveAlertSeverity;
  status: LiveAlertStatus;
  triggerEntityId?: string;
  triggerEntityLabel?: string;
  ruleId: string;
  ruleName: string;
  message: string;
  evidence: string;
  zoneId?: string;
  zoneName?: string;
  confidence: number;
  screenshotFrame?: number; // frame number to reference
  notes?: string;
}

export interface LiveFrame {
  frameNumber: number;
  timestamp: number; // ms since session start
  fps: number;
  latencyMs: number; // simulated inference latency
  objects: TrackedObject[];
  zones: Zone[];
  newAlerts: LiveAlert[];
  objectsNow: number;
  uniqueTrackedIds: number;
  maxSimultaneous: number;
  averageConfidence: number;
}

export type LiveEnvironmentType = 'classic' | 'technological';

export interface LiveScenario {
  id: string;
  name: string;
  description: string;
  sector: string;
  environmentType: LiveEnvironmentType;
  environment: 'office' | 'datacenter' | 'lab' | 'meeting_room' | 'industrial' | 'warehouse' | 'quality' | 'retail';
  assetImage?: string; // Vector/bitmap asset for classic image scenarios
  cameraLabel: string;
  rules: LiveRule[];
  zones: Zone[];
  initialEntities: Omit<TrackedObject, 'stateFrameCount' | 'framesSinceAlert'>[];
  backgroundDescription: string; // what the scene looks like
  caption?: string; // One-line subtitle caption displayed under the camera view
  aiModel: string; // e.g. "Nexus-YOLO v8"
  tags: string[];
}

export interface LiveRule {
  id: string;
  name: string;
  description: string;
  severity: LiveAlertSeverity;
  enabled: boolean;
  cooldownFrames: number; // minimum frames between same alert
  evaluator: string; // key for the rule evaluator function
  threshold?: number;
}

export interface LiveSession {
  id: string;
  scenarioId: string;
  scenarioName: string;
  cameraLabel: string;
  startedAt: string;
  endedAt?: string;
  totalFrames: number;
  totalAlerts: number;
  uniqueObjectsTracked: number;
  averageConfidence: number;
  status: 'running' | 'paused' | 'ended';
  aiModel: string;
}
