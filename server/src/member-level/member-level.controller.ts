import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MemberLevelService } from './member-level.service';

@Controller('member-level')
@UseGuards(AuthGuard('jwt'))
export class MemberLevelController {
  constructor(private readonly memberLevelService: MemberLevelService) {}

  @Get()
  async findAll() {
    return this.memberLevelService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.memberLevelService.findOne(Number(id));
  }

  @Post()
  async create(@Body() createDto: any) {
    return this.memberLevelService.create(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.memberLevelService.update(Number(id), updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.memberLevelService.remove(Number(id));
  }

  @Get('customer/:customerId')
  async getCustomerLevel(@Param('customerId') customerId: string) {
    return this.memberLevelService.getCustomerLevel(Number(customerId));
  }

  @Post('customer/:customerId/adjust')
  async adjustMemberLevel(
    @Param('customerId') customerId: string,
    @Body() body: { newLevelId: number; remark: string },
    @Req() req: any,
  ) {
    const operatorId = req.user?.userId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.memberLevelService.adjustMemberLevel(
      Number(customerId),
      body.newLevelId,
      body.remark,
      operatorId,
      ipAddress,
    );
  }

  @Get('logs/list')
  async getLevelLogs(@Query('customerId') customerId?: string, @Query('limit') limit?: string) {
    return this.memberLevelService.getLevelLogs(
      customerId ? Number(customerId) : undefined,
      limit ? Number(limit) : 50,
    );
  }

  @Get('benefit/:levelId/:key')
  async getBenefit(
    @Param('levelId') levelId: string,
    @Param('key') key: string,
    @Query('defaultValue') defaultValue?: string,
  ) {
    return this.memberLevelService.getBenefit(
      Number(levelId),
      key,
      defaultValue ? JSON.parse(defaultValue) : null,
    );
  }

  @Get('customer/:customerId/benefit/:key')
  async getCustomerBenefit(
    @Param('customerId') customerId: string,
    @Param('key') key: string,
    @Query('defaultValue') defaultValue?: string,
  ) {
    return this.memberLevelService.getCustomerBenefit(
      Number(customerId),
      key,
      defaultValue ? JSON.parse(defaultValue) : null,
    );
  }
}
