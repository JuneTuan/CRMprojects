import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('customers')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);
    return this.customerService.findAll(pageNum, pageSizeNum, search);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.customerService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    console.log('=== 新增客户请求 ===');
    console.log('接收到的数据:', JSON.stringify(createCustomerDto, null, 2));
    try {
      const result = await this.customerService.create(createCustomerDto);
      console.log('新增客户成功:', result);
      return result;
    } catch (error) {
      console.error('新增客户失败:', error);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(@Param('id') id: number, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.customerService.remove(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/points-history')
  async getPointsHistory(@Param('id') id: number) {
    return this.customerService.getPointsHistory(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/add-points')
  async addPoints(@Param('id') id: number, @Body('points') points: number, @Body('reason') reason: string) {
    return this.customerService.addPoints(id, points, reason);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/use-points')
  async usePoints(@Param('id') id: number, @Body('points') points: number, @Body('reason') reason: string) {
    return this.customerService.usePoints(id, points, reason);
  }
}