import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from './role.entity';
import { Customer } from '../customer/customer.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'username', unique: true, nullable: false, length: 50 })
  username: string;

  @Column({ name: 'password', nullable: false, length: 255 })
  password: string;

  @Column({ name: 'user_name', nullable: false, length: 50 })
  userName: string;

  @Column({ name: 'phone', unique: true, nullable: true, length: 20 })
  phone: string;

  @Column({ name: 'email', unique: true, nullable: true, length: 100 })
  email: string;

  @Column({ name: 'role_id', type: 'int', nullable: true })
  roleId: number;

  @Column({ name: 'position', nullable: true, length: 50 })
  position: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Customer, customer => customer.owner)
  customers: Customer[];
}