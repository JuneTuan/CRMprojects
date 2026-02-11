import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { prizes, insertPrizeSchema, updatePrizeSchema } from "./shared/schema";
import type { Prize, InsertPrize, UpdatePrize } from "./shared/schema";
import * as schema from "./shared/schema";

export class PrizeManager {
  async createPrize(data: InsertPrize): Promise<Prize> {
    const db = await getDb(schema);
    const validated = insertPrizeSchema.parse(data);
    const [prize] = await db.insert(prizes).values(validated).returning();
    return prize;
  }

  async getPrizes(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<Prize, 'id' | 'type' | 'isActive'>>
  } = {}): Promise<Prize[]> {
    const { skip = 0, limit = 100, filters = {} } = options;
    const db = await getDb(schema);

    const conditions: SQL[] = [];
    if (filters.id !== undefined) {
      conditions.push(eq(prizes.id, filters.id));
    }
    if (filters.type !== undefined) {
      conditions.push(eq(prizes.type, filters.type));
    }

    const results = await db.query.prizes.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset: skip,
      orderBy: { createdAt: "desc" as any },
    });

    return results;
  }

  async getAvailablePrizes(): Promise<Prize[]> {
    const db = await getDb(schema);
    const results = await db.query.prizes.findMany({
      where: eq(prizes.isActive, true),
      orderBy: { probability: "asc" as any },
    });
    return results;
  }

  async getPrizeById(id: string): Promise<Prize | null> {
    const db = await getDb(schema);
    const prize = await db.query.prizes.findFirst({
      where: eq(prizes.id, id),
    });
    return prize || null;
  }

  async updatePrize(id: string, data: UpdatePrize): Promise<Prize | null> {
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
    await db.schema.updateTable('prizes')
      .set({
        remainingQuantity: sql`${prizes.remainingQuantity} - 1`
      })
      .where(
        and(
          eq(prizes.id, prizeId),
          eq(prizes.isActive, true)
        )
      )
      .execute();
  }
}

export const prizeManager = new PrizeManager();
