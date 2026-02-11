import { Injectable } from '@nestjs/common';
import { couponManager } from '../storage/database';

@Injectable()
export class CouponService {
  async getCoupons(query: any) {
    const { skip, limit, customerId, status } = query;
    return couponManager.getCoupons({
      skip: skip ? parseInt(skip) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      customerId,
      status
    });
  }

  async getCouponById(id: string) {
    return couponManager.getCouponById(id);
  }

  async useCoupon(id: string) {
    const coupon = await couponManager.getCouponById(id);
    if (!coupon) {
      throw new Error('卡券不存在');
    }
    if (coupon.status !== 'claimed') {
      throw new Error('卡券状态不正确');
    }
    return couponManager.useCoupon(id);
  }
}
