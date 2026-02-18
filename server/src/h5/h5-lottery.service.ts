import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../activity/activity.entity';
import { ActivityGame } from '../activity/activity-game.entity';
import { GameType } from '../activity/game-type.entity';
import { GamePrize } from '../activity/game-prize.entity';
import { Prize } from '../prize/prize.entity';
import { LotteryRecord } from '../lottery/lottery-record.entity';
import { Customer } from '../customer/customer.entity';
import { Coupon } from '../coupon/coupon.entity';
import { CustomerCoupon } from '../coupon/customer-coupon.entity';

@Injectable()
export class H5LotteryService {
  constructor(
    @InjectRepository(Activity) private activityRepository: Repository<Activity>,
    @InjectRepository(ActivityGame) private activityGameRepository: Repository<ActivityGame>,
    @InjectRepository(GameType) private gameTypeRepository: Repository<GameType>,
    @InjectRepository(GamePrize) private gamePrizeRepository: Repository<GamePrize>,
    @InjectRepository(Prize) private prizeRepository: Repository<Prize>,
    @InjectRepository(LotteryRecord) private lotteryRecordRepository: Repository<LotteryRecord>,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
    @InjectRepository(CustomerCoupon) private customerCouponRepository: Repository<CustomerCoupon>,
  ) {}

  async getActivities() {
    const now = new Date();
    const activities = await this.activityRepository.find({
      where: { status: '进行中' },
      relations: ['activityGames', 'activityGames.gameType'],
      order: { createdAt: 'DESC' },
    });

    return activities.map(activity => {
      let gameTypes = activity.activityGames.map(ag => ({
        gameTypeId: ag.gameType.id,
        gameTypeName: ag.gameType.name,
        gameTypeCode: ag.gameType.type,
        costPoints: ag.config?.costPoints || 0,
        maxDrawCount: ag.config?.maxDrawCount || 1
      }));

      if (activity.gameType) {
        gameTypes = gameTypes.filter(gt => gt.gameTypeCode === activity.gameType);
      }

      return {
        activityId: activity.activityId,
        activityName: activity.activityName,
        activityCode: activity.activityCode,
        activityType: activity.activityType,
        description: activity.description,
        startTime: activity.startTime,
        endTime: activity.endTime,
        minPoints: activity.minPoints,
        status: activity.status,
        imageUrl: activity.imageUrl,
        gameTypes: gameTypes
      };
    });
  }

