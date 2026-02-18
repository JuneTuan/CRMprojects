import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { PointsRecord } from '../customer/points-record.entity';
import { MemberLevel } from '../member-level/member-level.entity';

@Injectable()
export class H5CustomerService {
  constructor(
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(PointsRecord) private pointsRecordRepository: Repository<PointsRecord>,
    @InjectRepository(MemberLevel) private memberLevelRepository: Repository<MemberLevel>,
  ) {}

  async getCustomerInfo(customerId: number) {
    const customer = await this.customerRepository.findOne({
      where: { customerId },
      relations: ['memberLevel'],
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    const memberLevel = customer.memberLevel;

    return {
      customerId: customer.customerId,
      customerCode: customer.customerCode,
      customerName: customer.customerName,
      phone: customer.phone,
      email: customer.email,
      points: customer.points,
      level: memberLevel ? memberLevel.levelName : '普通会员',
      levelCode: memberLevel ? memberLevel.levelCode : 'normal',
      levelIcon: memberLevel ? memberLevel.iconCode : 'User',
      avatar: customer.avatar,
      position: customer.position,
      address: customer.address,
      totalConsumption: customer.totalConsumption,
      memberLevelId: customer.memberLevelId,
    };
  }

  async getPointsHistory(customerId: number) {
    const pointsRecords = await this.pointsRecordRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });

    return pointsRecords.map(record => ({
      pointsRecordId: record.id,
      type: record.type,
      points: record.points,
      balance: record.balance,
      reason: record.reason,
      createdAt: record.createdAt
    }));
  }

  async getProfile(customerId: number) {
    const customer = await this.customerRepository.findOne({
      where: { customerId },
      relations: ['memberLevel'],
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    const memberLevel = customer.memberLevel;

    return {
      id: customer.customerId,
      customerCode: customer.customerCode,
      customerName: customer.customerName,
      phone: customer.phone,
      email: customer.email,
      points: customer.points,
      level: memberLevel ? memberLevel.levelName : '普通会员',
      levelCode: memberLevel ? memberLevel.levelCode : 'normal',
      levelIcon: memberLevel ? memberLevel.iconCode : 'User',
      avatar: customer.avatar,
      position: customer.position,
      address: customer.address,
      totalConsumption: customer.totalConsumption,
      memberLevelId: customer.memberLevelId,
    };
  }

  async updateProfile(customerId: number, data: any) {
    const customer = await this.customerRepository.findOne({
      where: { customerId },
      relations: ['memberLevel'],
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    const allowedFields = ['customerName', 'phone', 'email', 'address', 'avatar', 'position'];
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        customer[field] = data[field];
      }
    });

    await this.customerRepository.save(customer);

    const memberLevel = customer.memberLevel;

    return {
      id: customer.customerId,
      customerCode: customer.customerCode,
      customerName: customer.customerName,
      phone: customer.phone,
      email: customer.email,
      points: customer.points,
      level: memberLevel ? memberLevel.levelName : '普通会员',
      levelCode: memberLevel ? memberLevel.levelCode : 'normal',
      levelIcon: memberLevel ? memberLevel.iconCode : 'User',
      avatar: customer.avatar,
      position: customer.position,
      address: customer.address,
      totalConsumption: customer.totalConsumption,
      memberLevelId: customer.memberLevelId,
    };
  }
}