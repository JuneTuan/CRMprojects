import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Customer } from '../customer/customer.entity';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';
import { Coupon } from '../coupon/coupon.entity';
import { Activity } from '../activity/activity.entity';
import { Prize } from '../prize/prize.entity';
import { LotteryRecord } from '../lottery/lottery-record.entity';
import { PointsRecord } from '../customer/points-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Order, Product, Coupon, Activity, Prize, LotteryRecord, PointsRecord]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}