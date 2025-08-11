import React from 'react';
import { useCan } from '../hooks/useCan';

interface PermissionGuardProps {
  children: React.ReactNode;
  required: string | string[];
  mode?: 'all' | 'any';
  fallback?: React.ReactNode;
}

/**
 * Componente para renderizar condicionalmente baseado em permissões
 * 
 * Exemplos de uso:
 * 
 * // Renderizar apenas se tiver a permissão
 * <PermissionGuard required="users:write">
 *   <Button>Editar Usuário</Button>
 * </PermissionGuard>
 * 
 * // Renderizar se tiver pelo menos uma das permissões
 * <PermissionGuard required={['users:read', 'users:write']} mode="any">
 *   <UserActions />
 * </PermissionGuard>
 * 
 * // Com fallback personalizado
 * <PermissionGuard 
 *   required="admin:config" 
 *   fallback={<span>Sem permissão</span>}
 * >
 *   <AdminPanel />
 * </PermissionGuard>
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  required, 
  mode = 'all',
  fallback = null 
}) => {
  const hasPermission = useCan(required, mode);
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default PermissionGuard;
