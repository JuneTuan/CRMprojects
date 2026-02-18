import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../customer/customer.entity';

@Injectable()
export class H5JwtStrategy extends PassportStrategy(Strategy, 'h5-jwt') {
  constructor(
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key',
    });
  }

  async validate(payload: any) {
    const customer = await this.customerRepository.findOne({
      where: { customerId: payload.sub, isActive: true },
    });

    if (!customer) {
      throw new UnauthorizedException('客户不存在或已被禁用');
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
      userType: 'customer',
    };
  }
}
