import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { PermissionsService } from '../../permissions/permissions.service';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Verificar se o usuário tem todas as permissões necessárias
    const hasPermissions = await this.permissionsService.hasAllPermissions(
      user.id, 
      requiredPermissions
    );
    
    if (!hasPermissions) {
      throw new ForbiddenException(
        `Acesso negado: permissões insuficientes. Necessário: ${requiredPermissions.join(', ')}`
      );
    }

    return true;
  }
}
