import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PointsRecordService } from './points-record.service';

@Controller('points-records')
@UseGuards(AuthGuard('jwt'))
export class PointsRecordController {
  constructor(private readonly pointsRecordService: PointsRecordService) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.pointsRecordService.findAll(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('customer/:customerId')
  async findByCustomerId(
    @Param('customerId') customerId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.pointsRecordService.findByCustomerId(
      parseInt(customerId),
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.pointsRecordService.findOne(parseInt(id));
  }

  @Post()
  async create(@Body() body: {
    customerId: number;
    type: string;
    points: number;
    reason: string;
  }) {
    return this.pointsRecordService.createPointsRecord(
      body.customerId,
      body.type,
      body.points,
      body.reason,
    );
  }
}