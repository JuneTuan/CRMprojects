import { Injectable } from '@nestjs/common';
import { lotteryManager, prizeManager, couponManager, customerManager } from '../storage/database';

@Injectable()
export class LotteryService {
  async draw(customerId: string) {
    const customer = await customerManager.getCustomerById(customerId);
    if (!customer) {
      throw new Error('客户不存在');
    }

    const todayCount = await lotteryManager.getTodayLotteryCount(customerId);
    if (todayCount >= 3) {
      throw new Error('今日抽奖次数已用完');
    }

    const prizes = await prizeManager.getAvailablePrizes();
    if (prizes.length === 0) {
      throw new Error('暂无可用奖品');
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
      isWon
    };
  }

  private randomPrize(prizes: any[]): any | null {
    const WIN_RATE = 0.95;

    if (Math.random() > WIN_RATE) {
      return null;
    }

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
}
