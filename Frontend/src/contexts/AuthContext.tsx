import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { apiRequest, apiRequestWithAuth } from '../config/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR';
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: (refreshToken?: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

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
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: false,
    isLoading: true,
  });

  // Referências para controlar os timers de refresh
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Função para limpar todos os timers
  const clearAllTimers = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
      validationTimerRef.current = null;
    }
  };

  // Função para agendar refresh automático
  const scheduleAutoRefresh = (accessToken: string) => {
    try {
      // Decodificar o token para obter a data de expiração
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Converter para milissegundos
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      
      // Agendar refresh 5 minutos antes da expiração
      const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000); // Mínimo 1 minuto
      
      console.log(`🕐 Agendando refresh automático em ${Math.round(refreshTime / 60000)} minutos`);
      
      refreshTimerRef.current = setTimeout(async () => {
        console.log('🔄 Executando refresh automático...');
        await refreshAuth();
      }, refreshTime);
    } catch (error) {
      console.error('❌ Erro ao agendar refresh automático:', error);
      // Fallback: agendar refresh em 23 horas
      refreshTimerRef.current = setTimeout(async () => {
        await refreshAuth();
      }, 23 * 60 * 60 * 1000);
    }
  };

  // Função para agendar validação periódica
  const schedulePeriodicValidation = () => {
    // Validar token a cada 6 horas
    validationTimerRef.current = setTimeout(async () => {
      if (authState.accessToken && authState.isAuthenticated) {
        console.log('🔄 Validação periódica do token...');
        await validateToken(authState.accessToken, authState.refreshToken!);
      }
      schedulePeriodicValidation(); // Agendar próxima validação
    }, 6 * 60 * 60 * 1000);
  };

  // Listener para logout global disparado pela API
  useEffect(() => {
    const handleApiUnauthorized = (event: CustomEvent) => {
      console.log('🚨 Logout global disparado pela API:', event.detail);
      clearAuth();
    };

    // Adicionar listener para o evento customizado
    window.addEventListener('api:unauthorized', handleApiUnauthorized as EventListener);

    // Cleanup do listener
    return () => {
      window.removeEventListener('api:unauthorized', handleApiUnauthorized as EventListener);
    };
  }, []);

  useEffect(() => {
    // Verificar se há tokens salvos e validar
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      console.log('🔐 Tokens encontrados no localStorage, validando...');
      validateToken(accessToken, refreshToken);
    } else {
      console.log('⚠️ Nenhum token encontrado no localStorage');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }

    // Cleanup dos timers quando o componente for desmontado
    return () => {
      clearAllTimers();
    };
  }, []);

  // Efeito para agendar refresh automático quando o token mudar
  useEffect(() => {
    if (authState.accessToken && authState.isAuthenticated) {
      clearAllTimers();
      scheduleAutoRefresh(authState.accessToken);
      schedulePeriodicValidation();
    }
  }, [authState.accessToken, authState.isAuthenticated]);

  const validateToken = async (accessToken: string, refreshToken: string) => {
    try {
      console.log('🔄 Validando token...');
      // Tentar fazer uma requisição para validar o token
      const response = await apiRequestWithAuth('/auth/me');

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Token válido, usuário autenticado:', userData);
        setAuthState({
          user: userData,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        console.log('⚠️ Token inválido, tentando refresh...');
        // Token inválido, tentar refresh
        await refreshAuth(refreshToken);
      }
    } catch (error) {
      console.error('❌ Erro ao validar token:', error);
      // Limpar tokens inválidos
      clearAuth();
    }
  };

  const refreshAuth = async (refreshToken?: string) => {
    try {
      const tokenToUse = refreshToken || authState.refreshToken;
      if (!tokenToUse) {
        throw new Error('Sem refresh token disponível');
      }
      
      console.log('🔄 Fazendo refresh do token...');
      const response = await apiRequest('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokenToUse })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token refreshado com sucesso');
        const newAuthState = {
          user: data.user,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          isAuthenticated: true,
          isLoading: false
        };

        setAuthState(newAuthState);
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
      } else {
        console.log('❌ Falha no refresh do token');
        throw new Error('Falha no refresh do token');
      }
    } catch (error) {
      console.error('❌ Erro ao fazer refresh do token:', error);
      clearAuth();
    }
  };

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
        isLoading: false
      };

      setAuthState(newAuthState);
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
    } catch (error) {
      console.error('Erro no login:', error);
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
      console.error('Erro no logout:', error);
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    clearAllTimers();
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false
    });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
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