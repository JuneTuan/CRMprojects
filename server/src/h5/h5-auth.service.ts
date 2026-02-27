import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { MemberLevel } from '../member-level/member-level.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MemberLevelService } from '../member-level/member-level.service';

@Injectable()
export class H5AuthService {
  constructor(
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(MemberLevel) private memberLevelRepository: Repository<MemberLevel>,
    private jwtService: JwtService,
    private memberLevelService: MemberLevelService,
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

    // 检查并更新会员等级
    await this.memberLevelService.checkAndUpgradeLevel(customer.customerId);
    
    // 重新加载客户信息以获取最新的会员等级
    const updatedCustomer = await this.customerRepository.findOne({
      where: { customerId: customer.customerId },
      relations: ['memberLevel'],
    });

    const memberLevel = updatedCustomer.memberLevel;

    const payload = { 
      username: updatedCustomer.customerCode, 
      sub: updatedCustomer.customerId, 
      role: 'customer',
      userType: 'customer' 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: updatedCustomer.customerId,
        customerId: updatedCustomer.customerId,
        customerCode: updatedCustomer.customerCode,
        customerName: updatedCustomer.customerName,
        phone: updatedCustomer.phone,
        email: updatedCustomer.email,
        points: updatedCustomer.points,
        level: memberLevel ? memberLevel.levelName : '普通会员',
        levelCode: memberLevel ? memberLevel.levelCode : 'normal',
        levelIcon: memberLevel ? memberLevel.iconCode : 'User',
        avatar: updatedCustomer.avatar,
        position: updatedCustomer.position,
        totalConsumption: updatedCustomer.totalConsumption,
        memberLevelId: updatedCustomer.memberLevelId,
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
      source: registerDto.source || 'H5注册',
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

  async forgotPassword(phone: string) {
    const customer = await this.customerRepository.findOne({
      where: { phone, isActive: true },
    });

    if (!customer) {
      throw new UnauthorizedException('该手机号未注册');
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    customer.password = hashedPassword;
    await this.customerRepository.save(customer);

    console.log(`临时密码已发送到手机号 ${phone}: ${tempPassword}`);
    
    return {
      message: '临时密码已发送到您的手机',
      tempPassword: tempPassword
    };
  }

  async resetPassword(phone: string, oldPassword: string, newPassword: string) {
    const customer = await this.customerRepository.findOne({
      where: { phone, isActive: true },
    });

    if (!customer) {
      throw new UnauthorizedException('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, customer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('原密码错误');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    customer.password = hashedPassword;
    await this.customerRepository.save(customer);

    return {
      message: '密码修改成功'
    };
  }
}