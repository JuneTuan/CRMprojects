import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { StaffService } from './staff.service';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  async list() {
    try {
      const data = await this.staffService.getStaffList();
      return {
        code: 200,
        msg: '获取成功',
        data
      };
    } catch (error: any) {
      throw new HttpException(
        {
          code: 400,
          msg: error.message || '获取失败',
          data: null
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    try {
      const data = await this.staffService.getStaffById(id);
      if (!data) {
        throw new HttpException(
          {
            code: 404,
            msg: '员工不存在',
            data: null
          },
          HttpStatus.NOT_FOUND
        );
      }
      return {
        code: 200,
        msg: '获取成功',
        data
      };
    } catch (error: any) {
      throw new HttpException(
        {
          code: 400,
          msg: error.message || '获取失败',
          data: null
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post()
  async create(@Body() body: {
    username: string;
    password: string;
    name: string;
    phone?: string;
    position?: string;
  }) {
    try {
      const data = await this.staffService.createStaff(body);
      return {
        code: 200,
        msg: '创建成功',
        data
      };
    } catch (error: any) {
      throw new HttpException(
        {
          code: 400,
          msg: error.message || '创建失败',
          data: null
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: {
      username?: string;
      password?: string;
      name?: string;
      phone?: string;
      position?: string;
      isActive?: boolean;
    }
  ) {
    try {
      const data = await this.staffService.updateStaff(id, body);
      return {
        code: 200,
        msg: '更新成功',
        data
      };
    } catch (error: any) {
      throw new HttpException(
        {
          code: 400,
          msg: error.message || '更新失败',
          data: null
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // 获取员工权限
  @Get(':id/permissions')
  async getPermissions(@Param('id') id: string) {
    try {
      const data = await this.staffService.getStaffPermissions(id);
      return {
        code: 200,
        msg: '获取成功',
        data
      };
    } catch (error: any) {
      throw new HttpException(
        {
          code: 400,
          msg: error.message || '获取失败',
          data: null
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // 更新员工权限
  @Put(':id/permissions')
  async updatePermissions(
    @Param('id') id: string,
    @Body() body: {
      permissionId: string;
      allowed: boolean;
    }
  ) {
    try {
      const data = await this.staffService.updateStaffPermission(id, body);
      return {
        code: 200,
        msg: '更新成功',
        data
      };
    } catch (error: any) {
      throw new HttpException(
        {
          code: 400,
          msg: error.message || '更新失败',
          data: null
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put(':id/toggle')
  async toggleStatus(@Param('id') id: string) {
    try {
      const data = await this.staffService.toggleStaffStatus(id);
      return {
        code: 200,
        msg: '状态更新成功',
        data
      };
    } catch (error: any) {
      throw new HttpException(
        {
          code: 400,
          msg: error.message || '更新失败',
          data: null
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.staffService.deleteStaff(id);
      return {
        code: 200,
        msg: '删除成功',
        data: null
      };
    } catch (error: any) {
      throw new HttpException(
        {
          code: 400,
          msg: error.message || '删除失败',
          data: null
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
