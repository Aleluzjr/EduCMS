import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn, ManyToMany } from 'typeorm';
import { Document } from './document.entity';
import { SlideTemplate } from './slide-template.entity';
import { ApiToken } from './api-token.entity';
import { AuditLog } from './audit-log.entity';
import { Permission } from './permission.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EDITOR
  })
  role: UserRole;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relacionamentos
  @OneToMany(() => Document, document => document.owner)
  documents: Document[];

  @OneToMany(() => SlideTemplate, template => template.createdBy)
  createdTemplates: SlideTemplate[];

  @OneToMany(() => ApiToken, token => token.createdBy)
  apiTokens: ApiToken[];

  @OneToMany(() => AuditLog, log => log.user)
  auditLogs: AuditLog[];

  // Relacionamento many-to-many com permissões
  @ManyToMany(() => Permission, permission => permission.users)
  permissions: Permission[];
} 