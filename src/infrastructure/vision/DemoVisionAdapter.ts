import { VisionEngine } from '../../core/ports/VisionEngine';
import { AnalysisInput, VisionResult, Detection, SegmentationResult, PatternResult, Alert } from '../../core/domain/types';
import { DEFAULT_SCENARIOS, DEFAULT_RULES } from '../../core/domain/seedData';

export class DemoVisionAdapter implements VisionEngine {
  readonly engineType = "demo" as const;
  readonly engineName = "DemoVisionAdapter (Simulador Determinista Local v1.0)";

  async analyze(input: AnalysisInput): Promise<VisionResult> {
    const startTime = performance.now();

    // Artificial delay to simulate real network/model inference (300ms - 600ms)
    await new Promise((resolve) => setTimeout(resolve, 450));

    let detections: Detection[] = [];
    let masks: SegmentationResult[] = [];
    let patterns: PatternResult[] = [];
    let alerts: Alert[] = [];

    // Check if input matches one of our pre-calibrated scenarios
    const matchedScenario = DEFAULT_SCENARIOS.find((s) => s.id === input.scenarioId);

    if (matchedScenario) {
      // Deterministic scenario seed
      if (input.mode === "detection" || input.mode === "combined") {
        detections = matchedScenario.detectionsSeed
          .filter((d) => d.confidence >= input.confidenceThreshold)
          .map((d) => ({
            ...d,
            analysisId: input.analysisId,
          }));
      }

      if (input.mode === "segmentation" || input.mode === "combined") {
        masks = matchedScenario.masksSeed
          .filter((m) => m.confidence >= input.confidenceThreshold)
          .map((m) => ({
            ...m,
            analysisId: input.analysisId,
          }));
      }

      if (input.mode === "patterns" || input.mode === "combined") {
        patterns = matchedScenario.patternsSeed
          .filter((p) => p.confidence >= input.confidenceThreshold)
          .map((p) => ({
            ...p,
            analysisId: input.analysisId,
          }));
      }

      // Check rules against patterns & detections to generate alerts
      for (const pattern of patterns) {
        if (pattern.status === "critical" || pattern.status === "warning") {
          const rule = DEFAULT_RULES.find((r) => r.scenarioTarget === matchedScenario.id);
          alerts.push({
            id: `alt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            analysisId: input.analysisId,
            ruleId: rule ? rule.id : "rul_custom",
            ruleName: rule ? rule.name : pattern.label,
            severity: pattern.severity || (pattern.status === "critical" ? "critical" : "medium"),
            message: pattern.evidence,
            status: "nueva",
            createdAt: new Date().toISOString(),
            scenarioName: matchedScenario.name,
          });
        }
      }
    } else {
      // Custom uploaded image simulation
      // Heuristic detections for user-uploaded custom pictures
      if (input.mode === "detection" || input.mode === "combined") {
        detections = [
          {
            id: `det_custom_1`,
            analysisId: input.analysisId,
            classId: "cls_persona",
            label: "Persona Detectada",
            confidence: 0.91,
            box: { x: 0.25, y: 0.2, width: 0.22, height: 0.55 },
            color: "#3b82f6",
          },
          {
            id: `det_custom_2`,
            analysisId: input.analysisId,
            classId: "cls_producto",
            label: "Objeto / Producto de Interés",
            confidence: 0.86,
            box: { x: 0.55, y: 0.35, width: 0.3, height: 0.45 },
            color: "#6366f1",
          },
        ].filter((d) => d.confidence >= input.confidenceThreshold);
      }

      if (input.mode === "segmentation" || input.mode === "combined") {
        masks = [
          {
            id: `mask_custom_1`,
            analysisId: input.analysisId,
            classId: "cls_persona",
            label: "Segmentación de Sujeto",
            confidence: 0.89,
            areaRatio: 0.12,
            type: "instance",
            color: "#3b82f6",
            polygon: [
              [0.26, 0.22], [0.45, 0.22], [0.47, 0.73], [0.25, 0.73]
            ],
          },
          {
            id: `mask_custom_2`,
            analysisId: input.analysisId,
            classId: "cls_object",
            label: "Segmentación Fondo / Piso",
            confidence: 0.94,
            areaRatio: 0.40,
            type: "semantic",
            color: "#64748b",
            polygon: [
              [0.0, 0.6], [1.0, 0.6], [1.0, 1.0], [0.0, 1.0]
            ],
          },
        ].filter((m) => m.confidence >= input.confidenceThreshold);
      }

      if (input.mode === "patterns" || input.mode === "combined") {
        patterns = [
          {
            id: `pat_custom_1`,
            analysisId: input.analysisId,
            type: "visual_inspection",
            label: "Inspección Visual General",
            confidence: 0.88,
            evidence: "Detección de elementos visuales principales dentro de parámetros estables.",
            status: "normal",
            severity: "low",
          },
        ].filter((p) => p.confidence >= input.confidenceThreshold);
      }
    }

    const durationMs = Math.round(performance.now() - startTime);

    const confidences = [
      ...detections.map((d) => d.confidence),
      ...masks.map((m) => m.confidence),
      ...patterns.map((p) => p.confidence),
    ];

    const averageConfidence = confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0.9;

    return {
      analysisId: input.analysisId,
      detections,
      masks,
      patterns,
      alerts,
      durationMs,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
    };
  }

  async healthCheck(): Promise<{ status: "connected" | "fallback"; latencyMs: number }> {
    return { status: "connected", latencyMs: 2 };
  }
}

