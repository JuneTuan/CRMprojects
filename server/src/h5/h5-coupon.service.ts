import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../coupon/coupon.entity';
import { CustomerCoupon } from '../coupon/customer-coupon.entity';

@Injectable()
export class H5CouponService {
  constructor(
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
    @InjectRepository(CustomerCoupon) private customerCouponRepository: Repository<CustomerCoupon>,
  ) {}

  async getCoupons(customerId: number) {
    const customerCoupons = await this.customerCouponRepository.find({
      where: { customerId },
      relations: ['coupon'],
      order: { receivedAt: 'DESC' },
    });

    return customerCoupons.map(cc => ({
      customerCouponId: cc.id,
      couponName: cc.coupon.couponName,
      couponCode: cc.coupon.couponCode,
      value: cc.coupon.value,
      startTime: cc.coupon.startTime,
      endTime: cc.coupon.endTime,
      status: cc.status,
      usedAt: cc.usedAt
    }));
  }

  async verifyCoupon(code: string, customerId: number) {
    const coupon = await this.couponRepository.findOne({
      where: { couponCode: code },
    });

    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }

    const now = new Date();
    if (coupon.status !== '进行中' || now < coupon.startTime || now > coupon.endTime) {
      throw new NotFoundException('优惠券不可用');
    }

    const existingCustomerCoupon = await this.customerCouponRepository.findOne({
      where: { customerId, couponId: coupon.couponId, status: '未使用' },
    });

    if (!existingCustomerCoupon) {
      throw new NotFoundException('您没有此优惠券');
    }

    return {
      couponId: coupon.couponId,
      couponName: coupon.couponName,
      value: coupon.value
    };
  }
}