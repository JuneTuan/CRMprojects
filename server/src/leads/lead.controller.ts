import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateLeadFollowupDto } from './dto/create-lead-followup.dto';
import { CreateLeadAssignmentDto } from './dto/create-lead-assignment.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';

@Controller('api/v6/leads')
@UseGuards(AuthGuard('jwt'))
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  // Create lead
  @Post()
  async create(@Body() createLeadDto: CreateLeadDto, @Request() req) {
    createLeadDto.createdBy = req.user.userId;
    const lead = await this.leadService.create(createLeadDto);
    return {
      success: true,
      data: lead,
      message: '线索创建成功',
      timestamp: new Date(),
    };
  }

  // Get all leads
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('source') source?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('keyword') keyword?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const result = await this.leadService.findAll(
      parseInt(page, 10),
      parseInt(pageSize, 10),
      status,
      priority,
      source,
      assignedTo ? parseInt(assignedTo, 10) : undefined,
      keyword,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    );

    return {
      success: true,
      data: result,
      message: '操作成功',
      timestamp: new Date(),
    };
  }

  // Update lead
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateLeadDto: UpdateLeadDto, @Request() req) {
    const lead = await this.leadService.update(id, updateLeadDto, req.user.userId);
    return {
      success: true,
      data: lead,
      message: '线索更新成功',
      timestamp: new Date(),
    };
  }

  // Delete lead
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.leadService.remove(id);
    return {
      success: true,
      data: null,
      message: '线索删除成功',
      timestamp: new Date(),
    };
  }

  // Batch delete leads
  @Delete('batch')
  async batchRemove(@Body('ids') ids: number[]) {
    const result = await this.leadService.batchRemove(ids);
    return {
      success: true,
      data: result,
      message: '批量删除成功',
      timestamp: new Date(),
    };
  }

  // Add followup record
  @Post(':id/followups')
  async addFollowup(@Param('id') id: number, @Body() createLeadFollowupDto: CreateLeadFollowupDto, @Request() req) {
    createLeadFollowupDto.leadId = id;
    createLeadFollowupDto.createdBy = req.user.userId;
    const followup = await this.leadService.addFollowup(createLeadFollowupDto);
    return {
      success: true,
      data: followup,
      message: '跟进记录添加成功',
      timestamp: new Date(),
    };
  }

  // Get lead followups
  @Get(':id/followups')
  async getLeadFollowups(@Param('id') id: number) {
    const followups = await this.leadService.getLeadFollowups(id);
    return {
      success: true,
      data: followups,
      message: '操作成功',
      timestamp: new Date(),
    };
  }

  // Assign lead
  @Post(':id/assign')
  async assignLead(@Param('id') id: number, @Body() body: { assignedTo: number; notes?: string }, @Request() req) {
    const lead = await this.leadService.assignLead(id, body.assignedTo, req.user.userId, body.notes);
    return {
      success: true,
      data: lead,
      message: '线索分配成功',
      timestamp: new Date(),
    };
  }

  // Batch assign leads
  @Post('batch-assign')
  async batchAssignLeads(@Body('ids') ids: number[], @Body('assignedTo') assignedTo: number, @Request() req, @Body('notes') notes?: string) {
    const result = await this.leadService.batchAssignLeads(ids, assignedTo, req.user.userId, notes);
    return {
      success: true,
      data: result,
      message: '批量分配成功',
      timestamp: new Date(),
    };
  }

  // Get lead assignments
  @Get(':id/assignments')
  async getLeadAssignments(@Param('id') id: number) {
    const assignments = await this.leadService.getLeadAssignments(id);
    return {
      success: true,
      data: assignments,
      message: '操作成功',
      timestamp: new Date(),
    };
  }

  // Convert lead
  @Post(':id/convert')
  async convertLead(@Param('id') id: number, @Body() convertLeadDto: ConvertLeadDto) {
    const result = await this.leadService.convertLead(id, convertLeadDto);
    return {
      success: true,
      data: result,
      message: '线索转化成功',
      timestamp: new Date(),
    };
  }

  // Close lead
  @Post(':id/close')
  async closeLead(@Param('id') id: number, @Body('closeReason') closeReason: string) {
    const lead = await this.leadService.closeLead(id, closeReason);
    return {
      success: true,
      data: lead,
      message: '线索关闭成功',
      timestamp: new Date(),
    };
  }

  // Get lead by ID
  @Get(':id')
  async findOne(@Param('id') id: number) {
    const lead = await this.leadService.findOne(id);
    return {
      success: true,
      data: lead,
      message: '操作成功',
      timestamp: new Date(),
    };
  }

  // Get lead statistics
  @Get('statistics')
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('assignedTo') assignedTo?: number,
  ) {
    const statistics = await this.leadService.getStatistics(startDate, endDate, assignedTo);
    return {
      success: true,
      data: statistics,
      message: '操作成功',
      timestamp: new Date(),
    };
  }

  // Get lead trends
  @Get('trends')
  async getTrends(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'day',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const trends = await this.leadService.getTrends(period, startDate, endDate);
    return {
      success: true,
      data: trends,
      message: '操作成功',
      timestamp: new Date(),
    };
  }

  // Get source analysis
  @Get('source-analysis')
  async getSourceAnalysis(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const analysis = await this.leadService.getSourceAnalysis(startDate, endDate);
    return {
      success: true,
      data: analysis,
      message: '操作成功',
      timestamp: new Date(),
    };
  }

  // Get salesperson analysis
  @Get('salesperson-analysis')
  async getSalespersonAnalysis(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const analysis = await this.leadService.getSalespersonAnalysis(startDate, endDate);
    return {
      success: true,
      data: analysis,
      message: '操作成功',
      timestamp: new Date(),
    };
  }
}
