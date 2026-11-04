import type { LiveFrame, LiveSession, LiveScenario } from '../domain/liveTypes';

export interface LiveSessionConfig {
  scenarioId: string;
  aiModel?: string;
  targetFps?: number; // simulation target FPS (default 12)
}

export interface LiveVisionEngine {
  readonly engineType: 'demo' | 'api';
  readonly engineName: string;

  /** Start a new live session for the given scenario */
  startSession(config: LiveSessionConfig): Promise<LiveSession>;

  /** Compute the next frame of simulation. Returns null if session not running. */
  nextFrame(sessionId: string): LiveFrame | null;

  /** Pause the current session */
  pauseSession(sessionId: string): void;

  /** Resume a paused session */
  resumeSession(sessionId: string): void;

  /** Stop and finalize the session, returning summary */
  stopSession(sessionId: string): LiveSession | null;

  /** Get current session state */
  getSession(sessionId: string): LiveSession | null;

  /** Get available scenarios */
  getScenarios(): LiveScenario[];
}
