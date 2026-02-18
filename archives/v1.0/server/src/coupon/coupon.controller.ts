import { Controller, Get, Put, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CouponService } from './coupon.service';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get()
  async list(@Query() query: any) {
    try {
      const data = await this.couponService.getCoupons(query);
      return {
        code: 200,
        msg: '获取成功',
        data
      };
    } catch (error: any) {
      throw new HttpException({
        code: 400,
        msg: error.message,
        data: null
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    try {
      const data = await this.couponService.getCouponById(id);
      if (!data) {
        throw new HttpException({
          code: 404,
          msg: '卡券不存在',
          data: null
        }, HttpStatus.NOT_FOUND);
      }
      return {
        code: 200,
        msg: '获取成功',
        data
      };
    } catch (error: any) {
      throw new HttpException({
        code: 400,
        msg: error.message,
        data: null
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id/use')
  async use(@Param('id') id: string) {
    try {
      const data = await this.couponService.useCoupon(id);
      if (!data) {
        throw new HttpException({
          code: 404,
          msg: '卡券不存在',
          data: null
        }, HttpStatus.NOT_FOUND);
      }
      return {
        code: 200,
        msg: '使用成功',
        data
      };
    } catch (error: any) {
      throw new HttpException({
        code: 400,
        msg: error.message,
        data: null
      }, HttpStatus.BAD_REQUEST);
    }
  }
}
