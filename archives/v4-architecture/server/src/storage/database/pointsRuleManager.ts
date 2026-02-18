import { eq, and, SQL, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { points_rules, insertPointsRuleSchema, updatePointsRuleSchema } from "./shared/schema";
import * as schema from "./shared/schema";

export class PointsRuleManager {
  async createPointsRule(data: any): Promise<any> {
    const db = await getDb(schema);
    const validated = insertPointsRuleSchema.parse(data);
    const [rule] = await db.insert(points_rules).values(validated).returning();
    return rule;
  }

  async getPointsRules(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<any, 'id' | 'name' | 'isActive'>>
  } = {}): Promise<any[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb(schema);

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(points_rules.id, filters.id));
    }
    if (filters.name !== undefined) {
      conditions.push(eq(points_rules.name, filters.name));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(points_rules.isActive, filters.isActive));
    }

    const results = await db.select().from(points_rules)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(skip)
      .orderBy(sql`${points_rules.createdAt} DESC`);

    return results;
  }

  async getActivePointsRule(): Promise<any | null> {
    const db = await getDb(schema);
    const rule = await db.select().from(points_rules)
      .where(eq(points_rules.isActive, true))
      .orderBy(sql`${points_rules.createdAt} DESC`)
      .limit(1);

    if (!rule[0]) return null;
    return rule[0];
  }

  async getPointsRuleById(id: string): Promise<any | null> {
    const db = await getDb(schema);
    const rule = await db.select().from(points_rules)
      .where(eq(points_rules.id, id))
      .limit(1);

    if (!rule[0]) return null;
    return rule[0];
  }

  async updatePointsRule(id: string, data: any): Promise<any | null> {
    const db = await getDb(schema);
    const validated = updatePointsRuleSchema.parse(data);
    const [rule] = await db
      .update(points_rules)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(points_rules.id, id))
      .returning();

    if (!rule) return null;
    return rule;
  }

  async deletePointsRule(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(points_rules).where(eq(points_rules.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async calculatePoints(amount: number): Promise<number> {
    const rule = await this.getActivePointsRule();
    if (!rule) {
      // 默认规则：1元=1积分
      return Math.floor(amount);
    }

    const minAmount = parseFloat(rule.minAmount);
    if (amount < minAmount) {
      return 0;
    }

    let points = Math.floor(amount * rule.pointsPerAmount);

    if (rule.maxPoints) {
      points = Math.min(points, rule.maxPoints);
    }

    return points;
  }
}

export const pointsRuleManager = new PointsRuleManager();
