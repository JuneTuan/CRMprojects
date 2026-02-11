import { Injectable } from '@nestjs/common';
import { userManager } from '../storage/database/userManager';
import { customerManager } from '../storage/database/customerManager';
import type { User } from '../storage/database/shared/schema';

@Injectable()
export class AuthService {
  async login(username: string, password: string) {
    const user = await userManager.getUserByUsername(username);

    if (!user) {
      throw new Error('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new Error('账号已被禁用');
    }

    if (password !== user.password) {
      throw new Error('用户名或密码错误');
    }

    const { password: _, ...userWithoutPassword } = user;

    return {
      token: this.generateToken(user),
      user: userWithoutPassword
    };
  }

  async register(data: {
    username: string;
    password: string;
    name: string;
    role: string;
    phone?: string;
  }) {
    // 检查用户名是否已存在
    const existingUser = await userManager.getUserByUsername(data.username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 创建用户
    const user = await userManager.createUser({
      username: data.username,
      password: data.password,
      role: data.role,
      name: data.name,
      isActive: true
    });

    // 如果是客户角色，自动创建关联的客户记录
    if (data.role === 'customer') {
      await customerManager.createCustomer({
        name: data.name,
        phone: data.phone || '',
        address: '',
        points: 0
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    return {
      token: this.generateToken(user),
      user: userWithoutPassword
    };
  }

  private generateToken(user: User): string {
    return `token_${user.id}_${Date.now()}`;
  }
}
