import { Module } from '@nestjs/common';
import { PointsHistoryService } from './points-history.service';
import { PointsHistoryController } from './points-history.controller';

@Module({
  controllers: [PointsHistoryController],
  providers: [PointsHistoryService],
  exports: [PointsHistoryService]
})
export class PointsHistoryModule {}