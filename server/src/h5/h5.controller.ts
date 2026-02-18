import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { H5AuthService } from './h5-auth.service';
import { H5OrderService } from './h5-order.service';
import { H5CouponService } from './h5-coupon.service';
import { H5CustomerService } from './h5-customer.service';
import { H5LotteryService } from './h5-lottery.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('h5')
export class H5Controller {
  constructor(
    private h5AuthService: H5AuthService,
    private h5OrderService: H5OrderService,
    private h5CouponService: H5CouponService,
    private h5CustomerService: H5CustomerService,
    private h5LotteryService: H5LotteryService,
  ) {}

  @Post('auth/login')
  async login(@Body() loginDto: any) {
    return this.h5AuthService.login(loginDto);
  }

  @Post('auth/register')
  async register(@Body() registerDto: any) {
    return this.h5AuthService.register(registerDto);
  }

  @UseGuards(AuthGuard('h5-jwt'))
  @Get('orders')
  async getOrders(@Request() req) {
    return this.h5OrderService.getOrders(req.user.customerId);
  }

  @UseGuards(AuthGuard('h5-jwt'))
  @Get('orders/:id')
  async getOrderDetail(@Param('id') id: number, @Request() req) {
    return this.h5OrderService.getOrderDetail(id, req.user.customerId);
  }

  @UseGuards(AuthGuard('h5-jwt'))
  @Get('coupons')
  async getCoupons(@Request() req) {
    return this.h5CouponService.getCoupons(req.user.customerId);
  }

  @UseGuards(AuthGuard('h5-jwt'))
  @Post('coupons/verify')
  async verifyCoupon(@Body() data: any, @Request() req) {
    return this.h5CouponService.verifyCoupon(data.code, req.user.customerId);
  }

  @UseGuards(AuthGuard('h5-jwt'))
  @Get('customer/info')
  async getCustomerInfo(@Request() req) {
    return this.h5CustomerService.getCustomerInfo(req.user.customerId);
  }

  @UseGuards(AuthGuard('h5-jwt'))
  @Get('customer/points-history')
  async getPointsHistory(@Request() req) {
    return this.h5CustomerService.getPointsHistory(req.user.customerId);
  }

  @UseGuards(AuthGuard('h5-jwt'))
  @Get('customer/profile')
  async getProfile(@Request() req) {
    return this.h5CustomerService.getProfile(req.user.customerId);
  }

  @UseGuards(AuthGuard('h5-jwt'))
  @Put('customer/profile')
  async updateProfile(@Body() data: any, @Request() req) {
    return this.h5CustomerService.updateProfile(req.user.customerId, data);
  }

  @UseGuards(AuthGuard('h5-jwt'))
  @Get('activities')
  async getActivities() {
    return this.h5LotteryService.getActivities();
  }

  @UseGuards(AuthGuard('h5-jwt'))
  @Get('lottery/draw-info/:activityId')
  async getDrawInfo(@Param('activityId') activityId: number, @Request() req) {
    return this.h5LotteryService.getDrawInfo(req.user.customerId, activityId);
  }

  @UseGuards(AuthGuard('h5-jwt'))
  @Post('lottery/draw')
  async draw(@Body() data: any, @Request() req) {
    return this.h5LotteryService.draw(req.user.customerId, data.activityId, data.gameTypeId);
  }

  @UseGuards(AuthGuard('h5-jwt'))
  @Get('lottery/records')
  async getRecords(@Request() req) {
    return this.h5LotteryService.getRecords(req.user.customerId);
  }

  @UseGuards(AuthGuard('h5-jwt'))
  @Put('lottery/records/:recordId/claim')
  async claimPrize(@Param('recordId') recordId: number, @Request() req) {
    return this.h5LotteryService.claimPrize(recordId, req.user.customerId);
  }
}