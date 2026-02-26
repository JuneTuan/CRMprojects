import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export interface CreateAuditLogDto {
  userId?: number;
  username?: string;
  action: string;
  module?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestUrl?: string;
  requestBody?: string;
  responseStatus?: number;
  responseTime?: number;
  status?: string;
  errorMessage?: string;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog) private auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(createAuditLogDto);
    return await this.auditLogRepository.save(auditLog);
  }

  async findAll(query: any = {}): Promise<{ data: AuditLog[]; total: number }> {
    const { page = 1, limit = 20, userId, action, module, status, startDate, endDate } = query;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('auditLog');

    if (userId) {
      queryBuilder.andWhere('auditLog.userId = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('auditLog.action LIKE :action', { action: `%${action}%` });
    }

    if (module) {
      queryBuilder.andWhere('auditLog.module = :module', { module });
    }

    if (status) {
      queryBuilder.andWhere('auditLog.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('auditLog.createdAt >= :startDate', { startDate: new Date(startDate) });
    }

    if (endDate) {
      queryBuilder.andWhere('auditLog.createdAt <= :endDate', { endDate: new Date(endDate) });
    }

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .orderBy('auditLog.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(logId: number): Promise<AuditLog> {
    return await this.auditLogRepository.findOne({
      where: { logId },
      relations: ['user'],
    });
  }

  async getStatistics(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = await this.auditLogRepository
      .createQueryBuilder('auditLog')
      .where('auditLog.createdAt >= :today', { today })
      .getCount();

    const successLogs = await this.auditLogRepository
      .createQueryBuilder('auditLog')
      .where('auditLog.status = :status', { status: 'success' })
      .getCount();

    const failedLogs = await this.auditLogRepository
      .createQueryBuilder('auditLog')
      .where('auditLog.status = :status', { status: 'failed' })
      .getCount();

    const topActions = await this.auditLogRepository
      .createQueryBuilder('auditLog')
      .select('auditLog.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auditLog.action')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      todayLogs,
      successLogs,
      failedLogs,
      topActions,
    };
  }

  async logLogin(userId: number, username: string, ipAddress: string, userAgent: string, userType: string = 'admin'): Promise<void> {
    const module = userType === 'customer' ? 'H5_AUTH' : 'AUTH';
    const description = userType === 'customer' 
      ? `客户 ${username} 登录H5系统`
      : `管理员 ${username} 登录管理系统`;
    
    await this.create({
      userId,
      username,
      action: 'LOGIN',
      module,
      description,
      ipAddress,
      userAgent,
      status: 'success',
    });
  }

  async logLogout(userId: number, username: string, ipAddress: string): Promise<void> {
    await this.create({
      userId,
      username,
      action: 'LOGOUT',
      module: 'AUTH',
      description: `用户 ${username} 登出系统`,
      ipAddress,
      status: 'success',
    });
  }

  async logAction(
    userId: number,
    username: string,
    action: string,
    module: string,
    description: string,
    ipAddress: string,
    userAgent?: string,
  ): Promise<void> {
    await this.create({
      userId,
      username,
      action,
      module,
      description,
      ipAddress,
      userAgent,
      status: 'success',
    });
  }

  async logError(
    userId: number,
    username: string,
    action: string,
    module: string,
    errorMessage: string,
    ipAddress: string,
    userAgent?: string,
  ): Promise<void> {
    await this.create({
      userId,
      username,
      action,
      module,
      description: `操作失败: ${errorMessage}`,
      ipAddress,
      userAgent,
      status: 'failed',
      errorMessage,
    });
  }
}
