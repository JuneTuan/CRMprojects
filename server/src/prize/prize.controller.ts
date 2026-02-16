import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { PrizeService } from './prize.service';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('prizes')
export class PrizeController {
  constructor(private prizeService: PrizeService) {}

  @Get()
  async findAll(@Query('page') page: string = '1', @Query('pageSize') pageSize: string = '10', @Query('keyword') keyword?: string) {
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 10;
    return this.prizeService.findAll(pageNum, pageSizeNum, keyword);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.prizeService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createPrizeDto: CreatePrizeDto) {
    return this.prizeService.create(createPrizeDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(@Param('id') id: number, @Body() updatePrizeDto: UpdatePrizeDto) {
    return this.prizeService.update(id, updatePrizeDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.prizeService.remove(id);
  }
}