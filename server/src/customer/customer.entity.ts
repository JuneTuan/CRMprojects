import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from '../order/order.entity';
import { CustomerCoupon } from '../coupon/customer-coupon.entity';
import { LotteryRecord } from '../lottery/lottery-record.entity';
import { PointsRecord } from './points-record.entity';
import { User } from '../auth/user.entity';
import { MemberLevel } from '../member-level/member-level.entity';
import { Lead } from '../leads/lead.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn({ name: 'customer_id' })
  customerId: number;

  @Column({ name: 'customer_code', unique: true, nullable: false, length: 32 })
  customerCode: string;

  @Column({ name: 'password', nullable: false, length: 255, default: '' })
  password: string;

  @Column({ name: 'customer_name', nullable: false, length: 50 })
  customerName: string;

  @Column({ name: 'phone', nullable: false, length: 20 })
  phone: string;

  @Column({ name: 'email', nullable: true, length: 100 })
  email: string;

  @Column({ name: 'position', nullable: true, length: 100 })
  position: string;

  @Column({ name: 'avatar', nullable: true, length: 255, default: '' })
  avatar: string;

  @Column({ name: 'points', type: 'bigint', default: 0 })
  points: number;

  @Column({ name: 'member_level_id', type: 'int', nullable: true })
  memberLevelId: number;

  @Column({ name: 'total_consumption', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalConsumption: number;

  @Column({ name: 'level', type: 'enum', enum: ['普通会员', '白银会员', '黄金会员', '钻石会员'], default: '普通会员' })
  level: string;

  @Column({ name: 'address', nullable: true, length: 255 })
  address: string;

  @Column({ name: 'source', type: 'varchar', length: 50, default: 'backend' })
  source: string;

  @Column({ name: 'remark', type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: number;

  @ManyToOne(() => User, user => user.customers)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => MemberLevel)
  @JoinColumn({ name: 'member_level_id' })
  memberLevel: MemberLevel;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Order, order => order.customer)
  orders: Order[];

  @OneToMany(() => CustomerCoupon, customerCoupon => customerCoupon.customer)
  customerCoupons: CustomerCoupon[];

  @OneToMany(() => LotteryRecord, lotteryRecord => lotteryRecord.customer)
  lotteryRecords: LotteryRecord[];

  @OneToMany(() => PointsRecord, pointsRecord => pointsRecord.customer)
  pointsRecords: PointsRecord[];

  // Lead relationships
  @OneToMany(() => Lead, lead => lead.convertedCustomer)
  convertedLeads: Lead[];
}