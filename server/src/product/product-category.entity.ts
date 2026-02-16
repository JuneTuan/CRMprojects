import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class ProductCategory {
  @PrimaryGeneratedColumn({ name: 'product_category_id' })
  productCategoryId: number;

  @Column({ name: 'product_category_name', nullable: false, length: 50 })
  productCategoryName: string;

  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId: number;

  @Column({ name: 'sort_order', type: 'int', nullable: true })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
