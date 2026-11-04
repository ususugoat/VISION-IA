import type { LiveVisionEngine, LiveSessionConfig } from '../../core/ports/LiveVisionEngine';
import type { LiveFrame, LiveSession, LiveScenario } from '../../core/domain/liveTypes';
import { LIVE_SCENARIOS } from '../../core/domain/liveScenarios';
import { SceneSimulator } from './SceneSimulator';

export class DemoLiveAdapter implements LiveVisionEngine {
  readonly engineType = 'demo' as const;
  readonly engineName = 'DemoLiveAdapter (Simulador Determinista Tiempo Real v2.0)';

  private simulator = new SceneSimulator(42);
  private sessions: Map<string, LiveSession> = new Map();
  private pausedSessions: Set<string> = new Set();
  private frameCounters: Map<string, number> = new Map();
  private maxSimultaneousMap: Map<string, number> = new Map();

  getScenarios(): LiveScenario[] {
    return LIVE_SCENARIOS;
  }

  async startSession(config: LiveSessionConfig): Promise<LiveSession> {
    const scenario = LIVE_SCENARIOS.find((s) => s.id === config.scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${config.scenarioId} not found`);
    }

    const sessionId = `lv_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const session: LiveSession = {
      id: sessionId,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      cameraLabel: scenario.cameraLabel,
      startedAt: new Date().toISOString(),
      totalFrames: 0,
      totalAlerts: 0,
      uniqueObjectsTracked: 0,
      averageConfidence: 0,
      status: 'running',
      aiModel: config.aiModel || scenario.aiModel,
    };

    this.sessions.set(sessionId, session);
    this.frameCounters.set(sessionId, 0);
    this.maxSimultaneousMap.set(sessionId, 0);
    this.simulator.initSession(sessionId, scenario);

    return session;
  }

  nextFrame(sessionId: string): LiveFrame | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.status === 'ended') return null;
    if (this.pausedSessions.has(sessionId)) return null;

    const startTime = performance.now();

    // Advance simulation
    const { entities, newAlerts } = this.simulator.nextFrame(sessionId);
    const state = this.simulator.getState(sessionId);

    const latencyMs = Math.round(performance.now() - startTime) + Math.floor(5 + Math.random() * 20);
    const frameNum = (this.frameCounters.get(sessionId) ?? 0) + 1;
    this.frameCounters.set(sessionId, frameNum);

    // Update session counters
    session.totalFrames = frameNum;
    session.totalAlerts += newAlerts.length;
    if (state) {
      session.uniqueObjectsTracked = state.uniqueTrackedIds.size;
      const totalConf = entities.reduce((acc, e) => acc + e.confidence, 0);
      session.averageConfidence = entities.length > 0 ? totalConf / entities.length : 0;
    }
    this.sessions.set(sessionId, session);

    const maxSim = this.maxSimultaneousMap.get(sessionId) ?? 0;
    if (entities.length > maxSim) {
      this.maxSimultaneousMap.set(sessionId, entities.length);
    }

    const scenario = LIVE_SCENARIOS.find((s) => s.id === session.scenarioId);

    const frame: LiveFrame = {
      frameNumber: frameNum,
      timestamp: Date.now(),
      fps: 12 + Math.round(Math.random() * 2 - 1), // 11-13 fps simulated
      latencyMs,
      objects: entities,
      zones: scenario?.zones ?? [],
      newAlerts,
      objectsNow: entities.length,
      uniqueTrackedIds: state?.uniqueTrackedIds.size ?? 0,
      maxSimultaneous: this.maxSimultaneousMap.get(sessionId) ?? entities.length,
      averageConfidence: session.averageConfidence,
    };

    return frame;
  }

  pauseSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.pausedSessions.add(sessionId);
      session.status = 'paused';
      this.sessions.set(sessionId, session);
    }
  }

  resumeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.pausedSessions.delete(sessionId);
      session.status = 'running';
      this.sessions.set(sessionId, session);
    }
  }

  stopSession(sessionId: string): LiveSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    session.status = 'ended';
    session.endedAt = new Date().toISOString();
    this.pausedSessions.delete(sessionId);
    this.simulator.removeSession(sessionId);
    this.sessions.set(sessionId, session);
    return { ...session };
  }

  getSession(sessionId: string): LiveSession | null {
    return this.sessions.get(sessionId) ?? null;
  }
}
