import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { H5AuthService } from './h5-auth.service';
import { H5OrderService } from './h5-order.service';
import { H5CouponService } from './h5-coupon.service';
import { H5CustomerService } from './h5-customer.service';
import { H5LotteryService } from './h5-lottery.service';
import { AuthGuard } from '@nestjs/passport';
import { AuditLogService } from '../audit/audit-log.service';

@Controller('h5')
export class H5Controller {
  constructor(
    private h5AuthService: H5AuthService,
    private h5OrderService: H5OrderService,
    private h5CouponService: H5CouponService,
    private h5CustomerService: H5CustomerService,
    private h5LotteryService: H5LotteryService,
    private auditLogService: AuditLogService,
  ) {}

  @Post('auth/login')
  async login(@Body() loginDto: any, @Request() req) {
    const ipAddress = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    console.log('H5登录请求开始:', { username: loginDto.username, ipAddress, userAgent });
    
    try {
      const result = await this.h5AuthService.login(loginDto);
      
      console.log('H5登录成功:', { user: result.user });
      
      if (result.user) {
        console.log('开始记录H5登录成功审计日志:', { customerId: result.user.customerId, customerCode: result.user.customerCode });
        try {
          await this.auditLogService.logLogin(
            result.user.customerId,
            result.user.customerCode,
            ipAddress,
            userAgent,
            'customer'
          );
          console.log('H5登录成功审计日志记录完成');
        } catch (auditError) {
          console.error('H5登录成功审计日志记录失败:', auditError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('H5登录失败:', error.message);
      // 登录失败时也记录审计日志
      try {
        await this.auditLogService.create({
          userId: 0,
          username: loginDto.username,
          action: 'LOGIN',
          module: 'H5_AUTH',
          description: `客户 ${loginDto.username} 登录H5系统失败: ${error.message}`,
          ipAddress,
          userAgent,
          status: 'failed',
          errorMessage: error.message,
        });
        console.log('H5登录失败审计日志记录完成');
      } catch (auditError) {
        console.error('H5登录失败审计日志记录失败:', auditError);
      }
      
      throw error;
    }
  }

  @Post('auth/register')
  async register(@Body() registerDto: any) {
    return this.h5AuthService.register(registerDto);
  }

  @Post('auth/forgot-password')
  async forgotPassword(@Body() data: any) {
    return this.h5AuthService.forgotPassword(data.phone);
  }

  @UseGuards(AuthGuard('h5-jwt'))
  @Post('auth/reset-password')
  async resetPassword(@Body() data: any, @Request() req) {
    return this.h5AuthService.resetPassword(data.phone, data.oldPassword, data.newPassword);
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