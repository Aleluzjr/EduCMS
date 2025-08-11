import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para verificar permissões do usuário
 * @param required - Permissão ou array de permissões requeridas
 * @param mode - Modo de verificação: 'all' (todas) ou 'any' (pelo menos uma)
 * @returns boolean indicando se o usuário possui as permissões
 */
export function useCan(
  required: string | string[], 
  mode: 'all' | 'any' = 'all'
): boolean {
  const { can, canAny, canAll } = useAuth();
  
  if (!required) return true;
  
  const permissions = Array.isArray(required) ? required : [required];
  
  if (permissions.length === 0) return true;
  
  return mode === 'all' ? canAll(permissions) : canAny(permissions);
}

/**
 * Hook para verificar se o usuário possui uma permissão específica
 */
export function useCanPermission(permission: string): boolean {
  const { can } = useAuth();
  return can(permission);
}

/**
 * Hook para verificar se o usuário possui todas as permissões
 */
export function useCanAll(permissions: string[]): boolean {
  const { canAll } = useAuth();
  return canAll(permissions);
}

/**
 * Hook para verificar se o usuário possui pelo menos uma das permissões
 */
export function useCanAny(permissions: string[]): boolean {
  const { canAny } = useAuth();
  return canAny(permissions);
}
