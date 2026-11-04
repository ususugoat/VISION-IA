import type { LiveVisionEngine } from '../ports/LiveVisionEngine';
import type { LiveSession } from '../domain/liveTypes';

export class StopLiveSessionUseCase {
  constructor(private liveEngine: LiveVisionEngine) {}

  execute(sessionId: string): LiveSession | null {
    return this.liveEngine.stopSession(sessionId);
  }
}
