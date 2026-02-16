import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { Activity } from '../activity/activity.entity';
import { GameType } from '../activity/game-type.entity';
import { Prize } from '../prize/prize.entity';

@Entity()
export class LotteryRecord {
  @PrimaryGeneratedColumn({ name: 'lottery_record_id' })
  lotteryRecordId: number;

  @Column({ name: 'customer_id', type: 'int', nullable: false })
  customerId: number;

  @Column({ name: 'activity_id', type: 'int', nullable: false })
  activityId: number;

  @Column({ name: 'game_type_id', type: 'int', nullable: false })
  gameTypeId: number;

  @Column({ name: 'prize_id', type: 'int', nullable: true })
  prizeId: number;

  @Column({ name: 'prize_name', nullable: true, length: 100 })
  prizeName: string;

  @Column({ name: 'coupon_id', type: 'int', nullable: true })
  couponId: number;

  @Column({ name: 'status', type: 'enum', enum: ['未领取', '已领取', '已过期', '未中奖'], default: '未领取' })
  status: string;

  @Column({ name: 'draw_count', type: 'int', default: 1 })
  drawCount: number;

  @Column({ name: 'cost_points', type: 'int', default: 0 })
  costPoints: number;

  @Column({ name: 'draw_time', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  drawTime: Date;

  @Column({ name: 'claim_time', nullable: true, type: 'timestamp' })
  claimTime: Date;

  @ManyToOne(() => Customer, customer => customer.lotteryRecords)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Activity, activity => activity.lotteryRecords)
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @ManyToOne(() => GameType, gameType => gameType.activityGames)
  @JoinColumn({ name: 'game_type_id' })
  gameType: GameType;

  @ManyToOne(() => Prize, prize => prize.lotteryRecords)
  @JoinColumn({ name: 'prize_id' })
  prize: Prize;
}