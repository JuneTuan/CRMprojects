import { Injectable } from '@nestjs/common';
import { JsonStorage } from '../storage/json-storage';

export interface Staff {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'staff';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateStaffDto {
  username: string;
  password: string;
  name: string;
}

export interface UpdateStaffDto {
  username?: string;
  password?: string;
  name?: string;
  isActive?: boolean;
}

@Injectable()
export class StaffService {
  private readonly USERS_FILE = 'users';

  private hashPassword(password: string): string {
    return `hash_${Buffer.from(password).toString('base64')}`;
  }

  async getStaffList(): Promise<Staff[]> {
    const users = JsonStorage.readData<any>(this.USERS_FILE);
    return users
      .filter((u: any) => u.role === 'staff' || u.role === 'admin')
      .map((u: any) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        role: u.role as 'admin' | 'staff',
        isActive: u.isActive,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }));
  }

  async getStaffById(id: string): Promise<Staff | null> {
    const users = JsonStorage.readData<any>(this.USERS_FILE);
    const user = users.find((u: any) => u.id === id && (u.role === 'staff' || u.role === 'admin'));
    
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role as 'admin' | 'staff',
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async createStaff(data: CreateStaffDto): Promise<Staff> {
    const users = JsonStorage.readData<any>(this.USERS_FILE);
    
    const existingUser = users.find((u: any) => u.username === data.username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    const hashedPassword = this.hashPassword(data.password);
    const newStaff = {
      id: JsonStorage.generateId(),
      username: data.username,
      password: hashedPassword,
      name: data.name,
      role: 'staff',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newStaff);
    JsonStorage.writeData(this.USERS_FILE, users);

    const { password: _, ...staffWithoutPassword } = newStaff;
    return staffWithoutPassword as Staff;
  }

  async updateStaff(id: string, data: UpdateStaffDto): Promise<Staff | null> {
    const users = JsonStorage.readData<any>(this.USERS_FILE);
    const index = users.findIndex((u: any) => u.id === id && (u.role === 'staff' || u.role === 'admin'));
    
    if (index === -1) {
      throw new Error('员工不存在');
    }

    const updateData: any = {
      ...users[index],
      updatedAt: new Date().toISOString()
    };

    if (data.username !== undefined) {
      const existingUser = users.find((u: any) => u.username === data.username && u.id !== id);
      if (existingUser) {
        throw new Error('用户名已存在');
      }
      updateData.username = data.username;
    }

    if (data.password !== undefined) {
      updateData.password = this.hashPassword(data.password);
    }

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    users[index] = updateData;
    JsonStorage.writeData(this.USERS_FILE, users);

    const { password: _, ...staffWithoutPassword } = updateData;
    return staffWithoutPassword as Staff;
  }

  async deleteStaff(id: string): Promise<boolean> {
    const users = JsonStorage.readData<any>(this.USERS_FILE);
    const index = users.findIndex((u: any) => u.id === id && u.role === 'staff');
    
    if (index === -1) {
      throw new Error('员工不存在');
    }

    users.splice(index, 1);
    JsonStorage.writeData(this.USERS_FILE, users);
    return true;
  }

  async toggleStaffStatus(id: string): Promise<Staff | null> {
    const users = JsonStorage.readData<any>(this.USERS_FILE);
    const index = users.findIndex((u: any) => u.id === id && u.role === 'staff');
    
    if (index === -1) {
      throw new Error('员工不存在');
    }

    users[index].isActive = !users[index].isActive;
    users[index].updatedAt = new Date().toISOString();
    JsonStorage.writeData(this.USERS_FILE, users);

    const { password: _, ...staffWithoutPassword } = users[index];
    return staffWithoutPassword as Staff;
  }
}
