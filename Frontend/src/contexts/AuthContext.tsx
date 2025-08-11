import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiRequest } from '../config/api';
import { useToastContext } from './ToastContext';
import {
  User,
  AuthState,
  AuthContextType,
  LogoutReason,
  authStorage,
  jwtUtils,
  RefreshScheduler,
  RefreshManager,
  AuthBroadcaster
} from './auth';

const DEBUG_AUTH = false;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
  persistAccessToken?: boolean;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  persistAccessToken = false
}) => {
  const toast = useToastContext();
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: persistAccessToken ? authStorage.getAccessToken() : null,
    refreshToken: authStorage.getRefreshToken(),
    isAuthenticated: false,
    isLoading: true,
    isRefreshing: false,
    authReady: false,
  });

  const scheduler = new RefreshScheduler();
  const refreshManager = RefreshManager.getInstance();
  const broadcaster = new AuthBroadcaster();

  // Função para limpar autenticação
  const clearAuth = useCallback((shouldBroadcast: boolean = true, reason?: LogoutReason) => {
    DEBUG_AUTH && console.debug('clearAuth chamado:', { shouldBroadcast, reason });
    
    scheduler.cancel();
    refreshManager.reset();
    
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isRefreshing: false,
      authReady: true,
    });
    
    authStorage.clearTokens();
    
    if (reason === 'expiration' || reason === 'failed_refresh') {
      toast.warning('Sua sessão expirou. Faça login novamente.');
    }
    
    if (shouldBroadcast) {
      broadcaster.send('logout');
    }
  }, [toast]);

  // Função para refresh de token
  const refreshAuth = useCallback(async (refreshToken?: string): Promise<void> => {
    DEBUG_AUTH && console.debug('Iniciando refresh de token...');
    
    return refreshManager.runOnce(async () => {
      const tokenToUse = refreshToken || authState.refreshToken;
      if (!tokenToUse) {
        throw new Error('Refresh token não disponível');
      }

      const response = await apiRequest('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: tokenToUse })
      });

      if (response.ok) {
        const data = await response.json();
        const newAuthState = {
          user: data.user,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          isAuthenticated: true,
          isLoading: false,
          isRefreshing: false,
          authReady: true
        };

        setAuthState(newAuthState);
        
        if (persistAccessToken) {
          authStorage.setAccessToken(data.access_token);
        }
        authStorage.setRefreshToken(data.refresh_token);

        // Agendar próximo refresh
        scheduler.scheduleRefresh(data.access_token, () => {
          refreshAuth().catch(() => {
            clearAuth(true, 'expiration');
          });
        });

        // Enviar broadcast
        broadcaster.send('refresh', {
          user: data.user,
          accessToken: data.access_token,
          refreshToken: data.refresh_token
        });
      } else if (response.status === 401 || response.status === 403) {
        clearAuth(true, 'failed_refresh');
        throw new Error('Token inválido');
      } else {
        throw new Error('Erro na requisição');
      }
    });
  }, [authState.refreshToken, persistAccessToken, clearAuth]);

  // Listener para eventos de API não autorizada
  useEffect(() => {
    const handleApiUnauthorized = async (event: CustomEvent) => {
      DEBUG_AUTH && console.debug('Evento de API não autorizada recebido:', event.detail);
      
      if (window.location.pathname.startsWith('/login')) {
        return;
      }

      if (authState.isRefreshing) {
        return;
      }

      if (!authState.refreshToken) {
        clearAuth(true, 'expiration');
        return;
      }

      try {
        await refreshAuth(authState.refreshToken);
      } catch (error) {
        clearAuth(true, 'failed_refresh');
      }
    };

    document.addEventListener('api:unauthorized', handleApiUnauthorized as unknown as EventListener);
    
    return () => {
      document.removeEventListener('api:unauthorized', handleApiUnauthorized as unknown as EventListener);
    };
  }, [authState.isRefreshing, authState.refreshToken, refreshAuth, clearAuth]);

  // Listener para mensagens de broadcast
  useEffect(() => {
    broadcaster.onMessage((message) => {
      const { type, data } = message;
      
      switch (type) {
                 case 'login':
         case 'refresh':
           if (data?.user && data?.accessToken && data?.refreshToken) {
             setAuthState(prev => ({
               ...prev,
               user: data.user!,
               accessToken: data.accessToken!,
               refreshToken: data.refreshToken!,
               isAuthenticated: true,
               isLoading: false,
               isRefreshing: false,
               authReady: true
             }));
            
            if (persistAccessToken) {
              authStorage.setAccessToken(data.accessToken);
            }
            authStorage.setRefreshToken(data.refreshToken);
            
            scheduler.scheduleRefresh(data.accessToken, () => {
              refreshAuth().catch(() => {
                clearAuth(true, 'expiration');
              });
            });
          }
          break;
          
        case 'logout':
          if (!authState.isRefreshing) {
            clearAuth(false);
          }
          break;
      }
    });

    return () => {
      broadcaster.close();
    };
  }, [authState.isRefreshing, persistAccessToken, refreshAuth, clearAuth]);

  // Bootstrap da sessão
  useEffect(() => {
    const bootstrapSession = async () => {
      DEBUG_AUTH && console.debug('Iniciando bootstrap da sessão...');
      
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        try {
          await refreshAuth(refreshToken);
        } catch (error) {
          DEBUG_AUTH && console.debug('Refresh inicial falhou:', error);
        }
      }
      
      setAuthState(prev => ({ ...prev, authReady: true }));
    };

    bootstrapSession();
  }, [refreshAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro no login');
      }

      const data = await response.json();
      const newAuthState = {
        user: data.user,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        isAuthenticated: true,
        isLoading: false,
        isRefreshing: false,
        authReady: true
      };

      setAuthState(newAuthState);
      
      if (persistAccessToken) {
        authStorage.setAccessToken(data.access_token);
      }
      authStorage.setRefreshToken(data.refresh_token);

      // Agendar próximo refresh
      scheduler.scheduleRefresh(data.access_token, () => {
        refreshAuth().catch(() => {
          clearAuth(true, 'expiration');
        });
      });

      // Enviar broadcast
      broadcaster.send('login', {
        user: data.user,
        accessToken: data.access_token,
        refreshToken: data.refresh_token
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (authState.accessToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.accessToken}`
          }
        });
      }
    } catch (error) {
      // Erro no logout - não expor detalhes
    } finally {
      clearAuth(true, 'user_action');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      setAuthState(prev => ({
        ...prev,
        user: { ...prev.user!, ...userData }
      }));
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 