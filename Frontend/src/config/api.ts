// Configuração centralizada da API usando variáveis de ambiente
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'), // Aumentado para 30 segundos
};

// Lista de endpoints de autenticação que NÃO devem disparar logout global
export const AUTH_EXCEPTIONS = [
  '/auth/login', 
  '/auth/register', 
  '/auth/refresh', 
  '/auth/validate'
];

// Endpoints específicos
export const ENDPOINTS = {
  DOCUMENTS: `${API_CONFIG.BASE_URL}/api/documents`,
  SLIDE_TEMPLATES: `${API_CONFIG.BASE_URL}/api/slide-templates`,
  FIELDS: `${API_CONFIG.BASE_URL}/api/fields`,
  UPLOAD: `${API_CONFIG.BASE_URL}/api/upload`,
  DB_TEST: `${API_CONFIG.BASE_URL}/api/db-test`,
} as const;

// Tipos para tratamento de erro
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// Mapeamento de códigos de erro para mensagens seguras
const ERROR_MESSAGES: Record<string, string> = {
  // Erros de autenticação
  'UNAUTHORIZED': 'Acesso não autorizado',
  'INVALID_CREDENTIALS': 'Credenciais inválidas',
  'TOKEN_EXPIRED': 'Sessão expirada',
  'INVALID_TOKEN': 'Token inválido',
  
  // Erros de validação
  'VALIDATION_ERROR': 'Dados inválidos',
  'REQUIRED_FIELD': 'Campo obrigatório',
  'INVALID_EMAIL': 'Email inválido',
  'PASSWORD_TOO_WEAK': 'Senha muito fraca',
  
  // Erros de permissão
  'FORBIDDEN': 'Acesso negado',
  'INSUFFICIENT_PERMISSIONS': 'Permissões insuficientes',
  
  // Erros de recurso
  'NOT_FOUND': 'Recurso não encontrado',
  'ALREADY_EXISTS': 'Recurso já existe',
  'CONFLICT': 'Conflito com recurso existente',
  
  // Erros de servidor
  'INTERNAL_ERROR': 'Erro interno',
  'SERVICE_UNAVAILABLE': 'Serviço indisponível',
  'TIMEOUT': 'Tempo limite excedido',
  
  // Erros de rede
  'NETWORK_ERROR': 'Erro de conexão',
  'CORS_ERROR': 'Erro de política de origem',
  
  // Erros de upload
  'FILE_TOO_LARGE': 'Arquivo muito grande',
  'INVALID_FILE_TYPE': 'Tipo de arquivo não suportado',
  'UPLOAD_FAILED': 'Falha no upload',
};

// Função para obter mensagem de erro segura
const getErrorMessage = (error: any, status: number): string => {
  if (error?.message) {
    return error.message;
  }
  
  if (error?.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  
  switch (status) {
    case 400:
      return 'Requisição inválida';
    case 401:
      return 'Não autorizado';
    case 403:
      return 'Acesso negado';
    case 404:
      return 'Recurso não encontrado';
    case 409:
      return 'Conflito com recurso existente';
    case 422:
      return 'Dados inválidos';
    case 429:
      return 'Muitas requisições. Tente novamente mais tarde';
    case 500:
      return 'Erro interno do servidor';
    case 502:
      return 'Servidor indisponível';
    case 503:
      return 'Serviço indisponível';
    case 504:
      return 'Tempo limite excedido';
    default:
      return 'Erro inesperado';
  }
};

// Função para fazer parse seguro de JSON
const safeJsonParse = (text: string): any => {
  if (!text || !text.trim()) {
    return null;
  }
  
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

// Função para obter tokens do localStorage
const getAuthTokens = (persistAccessToken: boolean = false) => {
  return {
    accessToken: persistAccessToken ? localStorage.getItem('accessToken') : null,
    refreshToken: localStorage.getItem('refreshToken')
  };
};

// Função para fazer refresh do token
const refreshAuthToken = async (refreshToken: string, persistAccessToken: boolean = false): Promise<string | null> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      
      if (persistAccessToken) {
        localStorage.setItem('accessToken', data.access_token);
      }
      localStorage.setItem('refreshToken', data.refresh_token);
      
      return data.access_token;
    }
  } catch {
    // Erro no refresh do token
  }
  return null;
};

// Função para disparar logout global
const triggerGlobalLogout = (shouldDispatchEvent: boolean = true) => {
  if (shouldDispatchEvent) {
    const logoutEvent = new CustomEvent('api:unauthorized', {
      detail: { reason: 'Sessão expirada' }
    });
    document.dispatchEvent(logoutEvent);
  }
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Função helper para fazer requisições com timeout e interceptor de auth
export const apiRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;

  // Sempre anexar o token de acesso atual se disponível
  const { accessToken } = getAuthTokens(false);
  if (accessToken && !(options.headers as Record<string, string>)?.['Authorization']) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    };
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (response.status === 401) {
      const isAuthEndpoint = AUTH_EXCEPTIONS.some(authPath => 
        url.includes(authPath) || fullUrl.includes(authPath)
      );
      
      if (isAuthEndpoint) {
        // Para endpoints de auth, não disparar evento de logout
        triggerGlobalLogout(false);
        throw new Error('Credenciais inválidas');
      } else {
        // Para outros endpoints, disparar evento de logout
        triggerGlobalLogout(true);
        throw new Error('Sessão expirada');
      }
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError: ApiError = {
        message: 'Tempo limite da requisição excedido',
        status: 408,
        code: 'TIMEOUT'
      };
      throw timeoutError;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError: ApiError = {
        message: 'Erro de conexão com o servidor',
        status: 0,
        code: 'NETWORK_ERROR'
      };
      throw networkError;
    }
    
    throw error;
  }
};

