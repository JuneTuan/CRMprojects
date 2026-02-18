import { eq, and, SQL, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { prizes, insertPrizeSchema, updatePrizeSchema } from "./shared/schema";
import * as schema from "./shared/schema";

export class PrizeManager {
  async createPrize(data: any): Promise<any> {
    const db = await getDb(schema);
    const validated = insertPrizeSchema.parse(data);
    const [prize] = await db.insert(prizes).values(validated).returning();
    return prize;
  }

  async getPrizes(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<any, 'id' | 'type'>>
  } = {}): Promise<any[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb(schema);

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(prizes.id, filters.id));
    }
    if (filters.type !== undefined) {
      conditions.push(eq(prizes.type, filters.type));
    }

    const results = await db.select().from(prizes)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(skip)
      .orderBy(sql`${prizes.createdAt} DESC`);

    return results;
  }

  async getAvailablePrizes(): Promise<any[]> {
    const db = await getDb(schema);
    const results = await db.select().from(prizes)
      .orderBy(sql`${prizes.probability} ASC`);

    return results;
  }

  async getPrizeById(id: string): Promise<any | null> {
    const db = await getDb(schema);
    const prize = await db.select().from(prizes)
      .where(eq(prizes.id, id))
      .limit(1);

    return prize[0] || null;
  }

  async updatePrize(id: string, data: any): Promise<any | null> {
    const db = await getDb(schema);
    const validated = updatePrizeSchema.parse(data);
    const [prize] = await db
      .update(prizes)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(prizes.id, id))
      .returning();
    return prize || null;
  }

  async deletePrize(id: string): Promise<boolean> {
    const db = await getDb(schema);
    const result = await db.delete(prizes).where(eq(prizes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async decreasePrizeQuantity(prizeId: string): Promise<void> {
    const db = await getDb(schema);
    await db
      .update(prizes)
      .set({
        remainingQuantity: sql`${prizes.remainingQuantity} - 1`,
        updatedAt: new Date()
      })
      .where(
        eq(prizes.id, prizeId)
      );
  }
}

export const prizeManager = new PrizeManager();
