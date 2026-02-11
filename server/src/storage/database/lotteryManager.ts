import { eq, and, SQL, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { lottery_records, insertLotteryRecordSchema } from "./shared/schema";
import type { LotteryRecord, InsertLotteryRecord } from "./shared/schema";
import * as schema from "./shared/schema";

export class LotteryManager {
  async createLotteryRecord(data: InsertLotteryRecord): Promise<LotteryRecord> {
    const db = await getDb(schema);
    const validated = insertLotteryRecordSchema.parse(data);
    const [record] = await db.insert(lottery_records).values(validated).returning();
    return record;
  }

  async getTodayLotteryCount(customerId: string): Promise<number> {
    const db = await getDb(schema);
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(lottery_records)
      .where(
        and(
          eq(lottery_records.customerId, customerId),
          sql`date(${lottery_records.createdAt}) = current_date`
        )
      );

    return result[0]?.count || 0;
  }

  async resetTodayLotteryCount(customerId: string): Promise<void> {
    const db = await getDb(schema);
    // 删除今日的所有抽奖记录，从而重置抽奖次数
    await db
      .delete(lottery_records)
      .where(
        and(
          eq(lottery_records.customerId, customerId),
          sql`date(${lottery_records.createdAt}) = current_date`
        )
      );
  }

  async getLotteryRecords(customerId: string, limit: number = 50): Promise<LotteryRecord[]> {
    const db = await getDb(schema);
    const results = await db.select().from(lottery_records)
      .where(eq(lottery_records.customerId, customerId))
      .limit(limit)
      .orderBy(sql`${lottery_records.createdAt} DESC`);

    return results;
  }
}

export const lotteryManager = new LotteryManager();
