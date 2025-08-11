export type Permission = string;

/**
 * Verifica se o usuário possui TODAS as permissões requeridas
 */
export function hasAll(permsUser: Permission[], required: Permission[]): boolean {
  if (required.length === 0) return true;
  return required.every(perm => permsUser.includes(perm));
}

/**
 * Verifica se o usuário possui PELO MENOS UMA das permissões requeridas
 */
export function hasAny(permsUser: Permission[], required: Permission[]): boolean {
  if (required.length === 0) return true;
  return required.some(perm => permsUser.includes(perm));
}

/**
 * Verifica se o usuário possui uma permissão específica
 */
export function hasPermission(permsUser: Permission[], required: Permission): boolean {
  return permsUser.includes(required);
}

/**
 * Filtra um array de itens baseado em permissões requeridas
 */
export function filterByPermissions<T extends { required?: Permission | Permission[] }>(
  items: T[],
  userPermissions: Permission[],
  mode: 'all' | 'any' = 'all'
): T[] {
  return items.filter(item => {
    if (!item.required) return true;
    
    const required = Array.isArray(item.required) ? item.required : [item.required];
    
    return mode === 'all' 
      ? hasAll(userPermissions, required)
      : hasAny(userPermissions, required);
  });
}
