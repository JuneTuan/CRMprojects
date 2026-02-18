import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PointsRuleService } from './points-rule.service';

@Controller('points-rule')
export class PointsRuleController {
  constructor(private readonly pointsRuleService: PointsRuleService) {}

  @Get()
  async getPointsRules(@Query() query: any) {
    const rules = await this.pointsRuleService.getPointsRules(query);
    return {
      code: 200,
      msg: 'success',
      data: rules
    };
  }

  @Get('active')
  async getActivePointsRule() {
    const rule = await this.pointsRuleService.getActivePointsRule();
    return {
      code: 200,
      msg: 'success',
      data: rule
    };
  }

  @Get(':id')
  async getPointsRuleById(@Param('id') id: string) {
    const rule = await this.pointsRuleService.getPointsRuleById(id);
    if (!rule) {
      return {
        code: 404,
        msg: '积分规则不存在',
        data: null
      };
    }
    return {
      code: 200,
      msg: 'success',
      data: rule
    };
  }

  @Post()
  async createPointsRule(@Body() body: any) {
    const rule = await this.pointsRuleService.createPointsRule(body);
    return {
      code: 200,
      msg: '创建成功',
      data: rule
    };
  }

  @Put(':id')
  async updatePointsRule(@Param('id') id: string, @Body() body: any) {
    const rule = await this.pointsRuleService.updatePointsRule(id, body);
    if (!rule) {
      return {
        code: 404,
        msg: '积分规则不存在',
        data: null
      };
    }
    return {
      code: 200,
      msg: '更新成功',
      data: rule
    };
  }

  @Delete(':id')
  async deletePointsRule(@Param('id') id: string) {
    const success = await this.pointsRuleService.deletePointsRule(id);
    if (!success) {
      return {
        code: 404,
        msg: '积分规则不存在',
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
