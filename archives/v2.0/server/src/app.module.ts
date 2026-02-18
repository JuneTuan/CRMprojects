import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/auth/auth.module';
import { CustomerModule } from '@/customer/customer.module';
import { ProductModule } from '@/product/product.module';
import { OrderModule } from '@/order/order.module';
import { PrizeModule } from '@/prize/prize.module';
import { LotteryModule } from '@/lottery/lottery.module';
import { CouponModule } from '@/coupon/coupon.module';
import { PointsRuleModule } from '@/points-rule/points-rule.module';
import { LotterySettingModule } from '@/lottery-setting/lottery-setting.module';
import { ActivityModule } from '@/activity/activity.module';
import { StatisticsModule } from '@/statistics/statistics.module';
import { PointsHistoryModule } from '@/points-history/points-history.module';
import { StaffModule } from '@/staff/staff.module';
import { ImportModule } from '@/import/import.module';
import { CleanupModule } from '@/cleanup/cleanup.module';

@Module({
  imports: [
    AuthModule,
    CustomerModule,
    ProductModule,
    OrderModule,
    PrizeModule,
    LotteryModule,
    CouponModule,
    PointsRuleModule,
    LotterySettingModule,
    ActivityModule,
    StatisticsModule,
    PointsHistoryModule,
    StaffModule,
    ImportModule,
    CleanupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
