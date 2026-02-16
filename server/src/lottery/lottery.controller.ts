import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { LotteryService } from './lottery.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('lottery')
export class LotteryController {
  constructor(private lotteryService: LotteryService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('records')
  async findAllRecords() {
    return this.lotteryService.findAllRecords();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('records/customer/:customerId')
  async findRecordsByCustomer(@Param('customerId') customerId: number) {
    return this.lotteryService.findRecordsByCustomer(customerId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('draw-info/:customerId/:activityId')
  async getCustomerDrawInfo(@Param('customerId') customerId: number, @Param('activityId') activityId: number) {
    return this.lotteryService.getCustomerDrawInfo(customerId, activityId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('draw')
  async draw(@Body() drawDto: any) {
    return this.lotteryService.draw(drawDto.customerId, drawDto.activityId, drawDto.gameTypeId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('records/:id/claim')
  async claimPrize(@Param('id') id: number) {
    return this.lotteryService.claimPrize(id);
  }
}