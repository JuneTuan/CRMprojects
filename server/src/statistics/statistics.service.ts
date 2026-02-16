import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';
import { Coupon } from '../coupon/coupon.entity';
import { Activity } from '../activity/activity.entity';
import { Prize } from '../prize/prize.entity';
import { LotteryRecord } from '../lottery/lottery-record.entity';
import { PointsRecord } from '../customer/points-record.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
    @InjectRepository(Activity) private activityRepository: Repository<Activity>,
    @InjectRepository(Prize) private prizeRepository: Repository<Prize>,
    @InjectRepository(LotteryRecord) private lotteryRecordRepository: Repository<LotteryRecord>,
    @InjectRepository(PointsRecord) private pointsRecordRepository: Repository<PointsRecord>,
  ) {}

  async getOverview(startDate?: Date, endDate?: Date) {
    try {
      let customerCount = await this.customerRepository.count();
      let orderCount = await this.orderRepository.count();
      let productCount = await this.productRepository.count();
      let couponCount = await this.couponRepository.count();
      let activityCount = await this.activityRepository.count();
      let prizeCount = await this.prizeRepository.count();

      if (startDate && endDate) {
        customerCount = await this.customerRepository
          .createQueryBuilder('customer')
          .where('customer.createdAt >= :startDate', { startDate })
          .andWhere('customer.createdAt <= :endDate', { endDate })
          .getCount();

        orderCount = await this.orderRepository
          .createQueryBuilder('order')
          .where('order.createdAt >= :startDate', { startDate })
          .andWhere('order.createdAt <= :endDate', { endDate })
          .getCount();

        activityCount = await this.activityRepository
          .createQueryBuilder('activity')
          .where('activity.createdAt >= :startDate', { startDate })
          .andWhere('activity.createdAt <= :endDate', { endDate })
          .getCount();

        prizeCount = await this.prizeRepository
          .createQueryBuilder('prize')
          .where('prize.createdAt >= :startDate', { startDate })
          .andWhere('prize.createdAt <= :endDate', { endDate })
          .getCount();
      }

      const totalSales = await this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.actualAmount)', 'total')
        .where('order.status = :status', { status: '已完成' });

      if (startDate && endDate) {
        totalSales.andWhere('order.createdAt >= :startDate', { startDate });
        totalSales.andWhere('order.createdAt <= :endDate', { endDate });
      }

      const totalSalesResult = await totalSales.getRawOne();

      const totalLotteryDraws = await this.lotteryRecordRepository
        .createQueryBuilder('record')
        .where('record.drawTime >= :startDate', { startDate: startDate || new Date(0) })
        .andWhere('record.drawTime <= :endDate', { endDate: endDate || new Date() })
        .getCount();

      const totalWins = await this.lotteryRecordRepository
        .createQueryBuilder('record')
        .select('COUNT(*)', 'count')
        .where('record.prizeId IS NOT NULL');

      if (startDate && endDate) {
        totalWins.andWhere('record.drawTime >= :startDate', { startDate });
        totalWins.andWhere('record.drawTime <= :endDate', { endDate });
      }

      const totalWinsResult = await totalWins.getRawOne();

      return {
        customerCount,
        orderCount,
        productCount,
        couponCount,
        activityCount,
        prizeCount,
        totalSales: totalSalesResult?.total || 0,
        totalLotteryDraws,
        totalWins: totalWinsResult?.count || 0,
      };
    } catch (error) {
      console.error('获取概览数据失败:', error);
      return {
        customerCount: 0,
        orderCount: 0,
        productCount: 0,
        couponCount: 0,
        activityCount: 0,
        prizeCount: 0,
        totalSales: 0,
        totalLotteryDraws: 0,
        totalWins: 0,
      };
    }
  }

  async getSalesStatistics(startDate?: Date, endDate?: Date, dimension: string = 'time') {
    try {
      const dailySales = await this.orderRepository
        .createQueryBuilder('order')
        .select('DATE(order.createdAt) as date, SUM(order.actualAmount) as sales')
        .where('order.status = :status', { status: '已完成' });

      if (startDate && endDate) {
        dailySales.andWhere('order.createdAt >= :startDate', { startDate });
        dailySales.andWhere('order.createdAt <= :endDate', { endDate });
      }

      const dailySalesResult = await dailySales
        .groupBy('DATE(order.createdAt)')
        .orderBy('date', 'ASC')
        .getRawMany();

      const orderStatusDistribution = await this.orderRepository
        .createQueryBuilder('order')
        .select('order.status, COUNT(*) as count');

      if (startDate && endDate) {
        orderStatusDistribution.andWhere('order.createdAt >= :startDate', { startDate });
        orderStatusDistribution.andWhere('order.createdAt <= :endDate', { endDate });
      }

      const orderStatusDistributionResult = await orderStatusDistribution
        .groupBy('order.status')
        .getRawMany();

      return {
        dailySales: dailySalesResult,
        orderStatusDistribution: orderStatusDistributionResult,
      };
    } catch (error) {
      console.error('获取销售统计失败:', error);
      return {
        dailySales: [],
        orderStatusDistribution: [],
      };
    }
  }

  async getCustomerStatistics(startDate?: Date, endDate?: Date, dimension: string = 'time') {
    try {
      const customerGrowth = await this.customerRepository
        .createQueryBuilder('customer')
        .select('DATE(customer.createdAt) as date, COUNT(*) as count');

      if (startDate && endDate) {
        customerGrowth.andWhere('customer.createdAt >= :startDate', { startDate });
        customerGrowth.andWhere('customer.createdAt <= :endDate', { endDate });
      }

      const customerGrowthResult = await customerGrowth
        .groupBy('DATE(customer.createdAt)')
        .orderBy('date', 'ASC')
        .getRawMany();

      const pointsDistribution = await this.customerRepository
        .createQueryBuilder('customer')
        .select('FLOOR(customer.points / 100) * 100 as pointsRange, COUNT(*) as count')
        .groupBy('FLOOR(customer.points / 100)')
        .orderBy('pointsRange', 'ASC')
        .getRawMany();

      return {
        customerGrowth: customerGrowthResult,
        pointsDistribution,
      };
    } catch (error) {
      console.error('获取客户统计失败:', error);
      return {
        customerGrowth: [],
        pointsDistribution: [],
      };
    }
  }

  async getLotteryStatistics(startDate?: Date, endDate?: Date, dimension: string = 'time') {
    try {
      const dailyDraws = await this.lotteryRecordRepository
        .createQueryBuilder('record')
        .select('DATE(record.drawTime) as date, COUNT(*) as draws');

      if (startDate && endDate) {
        dailyDraws.andWhere('record.drawTime >= :startDate', { startDate });
        dailyDraws.andWhere('record.drawTime <= :endDate', { endDate });
      }

      const dailyDrawsResult = await dailyDraws
        .groupBy('DATE(record.drawTime)')
        .orderBy('date', 'ASC')
        .getRawMany();

      const prizeWinDistribution = await this.lotteryRecordRepository
        .createQueryBuilder('record')
        .select('record.prizeId, record.prizeName, COUNT(*) as count')
        .where('record.prizeId IS NOT NULL');

      if (startDate && endDate) {
        prizeWinDistribution.andWhere('record.drawTime >= :startDate', { startDate });
        prizeWinDistribution.andWhere('record.drawTime <= :endDate', { endDate });
      }

      const prizeWinDistributionResult = await prizeWinDistribution
        .groupBy('record.prizeId, record.prizeName')
        .orderBy('count', 'DESC')
        .getRawMany();

      return {
        dailyDraws: dailyDrawsResult,
        prizeWinDistribution: prizeWinDistributionResult,
      };
    } catch (error) {
      console.error('获取抽奖统计失败:', error);
      return {
        dailyDraws: [],
        prizeWinDistribution: [],
      };
    }
  }

  async getActivityStatistics(startDate?: Date, endDate?: Date, dimension: string = 'status') {
    try {
      const activities = await this.activityRepository
        .createQueryBuilder('activity');

      if (startDate && endDate) {
        activities.andWhere('activity.createdAt >= :startDate', { startDate });
        activities.andWhere('activity.createdAt <= :endDate', { endDate });
      }

      const activitiesResult = await activities.getMany();
      const now = new Date();

      const activeActivities = activitiesResult.filter(a => a.status === '进行中');
      const completedActivities = activitiesResult.filter(a => a.status === '已结束');

      const activityStatusDistribution = await this.activityRepository
        .createQueryBuilder('activity')
        .select('activity.status, COUNT(*) as count');

      if (startDate && endDate) {
        activityStatusDistribution.andWhere('activity.createdAt >= :startDate', { startDate });
        activityStatusDistribution.andWhere('activity.createdAt <= :endDate', { endDate });
      }

      const activityStatusDistributionResult = await activityStatusDistribution
        .groupBy('activity.status')
        .getRawMany();

      const activityTypeDistribution = await this.activityRepository
        .createQueryBuilder('activity')
        .select('activity.activityType, COUNT(*) as count');

      if (startDate && endDate) {
        activityTypeDistribution.andWhere('activity.createdAt >= :startDate', { startDate });
        activityTypeDistribution.andWhere('activity.createdAt <= :endDate', { endDate });
      }

      const activityTypeDistributionResult = await activityTypeDistribution
        .groupBy('activity.activityType')
        .getRawMany();

      return {
        totalActivities: activitiesResult.length,
        activeActivities: activeActivities.length,
        completedActivities: completedActivities.length,
        activityStatusDistribution: activityStatusDistributionResult,
        activityTypeDistribution: activityTypeDistributionResult,
      };
    } catch (error) {
      console.error('获取活动统计失败:', error);
      return {
        totalActivities: 0,
        activeActivities: 0,
        completedActivities: 0,
        activityStatusDistribution: [],
        activityTypeDistribution: [],
      };
    }
  }

  async getPrizeStatistics(startDate?: Date, endDate?: Date, dimension: string = 'type') {
    try {
      const prizes = await this.prizeRepository
        .createQueryBuilder('prize');

      if (startDate && endDate) {
        prizes.andWhere('prize.createdAt >= :startDate', { startDate });
        prizes.andWhere('prize.createdAt <= :endDate', { endDate });
      }

      const prizesResult = await prizes.getMany();

      const prizeTypeDistribution = await this.prizeRepository
        .createQueryBuilder('prize')
        .select('prize.type, COUNT(*) as count, SUM(prize.quantity) as totalQuantity, SUM(prize.remainingQuantity) as totalRemaining');

      if (startDate && endDate) {
        prizeTypeDistribution.andWhere('prize.createdAt >= :startDate', { startDate });
        prizeTypeDistribution.andWhere('prize.createdAt <= :endDate', { endDate });
      }

      const prizeTypeDistributionResult = await prizeTypeDistribution
        .groupBy('prize.type')
        .getRawMany();

      const totalIssued = prizesResult.reduce((sum, p) => sum + p.quantity, 0);
      const totalRemaining = prizesResult.reduce((sum, p) => sum + p.remainingQuantity, 0);
      const totalUsed = totalIssued - totalRemaining;

      return {
        totalPrizes: prizesResult.length,
        totalIssued,
        totalRemaining,
        totalUsed,
        usageRate: totalIssued > 0 ? ((totalUsed / totalIssued) * 100).toFixed(2) : 0,
        prizeTypeDistribution: prizeTypeDistributionResult,
      };
    } catch (error) {
      console.error('获取奖品统计失败:', error);
      return {
        totalPrizes: 0,
        totalIssued: 0,
        totalRemaining: 0,
        totalUsed: 0,
        usageRate: 0,
        prizeTypeDistribution: [],
      };
    }
  }

  async getPointsStatistics(startDate?: Date, endDate?: Date, dimension: string = 'time') {
    try {
      const customers = await this.customerRepository.find();
      const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);

      const dailyPointsIssued = await this.pointsRecordRepository
        .createQueryBuilder('record')
        .select('DATE(record.createdAt) as date, SUM(CASE WHEN record.points > 0 THEN record.points ELSE 0 END) as issued, SUM(CASE WHEN record.points < 0 THEN ABS(record.points) ELSE 0 END) as consumed');

      if (startDate && endDate) {
        dailyPointsIssued.andWhere('record.createdAt >= :startDate', { startDate });
        dailyPointsIssued.andWhere('record.createdAt <= :endDate', { endDate });
      }

      const dailyPointsIssuedResult = await dailyPointsIssued
        .groupBy('DATE(record.createdAt)')
        .orderBy('date', 'ASC')
        .limit(30)
        .getRawMany();

      const pointsTypeDistribution = await this.pointsRecordRepository
        .createQueryBuilder('record')
        .select('record.type, COUNT(*) as count, SUM(ABS(record.points)) as total');

      if (startDate && endDate) {
        pointsTypeDistribution.andWhere('record.createdAt >= :startDate', { startDate });
        pointsTypeDistribution.andWhere('record.createdAt <= :endDate', { endDate });
      }

      const pointsTypeDistributionResult = await pointsTypeDistribution
        .groupBy('record.type')
        .getRawMany();

      return {
        totalPoints,
        totalCustomers: customers.length,
        averagePointsPerCustomer: customers.length > 0 ? (totalPoints / customers.length).toFixed(2) : 0,
        dailyPointsIssued: dailyPointsIssuedResult,
        pointsTypeDistribution: pointsTypeDistributionResult,
      };
    } catch (error) {
      console.error('获取积分统计失败:', error);
      return {
        totalPoints: 0,
        totalCustomers: 0,
        averagePointsPerCustomer: 0,
        dailyPointsIssued: [],
        pointsTypeDistribution: [],
      };
    }
  }

  async getCouponStatistics(startDate?: Date, endDate?: Date, dimension: string = 'status') {
    try {
      const coupons = await this.couponRepository
        .createQueryBuilder('coupon');

      if (startDate && endDate) {
        coupons.andWhere('coupon.createdAt >= :startDate', { startDate });
        coupons.andWhere('coupon.createdAt <= :endDate', { endDate });
      }

      const couponsResult = await coupons.getMany();

      const couponStatusDistribution = await this.couponRepository
        .createQueryBuilder('coupon')
        .select('coupon.status, COUNT(*) as count');

      if (startDate && endDate) {
        couponStatusDistribution.andWhere('coupon.createdAt >= :startDate', { startDate });
        couponStatusDistribution.andWhere('coupon.createdAt <= :endDate', { endDate });
      }

      const couponStatusDistributionResult = await couponStatusDistribution
        .groupBy('coupon.status')
        .getRawMany();

      const totalCoupons = couponsResult.length;
      const usedCoupons = couponsResult.filter(c => c.status === '已使用').length;
      const unusedCoupons = couponsResult.filter(c => c.status === '未使用').length;
      const expiredCoupons = couponsResult.filter(c => c.status === '已过期').length;

      return {
        totalCoupons,
        usedCoupons,
        unusedCoupons,
        expiredCoupons,
        usageRate: totalCoupons > 0 ? ((usedCoupons / totalCoupons) * 100).toFixed(2) : 0,
        couponStatusDistribution: couponStatusDistributionResult,
      };
    } catch (error) {
      console.error('获取优惠券统计失败:', error);
      return {
        totalCoupons: 0,
        usedCoupons: 0,
        unusedCoupons: 0,
        expiredCoupons: 0,
        usageRate: 0,
        couponStatusDistribution: [],
      };
    }
  }
}