import { eq, and, desc, gte, lte } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  activities,
  activity_configs,
  activity_prizes,
  prizes,
} from './shared/schema';
import type {
  Activity,
  InsertActivity,
  UpdateActivity,
  ActivityConfig,
  InsertActivityConfig,
  ActivityPrize,
  InsertActivityPrize,
} from './shared/schema';
import * as schema from './shared/schema';

class ActivityManager {
  private async getDb() {
    return await getDb(schema);
  }

  // 获取所有活动
  async getActivities() {
    const db = await this.getDb();
    return await db.select().from(activities).orderBy(desc(activities.createdAt));
  }

  // 获取活动（单个）
  async getActivityById(id: string): Promise<Activity | undefined> {
    const db = await this.getDb();
    const result = await db.select().from(activities).where(eq(activities.id, id));
    return result[0];
  }

  // 获取当前活动的活动
  async getActiveActivity() {
    const db = await this.getDb();
    const now = new Date();
    const result = await db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.status, 'active'),
          gte(activities.endTime, now),
          lte(activities.startTime, now)
        )
      )
      .limit(1);
    return result[0];
  }

  // 创建活动
  async createActivity(data: InsertActivity) {
    const db = await this.getDb();
    const result = await db.insert(activities).values(data).returning();
    return result[0];
  }

  // 更新活动
  async updateActivity(id: string, data: UpdateActivity) {
    const db = await this.getDb();
    const result = await db
      .update(activities)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(activities.id, id))
      .returning();
    return result[0];
  }

  // 删除活动
  async deleteActivity(id: string) {
    const db = await this.getDb();
    await db.delete(activities).where(eq(activities.id, id));
  }

  // 获取活动配置
  async getActivityConfigs(activityId: string) {
    const db = await this.getDb();
    return await db
      .select()
      .from(activity_configs)
      .where(eq(activity_configs.activityId, activityId));
  }

  // 添加活动配置
  async addActivityConfig(data: InsertActivityConfig) {
    const db = await this.getDb();
    const result = await db.insert(activity_configs).values(data).returning();
    return result[0];
  }

  // 更新活动配置
  async updateActivityConfig(id: string, configValue: string) {
    const db = await this.getDb();
    const result = await db
      .update(activity_configs)
      .set({ configValue })
      .where(eq(activity_configs.id, id))
      .returning();
    if (result.length === 0) {
      throw new Error('配置不存在');
    }
    return result[0];
  }

  // 删除活动配置
  async deleteActivityConfig(id: string) {
    const db = await this.getDb();
    await db.delete(activity_configs).where(eq(activity_configs.id, id));
  }

  // 获取活动奖品列表
  async getActivityPrizes(activityId: string) {
    const db = await this.getDb();
    return await db
      .select({
        id: activity_prizes.id,
        probability: activity_prizes.probability,
        stock: activity_prizes.stock,
        config: activity_prizes.config,
        prize: {
          id: prizes.id,
          name: prizes.name,
          type: prizes.type,
          value: prizes.value,
          totalQuantity: prizes.totalQuantity,
          remainingQuantity: prizes.remainingQuantity,
        },
      })
      .from(activity_prizes)
      .innerJoin(prizes, eq(activity_prizes.prizeId, prizes.id))
      .where(eq(activity_prizes.activityId, activityId));
  }

  // 添加活动奖品
  async addActivityPrize(data: any) {
    const db = await this.getDb();
    const result = await db.insert(activity_prizes).values(data as any).returning();
    return result[0];
  }

  // 更新活动奖品
  async updateActivityPrize(id: string, data: any) {
    const db = await this.getDb();
    const result = await db
      .update(activity_prizes)
      .set(data as any)
      .where(eq(activity_prizes.id, id))
      .returning();
    if (result.length === 0) {
      throw new Error('活动奖品不存在');
    }
    return result[0];
  }

  // 删除活动奖品
  async deleteActivityPrize(id: string) {
    const db = await this.getDb();
    await db.delete(activity_prizes).where(eq(activity_prizes.id, id));
  }

  // 获取游戏类型列表
  getGameTypes() {
    return [
      { value: 'wheel', label: '转盘', icon: '🎡' },
      { value: 'blindbox', label: '盲盒', icon: '📦' },
      { value: 'slotmachine', label: '老虎机', icon: '🎰' },
      { value: 'scratchcard', label: '刮刮乐', icon: '🎫' },
      { value: 'lotterybox', label: '抽奖箱', icon: '🎁' },
    ];
  }
}

export const activityManager = new ActivityManager();
