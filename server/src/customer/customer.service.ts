import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { PointsRecord } from './points-record.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(PointsRecord) private pointsRecordRepository: Repository<PointsRecord>,
  ) {}

  async findAll(page: number = 1, pageSize: number = 10, search?: string) {
    const queryBuilder = this.customerRepository.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.owner', 'owner');

    if (search) {
      queryBuilder.where(
        '(customer.customerName LIKE :search OR customer.phone LIKE :search OR customer.email LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('customer.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number) {
    const customer = await this.customerRepository.findOne({
      where: { customerId: id },
      relations: ['owner'],
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async create(createCustomerDto: CreateCustomerDto) {
    console.log('=== CustomerService.create 开始 ===');
    console.log('CreateCustomerDto:', JSON.stringify(createCustomerDto, null, 2));
    
    const customerCode = `CUST_${Date.now()}`;
    console.log('生成的客户编码:', customerCode);
    
    const password = createCustomerDto.source === '后台新增' 
      ? '123456' 
      : createCustomerDto.password;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('密码已加密');
    
    const customerData = {
      ...createCustomerDto,
      customerCode,
      password: hashedPassword,
      source: createCustomerDto.source || '后台新增',
      ownerId: createCustomerDto.ownerId || 22,
    };
    console.log('准备保存的数据:', JSON.stringify({
      ...customerData,
      password: '***已加密***'
    }, null, 2));
    
    const customer = this.customerRepository.create(customerData);
    console.log('Customer对象已创建');
    
    const result = await this.customerRepository.save(customer);
    console.log('客户保存成功:', result);
    
    return result;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findOne(id);
    Object.assign(customer, updateCustomerDto);
    return this.customerRepository.save(customer);
  }

  async remove(id: number) {
    const customer = await this.findOne(id);
    return this.customerRepository.remove(customer);
  }

  async getPointsHistory(id: number) {
    const customer = await this.findOne(id);
    return this.pointsRecordRepository.find({
      where: { customerId: id },
      order: { createdAt: 'DESC' },
    });
  }

  async addPoints(id: number, points: number, reason: string) {
    const customer = await this.findOne(id);
    if (points <= 0) {
      throw new BadRequestException('Points must be positive');
    }

    const newBalance = customer.points + points;
    customer.points = newBalance;

    const pointsRecord = this.pointsRecordRepository.create({
      customerId: id,
      type: '获取',
      points,
      balance: newBalance,
      reason,
    });

    await this.customerRepository.save(customer);
    await this.pointsRecordRepository.save(pointsRecord);

    return { customer, pointsRecord };
  }

  async usePoints(id: number, points: number, reason: string) {
    const customer = await this.findOne(id);
    if (points <= 0) {
      throw new BadRequestException('Points must be positive');
    }
    if (customer.points < points) {
      throw new BadRequestException('Insufficient points');
    }

    const newBalance = customer.points - points;
    customer.points = newBalance;

    const pointsRecord = this.pointsRecordRepository.create({
      customerId: id,
      type: '使用',
      points,
      balance: newBalance,
      reason,
    });

    await this.customerRepository.save(customer);
    await this.pointsRecordRepository.save(pointsRecord);

    return { customer, pointsRecord };
  }
}