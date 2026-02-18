import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { MemberLevel } from './member-level.entity';
import { User } from '../auth/user.entity';

@Entity('member_level_log')
export class MemberLevelLog {
  @PrimaryGeneratedColumn({ name: 'log_id' })
  logId: number;

  @Column({ name: 'customer_id', type: 'int', nullable: false })
  customerId: number;

  @Column({ name: 'old_level_id', type: 'int', nullable: true })
  oldLevelId: number;

  @Column({ name: 'new_level_id', type: 'int', nullable: false })
  newLevelId: number;

  @Column({ name: 'change_type', type: 'enum', enum: ['auto_upgrade', 'manual_adjust', 'manual_downgrade'], nullable: false, default: 'auto_upgrade' })
  changeType: string;

  @Column({ name: 'old_consumption', type: 'decimal', precision: 10, scale: 2, nullable: true })
  oldConsumption: number;

  @Column({ name: 'new_consumption', type: 'decimal', precision: 10, scale: 2, nullable: true })
  newConsumption: number;

  @Column({ name: 'remark', length: 255, nullable: true })
  remark: string;

  @Column({ name: 'operator_id', type: 'int', nullable: true })
  operatorId: number;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => MemberLevel)
  @JoinColumn({ name: 'old_level_id' })
  oldLevel: MemberLevel;

  @ManyToOne(() => MemberLevel)
  @JoinColumn({ name: 'new_level_id' })
  newLevel: MemberLevel;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'operator_id' })
  operator: User;
}
