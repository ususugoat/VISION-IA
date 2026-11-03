import type { AnalysisRepository } from '../ports/AnalysisRepository';
import type { Alert, AlertStatus } from '../domain/types';

export class UpdateAlertStatusUseCase {
  constructor(private repository: AnalysisRepository) {}

  async execute(alertId: string, status: AlertStatus, reviewerName: string, notes?: string): Promise<Alert> {
    return this.repository.updateAlertStatus(alertId, status, reviewerName, notes);
  }
}

