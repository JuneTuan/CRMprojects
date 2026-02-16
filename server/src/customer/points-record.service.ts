import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointsRecord } from './points-record.entity';
import { Customer } from './customer.entity';

@Injectable()
export class PointsRecordService {
  constructor(
    @InjectRepository(PointsRecord)
    private pointsRecordRepository: Repository<PointsRecord>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async createPointsRecord(customerId: number, type: string, points: number, reason: string): Promise<PointsRecord> {
    const customer = await this.customerRepository.findOne({ where: { customerId } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const currentBalance = Number(customer.points);
    const newBalance = currentBalance + points;

    const pointsRecord = this.pointsRecordRepository.create({
      customerId,
      type,
      points,
      balance: newBalance,
      reason,
    });

    await this.pointsRecordRepository.save(pointsRecord);

    customer.points = newBalance;
    await this.customerRepository.save(customer);

    return pointsRecord;
  }

  async findByCustomerId(customerId: number, page: number = 1, limit: number = 10) {
    const [records, total] = await this.pointsRecordRepository.findAndCount({
      where: { customerId },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: records,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<PointsRecord> {
    const record = await this.pointsRecordRepository.findOne({
      where: { id },
      relations: ['customer'],
    });
    if (!record) {
      throw new NotFoundException(`Points record with ID ${id} not found`);
    }
    return record;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [records, total] = await this.pointsRecordRepository.findAndCount({
      relations: ['customer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: records,
      total,
      page,
      limit,
    };
  }
}