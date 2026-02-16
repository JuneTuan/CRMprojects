import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { Coupon } from './coupon.entity';

@Entity()
export class CustomerCoupon {
  @PrimaryGeneratedColumn({ name: 'customer_coupon_id' })
  id: number;

  @Column({ name: 'customer_id', nullable: false })
  customerId: number;

  @Column({ name: 'coupon_id', nullable: false })
  couponId: number;

  @Column({ name: 'status', default: '未使用' })
  status: string;

  @Column({ name: 'received_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  receivedAt: Date;

  @Column({ name: 'used_at', nullable: true })
  usedAt: Date;

  @Column({ name: 'order_id', nullable: true })
  orderId: number;

  @ManyToOne(() => Customer, customer => customer.customerCoupons)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Coupon, coupon => coupon.customerCoupons)
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;
}