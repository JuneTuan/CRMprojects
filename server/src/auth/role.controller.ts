import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from './role-permission.entity';
import { Permission } from './permission.entity';

@Controller('roles')
@UseGuards(AuthGuard('jwt'))
export class RoleController {
  constructor(
    private roleService: RoleService,
    @InjectRepository(RolePermission) private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Permission) private permissionRepository: Repository<Permission>,
  ) {}

  @Get()
  async findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.roleService.findOne(id);
  }

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.roleService.remove(id);
  }

  @Put(':roleId/permissions')
  async updateRolePermissions(@Param('roleId') roleId: number, @Body() updatePermissionsDto: any) {
    const { permissionIds } = updatePermissionsDto;
    
    await this.rolePermissionRepository.delete({ roleId });
    
    const rolePermissions = permissionIds.map((permissionId: number) =>
      this.rolePermissionRepository.create({
        roleId,
        permissionId,
      })
    );
    
    return this.rolePermissionRepository.save(rolePermissions);
  }

  @Post(':roleId/permissions')
  async addPermissionToRole(@Param('roleId') roleId: number, @Body() addPermissionDto: any) {
    const existingRolePermission = await this.rolePermissionRepository.findOne({
      where: { roleId, permissionId: addPermissionDto.permissionId },
    });
    if (existingRolePermission) {
      throw new Error('Role already has this permission');
    }

    const rolePermission = this.rolePermissionRepository.create({
      roleId,
      permissionId: addPermissionDto.permissionId,
    });

    return this.rolePermissionRepository.save(rolePermission);
  }

  @Delete(':roleId/permissions/:permissionId')
  async removePermissionFromRole(@Param('roleId') roleId: number, @Param('permissionId') permissionId: number) {
    const rolePermission = await this.rolePermissionRepository.findOne({
      where: { roleId, permissionId },
    });
    if (!rolePermission) {
      throw new Error('Role permission not found');
    }
    return this.rolePermissionRepository.remove(rolePermission);
  }
}