import { Injectable } from '@nestjs/common';
import { JsonStorage } from '../storage/json-storage';
import { CustomerStorage } from '../storage/customer-storage';
import type { User, LoginRequest, RegisterRequest, LoginResponse } from '../types';

@Injectable()
export class AuthService {
  private readonly USERS_FILE = 'users';

  private hashPassword(password: string): string {
    return `hash_${Buffer.from(password).toString('base64')}`;
  }

  private verifyPassword(password: string, hashedPassword: string): boolean {
    const expectedHash = this.hashPassword(password);
    return expectedHash === hashedPassword;
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const users = JsonStorage.readData<User>(this.USERS_FILE);
    let user = users.find(u => u.username === username && u.isActive);

    if (!user) {
      const customer = CustomerStorage.findByPhone(username);
      if (customer && customer.userId) {
        user = users.find(u => u.id === customer.userId && u.isActive);
      }
    }

    if (!user) {
      throw new Error('用户名或密码错误');
    }

    if (!this.verifyPassword(password, user.password)) {
      throw new Error('用户名或密码错误');
    }

    const { password: _, ...userWithoutPassword } = user;

    return {
      token: this.generateToken(user),
      user: userWithoutPassword
    };
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const users = JsonStorage.readData<User>(this.USERS_FILE);
    
    const existingUser = users.find(u => u.username === data.username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    if (data.role !== 'customer') {
      throw new Error('只有客户可以自注册，员工需要管理员添加');
    }

    const hashedPassword = this.hashPassword(data.password);
    const newUser: User = {
      id: JsonStorage.generateId(),
      username: data.username,
      password: hashedPassword,
      name: data.name,
      role: 'customer',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    JsonStorage.writeData(this.USERS_FILE, users);

    if (data.role === 'customer') {
      let existingCustomerByPhone: any = null;
      if (data.phone) {
        existingCustomerByPhone = CustomerStorage.findByPhone(data.phone);
      }
      
      if (existingCustomerByPhone) {
        CustomerStorage.update(existingCustomerByPhone.id, {
          userId: newUser.id,
          password: hashedPassword
        });
      } else {
        CustomerStorage.create({
          userId: newUser.id,
          name: data.name,
          phone: data.phone || '',
          email: '',
          points: 0,
          password: hashedPassword
        });
      }
    }

    const { password: _, ...userWithoutPassword } = newUser;

    return {
      token: this.generateToken(newUser),
      user: userWithoutPassword
    };
  }

  private findCustomerByUserId(userId: string): any {
    const customers = CustomerStorage.findAll();
    return customers.find(customer => customer.userId === userId) || null;
  }

  private generateToken(user: User): string {
    return `token_${user.id}_${Date.now()}`;
  }
}
