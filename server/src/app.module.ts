import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { CouponModule } from './coupon/coupon.module';
import { ActivityModule } from './activity/activity.module';
import { PrizeModule } from './prize/prize.module';
import { LotteryModule } from './lottery/lottery.module';
import { StatisticsModule } from './statistics/statistics.module';
import { H5Module } from './h5/h5.module';
import { UploadModule } from './upload/upload.module';
import { MemberLevelModule } from './member-level/member-level.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: true,
        charset: 'utf8mb4',
        extra: {
          connectionLimit: 10,
        },
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    CustomerModule,
    ProductModule,
    OrderModule,
    CouponModule,
    ActivityModule,
    PrizeModule,
    LotteryModule,
    StatisticsModule,
    H5Module,
    UploadModule,
    MemberLevelModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}