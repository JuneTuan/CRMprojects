import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/user.entity';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn({ name: 'log_id' })
  logId: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number;

  @Column({ name: 'username', nullable: true, length: 50 })
  username: string;

  @Column({ name: 'action', nullable: false, length: 100 })
  action: string;

  @Column({ name: 'module', nullable: true, length: 50 })
  module: string;

  @Column({ name: 'description', nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'ip_address', nullable: true, length: 50 })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  userAgent: string;

  @Column({ name: 'request_method', nullable: true, length: 10 })
  requestMethod: string;

  @Column({ name: 'request_url', nullable: true, length: 500 })
  requestUrl: string;

  @Column({ name: 'request_body', nullable: true, type: 'text' })
  requestBody: string;

  @Column({ name: 'response_status', nullable: true, type: 'int' })
  responseStatus: number;

  @Column({ name: 'response_time', nullable: true, type: 'int' })
  responseTime: number;

  @Column({ name: 'status', nullable: false, length: 20, default: 'success' })
  status: string;

  @Column({ name: 'error_message', nullable: true, type: 'text' })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.auditLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
