import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { H5Controller } from './h5.controller';
import { H5AuthService } from './h5-auth.service';
import { H5OrderService } from './h5-order.service';
import { H5CouponService } from './h5-coupon.service';
import { H5CustomerService } from './h5-customer.service';
import { H5LotteryService } from './h5-lottery.service';
import { Customer } from '../customer/customer.entity';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';
import { Coupon } from '../coupon/coupon.entity';
import { CustomerCoupon } from '../coupon/customer-coupon.entity';
import { PointsRecord } from '../customer/points-record.entity';
import { Activity } from '../activity/activity.entity';
import { ActivityGame } from '../activity/activity-game.entity';
import { GameType } from '../activity/game-type.entity';
import { GamePrize } from '../activity/game-prize.entity';
import { Prize } from '../prize/prize.entity';
import { LotteryRecord } from '../lottery/lottery-record.entity';
import { MemberLevel } from '../member-level/member-level.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { H5JwtStrategy } from './strategies/h5-jwt.strategy';
import { AuthModule } from '../auth/auth.module';
import { MemberLevelModule } from '../member-level/member-level.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      Order,
      OrderItem,
      Coupon,
      CustomerCoupon,
      PointsRecord,
      Activity,
      ActivityGame,
      GameType,
      GamePrize,
      Prize,
      LotteryRecord,
      MemberLevel,
    ]),
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    PassportModule,
    AuthModule,
    MemberLevelModule,
  ],
  controllers: [H5Controller],
  providers: [
    H5AuthService,
    H5OrderService,
    H5CouponService,
    H5CustomerService,
    H5LotteryService,
    JwtStrategy,
    H5JwtStrategy,
  ],
  exports: [
    H5AuthService,
    H5OrderService,
    H5CouponService,
    H5CustomerService,
    H5LotteryService,
  ],
})
export class H5Module {}