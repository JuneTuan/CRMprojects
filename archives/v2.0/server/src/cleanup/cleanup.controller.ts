import { Controller, Get, Post, HttpException, HttpStatus } from '@nestjs/common';
import { CleanupService } from './cleanup.service';

@Controller('cleanup')
export class CleanupController {
  constructor(private readonly cleanupService: CleanupService) {}

  @Get('stats')
  async getStats() {
    try {
      const stats = await this.cleanupService.getCleanupStats();
      return {
        code: 200,
        msg: '获取成功',
        data: stats
      };
    } catch (error: any) {
      throw new HttpException({
        code: 400,
        msg: error.message,
        data: null
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('execute')
  async executeCleanup() {
    try {
      const result = await this.cleanupService.cleanupExpiredData();
      return {
        code: 200,
        msg: '清理完成',
        data: result
      };
    } catch (error: any) {
      throw new HttpException({
        code: 400,
        msg: error.message,
        data: null
      }, HttpStatus.BAD_REQUEST);
    }
  }
}