// Função para fazer refresh e reexecutar uma requisição
export const refreshAndRetry = async (
  url: string, 
  options: RequestInit, 
  refreshAuthFn: () => Promise<void>
): Promise<Response> => {
  try {
    await refreshAuthFn();
    
    const { accessToken } = getAuthTokens(false);
    
    if (accessToken) {
      const newOptions = {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`
        }
      };
      
      const retryResponse = await apiRequest(url, newOptions);
      
      if (retryResponse.status === 401) {
        const isAuthEndpoint = AUTH_EXCEPTIONS.some(authPath => 
          url.includes(authPath) || url.includes('/auth/')
        );
        
        if (isAuthEndpoint) {
          triggerGlobalLogout(false);
        } else {
          triggerGlobalLogout(true);
        }
        
        throw new Error('Falha na renovação da sessão');
      }
      
      return retryResponse;
    } else {
      throw new Error('Token não encontrado após refresh');
    }
  } catch (error) {
    const isAuthEndpoint = AUTH_EXCEPTIONS.some(authPath => 
      url.includes(authPath) || url.includes('/auth/')
    );
    
    if (isAuthEndpoint) {
      triggerGlobalLogout(false);
    } else {
      triggerGlobalLogout(true);
    }
    
    throw new Error('Falha na renovação da sessão');
  }
};

// Função para fazer requisições com auth e interceptor global para refresh
export const apiRequestWithAuth = async (
  url: string, 
  options: RequestInit = {}, 
  refreshAuthFn?: () => Promise<void>
): Promise<Response> => {
  try {
    const response = await apiRequest(url, options);
    
    if (response.status === 401) {
      // Verificar se é um endpoint de auth
      const isAuthEndpoint = AUTH_EXCEPTIONS.some(authPath => 
        url.includes(authPath) || url.includes('/auth/')
      );
      
      // Se for endpoint de auth, nunca disparar api:unauthorized
      if (isAuthEndpoint) {
        triggerGlobalLogout(false);
        throw new Error('Credenciais inválidas');
      }
      
      // Para outros endpoints, tentar refresh se disponível
      if (refreshAuthFn) {
        try {
          await refreshAuthFn();
          
          const { accessToken } = getAuthTokens(false);
          
          if (accessToken) {
            const newOptions = {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`
              }
            };
            
            const retryResponse = await apiRequest(url, newOptions);
            
            if (retryResponse.status === 401) {
              // Segunda tentativa falhou, disparar logout
              triggerGlobalLogout(true);
              throw new Error('Falha na renovação da sessão');
            }
            
            return retryResponse;
          } else {
            throw new Error('Token não encontrado após refresh');
          }
        } catch (refreshError) {
          // Refresh falhou, disparar logout
          triggerGlobalLogout(true);
          throw new Error('Falha na renovação da sessão');
        }
      } else {
        // Sem função de refresh, tentar refresh automático
        const { refreshToken } = getAuthTokens(false);
        
        if (refreshToken) {
          try {
            let newAccessToken = await refreshAuthToken(refreshToken, false);
            
            if (newAccessToken) {
              const newOptions = {
                ...options,
                headers: {
                  ...options.headers,
                  'Authorization': `Bearer ${newAccessToken}`
                }
              };
              return await apiRequest(url, newOptions);
            }
          } catch (autoRefreshError) {
            // Refresh automático falhou
          }
        }
        
        // Refresh falhou ou não há refresh token, disparar logout
        triggerGlobalLogout(true);
        throw new Error('Falha na renovação da sessão');
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

// Função para fazer requisições com tratamento de erro centralizado
export const apiRequestWithErrorHandling = async <T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiRequest(url, options);
    
    const responseText = await response.text();
    const data = safeJsonParse(responseText);
    
    if (!response.ok) {
      const error: ApiError = {
        message: getErrorMessage(data, response.status),
        status: response.status,
        code: data?.code,
        details: data
      };
      
      return {
        success: false,
        error
      };
    }
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError
      };
    }
    
    const genericError: ApiError = {
      message: 'Erro inesperado na requisição',
      status: 0,
      code: 'UNKNOWN_ERROR'
    };
    
    return {
      success: false,
      error: genericError
    };
  }
};

// Função para fazer requisições com auth e tratamento de erro centralizado
export const apiRequestWithAuthAndErrorHandling = async <T = any>(
  url: string, 
  options: RequestInit = {},
  refreshAuthFn?: () => Promise<void>
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiRequestWithAuth(url, options, refreshAuthFn);
    
    const responseText = await response.text();
    const data = safeJsonParse(responseText);
    
    if (!response.ok) {
      const error: ApiError = {
        message: getErrorMessage(data, response.status),
        status: response.status,
        code: data?.code,
        details: data
      };
      
      return {
        success: false,
        error
      };
    }
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError
      };
    }
    
    const genericError: ApiError = {
      message: 'Erro inesperado na requisição',
      status: 0,
      code: 'UNKNOWN_ERROR'
    };
    
    return {
      success: false,
      error: genericError
    };
  }
}; 