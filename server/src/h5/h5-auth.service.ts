import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class H5AuthService {
  constructor(
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: any) {
    const customer = await this.customerRepository.findOne({
      where: { customerCode: loginDto.username, isActive: true },
    });

    if (!customer) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, customer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

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
        level: customer.level,
        avatar: customer.avatar,
        position: customer.position
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
      isActive: true,
      source: 'H5注册',
    });
    
    const savedCustomer = await this.customerRepository.save(customer);
    
    const customerWithId = await this.customerRepository.findOne({
      where: { customerCode: savedCustomer.customerCode },
    });

    const payload = { username: customerWithId.customerCode, sub: customerWithId.customerId, role: 'customer', userType: 'customer' };
    const user = { ...customerWithId, password: undefined, userType: 'customer' };
    
    console.log('注册用户ID:', customerWithId.customerId);
    
    return {
      access_token: this.jwtService.sign(payload),
      customerId: customerWithId.customerId,
      user: {
        id: customerWithId.customerId,
        customerId: customerWithId.customerId,
        ...user
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