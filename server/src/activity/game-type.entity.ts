import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ActivityGame } from './activity-game.entity';

@Entity()
export class GameType {
  @PrimaryGeneratedColumn({ name: 'game_type_id' })
  id: number;

  @Column({ name: 'type', unique: true, nullable: false })
  type: string;

  @Column({ name: 'game_type_name', nullable: false })
  name: string;

  @Column({ name: 'icon', nullable: true })
  icon: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ActivityGame, activityGame => activityGame.gameType)
  activityGames: ActivityGame[];
}