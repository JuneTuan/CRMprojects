import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('lottery_records')
export class LotteryRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column()
  prizeId: string;

  @Column()
  prizeName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prizeValue: number;

  @Column()
  prizeType: string;

  @CreateDateColumn()
  createdAt: Date;
}
