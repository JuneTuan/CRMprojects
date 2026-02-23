import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ActivitySchedulerService } from './activity-scheduler.service';
import { Activity } from './activity.entity';
import { GameType } from './game-type.entity';
import { ActivityGame } from './activity-game.entity';
import { GamePrize } from './game-prize.entity';
import { Prize } from '../prize/prize.entity';
import { LotteryRecord } from '../lottery/lottery-record.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Activity, GameType, ActivityGame, GamePrize, Prize, LotteryRecord]),
  ],
  controllers: [ActivityController],
  providers: [ActivityService, ActivitySchedulerService],
  exports: [ActivityService],
})
export class ActivityModule {}