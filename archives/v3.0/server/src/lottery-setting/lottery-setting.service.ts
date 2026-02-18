import { Injectable } from '@nestjs/common';
import { lotterySettingManager } from '../storage/database';

@Injectable()
export class LotterySettingService {
  async getLotterySettings(query: any) {
    const { skip, limit } = query;
    return lotterySettingManager.getLotterySettings({
      skip: skip ? parseInt(skip) : undefined,
      limit: limit ? parseInt(limit) : undefined
    });
  }

  async getLotterySettingById(id: string) {
    return lotterySettingManager.getLotterySettingById(id);
  }

  async getActiveLotterySetting() {
    return lotterySettingManager.getActiveLotterySetting();
  }

  async createLotterySetting(data: any) {
    return lotterySettingManager.createLotterySetting(data);
  }

  async updateLotterySetting(id: string, data: any) {
    return lotterySettingManager.updateLotterySetting(id, data);
  }

  async deleteLotterySetting(id: string) {
    return lotterySettingManager.deleteLotterySetting(id);
  }
}
