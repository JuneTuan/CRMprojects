import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { activityManager } from '../storage/database';

@Injectable()
export class ActivityService {
  // 获取所有活动
  async getAll() {
    return await activityManager.getActivities();
  }

  // 获取活动（单个）
  async getById(id: string) {
    const activity = await activityManager.getActivityById(id);
    if (!activity) {
      throw new NotFoundException('活动不存在');
    }
    return activity;
  }

  // 获取当前活动的活动
  async getActive() {
    return await activityManager.getActiveActivity();
  }

  // 创建活动
  async create(data: any) {
    return await activityManager.createActivity(data);
  }

  // 更新活动
  async update(id: string, data: any) {
    return await activityManager.updateActivity(id, data);
  }

  // 删除活动
  async delete(id: string) {
    await activityManager.deleteActivity(id);
  }

  // 获取活动配置
  async getConfigs(activityId: string) {
    return await activityManager.getActivityConfigs(activityId);
  }

  // 添加活动配置
  async addConfig(data: any) {
    return await activityManager.addActivityConfig(data);
  }

  // 更新活动配置
  async updateConfig(id: string, configValue: string) {
    return await activityManager.updateActivityConfig(id, configValue);
  }

  // 删除活动配置
  async deleteConfig(id: string) {
    await activityManager.deleteActivityConfig(id);
  }

  // 获取活动奖品列表
  async getPrizes(activityId: string) {
    return await activityManager.getActivityPrizes(activityId);
  }

  // 添加活动奖品
  async addPrize(data: any) {
    return await activityManager.addActivityPrize(data);
  }

  // 更新活动奖品
  async updatePrize(id: string, data: any) {
    return await activityManager.updateActivityPrize(id, data);
  }

  // 删除活动奖品
  async deletePrize(id: string) {
    await activityManager.deleteActivityPrize(id);
  }

  // 获取游戏类型列表
  getGameTypes() {
    return activityManager.getGameTypes();
  }
}
