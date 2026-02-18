import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum CouponType {
  DISCOUNT = 'discount',
  GIFT = 'gift',
}

export enum CouponStatus {
  UNUSED = 'unused',
  USED = 'used',
  EXPIRED = 'expired',
}

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  customerId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customerId' })
  customer?: User;

  @Column({
    type: 'enum',
    enum: CouponType,
  })
  type: CouponType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({
    type: 'enum',
    enum: CouponStatus,
    default: CouponStatus.UNUSED,
  })
  status: CouponStatus;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
