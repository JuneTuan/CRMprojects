import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { MemberLevel } from '../member-level/member-level.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class H5AuthService {
  constructor(
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(MemberLevel) private memberLevelRepository: Repository<MemberLevel>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: any) {
    const customer = await this.customerRepository.findOne({
      where: { customerCode: loginDto.username, isActive: true },
      relations: ['memberLevel'],
    });

    if (!customer) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, customer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const memberLevel = customer.memberLevel;

    const payload = { 
      username: customer.customerCode, 
      sub: customer.customerId, 
      role: 'customer',
      userType: 'customer' 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: customer.customerId,
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
        totalConsumption: customer.totalConsumption,
        memberLevelId: customer.memberLevelId,
      },
    };
  }

  async register(registerDto: any) {
    const existingCustomer = await this.customerRepository.findOne({
      where: { customerCode: registerDto.username },
    });

    if (existingCustomer) {
      throw new ConflictException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const customer = this.customerRepository.create({
      customerName: registerDto.name,
      customerCode: registerDto.username,
      password: hashedPassword,
      phone: registerDto.phone,
      email: registerDto.email,
      points: 0,
      level: '普通会员',
      memberLevelId: 1,
      totalConsumption: 0,
      isActive: true,
      source: 'H5注册',
    });
    
    const savedCustomer = await this.customerRepository.save(customer);
    
    const customerWithId = await this.customerRepository.findOne({
      where: { customerCode: savedCustomer.customerCode },
      relations: ['memberLevel'],
    });

    const payload = { username: customerWithId.customerCode, sub: customerWithId.customerId, role: 'customer', userType: 'customer' };
    const user = { ...customerWithId, password: undefined, userType: 'customer' };
    
    const memberLevel = customerWithId.memberLevel;
    
    console.log('注册用户ID:', customerWithId.customerId);
    
    return {
      access_token: this.jwtService.sign(payload),
      customerId: customerWithId.customerId,
      user: {
        id: customerWithId.customerId,
        customerId: customerWithId.customerId,
        customerCode: customerWithId.customerCode,
        customerName: customerWithId.customerName,
        phone: customerWithId.phone,
        email: customerWithId.email,
        points: customerWithId.points,
        level: memberLevel ? memberLevel.levelName : '普通会员',
        levelCode: memberLevel ? memberLevel.levelCode : 'normal',
        levelIcon: memberLevel ? memberLevel.iconCode : 'User',
        avatar: customerWithId.avatar,
        position: customerWithId.position,
        totalConsumption: customerWithId.totalConsumption,
        memberLevelId: customerWithId.memberLevelId,
      },
    };
  }

  async getProfile(user: any) {
    const customer = await this.customerRepository.findOne({
      where: { customerId: user.customerId || user.sub },
    });

    if (!customer) {
      throw new UnauthorizedException('用户不存在');
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
      position: customer.position
    };
  }
}