  async getDrawInfo(customerId: number, activityId: number) {
    const activity = await this.activityRepository.findOne({
      where: { activityId, status: '进行中' },
      relations: ['activityGames', 'activityGames.gameType', 'activityGames.gamePrizes', 'activityGames.gamePrizes.prize'],
    });

    if (!activity) {
      throw new NotFoundException('活动不存在或已结束');
    }

    const customer = await this.customerRepository.findOne({
      where: { customerId },
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    let activityGames = activity.activityGames || [];
    activityGames = activityGames.filter(ag => ag.isActive !== false);
    
    if (activity.gameType) {
      activityGames = activityGames.filter(ag => ag.gameType.type === activity.gameType);
    }

    const gameTypeDrawCounts = {};
    for (const activityGame of activityGames) {
      const drawCount = await this.lotteryRecordRepository.count({
        where: { customerId, activityId, gameTypeId: activityGame.gameType.id },
      });
      gameTypeDrawCounts[activityGame.gameType.id] = drawCount;
    }

    const result = {
      activityId: activity.activityId,
      activityName: activity.activityName,
      activityType: activity.activityType,
      description: activity.description,
      startTime: activity.startTime,
      endTime: activity.endTime,
      minPoints: activity.minPoints,
      imageUrl: activity.imageUrl,
      customerPoints: customer.points,
      gameTypes: activityGames.map(ag => ({
        gameTypeId: ag.gameType.id,
        gameTypeName: ag.gameType.name,
        gameTypeCode: ag.gameType.type,
        costPoints: ag.config?.costPoints || 0,
        maxDrawCount: ag.config?.maxDrawCount || 1,
        usedDrawCount: gameTypeDrawCounts[ag.gameType.id] || 0,
        remainingDrawCount: (ag.config?.maxDrawCount || 1) - (gameTypeDrawCounts[ag.gameType.id] || 0),
        prizes: (ag.gamePrizes || []).map(gp => ({
          prizeId: gp.prize.prizeId,
          prizeName: gp.prize.prizeName,
          prizeType: gp.prize.type,
          value: gp.prize.value,
          probability: gp.probability
        }))
      }))
    };

    return result;
  }

  async draw(customerId: number, activityId: number, gameTypeId: number) {
    const activity = await this.activityRepository.findOne({
      where: { activityId, status: '进行中' },
    });

    if (!activity) {
      throw new NotFoundException('活动不存在或已结束');
    }

    const activityGame = await this.activityGameRepository.findOne({
      where: { activityId, gameTypeId, isActive: true },
      relations: ['gameType'],
    });

    if (!activityGame) {
      throw new NotFoundException('游戏类型不存在');
    }

    const costPoints = activityGame.config?.costPoints || 0;
    const maxDrawCount = activityGame.config?.maxDrawCount || 1;

    const customer = await this.customerRepository.findOne({
      where: { customerId },
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    if (customer.points < costPoints) {
      throw new BadRequestException('积分不足');
    }

    const usedDrawCount = await this.lotteryRecordRepository.count({
      where: { customerId, activityId, gameTypeId },
    });

    let actualCostPoints = costPoints;
    
    // 免费抽奖次数用完后，需要消耗积分继续抽奖
    if (costPoints === 0 && usedDrawCount >= maxDrawCount) {
      // 免费次数已用完，需要消耗10积分继续抽奖
      actualCostPoints = 10;
      
      if (customer.points < actualCostPoints) {
        throw new BadRequestException('免费次数已用完，积分不足');
      }
    } else if (costPoints > 0 && customer.points < costPoints) {
      throw new BadRequestException('积分不足');
    }

    const gamePrizes = await this.gamePrizeRepository.find({
      where: { activityGameId: activityGame.id },
      relations: ['prize'],
      order: { id: 'ASC' },
    });

    if (gamePrizes.length === 0) {
      throw new BadRequestException('没有可用的奖品');
    }

    let selectedPrize = null;
    let prizeIndex = -1;
    const random = Math.random() * 100;
    let cumulativeProbability = 0;

    for (let i = 0; i < gamePrizes.length; i++) {
      const gamePrize = gamePrizes[i];
      if (gamePrize.prize.status === '可用' && gamePrize.prize.remainingQuantity > 0) {
        cumulativeProbability += Number(gamePrize.probability);
        if (random <= cumulativeProbability) {
          selectedPrize = gamePrize.prize;
          prizeIndex = i;
          break;
        }
      }
    }

    const lotteryRecord = this.lotteryRecordRepository.create({
      customerId,
      activityId,
      gameTypeId,
      prizeId: selectedPrize ? selectedPrize.prizeId : null,
      prizeName: selectedPrize ? selectedPrize.prizeName : null,
      status: selectedPrize ? '未领取' : '未中奖',
      drawCount: 1,
      costPoints: actualCostPoints,
    });

    await this.lotteryRecordRepository.save(lotteryRecord);

    if (selectedPrize) {
      selectedPrize.remainingQuantity -= 1;
      await this.prizeRepository.save(selectedPrize);

      const couponType = selectedPrize.type === '券' ? '代金券' : '实物券';
      
      const newCoupon = this.couponRepository.create({
        couponCode: `CPN${Date.now()}`,
        couponName: selectedPrize.prizeName,
        type: couponType,
        value: selectedPrize.value,
        startTime: new Date(),
        endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        totalQuantity: 1,
        remainingQuantity: 1,
        maxUsesPerUser: 1,
        status: '进行中',
      });
      await this.couponRepository.save(newCoupon);

      const customerCoupon = this.customerCouponRepository.create({
        customerId,
        couponId: newCoupon.couponId,
        status: '未使用',
      });
      await this.customerCouponRepository.save(customerCoupon);
    }

    customer.points -= actualCostPoints;
    await this.customerRepository.save(customer);

    return {
      lotteryRecordId: lotteryRecord.lotteryRecordId,
      prizeIndex: prizeIndex,
      prize: selectedPrize ? {
        prizeId: selectedPrize.prizeId,
        prizeName: selectedPrize.prizeName,
        prizeType: selectedPrize.type,
        value: selectedPrize.value
      } : null,
      status: selectedPrize ? '未领取' : '未中奖',
      remainingPoints: customer.points
    };
  }

  async getRecords(customerId: number) {
    const records = await this.lotteryRecordRepository.find({
      where: { customerId },
      relations: ['activity', 'gameType', 'prize'],
      order: { drawTime: 'DESC' },
    });

    return records.map(record => ({
      lotteryRecordId: record.lotteryRecordId,
      activityName: record.activity.activityName,
      gameTypeName: record.gameType.name,
      prize: record.prize ? {
        prizeId: record.prize.prizeId,
        prizeName: record.prize.prizeName,
        prizeType: record.prize.type,
        value: record.prize.value
      } : null,
      status: record.status,
      costPoints: record.costPoints,
      drawTime: record.drawTime,
      claimTime: record.claimTime
    }));
  }

  async claimPrize(recordId: number, customerId: number) {
    const record = await this.lotteryRecordRepository.findOne({
      where: { lotteryRecordId: recordId, customerId },
    });

    if (!record) {
      throw new NotFoundException('抽奖记录不存在');
    }

    if (record.status !== '未领取') {
      throw new BadRequestException('该奖品已领取或已过期');
    }

    record.status = '已领取';
    record.claimTime = new Date();

    await this.lotteryRecordRepository.save(record);

    return {
      lotteryRecordId: record.lotteryRecordId,
      status: record.status,
      claimTime: record.claimTime
    };
  }
}