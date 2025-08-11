import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { apiRequest, registerAuthTokenGetter } from '../config/api';
import { useToast } from '../hooks/useToast';
import { RefreshScheduler, RefreshManager, AuthBroadcaster, authStorage } from './auth';
import { AuthState, User, AuthContextType } from './auth/types';

const DEBUG_AUTH = true;

// Instâncias singleton criadas fora do componente para evitar recriação
const scheduler = new RefreshScheduler();
const refreshManager = RefreshManager.getInstance();
const broadcaster = new AuthBroadcaster();

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
  const toast = useToast();
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: persistAccessToken ? authStorage.getAccessToken() : null,
    refreshToken: authStorage.getRefreshToken(),
    isAuthenticated: false,
    isLoading: true,
    isRefreshing: false,
    authReady: false,
    permissions: [],
  });

  // Registrar getter de tokens para a API
  useEffect(() => {
    registerAuthTokenGetter(() => ({
      accessToken: authState.accessToken,
      refreshToken: authState.refreshToken
    }));
  }, [authState.accessToken, authState.refreshToken]);

  // Função para limpar autenticação
  const clearAuth = useCallback((shouldBroadcast: boolean = true, reason?: string) => {
    DEBUG_AUTH && console.debug('clearAuth chamado:', { shouldBroadcast, reason });
    
    scheduler.cancel();
    
    setAuthState(prev => ({
      ...prev,
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isRefreshing: false,
      permissions: [],
    }));
    
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
    DEBUG_AUTH && console.debug('🔄 Iniciando refresh de token...');
    DEBUG_AUTH && console.debug('📋 Estado atual:', { 
      hasRefreshToken: !!authState.refreshToken, 
      hasAccessToken: !!authState.accessToken,
      isAuthenticated: authState.isAuthenticated 
    });
    
    return refreshManager.runOnce(async () => {
      const tokenToUse = refreshToken || authState.refreshToken;
      if (!tokenToUse) {
        DEBUG_AUTH && console.debug('❌ Refresh token não disponível');
        throw new Error('Refresh token não disponível');
      }

      try {
        DEBUG_AUTH && console.debug('📡 Fazendo requisição de refresh...');
        DEBUG_AUTH && console.debug('🔑 Token usado:', tokenToUse.substring(0, 20) + '...');
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ refresh_token: tokenToUse })
        });

        DEBUG_AUTH && console.debug('📊 Resposta do refresh:', { status: response.status, ok: response.ok });

        if (response.ok) {
          const data = await response.json();
          DEBUG_AUTH && console.debug('✅ Refresh bem-sucedido, atualizando estado...', data);
          
          const newAuthState = {
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            isRefreshing: false,
            authReady: true,
            permissions: data.user?.permissions || []
          };

          setAuthState(newAuthState);
          
          if (persistAccessToken) {
            authStorage.setAccessToken(data.access_token);
          }
          authStorage.setRefreshToken(data.refresh_token);

          scheduler.scheduleRefresh(data.access_token, () => {
            refreshAuth().catch((error) => {
              DEBUG_AUTH && console.debug('❌ Refresh agendado falhou:', error);
              clearAuth(true, 'expiration');
            });
          });

          broadcaster.send('refresh', {
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token
          });
        } else {
          const errorText = await response.text();
          DEBUG_AUTH && console.debug('❌ Refresh falhou:', response.status, errorText);
          
          if (response.status === 401 || response.status === 403) {
            clearAuth(true, 'failed_refresh');
            throw new Error(`Token inválido: ${response.status}`);
          } else {
            throw new Error(`Erro na requisição: ${response.status}`);
          }
        }
      } catch (error) {
        DEBUG_AUTH && console.debug('❌ Erro durante refresh:', error);
        clearAuth(true, 'failed_refresh');
        throw error;
      }
    });
  }, [authState.refreshToken, persistAccessToken, clearAuth]);

  // Listener para eventos de API não autorizada
  useEffect(() => {
    const handleApiUnauthorized = async (event: CustomEvent) => {
      DEBUG_AUTH && console.debug('🚨 Evento de API não autorizada recebido:', event.detail);
      
      if (window.location.pathname.startsWith('/login')) {
        DEBUG_AUTH && console.debug('📍 Ignorando evento em página de login');
        return;
      }

      if (authState.isRefreshing) {
        DEBUG_AUTH && console.debug('🔄 Ignorando evento durante refresh em andamento');
        return;
      }

      if (!authState.refreshToken) {
        DEBUG_AUTH && console.debug('❌ Sem refresh token, disparando logout');
        clearAuth(true, 'expiration');
        return;
      }

      try {
        DEBUG_AUTH && console.debug('🔄 Tentando refresh via evento...');
        await refreshAuth(authState.refreshToken);
        DEBUG_AUTH && console.debug('✅ Refresh via evento bem-sucedido');
      } catch (error) {
        DEBUG_AUTH && console.debug('❌ Refresh via evento falhou:', error);
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
    const handleBroadcastMessage = (message: any) => {
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
              authReady: true,
              permissions: data.user!.permissions || []
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
    };

    broadcaster.onMessage(handleBroadcastMessage);
    
    return () => {
      broadcaster.close();
    };
  }, [authState.isRefreshing, persistAccessToken, refreshAuth, clearAuth]);

  // Bootstrap da sessão - executado apenas uma vez
  useEffect(() => {
    const bootstrapSession = async () => {
      DEBUG_AUTH && console.debug('🚀 Iniciando bootstrap da sessão...');
      
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        try {
          DEBUG_AUTH && console.debug('🔄 Tentando refresh inicial...');
          await refreshAuth(refreshToken);
          DEBUG_AUTH && console.debug('✅ Bootstrap bem-sucedido');
        } catch (error) {
          DEBUG_AUTH && console.debug('❌ Refresh inicial falhou:', error);
          // Limpar tokens inválidos
          authStorage.clearTokens();
        }
      } else {
        DEBUG_AUTH && console.debug('ℹ️ Sem refresh token para bootstrap');
      }
      
      setAuthState(prev => ({ ...prev, authReady: true }));
    };

    bootstrapSession();
  }, []); // Sem dependências - executado apenas uma vez

  const login = useCallback(async (email: string, password: string) => {
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
        authReady: true,
        permissions: data.user?.permissions || []
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
  }, [persistAccessToken, refreshAuth, clearAuth]);

  const logout = useCallback(async () => {
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
  }, [authState.accessToken, clearAuth]);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (authState.user) {
      setAuthState(prev => ({
        ...prev,
        user: { ...prev.user!, ...userData },
        permissions: userData.permissions || prev.permissions
      }));
    }
  }, [authState.user]);

  // Helpers de permissões
  const can = useCallback((permission: string): boolean => {
    return authState.permissions.includes(permission);
  }, [authState.permissions]);

  const canAny = useCallback((permissions: string[]): boolean => {
    return permissions.some(perm => authState.permissions.includes(perm));
  }, [authState.permissions]);

  const canAll = useCallback((permissions: string[]): boolean => {
    return permissions.every(perm => authState.permissions.includes(perm));
  }, [authState.permissions]);

  // Memoizar o valor do contexto para evitar recriações desnecessárias
  const value = useMemo<AuthContextType>(() => ({
    ...authState,
    login,
    logout,
    refreshAuth,
    updateUser,
    can,
    canAny,
    canAll
  }), [authState, login, logout, refreshAuth, updateUser, can, canAny, canAll]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 