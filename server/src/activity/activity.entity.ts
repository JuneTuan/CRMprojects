import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ActivityGame } from './activity-game.entity';
import { LotteryRecord } from '../lottery/lottery-record.entity';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn({ name: 'activity_id' })
  activityId: number;

  @Column({ name: 'activity_code', unique: true, nullable: false, length: 32 })
  activityCode: string;

  @Column({ name: 'activity_type', type: 'enum', enum: ['游戏活动', '积分活动', '优惠券活动', '混合活动'], default: '游戏活动' })
  activityType: string;

  @Column({ name: 'activity_name', nullable: false, length: 100 })
  activityName: string;

  @Column({ name: 'game_type', type: 'enum', enum: ['slot-machine', 'blind-box', 'wheel', 'scratch-card', 'nine-grid'], nullable: true })
  gameType: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'start_time', nullable: false, type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', nullable: false, type: 'timestamp' })
  endTime: Date;

  @Column({ name: 'max_participants', type: 'int', nullable: true })
  maxParticipants: number;

  @Column({ name: 'max_draws_per_user', type: 'int', nullable: true })
  maxDrawsPerUser: number;

  @Column({ name: 'min_points', type: 'int', default: 0 })
  minPoints: number;

  @Column({ name: 'win_rate_config', type: 'json', nullable: true })
  winRateConfig: any;

  @Column({ name: 'status', type: 'enum', enum: ['未开始', '进行中', '已结束'], default: '未开始' })
  status: string;

  @Column({ name: 'image_url', nullable: true, length: 255 })
  imageUrl: string;

  @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => ActivityGame, activityGame => activityGame.activity)
  activityGames: ActivityGame[];

  @OneToMany(() => LotteryRecord, lotteryRecord => lotteryRecord.activity)
  lotteryRecords: LotteryRecord[];
}