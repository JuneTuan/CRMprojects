import { Module } from '@nestjs/common';
import { PointsRuleController } from './points-rule.controller';
import { PointsRuleService } from './points-rule.service';

@Module({
  controllers: [PointsRuleController],
  providers: [PointsRuleService],
  exports: [PointsRuleService]
})
export class PointsRuleModule {}
