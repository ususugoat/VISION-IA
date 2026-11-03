import type { VisionEngine } from '../ports/VisionEngine';
import type { AnalysisRepository } from '../ports/AnalysisRepository';
import type { AnalysisInput, AnalysisRecord, VisionResult } from '../domain/types';

export class AnalyzeImageUseCase {
  constructor(
    private visionEngine: VisionEngine,
    private repository: AnalysisRepository
  ) {}

  async execute(input: AnalysisInput, scenarioName?: string): Promise<{ result: VisionResult; record: AnalysisRecord }> {
    // 1. Execute vision inference through the engine port
    const result = await this.visionEngine.analyze(input);

    // 2. Build immutable audit record
    const record: AnalysisRecord = {
      id: input.analysisId,
      createdAt: new Date().toISOString(),
      createdBy: input.user.name,
      userRole: input.user.role,
      sourceName: input.sourceName,
      scenarioId: input.scenarioId,
      scenarioName: scenarioName || (input.scenarioId ? "Escenario Demostrativo" : "Análisis Personalizado"),
      imageUrl: input.imageUrl,
      mode: input.mode,
      status: "completed",
      durationMs: result.durationMs,
      averageConfidence: result.averageConfidence,
      detectionsCount: result.detections.length,
      alertsCount: result.alerts.length,
      confidenceThreshold: input.confidenceThreshold,
      engineType: this.visionEngine.engineType,
      result,
    };

    // 3. Persist record in repository
    await this.repository.saveAnalysis(record);

    return { result, record };
  }
}

