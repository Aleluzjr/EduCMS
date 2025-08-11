import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCan } from '../hooks/useCan';
import LoadingSpinner from './LoadingSpinner';
import ForbiddenPage from '../pages/ForbiddenPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'EDITOR' | Array<'ADMIN' | 'EDITOR'>;
  required?: string | string[];
}

/**
 * Componente para proteger rotas baseado em autenticação, roles e permissões
 * 
 * Exemplos de uso:
 * 
 * // Apenas autenticação (sem verificação de role ou permissões)
 * <ProtectedRoute>
 *   <Componente />
 * </ProtectedRoute>
 * 
 * // Role específica (ADMIN ou EDITOR)
 * <ProtectedRoute requiredRole="ADMIN">
 *   <AdminComponent />
 * </ProtectedRoute>
 * 
 * // Múltiplas roles (ADMIN OU EDITOR)
 * <ProtectedRoute requiredRole={['ADMIN', 'EDITOR']}>
 *   <EditorComponent />
 * </ProtectedRoute>
 * 
 * // Permissão específica
 * <ProtectedRoute required="users:read">
 *   <UsersList />
 * </ProtectedRoute>
 * 
 * // Múltiplas permissões (todas são necessárias)
 * <ProtectedRoute required={['users:read', 'users:write']}>
 *   <UserEditor />
 * </ProtectedRoute>
 * 
 * // Role + permissões
 * <ProtectedRoute requiredRole="ADMIN" required="system:config">
 *   <SystemConfig />
 * </ProtectedRoute>
 * 
 * Exemplo de uso no roteamento:
 * 
 * <Route 
 *   path="/admin" 
 *   element={
 *     <ProtectedRoute requiredRole="ADMIN">
 *       <AdminPage />
 *     </ProtectedRoute>
 *   } 
 * />
 * 
 * <Route 
 *   path="/users" 
 *   element={
 *     <ProtectedRoute required="users:read">
 *       <UsersPage />
 *     </ProtectedRoute>
 *   } 
 * />
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, required }) => {
  const { isAuthenticated, user, authReady } = useAuth();
  const location = useLocation();
  
  // Verificar permissões se especificado
  const hasRequiredPermissions = required ? useCan(required) : true;

  // Aguardar authReady antes de decidir a renderização ou redirecionamento
  if (!authReady) {
    // Renderizar fallback (splash/spinner) sem redirecionar
    return <LoadingSpinner fullScreen text="Carregando..." />;
  }

  // Se authReady mas não autenticado, redirecionar para login
  if (authReady && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se requiredRole for especificado, verificar roles
  if (requiredRole) {
    let hasRequiredRole = false;
    
    if (Array.isArray(requiredRole)) {
      // Se for array, verificar se o usuário tem pelo menos uma das roles
      hasRequiredRole = requiredRole.includes(user?.role as 'ADMIN' | 'EDITOR');
    } else {
      // Se for string única, verificar se o usuário tem exatamente essa role
      hasRequiredRole = user?.role === requiredRole;
    }

    if (!hasRequiredRole) {
      // Redirecionar para dashboard se não tiver permissão
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Se required for especificado, verificar permissões
  if (required && !hasRequiredPermissions) {
    // Renderizar página de acesso negado sem redirecionar
    return <ForbiddenPage />;
  }

  // Se authReady e autenticado (e com permissões se aplicável), renderizar children
  return <>{children}</>;
};

export default ProtectedRoute; 