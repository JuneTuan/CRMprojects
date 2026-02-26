import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuditLogService } from '../audit/audit-log.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private auditLogService: AuditLogService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    const result = await this.authService.login(loginDto);
    
    if (result.user && result.user.userType === 'admin') {
      const ipAddress = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      await this.auditLogService.logLogin(
        result.user.userId,
        result.user.username,
        ipAddress,
        userAgent,
        'admin',
      );
    }
    
    return result;
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }
}