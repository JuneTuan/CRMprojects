import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { PointsRecord } from '../customer/points-record.entity';

@Injectable()
export class H5CustomerService {
  constructor(
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(PointsRecord) private pointsRecordRepository: Repository<PointsRecord>,
  ) {}

  async getCustomerInfo(customerId: number) {
    const customer = await this.customerRepository.findOne({
      where: { customerId },
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    return {
      customerId: customer.customerId,
      customerCode: customer.customerCode,
      customerName: customer.customerName,
      phone: customer.phone,
      email: customer.email,
      points: customer.points,
      level: customer.level,
      avatar: customer.avatar,
      position: customer.position,
      address: customer.address
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
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    return {
      id: customer.customerId,
      customerCode: customer.customerCode,
      customerName: customer.customerName,
      phone: customer.phone,
      email: customer.email,
      points: customer.points,
      level: customer.level,
      avatar: customer.avatar,
      position: customer.position,
      address: customer.address
    };
  }

  async updateProfile(customerId: number, data: any) {
    const customer = await this.customerRepository.findOne({
      where: { customerId },
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

    return {
      id: customer.customerId,
      customerCode: customer.customerCode,
      customerName: customer.customerName,
      phone: customer.phone,
      email: customer.email,
      points: customer.points,
      level: customer.level,
      avatar: customer.avatar,
      position: customer.position,
      address: customer.address
    };
  }
}