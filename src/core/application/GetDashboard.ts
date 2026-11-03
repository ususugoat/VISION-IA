import type { AnalysisRepository } from '../ports/AnalysisRepository';
import type { DashboardKPIs } from '../domain/types';

export class GetDashboardUseCase {
  constructor(private repository: AnalysisRepository) {}

  async execute(): Promise<DashboardKPIs> {
    return this.repository.getDashboardKPIs();
  }
}

