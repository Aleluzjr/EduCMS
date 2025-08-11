import { useState, useCallback } from 'react';
import { 
  apiRequestWithErrorHandling, 
  apiRequestWithAuthAndErrorHandling,
  ApiResponse,
  ApiError 
} from '../config/api';

interface UseApiState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  success: boolean;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (url: string, options?: RequestInit) => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

/**
 * Hook para requisições sem autenticação
 * Use este hook para endpoints públicos que não requerem token de acesso
 */
export const useApi = <T = any>(): UseApiReturn<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    success: false
  });

  const execute = useCallback(async (url: string, options?: RequestInit) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiRequestWithErrorHandling<T>(url, options);
      
      if (response.success && response.data) {
        setState({
          data: response.data,
          error: null,
          isLoading: false,
          success: true
        });
      } else if (response.error) {
        setState({
          data: null,
          error: response.error,
          isLoading: false,
          success: false
        });
      }
    } catch (error) {
      // Erro inesperado no hook useApi - não expor detalhes
      setState({
        data: null,
        error: {
          message: 'Erro inesperado na requisição',
          status: 0,
          code: 'UNKNOWN_ERROR'
        },
        isLoading: false,
        success: false
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      success: false
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    clearError
  };
};

/**
 * Hook para requisições com autenticação
 * IMPORTANTE: Sempre passe a função refreshAuth do AuthContext como parâmetro
 * 
 * Exemplo de uso:
 * const { refreshAuth } = useAuth();
 * const { execute, data, error, isLoading } = useAuthApi(refreshAuth);
 */
export const useAuthApi = <T = any>(refreshAuthFn?: () => Promise<void>): UseApiReturn<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    success: false
  });

  const execute = useCallback(async (url: string, options?: RequestInit) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiRequestWithAuthAndErrorHandling<T>(url, options, refreshAuthFn);
      
      if (response.success && response.data) {
        setState({
          data: response.data,
          error: null,
          isLoading: false,
          success: true
        });
      } else if (response.error) {
        setState({
          data: null,
          error: response.error,
          isLoading: false,
          success: false
        });
      }
    } catch (error) {
      // Erro inesperado no hook useAuthApi - não expor detalhes
      setState({
        data: null,
        error: {
          message: 'Erro inesperado na requisição',
          status: 0,
          code: 'UNKNOWN_ERROR'
        },
        isLoading: false,
        success: false
      });
    }
  }, [refreshAuthFn]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      success: false
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    clearError
  };
};

/**
 * Hook para operações CRUD com autenticação
 * IMPORTANTE: Sempre passe a função refreshAuth do AuthContext como parâmetro
 * 
 * Exemplo de uso:
 * const { refreshAuth } = useAuth();
 * const { create, update, get, remove, data, error, isLoading } = useCrudApi(refreshAuth);
 */
export const useCrudApi = <T = any>(refreshAuthFn?: () => Promise<void>) => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    success: false
  });

  const create = useCallback(async (url: string, data: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiRequestWithAuthAndErrorHandling<T>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }, refreshAuthFn);
      
      if (response.success && response.data) {
        setState({
          data: response.data,
          error: null,
          isLoading: false,
          success: true
        });
      } else if (response.error) {
        setState({
          data: null,
          error: response.error,
          isLoading: false,
          success: false
        });
      }
    } catch (error) {
      setState({
        data: null,
        error: {
          message: 'Erro ao criar recurso',
          status: 0,
          code: 'CREATE_ERROR'
        },
        isLoading: false,
        success: false
      });
    }
  }, [refreshAuthFn]);

  const update = useCallback(async (url: string, data: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiRequestWithAuthAndErrorHandling<T>(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }, refreshAuthFn);
      
      if (response.success && response.data) {
        setState({
          data: response.data,
          error: null,
          isLoading: false,
          success: true
        });
      } else if (response.error) {
        setState({
          data: null,
          error: response.error,
          isLoading: false,
          success: false
        });
      }
    } catch (error) {
      setState({
        data: null,
        error: {
          message: 'Erro ao atualizar recurso',
          status: 0,
          code: 'UPDATE_ERROR'
        },
        isLoading: false,
        success: false
      });
    }
  }, [refreshAuthFn]);

  const get = useCallback(async (url: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiRequestWithAuthAndErrorHandling<T>(url, {
        method: 'GET'
      }, refreshAuthFn);
      
      if (response.success && response.data) {
        setState({
          data: response.data,
          error: null,
          isLoading: false,
          success: true
        });
      } else if (response.error) {
        setState({
          data: null,
          error: response.error,
          isLoading: false,
          success: false
        });
      }
    } catch (error) {
      setState({
        data: null,
        error: {
          message: 'Erro ao buscar recurso',
          status: 0,
          code: 'GET_ERROR'
        },
        isLoading: false,
        success: false
      });
    }
  }, [refreshAuthFn]);

  const remove = useCallback(async (url: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiRequestWithAuthAndErrorHandling<T>(url, {
        method: 'DELETE'
      }, refreshAuthFn);
      
      if (response.success) {
        setState({
          data: null,
          error: null,
          isLoading: false,
          success: true
        });
      } else if (response.error) {
        setState({
          data: null,
          error: response.error,
          isLoading: false,
          success: false
        });
      }
    } catch (error) {
      setState({
        data: null,
        error: {
          message: 'Erro ao remover recurso',
          status: 0,
          code: 'DELETE_ERROR'
        },
        isLoading: false,
        success: false
      });
    }
  }, [refreshAuthFn]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      success: false
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    create,
    update,
    get,
    remove,
    reset,
    clearError
  };
};
