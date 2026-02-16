import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ActivityGame } from './activity-game.entity';
import { Prize } from '../prize/prize.entity';

@Entity()
export class GamePrize {
  @PrimaryGeneratedColumn({ name: 'game_prize_id' })
  id: number;

  @Column({ name: 'activity_game_id', nullable: false })
  activityGameId: number;

  @Column({ name: 'prize_id', nullable: false })
  prizeId: number;

  @Column({ name: 'probability', type: 'decimal', precision: 5, scale: 2, nullable: false })
  probability: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ActivityGame, activityGame => activityGame.gamePrizes)
  @JoinColumn({ name: 'activity_game_id' })
  activityGame: ActivityGame;

  @ManyToOne(() => Prize, prize => prize.gamePrizes)
  @JoinColumn({ name: 'prize_id' })
  prize: Prize;
}