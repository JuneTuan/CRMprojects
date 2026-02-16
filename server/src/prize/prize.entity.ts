import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { GamePrize } from '../activity/game-prize.entity';
import { LotteryRecord } from '../lottery/lottery-record.entity';

@Entity()
export class Prize {
  @PrimaryGeneratedColumn({ name: 'prize_id' })
  prizeId: number;

  @Column({ name: 'prize_name', nullable: false, length: 100 })
  prizeName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'type', type: 'enum', enum: ['券', '实物', '积分'], nullable: false })
  type: string;

  @Column({ name: 'value', type: 'decimal', precision: 10, scale: 2, default: 0 })
  value: number;

  @Column({ name: 'image_url', nullable: true, length: 255 })
  imageUrl: string;

  @Column({ name: 'quantity', type: 'int', nullable: false })
  quantity: number;

  @Column({ name: 'remaining_quantity', type: 'int', nullable: false })
  remainingQuantity: number;

  @Column({ name: 'status', type: 'enum', enum: ['可用', '不可用'], default: '可用' })
  status: string;

  @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => GamePrize, gamePrize => gamePrize.prize)
  gamePrizes: GamePrize[];

  @OneToMany(() => LotteryRecord, lotteryRecord => lotteryRecord.prize)
  lotteryRecords: LotteryRecord[];
}