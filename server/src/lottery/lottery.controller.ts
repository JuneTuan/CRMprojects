import { Controller, Get, Post, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { LotteryService } from './lottery.service';

@Controller('lottery')
export class LotteryController {
  constructor(private readonly lotteryService: LotteryService) {}

  @Post('draw')
  async draw(@Body() body: { customerId: string }) {
    try {
      const data = await this.lotteryService.draw(body.customerId);
      return {
        code: 200,
        msg: '抽奖成功',
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

  @Get('records')
  async getRecords(@Query() query: { customerId: string }) {
    try {
      const data = await this.lotteryService.getRecords(query.customerId);
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

  @Get('count')
  async getTodayCount(@Query() query: { customerId: string }) {
    try {
      const data = await this.lotteryService.getTodayCount(query.customerId);
      return {
        code: 200,
        msg: '获取成功',
        data: { count: data }
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
