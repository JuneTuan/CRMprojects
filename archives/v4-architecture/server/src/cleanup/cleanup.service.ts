import { Injectable } from '@nestjs/common';
import { couponManager } from '../storage/database';
import { CustomerStorage } from '../storage/customer-storage';
import { OrderStorage } from '../storage/order-storage';
import { JsonStorage } from '../storage/json-storage';

export interface CleanupResult {
  expiredCoupons: number;
  invalidCustomers: number;
  invalidOrders: number;
  totalCleaned: number;
}

@Injectable()
export class CleanupService {
  async cleanupExpiredData(): Promise<CleanupResult> {
    const result: CleanupResult = {
      expiredCoupons: 0,
      invalidCustomers: 0,
      invalidOrders: 0,
      totalCleaned: 0
    };

    try {
      result.expiredCoupons = await this.cleanupExpiredCoupons();
      result.invalidCustomers = await this.cleanupInvalidCustomers();
      result.invalidOrders = await this.cleanupInvalidOrders();
      result.totalCleaned = result.expiredCoupons + result.invalidCustomers + result.invalidOrders;
    } catch (error) {
      console.error('数据清理失败:', error);
      throw error;
    }

    return result;
  }

  private async cleanupExpiredCoupons(): Promise<number> {
    const coupons = await couponManager.getCoupons();
    const now = new Date();
    let cleanedCount = 0;

    for (const coupon of coupons) {
      if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
        if (coupon.status === 'claimed') {
          await couponManager.updateCoupon(coupon.id, { status: 'expired' });
          cleanedCount++;
        }
      }
    }

    return cleanedCount;
  }

  private async cleanupInvalidCustomers(): Promise<number> {
    const customers = CustomerStorage.findAll();
    const users = JsonStorage.readData<any>('users');
    let cleanedCount = 0;

    for (const customer of customers) {
      if (customer.userId) {
        const userExists = users.some((u: any) => u.id === customer.userId);
        if (!userExists) {
          CustomerStorage.delete(customer.id);
          cleanedCount++;
        }
      }
    }

    return cleanedCount;
  }

  private async cleanupInvalidOrders(): Promise<number> {
    const orders = OrderStorage.findAll();
    const customers = CustomerStorage.findAll();
    let cleanedCount = 0;

    for (const order of orders) {
      if (order.customerId) {
        const customerExists = customers.some((c: any) => c.id === order.customerId);
        if (!customerExists) {
          OrderStorage.delete(order.id);
          cleanedCount++;
        }
      }
    }

    return cleanedCount;
  }

  async getCleanupStats(): Promise<{
    expiredCoupons: number;
    invalidCustomers: number;
    invalidOrders: number;
    totalDataSize: number;
  }> {
    const coupons = await couponManager.getCoupons();
    const customers = CustomerStorage.findAll();
    const orders = OrderStorage.findAll();
    const users = JsonStorage.readData<any>('users');
    const now = new Date();

    const expiredCoupons = coupons.filter(coupon => 
      coupon.expiryDate && new Date(coupon.expiryDate) < now && coupon.status === 'claimed'
    ).length;

    const invalidCustomers = customers.filter(customer => 
      customer.userId && !users.some((u: any) => u.id === customer.userId)
    ).length;

    const invalidOrders = orders.filter(order => 
      order.customerId && !customers.some((c: any) => c.id === order.customerId)
    ).length;

    const totalDataSize = 
      JSON.stringify(coupons).length +
      JSON.stringify(customers).length +
      JSON.stringify(orders).length +
      JSON.stringify(users).length;

    return {
      expiredCoupons,
      invalidCustomers,
      invalidOrders,
      totalDataSize
    };
  }
}
