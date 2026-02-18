// server/src/customer/customer.service.ts
import { Injectable } from '@nestjs/common';
import { CustomerStorage, Customer } from '../storage/customer-storage';
import { OrderStorage } from '../storage/order-storage';
import { JsonStorage } from '../storage/json-storage';
import type { User } from '../types';

@Injectable()
export class CustomerService {
  private readonly USERS_FILE = 'users';

  async findAll() {
    return CustomerStorage.findAll();
  }

  async findOne(id: string) {
    return CustomerStorage.findById(id);
  }

  async findByPhone(phone: string) {
    return CustomerStorage.findByPhone(phone);
  }

  async findByUserId(userId: string) {
    const customers = CustomerStorage.findAll();
    return customers.find(customer => customer.userId === userId) || null;
  }

  async create(createCustomerDto: any) {
    const customer = CustomerStorage.create({
      name: createCustomerDto.name,
      phone: createCustomerDto.phone,
      email: createCustomerDto.email,
      points: createCustomerDto.points || 0
    });

    if (createCustomerDto.password) {
      await this.createCustomerUser(customer.id, createCustomerDto.name, createCustomerDto.phone, createCustomerDto.password);
    }

    return customer;
  }

  private async createCustomerUser(customerId: string, name: string, phone: string, password: string) {
    const users = JsonStorage.readData<User>(this.USERS_FILE);
    
    const hashPassword = (pwd: string): string => {
      return `hash_${Buffer.from(pwd).toString('base64')}`;
    };

    // 生成用户名：优先使用手机号，如果没有则使用时间戳
    let username = '';
    if (phone) {
      username = `customer_${phone}`;
    } else {
      // 如果没有手机号，生成一个基于时间戳的用户名
      username = `customer_${Date.now()}`;
    }
    
    // 检查用户名是否已存在
    let existingUser = users.find(u => u.username === username);
    if (existingUser) {
      // 如果用户名已存在，更新客户记录的userId
      CustomerStorage.update(customerId, {
        userId: existingUser.id,
        password: hashPassword(password)
      });
      return existingUser.id;
    }

    const newUser: User = {
      id: JsonStorage.generateId(),
      username: username,
      password: hashPassword(password),
      name: name,
      role: 'customer',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    JsonStorage.writeData(this.USERS_FILE, users);

    CustomerStorage.update(customerId, {
      userId: newUser.id,
      password: hashPassword(password)
    });

    return newUser.id;
  }

  async update(id: string, updateCustomerDto: any) {
    return CustomerStorage.update(id, updateCustomerDto);
  }

  async remove(id: string) {
    const customer = CustomerStorage.findById(id);
    if (customer && customer.userId) {
      await this.deleteCustomerUser(customer.userId);
    }
    return CustomerStorage.delete(id);
  }

  private async deleteCustomerUser(userId: string) {
    const users = JsonStorage.readData<User>(this.USERS_FILE);
    const filteredUsers = users.filter(u => u.id !== userId);
    JsonStorage.writeData(this.USERS_FILE, filteredUsers);
  }

  async addPoints(id: string, points: number) {
    return CustomerStorage.addPoints(id, points);
  }

  async getOrders(customerId: string) {
    return OrderStorage.findByCustomerId(customerId);
  }

  async updatePassword(customerId: string, oldPassword: string, newPassword: string) {
    const customer = CustomerStorage.findById(customerId);
    if (!customer) {
      throw new Error('客户不存在');
    }

    if (!customer.password) {
      throw new Error('该客户未设置密码');
    }

    const hashPassword = (password: string): string => {
      return `hash_${Buffer.from(password).toString('base64')}`;
    };

    const verifyPassword = (password: string, hashedPassword: string): boolean => {
      const expectedHash = hashPassword(password);
      return expectedHash === hashedPassword;
    };

    if (!verifyPassword(oldPassword, customer.password)) {
      throw new Error('原密码错误');
    }

    const updatedCustomer = CustomerStorage.update(customerId, {
      password: hashPassword(newPassword)
    });

    if (customer.userId) {
      const users = JsonStorage.readData<User>(this.USERS_FILE);
      const userIndex = users.findIndex(u => u.id === customer.userId);
      if (userIndex !== -1) {
        users[userIndex].password = hashPassword(newPassword);
        JsonStorage.writeData(this.USERS_FILE, users);
      }
    }

    return updatedCustomer;
  }

  async resetPassword(customerId: string, newPassword: string) {
    const customer = CustomerStorage.findById(customerId);
    if (!customer) {
      throw new Error('客户不存在');
    }

    const hashPassword = (password: string): string => {
      return `hash_${Buffer.from(password).toString('base64')}`;
    };

    const updatedCustomer = CustomerStorage.update(customerId, {
      password: hashPassword(newPassword)
    });

    if (customer.userId) {
      const users = JsonStorage.readData<User>(this.USERS_FILE);
      const userIndex = users.findIndex(u => u.id === customer.userId);
      if (userIndex !== -1) {
        users[userIndex].password = hashPassword(newPassword);
        JsonStorage.writeData(this.USERS_FILE, users);
      }
    }

    return updatedCustomer;
  }

  // 别名方法以匹配控制器期望的接口
  async getCustomers(query: any) {
    return this.findAll();
  }

  async getCustomerById(id: string) {
    return this.findOne(id);
  }

  async createCustomer(body: any) {
    return this.create(body);
  }

  async updateCustomer(id: string, body: any) {
    return this.update(id, body);
  }

  async deleteCustomer(id: string) {
    return this.remove(id);
  }

  async getCustomerOrders(id: string) {
    return this.getOrders(id);
  }

  async changeCustomerPassword(id: string, body: any) {
    if (body.oldPassword) {
      return this.updatePassword(id, body.oldPassword, body.newPassword);
    } else {
      return this.resetPassword(id, body.newPassword);
    }
  }
}