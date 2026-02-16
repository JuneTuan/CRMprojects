import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotteryController } from './lottery.controller';
import { LotteryService } from './lottery.service';
import { LotteryRecord } from './lottery-record.entity';
import { CustomerCoupon } from '../coupon/customer-coupon.entity';
import { ActivityModule } from '../activity/activity.module';
import { CustomerModule } from '../customer/customer.module';
import { PrizeModule } from '../prize/prize.module';
import { CouponModule } from '../coupon/coupon.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LotteryRecord, CustomerCoupon]),
    ActivityModule,
    CustomerModule,
    PrizeModule,
    CouponModule,
  ],
  controllers: [LotteryController],
  providers: [LotteryService],
  exports: [LotteryService],
})
export class LotteryModule {}