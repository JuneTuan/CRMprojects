import { eq, and, SQL, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { coupons, insertCouponSchema, updateCouponSchema } from "./shared/schema";
import type { Coupon, InsertCoupon, UpdateCoupon } from "./shared/schema";
import * as schema from "./shared/schema";

export class CouponManager {
  async createCoupon(data: InsertCoupon): Promise<Coupon> {
    const db = await getDb(schema);
    const validated = insertCouponSchema.parse(data);
    const [coupon] = await db.insert(coupons).values(validated).returning();
    return coupon;
  }

  async getCoupons(options: {
    skip?: number;
    limit?: number;
    customerId?: string;
    status?: string;
  } = {}): Promise<Coupon[]> {
    const { skip = 0, limit = 100, customerId, status } = options;
    const db = await getDb(schema);

    const conditions: SQL[] = [];
    if (customerId) {
      conditions.push(eq(coupons.customerId, customerId));
    }
    if (status) {
      conditions.push(eq(coupons.status, status));
    }

    const results = await db.select().from(coupons)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(skip)
      .orderBy(sql`${coupons.createdAt} DESC`);

    return results;
  }

  async getCouponById(id: string): Promise<Coupon | null> {
    const db = await getDb(schema);
    const coupon = await db.select().from(coupons)
      .where(eq(coupons.id, id))
      .limit(1);

    return coupon[0] || null;
  }

  async updateCoupon(id: string, data: UpdateCoupon): Promise<Coupon | null> {
    const db = await getDb(schema);
    const validated = updateCouponSchema.parse(data);
    const coupon = await db
      .update(coupons)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning();

    return coupon[0] || null;
  }

  async useCoupon(id: string): Promise<Coupon | null> {
    const db = await getDb(schema);
    const coupon = await db
      .update(coupons)
      .set({
        status: 'used',
        usedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(coupons.id, id))
      .returning();

    return coupon[0] || null;
  }
}

export const couponManager = new CouponManager();
