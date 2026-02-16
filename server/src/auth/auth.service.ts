import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Customer } from '../customer/customer.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['role'],
    });

    if (!user) {
      const customer = await this.customerRepository.findOne({
        where: { customerCode: username, isActive: true },
      });

      if (!customer) {
        throw new UnauthorizedException('用户名或密码错误');
      }

      const isPasswordValid = await bcrypt.compare(password, customer.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('用户名或密码错误');
      }

      const { password: _, ...result } = customer;
      return { ...result, userType: 'customer' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('用户已被禁用');
    }

    const { password: _, ...result } = user;
    return { ...result, userType: 'admin' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    const payload = { 
      username: user.customerCode || user.username, 
      sub: user.customerId || user.userId, 
      role: user.role?.name || 'customer',
      userType: user.userType 
    };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.customerRepository.findOne({
      where: { customerCode: registerDto.username },
    });

    if (existingUser) {
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
    });
    await this.customerRepository.save(customer);

    const payload = { username: customer.customerCode, sub: customer.customerId, role: 'customer', userType: 'customer' };
    return {
      access_token: this.jwtService.sign(payload),
      user: { ...customer, password: undefined, userType: 'customer' },
    };
  }

  async findUserById(id: number) {
    let user = await this.userRepository.findOne({
      where: { userId: id },
      relations: ['role'],
    });

    if (!user) {
      user = await this.customerRepository.findOne({
        where: { customerId: id },
      }) as any;
    }

    return user;
  }
}