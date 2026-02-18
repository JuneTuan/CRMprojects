import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { PrizeService } from './prize.service';

@Controller('prize')
export class PrizeController {
  constructor(private readonly prizeService: PrizeService) {}

  @Get()
  async list(@Query() query: any) {
    try {
      const data = await this.prizeService.getPrizes(query);
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

  @Get('available')
  async getAvailable() {
    try {
      const data = await this.prizeService.getAvailablePrizes();
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
      const data = await this.prizeService.getPrizeById(id);
      if (!data) {
        throw new HttpException({
          code: 404,
          msg: '奖品不存在',
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
  async create(@Body() body: any) {
    try {
      const data = await this.prizeService.createPrize(body);
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

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    try {
      const data = await this.prizeService.updatePrize(id, body);
      if (!data) {
        throw new HttpException({
          code: 404,
          msg: '奖品不存在',
          data: null
        }, HttpStatus.NOT_FOUND);
      }
      return {
        code: 200,
        msg: '更新成功',
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
  async delete(@Param('id') id: string) {
    try {
      const data = await this.prizeService.deletePrize(id);
      return {
        code: 200,
        msg: '删除成功',
        data: { success: data }
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
