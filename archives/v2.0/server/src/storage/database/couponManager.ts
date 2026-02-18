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

  async createCouponFromPrize(data: {
    customerId?: string;
    prizeId: string;
    prizeName: string;
    prizeType: string;
    prizeValue: string;
    expiryDays?: number;
  }): Promise<Coupon> {
    const db = await getDb(schema);
    const expiryDate = data.expiryDays 
      ? new Date(Date.now() + data.expiryDays * 24 * 60 * 60 * 1000)
      : undefined;
    
    const couponData: InsertCoupon = {
      customerId: data.customerId,
      prizeId: data.prizeId,
      prizeName: data.prizeName,
      prizeType: data.prizeType,
      prizeValue: data.prizeValue,
      code: `CPN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'claimed',
      expiryDate
    };
    
    const validated = insertCouponSchema.parse(couponData);
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

  async verifyCoupon(id: string, userId: string): Promise<Coupon | null> {
    const db = await getDb(schema);
    const coupon = await db.select().from(coupons)
      .where(eq(coupons.id, id))
      .limit(1);

    if (!coupon[0]) {
      throw new Error('卡券不存在');
    }

    if (coupon[0].status === 'used') {
      throw new Error('卡券已被核销');
    }

    if (coupon[0].status === 'expired') {
      throw new Error('卡券已过期');
    }

    if (coupon[0].expiryDate && new Date(coupon[0].expiryDate) < new Date()) {
      throw new Error('卡券已过期');
    }

    const updated = await db
      .update(coupons)
      .set({
        status: 'used',
        usedAt: new Date(),
        verifiedBy: userId,
        verifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(coupons.id, id))
      .returning();

    return updated[0] || null;
  }

  async verifyCouponByCode(code: string, userId: string): Promise<Coupon | null> {
    const db = await getDb(schema);
    const coupon = await db.select().from(coupons)
      .where(eq(coupons.code, code))
      .limit(1);

    if (!coupon[0]) {
      throw new Error('卡券不存在');
    }

    if (coupon[0].status === 'used') {
      throw new Error('卡券已被核销');
    }

    if (coupon[0].status === 'expired') {
      throw new Error('卡券已过期');
    }

    if (coupon[0].expiryDate && new Date(coupon[0].expiryDate) < new Date()) {
      throw new Error('卡券已过期');
    }

    const updated = await db
      .update(coupons)
      .set({
        status: 'used',
        usedAt: new Date(),
        verifiedBy: userId,
        verifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(coupons.code, code))
      .returning();

    return updated[0] || null;
  }
}

export const couponManager = new CouponManager();
