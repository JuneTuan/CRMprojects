import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { LotterySettingService } from './lottery-setting.service';

@Controller('lottery-setting')
export class LotterySettingController {
  constructor(private readonly lotterySettingService: LotterySettingService) {}

  @Get()
  async getLotterySettings(@Query() query: any) {
    const settings = await this.lotterySettingService.getLotterySettings(query);
    return {
      code: 200,
      msg: 'success',
      data: settings
    };
  }

  @Get('active')
  async getActiveLotterySetting() {
    const setting = await this.lotterySettingService.getActiveLotterySetting();
    return {
      code: 200,
      msg: 'success',
      data: setting
    };
  }

  @Get(':id')
  async getLotterySettingById(@Param('id') id: string) {
    const setting = await this.lotterySettingService.getLotterySettingById(id);
    if (!setting) {
      return {
        code: 404,
        msg: '抽奖配置不存在',
        data: null
      };
    }
    return {
      code: 200,
      msg: 'success',
      data: setting
    };
  }

  @Post()
  async createLotterySetting(@Body() body: any) {
    const setting = await this.lotterySettingService.createLotterySetting(body);
    return {
      code: 200,
      msg: '创建成功',
      data: setting
    };
  }

  @Put(':id')
  async updateLotterySetting(@Param('id') id: string, @Body() body: any) {
    const setting = await this.lotterySettingService.updateLotterySetting(id, body);
    if (!setting) {
      return {
        code: 404,
        msg: '抽奖配置不存在',
        data: null
      };
    }
    return {
      code: 200,
      msg: '更新成功',
      data: setting
    };
  }

  @Delete(':id')
  async deleteLotterySetting(@Param('id') id: string) {
    const success = await this.lotterySettingService.deleteLotterySetting(id);
    if (!success) {
      return {
        code: 404,
        msg: '抽奖配置不存在',
        data: null
      };
    }
    return {
      code: 200,
      msg: '删除成功',
      data: null
    };
  }
}
