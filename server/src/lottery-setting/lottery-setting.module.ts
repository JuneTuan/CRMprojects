import { Module } from '@nestjs/common';
import { LotterySettingController } from './lottery-setting.controller';
import { LotterySettingService } from './lottery-setting.service';

@Module({
  controllers: [LotterySettingController],
  providers: [LotterySettingService],
  exports: [LotterySettingService]
})
export class LotterySettingModule {}
