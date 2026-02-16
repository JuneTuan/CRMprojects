import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(
    @Query('page') page: any = 1,
    @Query('limit') limit: any = 10,
    @Query('sort') sort: string = 'createdAt',
    @Query('order') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('search') search?: string
  ) {
    return this.orderService.findAll(
      parseInt(page.toString(), 10) || 1,
      parseInt(limit.toString(), 10) || 10,
      sort,
      sortOrder,
      search
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.orderService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId') customerId: number) {
    return this.orderService.findByCustomer(customerId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/pay')
  async payOrder(@Param('id') id: number, @Body('paymentMethod') paymentMethod: string) {
    return this.orderService.payOrder(id, paymentMethod);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/cancel')
  async cancelOrder(@Param('id') id: number, @Body('reason') reason: string) {
    return this.orderService.cancelOrder(id, reason);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.orderService.remove(id);
  }
}