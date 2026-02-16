import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './coupon.entity';
import { CustomerCoupon } from './customer-coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CustomerService } from '../customer/customer.service';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
    @InjectRepository(CustomerCoupon) private customerCouponRepository: Repository<CustomerCoupon>,
    private customerService: CustomerService,
  ) {}

  async findAll(page: number = 1, limit: number = 10, search?: string, status?: string, minLevel?: string, startDate?: string, endDate?: string) {
    const queryBuilder = this.couponRepository.createQueryBuilder('coupon');

    if (search) {
      queryBuilder.andWhere(
        '(coupon.couponCode LIKE :search OR coupon.couponName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('coupon.status = :status', { status });
    }

    if (minLevel) {
      queryBuilder.andWhere('coupon.minLevel = :minLevel', { minLevel });
    }

    if (startDate) {
      queryBuilder.andWhere('coupon.startTime >= :startDate', { startDate });
    }

    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('coupon.endTime <= :endDate', { endDate: endOfDay });
    }

    const [coupons, total] = await queryBuilder
      .orderBy('coupon.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    await this.updateCouponStatus();

    return {
      data: coupons,
      total,
      page,
      limit,
    };
  }

  async updateCouponStatus() {
    const now = new Date();
    
    await this.couponRepository
      .createQueryBuilder()
      .update(Coupon)
      .set({ status: '进行中' })
      .where('startTime <= :now', { now })
      .andWhere('endTime > :now', { now })
      .andWhere('status = :status', { status: '未开始' })
      .execute();

    await this.couponRepository
      .createQueryBuilder()
      .update(Coupon)
      .set({ status: '已结束' })
      .where('endTime <= :now', { now })
      .andWhere('status = :status', { status: '进行中' })
      .execute();
  }

  async findOne(id: number) {
    const coupon = await this.couponRepository.findOne({
      where: { couponId: id },
    });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  async getStatistics(id: number) {
    const coupon = await this.findOne(id);
    
    const claimedCount = await this.customerCouponRepository.count({
      where: { couponId: id },
    });

    const usedCount = await this.customerCouponRepository.count({
      where: { couponId: id, status: '已使用' },
    });

    return {
      couponId: coupon.couponId,
      couponName: coupon.couponName,
      totalQuantity: coupon.totalQuantity,
      remainingQuantity: coupon.remainingQuantity,
      claimedCount,
      usedCount,
      unusedCount: claimedCount - usedCount,
      claimRate: coupon.totalQuantity > 0 ? ((claimedCount / coupon.totalQuantity) * 100).toFixed(2) : '0.00',
      useRate: claimedCount > 0 ? ((usedCount / claimedCount) * 100).toFixed(2) : '0.00',
    };
  }

  async getClaimRecords(couponId: number, page: number = 1, limit: number = 10) {
    await this.findOne(couponId);

    const [records, total] = await this.customerCouponRepository.findAndCount({
      where: { couponId },
      relations: ['customer'],
      order: { receivedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: records,
      total,
      page,
      limit,
    };
  }

  async getAnalysis() {
    const totalCoupons = await this.couponRepository.count();
    
    const activeCoupons = await this.couponRepository.count({
      where: { status: '进行中' },
    });

    const totalQuantity = await this.couponRepository
      .createQueryBuilder('coupon')
      .select('SUM(coupon.totalQuantity)', 'total')
      .getRawOne();

    const totalClaimed = await this.customerCouponRepository.count();

    const totalUsed = await this.customerCouponRepository.count({
      where: { status: '已使用' },
    });

    const statusStats = await this.couponRepository
      .createQueryBuilder('coupon')
      .select('coupon.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('coupon.status')
      .getRawMany();

    return {
      totalCoupons,
      activeCoupons,
      totalQuantity: totalQuantity.total || 0,
      totalClaimed,
      totalUsed,
      totalUnused: totalClaimed - totalUsed,
      claimRate: totalQuantity.total > 0 ? ((totalClaimed / totalQuantity.total) * 100).toFixed(2) : '0.00',
      useRate: totalClaimed > 0 ? ((totalUsed / totalClaimed) * 100).toFixed(2) : '0.00',
      statusStats,
    };
  }

  async create(createCouponDto: CreateCouponDto) {
    const coupon = this.couponRepository.create(createCouponDto);
    return this.couponRepository.save(coupon);
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.findOne(id);
    Object.assign(coupon, updateCouponDto);
    return this.couponRepository.save(coupon);
  }

  async remove(id: number) {
    const coupon = await this.findOne(id);
    return this.couponRepository.remove(coupon);
  }

  async findByCustomer(customerId: number) {
    await this.customerService.findOne(customerId);

    return this.customerCouponRepository.find({
      where: { customerId },
      relations: ['coupon'],
      order: { receivedAt: 'DESC' },
    });
  }

  async claimCoupon(customerId: number, couponId: number) {
    await this.customerService.findOne(customerId);

    const coupon = await this.findOne(couponId);

    const now = new Date();
    if (now < coupon.startTime || now > coupon.endTime) {
      throw new BadRequestException('Coupon is not active');
    }

    if (coupon.remainingQuantity <= 0) {
      throw new BadRequestException('Coupon is out of stock');
    }

    if (coupon.status !== '进行中') {
      throw new BadRequestException('Coupon is not active');
    }

    const existingCustomerCoupon = await this.customerCouponRepository.findOne({
      where: { customerId, couponId },
    });
    if (existingCustomerCoupon) {
      throw new BadRequestException('Customer has already claimed this coupon');
    }

    const customerCoupon = this.customerCouponRepository.create({
      customerId,
      couponId,
      status: '未使用',
      receivedAt: new Date(),
    });

    coupon.remainingQuantity -= 1;

    await this.couponRepository.save(coupon);
    return this.customerCouponRepository.save(customerCoupon);
  }

  async useCoupon(customerId: number, couponId: number) {
    await this.customerService.findOne(customerId);

    const customerCoupon = await this.customerCouponRepository.findOne({
      where: { customerId, couponId, status: '未使用' },
      relations: ['coupon'],
    });

    if (!customerCoupon) {
      throw new NotFoundException('Customer coupon not found or already used');
    }

    const now = new Date();
    if (now > customerCoupon.coupon.endTime) {
      throw new BadRequestException('Coupon has expired');
    }

    customerCoupon.status = '已使用';
    customerCoupon.usedAt = new Date();

    return this.customerCouponRepository.save(customerCoupon);
  }

  async verifyCoupon(code: string, customerId: number, orderId?: number) {
    await this.customerService.findOne(customerId);

    const coupon = await this.couponRepository.findOne({
      where: { couponCode: code },
    });

    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }

    const customerCoupon = await this.customerCouponRepository.findOne({
      where: { customerId, couponId: coupon.couponId },
      relations: ['coupon'],
    });

    if (!customerCoupon) {
      throw new NotFoundException('客户未领取该优惠券');
    }

    if (customerCoupon.status === '已使用') {
      throw new BadRequestException('优惠券已被使用');
    }

    const now = new Date();
    if (now > coupon.endTime) {
      throw new BadRequestException('优惠券已过期');
    }

    if (coupon.status !== '进行中') {
      throw new BadRequestException('优惠券未在有效期内');
    }

    customerCoupon.status = '已使用';
    customerCoupon.usedAt = new Date();
    if (orderId) {
      customerCoupon.orderId = orderId;
    }

    return this.customerCouponRepository.save(customerCoupon);
  }

  async verifyByCode(code: string) {
    const coupon = await this.couponRepository.findOne({
      where: { couponCode: code },
    });

    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }

    const now = new Date();
    if (now < coupon.startTime) {
      throw new BadRequestException('优惠券未开始');
    }

    if (now > coupon.endTime) {
      throw new BadRequestException('优惠券已过期');
    }

    if (coupon.status !== '进行中') {
      throw new BadRequestException('优惠券未在有效期内');
    }

    const customerCoupons = await this.customerCouponRepository.find({
      where: { couponId: coupon.couponId, status: '未使用' },
      relations: ['customer'],
    });

    return {
      couponId: coupon.couponId,
      couponCode: coupon.couponCode,
      couponName: coupon.couponName,
      value: coupon.value,
      startTime: coupon.startTime,
      endTime: coupon.endTime,
      totalQuantity: coupon.totalQuantity,
      remainingQuantity: coupon.remainingQuantity,
      customers: customerCoupons.map(cc => ({
        customerCouponId: cc.id,
        customerId: cc.customerId,
        customerName: cc.customer.customerName,
        customerPhone: cc.customer.phone,
        receivedAt: cc.receivedAt,
      })),
    };
  }

  async getVerificationRecords(couponId: number, page: number = 1, limit: number = 10) {
    await this.findOne(couponId);

    const [records, total] = await this.customerCouponRepository.findAndCount({
      where: { 
        couponId,
        status: '已使用',
      },
      relations: ['customer'],
      order: { usedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: records,
      total,
      page,
      limit,
    };
  }

  async findAvailableCoupons() {
    const coupons = await this.couponRepository.find({
      where: {
        status: '进行中',
      },
    });

    return coupons.filter(coupon => coupon.remainingQuantity > 0);
  }
}