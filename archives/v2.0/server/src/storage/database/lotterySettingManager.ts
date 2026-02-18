import { eq, and, SQL, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { lottery_settings, insertLotterySettingSchema, updateLotterySettingSchema } from "./shared/schema";
import * as schema from "./shared/schema";

export class LotterySettingManager {
  async getLotterySettings(options: {
    skip?: number;
    limit?: number;
  } = {}): Promise<any[]> {
    const { skip = 0, limit = 100 } = options;
    const db = await getDb(schema);

    const results = await db.select().from(lottery_settings)
      .limit(limit)
      .offset(skip)
      .orderBy(sql`${lottery_settings.createdAt} DESC`);

    return results;
  }

  async getActiveLotterySetting(): Promise<any | null> {
    const db = await getDb(schema);
    const setting = await db.select().from(lottery_settings)
      .limit(1)
      .orderBy(sql`${lottery_settings.createdAt} DESC`);

    if (!setting[0]) return null;
    return setting[0];
  }

  async getLotterySettingById(id: string): Promise<any | null> {
    const db = await getDb(schema);
    const setting = await db.select().from(lottery_settings)
      .where(eq(lottery_settings.id, id))
      .limit(1);

    if (!setting[0]) return null;
    return setting[0];
  }

  async createLotterySetting(data: any): Promise<any> {
    const db = await getDb(schema);
    const validated = insertLotterySettingSchema.parse(data);
    const [setting] = await db.insert(lottery_settings).values(validated).returning();
    return setting;
  }

  async updateLotterySetting(id: string, data: any): Promise<any | null> {
    const db = await getDb(schema);
    const validated = updateLotterySettingSchema.parse(data);
    const [setting] = await db
      .update(lottery_settings)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(lottery_settings.id, id))
      .returning();

    if (!setting) return null;
    return setting;
  }

  async deleteLotterySetting(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(lottery_settings).where(eq(lottery_settings.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const lotterySettingManager = new LotterySettingManager();
