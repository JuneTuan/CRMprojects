import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Activity } from './activity.entity';
import { GameType } from './game-type.entity';
import { GamePrize } from './game-prize.entity';

@Entity()
export class ActivityGame {
  @PrimaryGeneratedColumn({ name: 'activity_game_id' })
  id: number;

  @Column({ name: 'activity_id', nullable: false })
  activityId: number;

  @Column({ name: 'game_type_id', nullable: false })
  gameTypeId: number;

  @Column({ name: 'config', type: 'json', nullable: true })
  config: any;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Activity, activity => activity.activityGames)
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @ManyToOne(() => GameType, gameType => gameType.activityGames)
  @JoinColumn({ name: 'game_type_id' })
  gameType: GameType;

  @OneToMany(() => GamePrize, gamePrize => gamePrize.activityGame)
  gamePrizes: GamePrize[];
}