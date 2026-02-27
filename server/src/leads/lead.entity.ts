import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from '../auth/user.entity';
import { Customer } from '../customer/customer.entity';
import { LeadFollowup } from './lead-followup.entity';
import { LeadAssignment } from './lead-assignment.entity';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lead_code', length: 50, nullable: true })
  @Index()
  leadCode: string;

  @Column({ name: 'name', length: 100, nullable: false })
  name: string;

  @Column({ name: 'phone', length: 20, nullable: false })
  @Index()
  phone: string;

  @Column({ name: 'email', length: 100, nullable: true })
  @Index()
  email: string;

  @Column({ name: 'company', length: 200, nullable: true })
  company: string;

  @Column({ name: 'position', length: 100, nullable: true })
  position: string;

  @Column({ name: 'source', length: 50, nullable: false })
  source: string;

  @Column({ name: 'source_detail', length: 200, nullable: true })
  sourceDetail: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'priority', length: 20, nullable: false, default: 'medium' })
  priority: string;

  @Column({ name: 'status', length: 20, nullable: false, default: 'new' })
  @Index()
  status: string;

  @Column({ name: 'assigned_to', nullable: true })
  @Index()
  assignedTo: number;

  @Column({ name: 'assigned_at', type: 'datetime', nullable: true })
  assignedAt: Date;

  @Column({ name: 'score', nullable: true, default: 0 })
  score: number;

  @Column({ name: 'converted', nullable: false, default: false })
  @Index()
  converted: boolean;

  @Column({ name: 'converted_at', type: 'datetime', nullable: true })
  convertedAt: Date;

  @Column({ name: 'converted_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  convertedAmount: number;

  @Column({ name: 'converted_customer_id', nullable: true })
  @Index()
  convertedCustomerId: number;

  @Column({ name: 'closed', nullable: false, default: false })
  closed: boolean;

  @Column({ name: 'closed_at', type: 'datetime', nullable: true })
  closedAt: Date;

  @Column({ name: 'close_reason', length: 200, nullable: true })
  closeReason: string;

  @Column({ name: 'created_by', nullable: false })
  @Index()
  createdBy: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', nullable: false })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', nullable: false })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.assignedLeads, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'assigned_to' })
  assignedUser: User;

  @ManyToOne(() => User, (user) => user.createdLeads, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  createdUser: User;

  @ManyToOne(() => Customer, (customer) => customer.convertedLeads, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'converted_customer_id' })
  convertedCustomer: Customer;

  @OneToMany(() => LeadFollowup, (followup) => followup.lead, { cascade: true, onDelete: 'CASCADE' })
  followups: LeadFollowup[];

  @OneToMany(() => LeadAssignment, (assignment) => assignment.lead, { onDelete: 'CASCADE' })
  assignments: LeadAssignment[];
}
