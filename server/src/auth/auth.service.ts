import { Injectable } from '@nestjs/common';
import { userManager } from '../storage/database/userManager';
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

  private generateToken(user: User): string {
    return `token_${user.id}_${Date.now()}`;
  }
}
