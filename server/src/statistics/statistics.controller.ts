import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('statistics')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('overview')
  async getOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.statisticsService.getOverview(start, end);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('sales')
  async getSalesStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('dimension') dimension?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.statisticsService.getSalesStatistics(start, end, dimension);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('customers')
  async getCustomerStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('dimension') dimension?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.statisticsService.getCustomerStatistics(start, end, dimension);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('lottery')
  async getLotteryStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('dimension') dimension?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.statisticsService.getLotteryStatistics(start, end, dimension);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('activities')
  async getActivityStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('dimension') dimension?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.statisticsService.getActivityStatistics(start, end, dimension);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('prizes')
  async getPrizeStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('dimension') dimension?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.statisticsService.getPrizeStatistics(start, end, dimension);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('points')
  async getPointsStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('dimension') dimension?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.statisticsService.getPointsStatistics(start, end, dimension);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('coupons')
  async getCouponStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('dimension') dimension?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.statisticsService.getCouponStatistics(start, end, dimension);
  }
}