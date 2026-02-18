import { Controller, Get, Post, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { PointsHistoryService } from './points-history.service';

@Controller('points-history')
export class PointsHistoryController {
  constructor(private readonly pointsHistoryService: PointsHistoryService) {}

  @Get()
  async findAll(@Query('customerId') customerId?: string) {
    try {
      const data = await this.pointsHistoryService.findAll(customerId);
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
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.pointsHistoryService.findOne(id);
      if (!data) {
        throw new HttpException({
          code: 404,
          msg: '积分记录不存在',
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

  @Post()
  async create(@Body() createTransactionDto: any) {
    try {
      const data = await this.pointsHistoryService.create(createTransactionDto);
      return {
        code: 200,
        msg: '创建成功',
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

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const data = await this.pointsHistoryService.remove(id);
      return {
        code: 200,
        msg: '删除成功',
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

  @Get('balance/:customerId')
  async getBalance(@Param('customerId') customerId: string) {
    try {
      const data = await this.pointsHistoryService.getCustomerBalance(customerId);
      return {
        code: 200,
        msg: '获取成功',
        data: { balance: data }
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