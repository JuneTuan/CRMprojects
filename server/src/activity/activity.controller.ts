import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  // 获取所有活动
  @Get()
  async list() {
    try {
      const data = await this.activityService.getAll();
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

  // 获取游戏类型列表
  @Get('game-types')
  async getGameTypes() {
    try {
      const data = this.activityService.getGameTypes();
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

  // 获取当前活动的活动
  @Get('active')
  async getActive() {
    try {
      const data = await this.activityService.getActive();
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

  // 获取单个活动
  @Get(':id')
  async get(@Param('id') id: string) {
    try {
      const data = await this.activityService.getById(id);
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

  // 创建活动
  @Post()
  async create(@Body() body: any) {
    try {
      const data = await this.activityService.create(body);
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

  // 更新活动
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    try {
      const data = await this.activityService.update(id, body);
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

  // 删除活动
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.activityService.delete(id);
      return {
        code: 200,
        msg: '删除成功',
        data: null
      };
    } catch (error: any) {
      throw new HttpException({
        code: 400,
        msg: error.message,
        data: null
      }, HttpStatus.BAD_REQUEST);
    }
  }

  // 获取活动配置
  @Get(':id/configs')
  async getConfigs(@Param('id') id: string) {
    try {
      const data = await this.activityService.getConfigs(id);
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

  // 添加活动配置
  @Post(':id/configs')
  async addConfig(@Param('id') id: string, @Body() body: any) {
    try {
      const data = await this.activityService.addConfig({
        ...body,
        activityId: id
      });
      return {
        code: 200,
        msg: '添加成功',
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

  // 获取活动奖品列表
  @Get(':id/prizes')
  async getPrizes(@Param('id') id: string) {
    try {
      const data = await this.activityService.getPrizes(id);
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

  // 添加活动奖品
  @Post(':id/prizes')
  async addPrize(@Param('id') id: string, @Body() body: any) {
    try {
      const data = await this.activityService.addPrize({
        ...body,
        activityId: id
      });
      return {
        code: 200,
        msg: '添加成功',
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
