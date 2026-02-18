import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberLevel } from './member-level.entity';
import { MemberLevelLog } from './member-level-log.entity';
import { Customer } from '../customer/customer.entity';

@Injectable()
export class MemberLevelService {
  constructor(
    @InjectRepository(MemberLevel)
    private readonly memberLevelRepository: Repository<MemberLevel>,
    @InjectRepository(MemberLevelLog)
    private readonly memberLevelLogRepository: Repository<MemberLevelLog>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async findAll(): Promise<MemberLevel[]> {
    return this.memberLevelRepository.find({
      order: { sortOrder: 'ASC', minConsumption: 'ASC' },
    });
  }

  async findOne(levelId: number): Promise<MemberLevel> {
    const level = await this.memberLevelRepository.findOne({ where: { levelId } });
    if (!level) {
      throw new NotFoundException(`会员等级 ${levelId} 不存在`);
    }
    return level;
  }

  async create(createDto: any): Promise<MemberLevel> {
    const level = this.memberLevelRepository.create(createDto);
    const saved = await this.memberLevelRepository.save(level);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async update(levelId: number, updateDto: any): Promise<MemberLevel> {
    const level = await this.findOne(levelId);
    Object.assign(level, updateDto);
    const saved = await this.memberLevelRepository.save(level);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async remove(levelId: number): Promise<void> {
    const level = await this.findOne(levelId);
    level.isActive = false;
    await this.memberLevelRepository.save(level);
  }

  async calculateLevelByConsumption(totalConsumption: number): Promise<MemberLevel | null> {
    const levels = await this.memberLevelRepository.find({
      where: { isActive: true },
      order: { minConsumption: 'DESC' },
    });

    const consumption = parseFloat(totalConsumption?.toString() || '0');

    for (const level of levels) {
      const levelMinConsumption = parseFloat(level.minConsumption?.toString() || '0');
      if (consumption >= levelMinConsumption) {
        return level;
      }
    }

    return levels.length > 0 ? levels[levels.length - 1] : null;
  }

  async checkAndUpgradeLevel(customerId: number): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { customerId },
      relations: ['memberLevel'],
    });

    if (!customer) {
      throw new NotFoundException(`客户 ${customerId} 不存在`);
    }

    const targetLevel = await this.calculateLevelByConsumption(customer.totalConsumption);

    if (!targetLevel) {
      return;
    }

    const currentLevelId = customer.memberLevelId;

    if (currentLevelId === targetLevel.levelId) {
      return;
    }

    await this.changeMemberLevel(
      customerId,
      currentLevelId,
      targetLevel.levelId,
      'auto_upgrade',
      customer.totalConsumption,
      customer.totalConsumption,
      '自动升级',
      null,
      null,
    );
  }

  async changeMemberLevel(
    customerId: number,
    fromLevelId: number | null,
    toLevelId: number,
    changeType: 'auto_upgrade' | 'manual_adjust' | 'manual_downgrade',
    oldConsumption: number,
    newConsumption: number,
    remark: string,
    operatorId: number | null,
    ipAddress: string | null,
  ): Promise<void> {
    const customer = await this.customerRepository.findOne({ where: { customerId } });
    if (!customer) {
      throw new NotFoundException(`客户 ${customerId} 不存在`);
    }

    const oldLevel = fromLevelId ? await this.memberLevelRepository.findOne({ where: { levelId: fromLevelId } }) : null;
    const newLevel = await this.memberLevelRepository.findOne({ where: { levelId: toLevelId } });
    if (!newLevel) {
      throw new NotFoundException(`目标等级 ${toLevelId} 不存在`);
    }

    customer.memberLevelId = toLevelId;
    customer.totalConsumption = newConsumption;
    await this.customerRepository.save(customer);

    await this.memberLevelLogRepository.save({
      customerId,
      oldLevelId: fromLevelId,
      newLevelId: toLevelId,
      changeType,
      oldConsumption,
      newConsumption,
      remark,
      operatorId,
      ipAddress,
    });
  }

