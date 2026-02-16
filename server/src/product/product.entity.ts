import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from '../order/order-item.entity';
import { ProductCategory } from './product-category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn({ name: 'product_id' })
  productId: number;

  @Column({ name: 'product_code', unique: true, nullable: false, length: 32 })
  productCode: string;

  @Column({ name: 'product_name', nullable: false, length: 100 })
  productName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ name: 'stock', type: 'int', nullable: true })
  stock: number;

  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId: number;

  @ManyToOne(() => ProductCategory)
  @JoinColumn({ name: 'category_id' })
  category: ProductCategory;

  @Column({ name: 'status', type: 'enum', enum: ['上架', '下架'], nullable: true })
  status: string;

  @Column({ name: 'image_url', nullable: true, length: 255 })
  imageUrl: string;

  @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, orderItem => orderItem.product)
  orderItems: OrderItem[];
}