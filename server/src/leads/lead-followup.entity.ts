import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Lead } from './lead.entity';
import { User } from '../auth/user.entity';

@Entity('lead_followups')
export class LeadFollowup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lead_id', nullable: false })
  @Index()
  leadId: number;

  @Column({ name: 'contact_method', length: 20, nullable: false })
  contactMethod: string;

  @Column({ name: 'contact_time', type: 'datetime', nullable: false })
  @Index()
  contactTime: Date;

  @Column({ name: 'contact_content', type: 'text', nullable: true })
  contactContent: string;

  @Column({ name: 'contact_result', length: 20, nullable: false })
  contactResult: string;

  @Column({ name: 'next_followup', type: 'datetime', nullable: true })
  nextFollowup: Date;

  @Column({ name: 'attachment', length: 500, nullable: true })
  attachment: string;

  @Column({ name: 'created_by', nullable: false })
  @Index()
  createdBy: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', nullable: false })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => Lead, (lead) => lead.followups, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @ManyToOne(() => User, (user) => user.createdLeadFollowups, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  createdUser: User;
}
