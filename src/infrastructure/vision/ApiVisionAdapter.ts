import { VisionEngine } from '../../core/ports/VisionEngine';
import { AnalysisInput, VisionResult } from '../../core/domain/types';
import { DemoVisionAdapter } from './DemoVisionAdapter';

export class ApiVisionAdapter implements VisionEngine {
  readonly engineType = "api" as const;
  readonly engineName = "ApiVisionAdapter (FastAPI + YOLO / SAM REST Client)";

  private apiUrl: string;
  private apiKey?: string;
  private fallbackEngine: DemoVisionAdapter;

  constructor(apiUrl: string = "http://localhost:8000/api/v1", apiKey?: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.fallbackEngine = new DemoVisionAdapter();
  }

  setApiUrl(url: string) {
    this.apiUrl = url;
  }

  async healthCheck(): Promise<{ status: "connected" | "fallback"; latencyMs: number }> {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.apiUrl}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        return { status: "connected", latencyMs };
      }
      return { status: "fallback", latencyMs };
    } catch {
      return { status: "fallback", latencyMs: Math.round(performance.now() - start) };
    }
  }

  async analyze(input: AnalysisInput): Promise<VisionResult> {
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`${this.apiUrl}/analyses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify({
          analysisId: input.analysisId,
          imageUrl: input.imageUrl,
          scenarioId: input.scenarioId,
          mode: input.mode,
          threshold: input.confidenceThreshold,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return {
          ...data,
          durationMs: Math.round(performance.now() - startTime),
        };
      }
      throw new Error(`API returned status ${response.status}`);
    } catch {
      // Fallback gracefully to DemoVisionAdapter with realistic note
      console.warn("ApiVisionAdapter: Endpoint backend no disponible, activando fallback a DemoVisionAdapter.");
      const demoResult = await this.fallbackEngine.analyze(input);
      return demoResult;
    }
  }
}

