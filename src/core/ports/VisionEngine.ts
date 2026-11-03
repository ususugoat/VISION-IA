import { AnalysisInput, VisionResult } from '../domain/types';

export interface VisionEngine {
  readonly engineType: "demo" | "api";
  readonly engineName: string;
  analyze(input: AnalysisInput): Promise<VisionResult>;
  healthCheck?(): Promise<{ status: "connected" | "fallback"; latencyMs: number }>;
}

