import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LotteryRecord } from './lottery-record.entity';
import { ActivityService } from '../activity/activity.service';
import { CustomerService } from '../customer/customer.service';
import { PrizeService } from '../prize/prize.service';
import { CouponService } from '../coupon/coupon.service';
import { CustomerCoupon } from '../coupon/customer-coupon.entity';

@Injectable()
export class LotteryService {
  constructor(
    @InjectRepository(LotteryRecord) private lotteryRecordRepository: Repository<LotteryRecord>,
    @InjectRepository(CustomerCoupon) private customerCouponRepository: Repository<CustomerCoupon>,
    private activityService: ActivityService,
    private customerService: CustomerService,
    private prizeService: PrizeService,
    private couponService: CouponService,
  ) {}

  async findAllRecords() {
    return this.lotteryRecordRepository.find({
      relations: ['customer', 'activity', 'gameType', 'prize'],
      order: { drawTime: 'DESC' },
    });
  }

  async findRecordsByCustomer(customerId: number) {
    await this.customerService.findOne(customerId);

    return this.lotteryRecordRepository.find({
      where: { customerId },
      relations: ['activity', 'gameType', 'prize'],
      order: { drawTime: 'DESC' },
    });
  }

  async getCustomerDrawInfo(customerId: number, activityId: number) {
    const customer = await this.customerService.findOne(customerId);
    const activity = await this.activityService.findOne(activityId);

    const freeDrawsPerActivity = 3;
    const usedFreeDraws = await this.lotteryRecordRepository.count({
      where: { 
        customerId, 
        activityId,
        costPoints: 0 
      },
    });

    const remainingFreeDraws = Math.max(0, freeDrawsPerActivity - usedFreeDraws);
    const canUsePoints = remainingFreeDraws === 0 && customer.points >= activity.minPoints;

    return {
      remainingFreeDraws,
      pointsCost: activity.minPoints,
      customerPoints: customer.points,
      canUsePoints,
      canDraw: remainingFreeDraws > 0 || canUsePoints,
    };
  }

  async draw(customerId: number, activityId: number, gameTypeId: number) {
    const customer = await this.customerService.findOne(customerId);
    const activity = await this.activityService.findOne(activityId);

    if (activity.status !== '进行中') {
      throw new BadRequestException('活动未进行中');
    }

    const now = new Date();
    if (now < activity.startTime || now > activity.endTime) {
      throw new BadRequestException('活动不在有效期内');
    }

    const activityGame = activity.activityGames.find(
      game => game.gameTypeId === gameTypeId && game.isActive,
    );
    if (!activityGame) {
      throw new BadRequestException('该游戏在此活动中不可用');
    }

    const gamePrizes = activityGame.gamePrizes;
    if (!gamePrizes || gamePrizes.length === 0) {
      throw new BadRequestException('该游戏暂无可用奖品');
    }

    const freeDrawsPerActivity = 3;
    const usedFreeDraws = await this.lotteryRecordRepository.count({
      where: { 
        customerId, 
        activityId,
        costPoints: 0 
      },
    });

    const remainingFreeDraws = Math.max(0, freeDrawsPerActivity - usedFreeDraws);
    let costPoints = 0;

    if (remainingFreeDraws > 0) {
      costPoints = 0;
    } else {
      costPoints = activity.minPoints;
      if (customer.points < costPoints) {
        throw new BadRequestException(`积分不足，需要${costPoints}积分`);
      }
    }

    const totalProbability = gamePrizes.reduce((sum, gp) => sum + gp.probability, 0);
    const random = Math.random() * totalProbability;

    let currentProbability = 0;
    let winningPrize = null;

    for (const gp of gamePrizes) {
      currentProbability += gp.probability;
      if (random <= currentProbability) {
        winningPrize = gp.prize;
        break;
      }
    }

    if (winningPrize && winningPrize.remainingQuantity <= 0) {
      winningPrize = null;
    }

    if (costPoints > 0) {
      await this.customerService.usePoints(customerId, costPoints, '抽奖消耗');
    }

    let assignedCouponId = null;
    if (winningPrize && winningPrize.type === '券') {
      const availableCoupons = await this.couponService.findAvailableCoupons();
      if (availableCoupons.length === 0) {
        throw new BadRequestException('暂无可用优惠券');
      }

      const randomCoupon = availableCoupons[Math.floor(Math.random() * availableCoupons.length)];
      
      const customerCoupon = this.customerCouponRepository.create({
        customerId,
        couponId: randomCoupon.couponId,
        status: '未使用',
        receivedAt: new Date(),
      });
      const savedCustomerCoupon = await this.customerCouponRepository.save(customerCoupon);
      assignedCouponId = savedCustomerCoupon.id;

      randomCoupon.remainingQuantity -= 1;
      await this.couponService.update(randomCoupon.couponId, {
        totalQuantity: randomCoupon.totalQuantity,
        remainingQuantity: randomCoupon.remainingQuantity,
      });
    }

    const lotteryRecord = this.lotteryRecordRepository.create({
      customerId,
      activityId,
      gameTypeId,
      prizeId: winningPrize?.prizeId || null,
      prizeName: winningPrize?.prizeName || null,
      couponId: assignedCouponId,
      status: winningPrize ? '未领取' : '未中奖',
      drawCount: 1,
      costPoints,
      drawTime: new Date(),
    });

    if (winningPrize) {
      winningPrize.remainingQuantity -= 1;
      await this.prizeService.update(winningPrize.prizeId, {
        prizeName: winningPrize.prizeName,
        description: winningPrize.description,
        type: winningPrize.type,
        value: winningPrize.value,
        imageUrl: winningPrize.imageUrl,
        quantity: winningPrize.quantity,
        remainingQuantity: winningPrize.remainingQuantity,
        status: winningPrize.status,
      });
    }

    return this.lotteryRecordRepository.save(lotteryRecord);
  }

  async claimPrize(id: number) {
    const lotteryRecord = await this.lotteryRecordRepository.findOne({
      where: { lotteryRecordId: id },
    });
    if (!lotteryRecord) {
      throw new NotFoundException(`抽奖记录不存在`);
    }

    if (lotteryRecord.status !== '未领取') {
      throw new BadRequestException('奖品已领取或未中奖');
    }

    lotteryRecord.status = '已领取';
    lotteryRecord.claimTime = new Date();

    return this.lotteryRecordRepository.save(lotteryRecord);
  }
}