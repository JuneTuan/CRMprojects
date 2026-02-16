import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('coupons')
export class CouponController {
  constructor(private couponService: CouponService) {}

  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId') customerId: number) {
    return this.couponService.findByCustomer(customerId);
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('minLevel') minLevel?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.couponService.findAll(
      parseInt(page),
      parseInt(limit),
      search,
      status,
      minLevel,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.couponService.findOne(id);
  }

  @Get('analysis/overview')
  async getAnalysis() {
    return this.couponService.getAnalysis();
  }

  @Get(':id/statistics')
  async getStatistics(@Param('id') id: number) {
    return this.couponService.getStatistics(id);
  }

  @Get(':id/claim-records')
  async getClaimRecords(
    @Param('id') id: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.couponService.getClaimRecords(
      id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(@Param('id') id: number, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(id, updateCouponDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.couponService.remove(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('customer/:customerId/claim/:couponId')
  async claimCoupon(@Param('customerId') customerId: number, @Param('couponId') couponId: number) {
    return this.couponService.claimCoupon(customerId, couponId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('customer/:customerId/use/:couponId')
  async useCoupon(@Param('customerId') customerId: number, @Param('couponId') couponId: number) {
    return this.couponService.useCoupon(customerId, couponId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('verify')
  async verifyCoupon(@Body() body: { code: string; customerId: number; orderId?: number }) {
    return this.couponService.verifyCoupon(body.code, body.customerId, body.orderId);
  }

  @Post('verify-code')
  async verifyByCode(@Body() body: { code: string }) {
    return this.couponService.verifyByCode(body.code);
  }

  @Get(':id/verification-records')
  async getVerificationRecords(
    @Param('id') id: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.couponService.getVerificationRecords(
      id,
      parseInt(page),
      parseInt(limit),
    );
  }
}