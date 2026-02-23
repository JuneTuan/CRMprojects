import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { GameType } from './game-type.entity';
import { ActivityGame } from './activity-game.entity';
import { GamePrize } from './game-prize.entity';
import { Prize } from '../prize/prize.entity';
import { LotteryRecord } from '../lottery/lottery-record.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity) private activityRepository: Repository<Activity>,
    @InjectRepository(GameType) private gameTypeRepository: Repository<GameType>,
    @InjectRepository(ActivityGame) private activityGameRepository: Repository<ActivityGame>,
    @InjectRepository(GamePrize) private gamePrizeRepository: Repository<GamePrize>,
    @InjectRepository(Prize) private prizeRepository: Repository<Prize>,
    @InjectRepository(LotteryRecord) private lotteryRecordRepository: Repository<LotteryRecord>,
  ) {}

  async findAll() {
    return this.activityRepository.find({
      relations: ['activityGames', 'activityGames.gameType', 'activityGames.gamePrizes', 'activityGames.gamePrizes.prize'],
    });
  }

  async findOne(id: number) {
    const activity = await this.activityRepository.findOne({
      where: { activityId: id },
      relations: ['activityGames', 'activityGames.gameType', 'activityGames.gamePrizes', 'activityGames.gamePrizes.prize'],
    });
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }

  async create(createActivityDto: CreateActivityDto) {
    const activityData = {
      ...createActivityDto,
      startTime: createActivityDto.startDate ? new Date(createActivityDto.startDate) : undefined,
      endTime: createActivityDto.endDate ? new Date(createActivityDto.endDate) : undefined,
    };
    delete activityData.startDate;
    delete activityData.endDate;
    
    if (activityData.activityType !== '游戏活动') {
      activityData.gameType = null;
      activityData.winRateConfig = null;
    } else {
      if (activityData.winRateConfig && activityData.winRateConfig.length > 0) {
        const totalProbability = activityData.winRateConfig.reduce((sum: number, item: any) => sum + (item.probability || 0), 0);
        if (Math.abs(totalProbability - 100) > 0.01) {
          throw new BadRequestException('总概率必须为100%');
        }

        for (const item of activityData.winRateConfig) {
          if (item.prizeId && item.prizeId !== 0) {
            const prize = await this.prizeRepository.findOne({ where: { prizeId: item.prizeId } });
            if (!prize) {
              throw new BadRequestException(`奖品ID ${item.prizeId} 不存在`);
            }
            if (prize.status !== '可用') {
              throw new BadRequestException(`奖品"${prize.prizeName}"不可用`);
            }
          }
        }
      }
    }
    
    const activity = this.activityRepository.create(activityData);
    
    const now = new Date();
    if (activity.startTime && activity.startTime <= now) {
      activity.status = '进行中';
    }
    if (activity.endTime && activity.endTime <= now) {
      activity.status = '已结束';
    }
    
    const savedActivity = await this.activityRepository.save(activity);
    
    return this.findOne(savedActivity.activityId);
  }

  async update(id: number, updateActivityDto: UpdateActivityDto) {
    const activity = await this.findOne(id);
    const updateData = {
      ...updateActivityDto,
      startTime: updateActivityDto.startDate ? new Date(updateActivityDto.startDate) : activity.startTime,
      endTime: updateActivityDto.endDate ? new Date(updateActivityDto.endDate) : activity.endTime,
    };
    delete updateData.startDate;
    delete updateData.endDate;
    
    if (updateData.activityType && updateData.activityType !== '游戏活动') {
      updateData.gameType = null;
      updateData.winRateConfig = null;
    } else {
      if (updateData.winRateConfig && updateData.winRateConfig.length > 0) {
        const totalProbability = updateData.winRateConfig.reduce((sum: number, item: any) => sum + (item.probability || 0), 0);
        if (Math.abs(totalProbability - 100) > 0.01) {
          throw new BadRequestException('总概率必须为100%');
        }

        for (const item of updateData.winRateConfig) {
          if (item.prizeId && item.prizeId !== 0) {
            const prize = await this.prizeRepository.findOne({ where: { prizeId: item.prizeId } });
            if (!prize) {
              throw new BadRequestException(`奖品ID ${item.prizeId} 不存在`);
            }
            if (prize.status !== '可用') {
              throw new BadRequestException(`奖品"${prize.prizeName}"不可用`);
            }
          }
        }
      }
    }
    
    Object.assign(activity, updateData);
    
    const now = new Date();
    if (activity.startTime && activity.startTime <= now) {
      activity.status = '进行中';
    }
    if (activity.endTime && activity.endTime <= now) {
      activity.status = '已结束';
    }
    
    await this.activityRepository.save(activity);
    
    return this.findOne(id);
  }

  async remove(id: number) {
    const activity = await this.findOne(id);
    
    await this.lotteryRecordRepository.delete({ activityId: id });
    
    const existingGames = await this.activityGameRepository.find({
      where: { activityId: id },
    });
    
    for (const existingGame of existingGames) {
      await this.gamePrizeRepository.delete({ activityGameId: existingGame.id });
    }
    
    await this.activityGameRepository.delete({ activityId: id });
    await this.activityRepository.delete(id);
    
    return { message: 'Activity deleted successfully' };
  }

  async updateActivityGames(activityId: number, gamesData: any) {
    const activity = await this.findOne(activityId);
    
    const existingGames = await this.activityGameRepository.find({
      where: { activityId },
    });
    
    for (const existingGame of existingGames) {
      await this.gamePrizeRepository.delete({ activityGameId: existingGame.id });
    }
    
    await this.activityGameRepository.delete({ activityId });
    
    if (gamesData.games) {
      for (const [gameType, prizes] of Object.entries(gamesData.games)) {
        const gameTypeEntity = await this.gameTypeRepository.findOne({
          where: { type: gameType },
        });
        
        if (!gameTypeEntity) {
          continue;
        }
        
        const activityGame = this.activityGameRepository.create({
          activityId,
          gameTypeId: gameTypeEntity.id,
          isActive: true,
        });
        
        const savedActivityGame = await this.activityGameRepository.save(activityGame);
        
        for (const prize of prizes as any[]) {
          const prizeEntity = await this.prizeRepository.findOne({
            where: { prizeId: prize.prizeId },
          });
          
          if (prizeEntity) {
            const gamePrize = this.gamePrizeRepository.create({
              activityGameId: savedActivityGame.id,
              prizeId: prize.prizeId,
              probability: prize.probability,
            });
            await this.gamePrizeRepository.save(gamePrize);
          }
        }
      }
    }
  }

  async findAllGameTypes() {
    return this.gameTypeRepository.find();
  }

  async createGameType(createGameTypeDto: any) {
    const gameType = this.gameTypeRepository.create(createGameTypeDto);
    return this.gameTypeRepository.save(gameType);
  }

  async addGameToActivity(activityId: number, addGameDto: any) {
    await this.findOne(activityId);

    const gameType = await this.gameTypeRepository.findOne({
      where: { id: addGameDto.gameTypeId },
    });
    if (!gameType) {
      throw new NotFoundException(`Game type with ID ${addGameDto.gameTypeId} not found`);
    }

    const activityGame = this.activityGameRepository.create({
      activityId,
      gameTypeId: addGameDto.gameTypeId,
      config: addGameDto.config,
      isActive: addGameDto.status !== undefined ? addGameDto.status : true,
    });

    return this.activityGameRepository.save(activityGame);
  }

  async addPrizeToGame(activityId: number, gameId: number, addPrizeDto: any) {
    await this.findOne(activityId);

    const activityGame = await this.activityGameRepository.findOne({
      where: { id: gameId, activityId },
    });
    if (!activityGame) {
      throw new NotFoundException(`Game with ID ${gameId} not found in activity ${activityId}`);
    }

    const gamePrize = this.gamePrizeRepository.create({
      activityGameId: gameId,
      prizeId: addPrizeDto.prizeId,
      probability: addPrizeDto.probability || 0,
    });

    return this.gamePrizeRepository.save(gamePrize);
  }
}