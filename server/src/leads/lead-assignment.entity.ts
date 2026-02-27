import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Lead } from './lead.entity';
import { User } from '../auth/user.entity';

@Entity('lead_assignments')
export class LeadAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lead_id', nullable: false })
  @Index()
  leadId: number;

  @Column({ name: 'assigned_to', nullable: false })
  @Index()
  assignedTo: number;

  @Column({ name: 'assigned_by', nullable: false })
  assignedBy: number;

  @CreateDateColumn({ name: 'assigned_at', type: 'datetime', nullable: false })
  @Index()
  assignedAt: Date;

  @Column({ name: 'notes', length: 500, nullable: true })
  notes: string;

  // Relationships
  @ManyToOne(() => Lead, (lead) => lead.assignments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @ManyToOne(() => User, (user) => user.assignedLeadAssignments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'assigned_to' })
  assignedUser: User;

  @ManyToOne(() => User, (user) => user.createdLeadAssignments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'assigned_by' })
  assignedByUser: User;
}
