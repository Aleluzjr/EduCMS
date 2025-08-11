import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Permission, PermissionAction, PermissionResource } from '../entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Gera permissões padrão baseadas no role do usuário
   */
  async generateDefaultPermissions(user: User): Promise<Permission[]> {
    const permissions: Permission[] = [];

    if (user.role === UserRole.ADMIN) {
      // Admin tem todas as permissões
      Object.values(PermissionResource).forEach(resource => {
        Object.values(PermissionAction).forEach(action => {
          permissions.push(
            this.permissionRepository.create({
              action,
              resource,
              active: true
            })
          );
        });
      });
    } else if (user.role === UserRole.EDITOR) {
      // Editor tem permissões limitadas
      const editorPermissions = [
        { action: PermissionAction.READ, resource: PermissionResource.DOCUMENTS },
        { action: PermissionAction.WRITE, resource: PermissionResource.DOCUMENTS },
        { action: PermissionAction.READ, resource: PermissionResource.TEMPLATES },
        { action: PermissionAction.WRITE, resource: PermissionResource.TEMPLATES },
        { action: PermissionAction.READ, resource: PermissionResource.MEDIA },
        { action: PermissionAction.WRITE, resource: PermissionResource.MEDIA },
      ];

      editorPermissions.forEach(({ action, resource }) => {
        permissions.push(
          this.permissionRepository.create({
            action,
            resource,
            active: true
          })
        );
      });
    }

    return permissions;
  }

  /**
   * Obtém todas as permissões de um usuário
   */
  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['permissions']
    });

    if (!user || !user.permissions) {
      return [];
    }

    return user.permissions.map(permission => 
      `${permission.resource}:${permission.action}`
    );
  }

  /**
   * Verifica se um usuário tem uma permissão específica
   */
  async hasPermission(userId: number, permission: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.includes(permission);
  }

  /**
   * Verifica se um usuário tem todas as permissões especificadas
   */
  async hasAllPermissions(userId: number, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.every(permission => userPermissions.includes(permission));
  }

  /**
   * Verifica se um usuário tem pelo menos uma das permissões especificadas
   */
  async hasAnyPermission(userId: number, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * Atualiza as permissões de um usuário
   */
  async updateUserPermissions(userId: number, permissionStrings: string[]): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['permissions']
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Limpar permissões existentes
    user.permissions = [];

    // Criar novas permissões
    for (const permissionString of permissionStrings) {
      const [resource, action] = permissionString.split(':');
      
      if (Object.values(PermissionResource).includes(resource as PermissionResource) &&
          Object.values(PermissionAction).includes(action as PermissionAction)) {
        
        const permission = this.permissionRepository.create({
          action: action as PermissionAction,
          resource: resource as PermissionResource,
          active: true
        });

        user.permissions.push(permission);
      }
    }

    await this.userRepository.save(user);
  }
}
