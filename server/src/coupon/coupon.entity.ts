import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from '../order/order.entity';
import { CustomerCoupon } from './customer-coupon.entity';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn({ name: 'coupon_id' })
  couponId: number;

  @Column({ name: 'coupon_code', unique: true, nullable: false, length: 50 })
  couponCode: string;

  @Column({ name: 'coupon_name', nullable: false, length: 100 })
  couponName: string;

  @Column({ name: 'value', type: 'decimal', precision: 10, scale: 2, nullable: false })
  value: number;

  @Column({ name: 'type', type: 'enum', enum: ['代金券', '实物券'], nullable: false })
  type: string;

  @Column({ name: 'start_time', nullable: false, type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', nullable: false, type: 'timestamp' })
  endTime: Date;

  @Column({ name: 'total_quantity', nullable: false, type: 'int' })
  totalQuantity: number;

  @Column({ name: 'remaining_quantity', nullable: false, type: 'int' })
  remainingQuantity: number;

  @Column({ name: 'max_uses_per_user', nullable: true, type: 'int', default: 1 })
  maxUsesPerUser: number;

  @Column({ name: 'min_level', type: 'enum', enum: ['普通会员', '白银会员', '黄金会员', '钻石会员'], nullable: true })
  minLevel: string;

  @Column({ name: 'applicable_products', type: 'text', nullable: true })
  applicableProducts: string;

  @Column({ name: 'status', type: 'enum', enum: ['未开始', '进行中', '已结束'], nullable: true, default: '未开始' })
  status: string;

  @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Order, order => order.coupon)
  orders: Order[];

  @OneToMany(() => CustomerCoupon, customerCoupon => customerCoupon.coupon)
  customerCoupons: CustomerCoupon[];
}