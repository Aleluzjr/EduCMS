import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  ACCESS_DENIED = 'ACCESS_DENIED'
}

export enum AuditEntity {
  USER = 'USER',
  DOCUMENT = 'DOCUMENT',
  TEMPLATE = 'TEMPLATE',
  API_TOKEN = 'API_TOKEN',
  AUTH = 'AUTH'
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.auditLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: AuditAction
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditEntity
  })
  entity: AuditEntity;

  @Column({ nullable: true })
  entityId: number;

  @Column({ type: 'text', nullable: true })
  metadata: string;

  @Column({ length: 45 })
  ip: string;

  @Column({ type: 'text' })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
} 