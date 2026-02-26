import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('audit-logs')
@UseGuards(AuthGuard('jwt'))
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  @Get()
  async findAll(@Query() query: any) {
    return await this.auditLogService.findAll(query);
  }

  @Get('statistics')
  async getStatistics() {
    return await this.auditLogService.getStatistics();
  }

  @Get(':logId')
  async findOne(@Query('logId') logId: number) {
    return await this.auditLogService.findOne(logId);
  }
}