  async adjustMemberLevel(
    customerId: number,
    newLevelId: number,
    remark: string,
    operatorId: number,
    ipAddress?: string,
  ): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { customerId },
      relations: ['memberLevel'],
    });

    if (!customer) {
      throw new NotFoundException(`客户 ${customerId} 不存在`);
    }

    if (!remark || remark.trim() === '') {
      throw new BadRequestException('调整原因不能为空');
    }

    const currentLevelId = customer.memberLevelId;
    const newLevel = await this.memberLevelRepository.findOne({ where: { levelId: newLevelId } });

    if (!newLevel) {
      throw new NotFoundException(`目标等级 ${newLevelId} 不存在`);
    }

    if (currentLevelId === newLevelId) {
      throw new BadRequestException('目标等级与当前等级相同');
    }

    const changeType = newLevel.minConsumption > (customer.memberLevel?.minConsumption || 0)
      ? 'manual_adjust'
      : 'manual_downgrade';

    await this.changeMemberLevel(
      customerId,
      currentLevelId,
      newLevelId,
      changeType,
      customer.totalConsumption,
      customer.totalConsumption,
      remark,
      operatorId,
      ipAddress || null,
    );
  }

  async getCustomerLevel(customerId: number): Promise<any> {
    const customer = await this.customerRepository.findOne({
      where: { customerId },
      relations: ['memberLevel'],
    });

    if (!customer) {
      throw new NotFoundException(`客户 ${customerId} 不存在`);
    }

    const currentLevel = customer.memberLevel;
    const allLevels = await this.findAll();
    const currentLevelIndex = allLevels.findIndex(l => l.levelId === currentLevel?.levelId);
    const nextLevel = currentLevelIndex < allLevels.length - 1 ? allLevels[currentLevelIndex + 1] : null;

    let needConsumption = 0;
    let progressPercent = 0;

    if (nextLevel) {
      needConsumption = Math.max(0, nextLevel.minConsumption - customer.totalConsumption);
      const currentThreshold = currentLevel?.minConsumption || 0;
      const nextThreshold = nextLevel.minConsumption;
      const progressRange = nextThreshold - currentThreshold;
      const currentProgress = customer.totalConsumption - currentThreshold;
      progressPercent = Math.min(100, Math.max(0, (currentProgress / progressRange) * 100));
    }

    return {
      customerId: customer.customerId,
      customerName: customer.customerName,
      totalConsumption: customer.totalConsumption,
      currentLevel: currentLevel ? {
        levelId: currentLevel.levelId,
        levelName: currentLevel.levelName,
        levelCode: currentLevel.levelCode,
        iconCode: currentLevel.iconCode,
        benefitsConfig: currentLevel.benefitsConfig,
      } : null,
      nextLevel: nextLevel ? {
        levelId: nextLevel.levelId,
        levelName: nextLevel.levelName,
        levelCode: nextLevel.levelCode,
        minConsumption: nextLevel.minConsumption,
      } : null,
      needConsumption,
      progressPercent,
    };
  }

  async getLevelLogs(customerId?: number, limit: number = 50): Promise<MemberLevelLog[]> {
    const queryBuilder = this.memberLevelLogRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.customer', 'customer')
      .leftJoinAndSelect('log.oldLevel', 'oldLevel')
      .leftJoinAndSelect('log.newLevel', 'newLevel')
      .leftJoinAndSelect('log.operator', 'operator')
      .orderBy('log.createdAt', 'DESC')
      .limit(limit);

    if (customerId) {
      queryBuilder.andWhere('log.customerId = :customerId', { customerId });
    }

    return queryBuilder.getMany();
  }

  async getBenefit(levelId: number, key: string, defaultValue: any = null): Promise<any> {
    const level = await this.memberLevelRepository.findOne({ where: { levelId } });
    if (!level || !level.benefitsConfig) {
      return defaultValue;
    }

    try {
      const config = typeof level.benefitsConfig === 'string'
        ? JSON.parse(level.benefitsConfig)
        : level.benefitsConfig;
      return config[key] ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  async getCustomerBenefit(customerId: number, key: string, defaultValue: any = null): Promise<any> {
    const customer = await this.customerRepository.findOne({ where: { customerId } });
    if (!customer || !customer.memberLevelId) {
      return defaultValue;
    }

    return this.getBenefit(customer.memberLevelId, key, defaultValue);
  }
}
