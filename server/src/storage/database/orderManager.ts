import { eq, and, SQL, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { orders, insertOrderSchema, customers, products } from "./shared/schema";
import type { Order, InsertOrder } from "./shared/schema";
import * as schema from "./shared/schema";

export class OrderManager {
  async createOrder(data: InsertOrder): Promise<Order> {
    const db = await getDb(schema);
    const validated = insertOrderSchema.parse(data);

    const order = await db.insert(orders).values(validated).returning();

    if (order[0].pointsEarned > 0) {
      await db.update(customers)
        .set({
          points: sql`${customers.points} + ${order[0].pointsEarned}`
        })
        .where(eq(customers.id, order[0].customerId));
    }

    return { ...order[0], amount: parseFloat(order[0].amount) || 0 };
  }

  async getOrders(options: {
    skip?: number;
    limit?: number;
    customerId?: string;
  } = {}): Promise<Order[]> {
    const { skip = 0, limit = 100, customerId } = options;
    const db = await getDb(schema);

    const conditions: SQL[] = [];
    if (customerId) {
      conditions.push(eq(orders.customerId, customerId));
    }

    const results = await db.select().from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(skip)
      .orderBy(sql`${orders.createdAt} DESC`);

    return results.map(r => ({ ...r, amount: parseFloat(r.amount) || 0 }));
  }

  async getOrderById(id: string): Promise<Order | null> {
    const db = await getDb(schema);
    const order = await db.select().from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order[0]) return null;
    return { ...order[0], amount: parseFloat(order[0].amount) || 0 };
  }
}

export const orderManager = new OrderManager();
