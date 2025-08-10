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

// Função helper para fazer requisições com timeout e interceptor de auth
export const apiRequest = async (url: string, options: RequestInit = {}) => {
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

    // Verificar se a resposta tem conteúdo
    const responseText = await response.text();
    
    // Se a resposta não estiver vazia, tentar fazer parse como JSON
    if (responseText.trim()) {
      try {
        const jsonData = JSON.parse(responseText);
        // Criar uma nova resposta com o JSON parseado
        return new Response(JSON.stringify(jsonData), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        // Retornar a resposta original como texto
        return new Response(responseText, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }
    } else {
      console.warn('⚠️ Resposta vazia recebida');
      return response;
    }
  } catch (error) {
    clearTimeout(timeoutId);
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
      
      // Se não conseguir fazer refresh, limpar tokens e redirecionar para login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    
    return response;
  } catch (error) {
    console.error('❌ Erro na requisição com auth:', error);
    throw error;
  }
}; 