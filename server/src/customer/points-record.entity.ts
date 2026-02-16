import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Customer } from './customer.entity';

@Entity('point_record')
export class PointsRecord {
  @PrimaryGeneratedColumn({ name: 'point_record_id' })
  id: number;

  @Column({ name: 'customer_id', nullable: false })
  customerId: number;

  @Column({ name: 'type', nullable: false })
  type: string;

  @Column({ name: 'points', nullable: false })
  points: number;

  @Column({ name: 'balance', nullable: false })
  balance: number;

  @Column({ name: 'reason', nullable: false })
  reason: string;

  @Column({ name: 'expire_time', type: 'timestamp', nullable: true })
  expireTime: Date;

  @Column({ name: 'is_expired', type: 'tinyint', nullable: true })
  isExpired: boolean;

  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;

  @ManyToOne(() => Customer, customer => customer.pointsRecords)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}