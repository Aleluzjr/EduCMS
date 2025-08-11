import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'EDITOR' | Array<'ADMIN' | 'EDITOR'>;
}

/**
 * Componente para proteger rotas baseado em autenticação e roles
 * 
 * Exemplos de uso:
 * 
 * // Apenas autenticação (sem verificação de role)
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
 *   path="/editor" 
 *   element={
 *     <ProtectedRoute requiredRole={['ADMIN', 'EDITOR']}>
 *       <EditorPage />
 *     </ProtectedRoute>
 *   } 
 * />
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, authReady } = useAuth();
  const location = useLocation();

  // Aguardar authReady antes de decidir a renderização ou redirecionamento
  if (!authReady) {
    // Renderizar fallback (splash/spinner) sem redirecionar
    return <LoadingSpinner fullScreen text="Carregando..." />;
  }

  // Se authReady mas não autenticado, redirecionar para login
  if (authReady && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se requiredRole for especificado, verificar permissões
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

  // Se authReady e autenticado (e com permissões se aplicável), renderizar children
  return <>{children}</>;
};

export default ProtectedRoute; 