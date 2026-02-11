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

@Module({
  imports: [
    AuthModule,
    CustomerModule,
    ProductModule,
    OrderModule,
    PrizeModule,
    LotteryModule,
    CouponModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
