import { Module } from "@nestjs/common";
import { CustomerModule } from "@/customer/customer.module";
import { ProductModule } from "@/product/product.module";
import { OrderModule } from "@/order/order.module";
import { PrizeModule } from "@/prize/prize.module";
import { LotteryModule } from "@/lottery/lottery.module";
import { CouponModule } from "@/coupon/coupon.module";
import { PointsRuleModule } from "@/points-rule/points-rule.module";
import { LotterySettingModule } from "@/lottery-setting/lottery-setting.module";
import { ActivityModule } from "@/activity/activity.module";
import { PointsHistoryModule } from "@/points-history/points-history.module";
import { ClientController } from "./client.controller";

@Module({
  imports: [
    CustomerModule,
    ProductModule,
    OrderModule,
    PrizeModule,
    LotteryModule,
    CouponModule,
    PointsRuleModule,
    LotterySettingModule,
    ActivityModule,
    PointsHistoryModule
  ],
  controllers: [ClientController],
  providers: []
})
export class ClientModule {}
