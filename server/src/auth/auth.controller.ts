import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    try {
      console.log('登录请求:', body);
      const result = await this.authService.login(body.username, body.password);
      return {
        code: 200,
        msg: '登录成功',
        data: result
      };
    } catch (error: any) {
      console.error('登录错误:', error.message);
      throw new HttpException(
        {
          code: 400,
          msg: error.message || '登录失败',
          data: null
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('register')
  async register(@Body() body: {
    username: string;
    password: string;
    name: string;
    role: string;
    phone?: string;
  }) {
    try {
      console.log('注册请求:', body);
      const result = await this.authService.register(body);
      return {
        code: 200,
        msg: '注册成功',
        data: result
      };
    } catch (error: any) {
      console.error('注册错误:', error.message);
      throw new HttpException(
        {
          code: 400,
          msg: error.message || '注册失败',
          data: null
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
