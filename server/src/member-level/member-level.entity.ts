import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('member_level')
export class MemberLevel {
  @PrimaryGeneratedColumn({ name: 'level_id' })
  levelId: number;

  @Column({ name: 'level_name', length: 20, nullable: false })
  levelName: string;

  @Column({ name: 'level_code', length: 20, nullable: false, unique: true })
  levelCode: string;

  @Column({ name: 'min_consumption', type: 'decimal', precision: 10, scale: 2, nullable: false, default: 0 })
  minConsumption: number;

  @Column({ name: 'icon_code', length: 50, nullable: true })
  iconCode: string;

  @Column({ name: 'benefits_config', type: 'json', nullable: true })
  benefitsConfig: any;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
