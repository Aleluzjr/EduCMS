// Configuração centralizada da API usando variáveis de ambiente
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
};

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

// Mapeamento de códigos de erro para mensagens legíveis
const ERROR_MESSAGES: Record<string, string> = {
  // Erros de autenticação
  'UNAUTHORIZED': 'Você não está autorizado a acessar este recurso',
  'INVALID_CREDENTIALS': 'Email ou senha incorretos',
  'TOKEN_EXPIRED': 'Sua sessão expirou. Faça login novamente',
  'INVALID_TOKEN': 'Token de autenticação inválido',
  
  // Erros de validação
  'VALIDATION_ERROR': 'Dados inválidos fornecidos',
  'REQUIRED_FIELD': 'Campo obrigatório não preenchido',
  'INVALID_EMAIL': 'Formato de email inválido',
  'PASSWORD_TOO_WEAK': 'Senha muito fraca',
  
  // Erros de permissão
  'FORBIDDEN': 'Você não tem permissão para realizar esta ação',
  'INSUFFICIENT_PERMISSIONS': 'Permissões insuficientes',
  
  // Erros de recurso
  'NOT_FOUND': 'Recurso não encontrado',
  'ALREADY_EXISTS': 'Recurso já existe',
  'CONFLICT': 'Conflito com recurso existente',
  
  // Erros de servidor
  'INTERNAL_ERROR': 'Erro interno do servidor',
  'SERVICE_UNAVAILABLE': 'Serviço temporariamente indisponível',
  'TIMEOUT': 'Tempo limite da requisição excedido',
  
  // Erros de rede
  'NETWORK_ERROR': 'Erro de conexão com o servidor',
  'CORS_ERROR': 'Erro de política de origem cruzada',
  
  // Erros de upload
  'FILE_TOO_LARGE': 'Arquivo muito grande',
  'INVALID_FILE_TYPE': 'Tipo de arquivo não suportado',
  'UPLOAD_FAILED': 'Falha no upload do arquivo',
};

// Função para obter mensagem de erro legível
const getErrorMessage = (error: any, status: number): string => {
  // Se já temos uma mensagem de erro estruturada
  if (error?.message) {
    return error.message;
  }
  
  // Se temos um código de erro
  if (error?.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  
  // Mapeamento por status HTTP
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
      return 'Servidor temporariamente indisponível';
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
  } catch (error) {
    console.warn('⚠️ Falha ao fazer parse do JSON:', error);
    return null;
  }
};

// Função para obter tokens do localStorage
const getAuthTokens = () => {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken')
  };
};

// Função para fazer refresh do token
const refreshAuthToken = async (refreshToken: string): Promise<string | null> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      return data.access_token;
    }
  } catch (error) {
    console.error('❌ Erro ao fazer refresh do token:', error);
  }
  return null;
};

// Função para disparar logout global
const triggerGlobalLogout = () => {
  // Disparar evento customizado para o AuthContext
  const logoutEvent = new CustomEvent('api:unauthorized', {
    detail: { reason: 'Token expirado ou inválido' }
  });
  window.dispatchEvent(logoutEvent);
  
  // Fallback: limpar tokens e redirecionar
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
};

// Função helper para fazer requisições com timeout e interceptor de auth
export const apiRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  // Construir URL completa se apenas o path for fornecido
  const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`;

  // Adicionar token de autorização se disponível
  const { accessToken } = getAuthTokens();
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

    // Interceptor para 401 - disparar logout global
    if (response.status === 401) {
      console.warn('🚨 Token expirado ou inválido - disparando logout global');
      triggerGlobalLogout();
      throw new Error('Sessão expirada');
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Tratamento específico para timeout
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError: ApiError = {
        message: 'Tempo limite da requisição excedido',
        status: 408,
        code: 'TIMEOUT'
      };
      throw timeoutError;
    }
    
    // Tratamento para erros de rede
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError: ApiError = {
        message: 'Erro de conexão com o servidor',
        status: 0,
        code: 'NETWORK_ERROR'
      };
      throw networkError;
    }
    
    console.error('❌ Erro na requisição:', error);
    throw error;
  }
};

// Função para fazer requisições com retry automático em caso de token expirado
export const apiRequestWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    const response = await apiRequest(url, options);
    
    // Se receber 401 (Unauthorized), tentar fazer refresh do token
    if (response.status === 401) {
      console.log('🔄 Token expirado, tentando refresh...');
      const { refreshToken } = getAuthTokens();
      
      if (refreshToken) {
        const newAccessToken = await refreshAuthToken(refreshToken);
        
        if (newAccessToken) {
          console.log('✅ Token refreshado, repetindo requisição...');
          // Repetir a requisição com o novo token
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${newAccessToken}`
            }
          };
          return await apiRequest(url, newOptions);
        }
      }
      
      // Se não conseguir fazer refresh, disparar logout global
      triggerGlobalLogout();
      throw new Error('Falha na renovação da sessão');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Erro na requisição com auth:', error);
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
    
    // Verificar se a resposta tem conteúdo
    const responseText = await response.text();
    
    // Parse seguro do JSON
    const data = safeJsonParse(responseText);
    
    if (!response.ok) {
      // Construir erro estruturado
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
    // Tratar erros específicos da API
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError
      };
    }
    
    // Erro genérico
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
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiRequestWithAuth(url, options);
    
    // Verificar se a resposta tem conteúdo
    const responseText = await response.text();
    
    // Parse seguro do JSON
    const data = safeJsonParse(responseText);
    
    if (!response.ok) {
      // Construir erro estruturado
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
    // Tratar erros específicos da API
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError
      };
    }
    
    // Erro genérico
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