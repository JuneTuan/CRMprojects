import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberLevelService } from './member-level.service';
import { MemberLevelController } from './member-level.controller';
import { MemberLevel } from './member-level.entity';
import { MemberLevelLog } from './member-level-log.entity';
import { Customer } from '../customer/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemberLevel, MemberLevelLog, Customer])],
  controllers: [MemberLevelController],
  providers: [MemberLevelService],
  exports: [MemberLevelService],
})
export class MemberLevelModule {}
