import { Injectable } from '@nestjs/common';
import { lotteryManager, prizeManager, couponManager, customerManager, lotterySettingManager, activityManager } from '../storage/database';

@Injectable()
export class LotteryService {
  async draw(customerId: string, activityId?: string, usePoints: boolean = false) {
    const customer = await customerManager.getCustomerById(customerId);
    if (!customer) {
      throw new Error('客户不存在');
    }

    // 优先使用活动配置，否则使用全局配置
    let freeDrawsPerDay = 3;
    let pointsPerDraw = 10;
    let enablePointsDraw = true;

    if (activityId) {
      const activity = await activityManager.getActivityById(activityId);
      if (activity) {
        freeDrawsPerDay = activity.dailyFreeDraws || 3;
        pointsPerDraw = activity.pointsPerDraw || 10;
        enablePointsDraw = activity.pointsEnabled !== false;
      }
    } else {
      // 使用全局配置
      const lotterySetting = await lotterySettingManager.getActiveLotterySetting();
      freeDrawsPerDay = lotterySetting?.freeDrawsPerDay || 3;
      pointsPerDraw = lotterySetting?.pointsPerDraw || 10;
      enablePointsDraw = lotterySetting?.enablePointsDraw !== false;
    }

    // 检查今日免费抽奖次数
    const todayCount = await lotteryManager.getTodayLotteryCount(customerId);

    // 判断是免费抽奖还是积分抽奖
    let isPointsDraw = usePoints;
    let pointsConsumed = 0;

    if (todayCount < freeDrawsPerDay) {
      // 还有免费次数
      isPointsDraw = false;
    } else if (usePoints && enablePointsDraw) {
      // 主动使用积分抽奖
      isPointsDraw = true;
    } else if (todayCount >= freeDrawsPerDay && !enablePointsDraw) {
      // 免费次数用完且未启用积分抽奖
      throw new Error('今日免费抽奖次数已用完');
    } else {
      // 免费次数用完，需要消耗积分
      isPointsDraw = true;
    }

    // 积分抽奖检查
    if (isPointsDraw) {
      if (!enablePointsDraw) {
        throw new Error('积分抽奖未启用');
      }
      if ((customer.points || 0) < pointsPerDraw) {
        throw new Error(`积分不足，需要${pointsPerDraw}积分`);
      }
    }

    const prizes = await prizeManager.getAvailablePrizes();
    if (prizes.length === 0) {
      throw new Error('暂无可用奖品');
    }

    // 扣除积分（如果是积分抽奖）
    if (isPointsDraw) {
      await customerManager.updateCustomer(customerId, {
        points: (customer.points || 0) - pointsPerDraw
      });
      pointsConsumed = pointsPerDraw;
    }

    const result = this.randomPrize(prizes);
    const isWon = result !== null;

    const record = await lotteryManager.createLotteryRecord({
      customerId,
      prizeId: isWon ? result!.id : null,
      isWon,
      result: isWon ? `恭喜获得${result!.name}` : '很遗憾，未中奖'
    });

    if (isWon && result) {
      await prizeManager.decreasePrizeQuantity(result.id);

      if (result.type === 'coupon' || result.type === 'redpacket') {
        await couponManager.createCoupon({
          customerId,
          prizeId: result.id,
          code: `CPN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          status: 'claimed'
        });
      }
    }

    return {
      record,
      prize: result,
      isWon,
      isPointsDraw,
      pointsConsumed
    };
  }

  private randomPrize(prizes: any[]): any | null {
    const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
    let random = Math.random() * totalProbability;

    for (const prize of prizes) {
      if (prize.remainingQuantity <= 0) continue;

      random -= prize.probability;
      if (random <= 0) {
        return prize;
      }
    }

    return prizes.find(p => p.remainingQuantity > 0) || null;
  }

  async getRecords(customerId: string) {
    return lotteryManager.getLotteryRecords(customerId);
  }

  async getTodayCount(customerId: string) {
    return lotteryManager.getTodayLotteryCount(customerId);
  }

  async resetTodayCount(customerId: string) {
    await lotteryManager.resetTodayLotteryCount(customerId);
  }
}
