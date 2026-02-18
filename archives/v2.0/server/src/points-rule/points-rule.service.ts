import { Injectable } from '@nestjs/common';
import { pointsRuleManager, customerManager } from '../storage/database';

@Injectable()
export class PointsRuleService {
  async getPointsRules(query: any) {
    const { skip, limit, isActive } = query;
    return pointsRuleManager.getPointsRules({
      skip: skip ? parseInt(skip) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      filters: {
        isActive: isActive !== undefined ? isActive === 'true' : undefined
      }
    });
  }

  async getPointsRuleById(id: string) {
    return pointsRuleManager.getPointsRuleById(id);
  }

  async getActivePointsRule() {
    return pointsRuleManager.getActivePointsRule();
  }

  async createPointsRule(data: any) {
    return pointsRuleManager.createPointsRule(data);
  }

  async updatePointsRule(id: string, data: any) {
    return pointsRuleManager.updatePointsRule(id, data);
  }

  async deletePointsRule(id: string) {
    return pointsRuleManager.deletePointsRule(id);
  }

  async calculatePoints(amount: number): Promise<number> {
    return pointsRuleManager.calculatePoints(amount);
  }
}
