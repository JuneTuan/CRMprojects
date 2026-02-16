import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { Coupon } from '../coupon/coupon.entity';
import { OrderItem } from './order-item.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'order_no', unique: true, nullable: false, length: 50 })
  orderNo: string;

  @Column({ name: 'customer_id', type: 'int', nullable: false })
  customerId: number;

  @Column({ name: 'coupon_id', type: 'int', nullable: true })
  couponId: number;

  @Column({ name: 'coupon_discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  couponDiscountAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalAmount: number;

  @Column({ name: 'actual_amount', type: 'decimal', precision: 10, scale: 2, nullable: false })
  actualAmount: number;

  @Column({ name: 'status', type: 'varchar', length: 20, default: '待支付' })
  status: string;

  @Column({ name: 'payment_method', nullable: true, length: 50 })
  paymentMethod: string;

  @Column({ name: 'payment_time', nullable: true, type: 'timestamp' })
  paymentTime: Date;

  @Column({ name: 'shipping_address', nullable: true, length: 255 })
  shippingAddress: string;

  @Column({ name: 'is_points', type: 'tinyint', default: 1 })
  isPoints: boolean;

  @Column({ name: 'points', type: 'int', default: 0 })
  points: number;

  @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Customer, customer => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Coupon, coupon => coupon.orders)
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  orderItems: OrderItem[];
}