import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('permissions')
@UseGuards(AuthGuard('jwt'))
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  @Get()
  async findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.permissionService.findOne(id);
  }

  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.permissionService.remove(id);
  }
}