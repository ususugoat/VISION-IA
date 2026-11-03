import type { AnalysisRepository, AnalysisFilter } from '../ports/AnalysisRepository';
import type { AnalysisRecord } from '../domain/types';

export class SearchHistoryUseCase {
  constructor(private repository: AnalysisRepository) {}

  async execute(filter?: AnalysisFilter): Promise<AnalysisRecord[]> {
    return this.repository.getAllAnalyses(filter);
  }
}

