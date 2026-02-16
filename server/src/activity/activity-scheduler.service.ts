import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Activity } from './activity.entity';

@Injectable()
export class ActivitySchedulerService {
  private readonly logger = new Logger(ActivitySchedulerService.name);

  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async updateActivityStatus() {
    try {
      const now = new Date();

      const activities = await this.activityRepository.find({
        where: [
          { status: '未开始' },
          { status: '进行中' },
        ],
      });

      let updatedCount = 0;

      for (const activity of activities) {
        let needsUpdate = false;
        let newStatus = activity.status;

        if (activity.status === '未开始' && activity.startTime <= now) {
          newStatus = '进行中';
          needsUpdate = true;
          this.logger.log(`活动 ${activity.activityName} (ID: ${activity.activityId}) 开始时间已到，状态更新为进行中`);
        }

        if (activity.status === '进行中' && activity.endTime <= now) {
          newStatus = '已结束';
          needsUpdate = true;
          this.logger.log(`活动 ${activity.activityName} (ID: ${activity.activityId}) 结束时间已到，状态更新为已结束`);
        }

        if (needsUpdate) {
          activity.status = newStatus;
          await this.activityRepository.save(activity);
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        this.logger.log(`活动状态更新完成，共更新 ${updatedCount} 个活动`);
      }
    } catch (error) {
      this.logger.error('更新活动状态时出错:', error);
    }
  }
}