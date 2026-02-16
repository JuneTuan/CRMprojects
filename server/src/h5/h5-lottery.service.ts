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
  ) {}

  async getActivities() {
    const now = new Date();
    const activities = await this.activityRepository.find({
      where: { status: '进行中' },
      relations: ['activityGames', 'activityGames.gameType'],
      order: { createdAt: 'DESC' },
    });

    return activities.map(activity => ({
      activityId: activity.activityId,
      activityName: activity.activityName,
      activityCode: activity.activityCode,
      description: activity.description,
      startTime: activity.startTime,
      endTime: activity.endTime,
      gameTypes: activity.activityGames.map(ag => ({
        gameTypeId: ag.gameType.id,
        gameTypeName: ag.gameType.name,
        gameTypeCode: ag.gameType.type,
        costPoints: ag.config?.costPoints || 0,
        maxDrawCount: ag.config?.maxDrawCount || 1
      }))
    }));
  }

  async getDrawInfo(customerId: number, activityId: number) {
    const activity = await this.activityRepository.findOne({
      where: { activityId, status: '进行中' },
      relations: ['activityGames', 'activityGames.gameType'],
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

    const gameTypeDrawCounts = {};
    for (const activityGame of activity.activityGames) {
      const drawCount = await this.lotteryRecordRepository.count({
        where: { customerId, activityId, gameTypeId: activityGame.gameType.id },
      });
      gameTypeDrawCounts[activityGame.gameType.id] = drawCount;
    }

    return {
      activityId: activity.activityId,
      activityName: activity.activityName,
      customerPoints: customer.points,
      gameTypes: activity.activityGames.map(ag => ({
        gameTypeId: ag.gameType.id,
        gameTypeName: ag.gameType.name,
        gameTypeCode: ag.gameType.type,
        costPoints: ag.config?.costPoints || 0,
        maxDrawCount: ag.config?.maxDrawCount || 1,
        usedDrawCount: gameTypeDrawCounts[ag.gameType.id] || 0,
        remainingDrawCount: (ag.config?.maxDrawCount || 1) - (gameTypeDrawCounts[ag.gameType.id] || 0)
      }))
    };
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

    if (usedDrawCount >= maxDrawCount) {
      throw new BadRequestException('抽奖次数已用完');
    }

    const gamePrizes = await this.gamePrizeRepository.find({
      where: { activityGameId: activityGame.id },
      relations: ['prize'],
    });

    if (gamePrizes.length === 0) {
      throw new BadRequestException('没有可用的奖品');
    }

    let selectedPrize = null;
    const random = Math.random() * 100;
    let cumulativeProbability = 0;

    for (const gamePrize of gamePrizes) {
      if (gamePrize.prize.status === '可用' && gamePrize.prize.remainingQuantity > 0) {
        cumulativeProbability += gamePrize.probability;
        if (random <= cumulativeProbability) {
          selectedPrize = gamePrize.prize;
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
      costPoints: costPoints,
    });

    await this.lotteryRecordRepository.save(lotteryRecord);

    if (selectedPrize) {
      selectedPrize.remainingQuantity -= 1;
      await this.prizeRepository.save(selectedPrize);
    }

    customer.points -= costPoints;
    await this.customerRepository.save(customer);

    return {
      lotteryRecordId: lotteryRecord.lotteryRecordId,
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