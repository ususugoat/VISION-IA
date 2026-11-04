import type { LiveVisionEngine, LiveSessionConfig } from '../ports/LiveVisionEngine';
import type { LiveSession } from '../domain/liveTypes';

export class StartLiveSessionUseCase {
  constructor(private liveEngine: LiveVisionEngine) {}

  async execute(config: LiveSessionConfig): Promise<LiveSession> {
    return this.liveEngine.startSession(config);
  }
}
