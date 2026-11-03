import type { AnalysisRepository } from '../ports/AnalysisRepository';
import type { BusinessRule } from '../domain/types';

export class ManageRulesUseCase {
  constructor(private repository: AnalysisRepository) {}

  async listRules(): Promise<BusinessRule[]> {
    return this.repository.getRules();
  }

  async toggleRule(ruleId: string, enabled: boolean): Promise<BusinessRule> {
    const rules = await this.repository.getRules();
    const found = rules.find((r) => r.id === ruleId);
    if (!found) {
      throw new Error(`Regla ${ruleId} no encontrada`);
    }
    const updated = { ...found, enabled };
    await this.repository.updateRule(updated);
    return updated;
  }

  async updateRuleThreshold(ruleId: string, threshold: number): Promise<BusinessRule> {
    const rules = await this.repository.getRules();
    const found = rules.find((r) => r.id === ruleId);
    if (!found) {
      throw new Error(`Regla ${ruleId} no encontrada`);
    }
    const updated = { ...found, threshold };
    await this.repository.updateRule(updated);
    return updated;
  }
}

