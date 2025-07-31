// Configuração centralizada da API usando variáveis de ambiente
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  API_PATH: import.meta.env.VITE_API_PATH || '/api',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
};

export const API_BASE = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PATH}`;

// Endpoints específicos
export const ENDPOINTS = {
  DOCUMENTS: `${API_BASE}/documents`,
  SLIDE_TEMPLATES: `${API_BASE}/slide-templates`,
  FIELDS: `${API_BASE}/fields`,
  UPLOAD: `${API_BASE}/upload`,
  DB_TEST: `${API_BASE}/db-test`,
} as const;

// Função helper para fazer requisições com timeout
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}; 