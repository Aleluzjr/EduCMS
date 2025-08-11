import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';

export enum PermissionAction {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  MANAGE = 'manage'
}

export enum PermissionResource {
  USERS = 'users',
  DOCUMENTS = 'documents',
  TEMPLATES = 'templates',
  MEDIA = 'media',
  SYSTEM = 'system'
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: PermissionAction
  })
  action: PermissionAction;

  @Column({
    type: 'enum',
    enum: PermissionResource
  })
  resource: PermissionResource;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Relacionamento many-to-many com usuários
  @ManyToMany(() => User, user => user.permissions)
  @JoinTable({
    name: 'user_permissions',
    joinColumn: { name: 'permissionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
  })
  users: User[];
}
