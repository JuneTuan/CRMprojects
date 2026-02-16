import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepository.find({
      relations: ['role'],
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { userId: id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      userName: createUserDto.name,
      isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
    });
    return this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    if (updateUserDto.name) {
      user.userName = updateUserDto.name;
    }
    
    if (updateUserDto.username !== undefined) {
      user.username = updateUserDto.username;
    }
    
    if (updateUserDto.phone !== undefined) {
      user.phone = updateUserDto.phone;
    }
    
    if (updateUserDto.email !== undefined) {
      user.email = updateUserDto.email;
    }
    
    if (updateUserDto.position !== undefined) {
      user.position = updateUserDto.position;
    }
    
    if (updateUserDto.roleId !== undefined) {
      user.roleId = updateUserDto.roleId;
    }
    
    if (updateUserDto.isActive !== undefined) {
      user.isActive = updateUserDto.isActive;
    }
    
    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }

  async toggleStatus(id: number) {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    return this.userRepository.save(user);
  }
}