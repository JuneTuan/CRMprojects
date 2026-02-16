import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { PointsRecordController } from './points-record.controller';
import { PointsRecordService } from './points-record.service';
import { Customer } from './customer.entity';
import { PointsRecord } from './points-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, PointsRecord])],
  controllers: [CustomerController, PointsRecordController],
  providers: [CustomerService, PointsRecordService],
  exports: [CustomerService, PointsRecordService],
})
export class CustomerModule {}