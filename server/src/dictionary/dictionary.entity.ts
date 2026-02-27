import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Dictionary {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'dict_type', length: 50 })
  dictType: string;

  @Column({ name: 'dict_value', length: 50 })
  dictValue: string;

  @Column({ name: 'dict_label', length: 100 })
  dictLabel: string;

  @Column({ name: 'dict_sort', type: 'int', default: 0 })
  dictSort: number;

  @Column({ name: 'status', type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'remark', length: 255, nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
