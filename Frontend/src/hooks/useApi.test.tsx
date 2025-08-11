/**
 * Testes para os hooks de API
 * 
 * Este arquivo contém testes para verificar se os hooks estão funcionando corretamente
 * e se o sistema de refresh está funcionando como esperado.
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useApi, useAuthApi, useCrudApi } from './useApi';

// Mock do AuthContext
const mockRefreshAuth = jest.fn().mockResolvedValue(undefined);
const mockUseAuth = jest.fn(() => ({
  refreshAuth: mockRefreshAuth
}));

// Mock da API
const mockApiRequest = jest.fn();
const mockApiRequestWithAuth = jest.fn();

jest.mock('../contexts/AuthContext', () => ({
  useAuth: mockUseAuth
}));

jest.mock('../config/api', () => ({
  apiRequestWithErrorHandling: mockApiRequest,
  apiRequestWithAuthAndErrorHandling: mockApiRequestWithAuth
}));

describe('useApi Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve inicializar com estado padrão', () => {
    const { result } = renderHook(() => useApi());

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(false);
  });

  it('deve executar requisição com sucesso', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockApiRequest.mockResolvedValue({
      success: true,
      data: mockData
    });

    const { result } = renderHook(() => useApi());

    await act(async () => {
      await result.current.execute('/api/test');
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(true);
  });

  it('deve tratar erro na requisição', async () => {
    const mockError = { message: 'Erro de teste', status: 400, code: 'TEST_ERROR' };
    mockApiRequest.mockResolvedValue({
      success: false,
      error: mockError
    });

    const { result } = renderHook(() => useApi());

    await act(async () => {
      await result.current.execute('/api/test');
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(mockError);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(false);
  });
});

describe('useAuthApi Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve inicializar com estado padrão', () => {
    const { result } = renderHook(() => useAuthApi(mockRefreshAuth));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(false);
  });

  it('deve executar requisição autenticada com sucesso', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockApiRequestWithAuth.mockResolvedValue({
      success: true,
      data: mockData
    });

    const { result } = renderHook(() => useAuthApi(mockRefreshAuth));

    await act(async () => {
      await result.current.execute('/api/protected');
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(true);
  });

  it('deve tratar erro na requisição autenticada', async () => {
    const mockError = { message: 'Erro de teste', status: 401, code: 'UNAUTHORIZED' };
    mockApiRequestWithAuth.mockResolvedValue({
      success: false,
      error: mockError
    });

    const { result } = renderHook(() => useAuthApi(mockRefreshAuth));

    await act(async () => {
      await result.current.execute('/api/protected');
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(mockError);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(false);
  });
});

describe('useCrudApi Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve inicializar com estado padrão', () => {
    const { result } = renderHook(() => useCrudApi(mockRefreshAuth));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(false);
  });

  it('deve executar operação GET com sucesso', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockApiRequestWithAuth.mockResolvedValue({
      success: true,
      data: mockData
    });

    const { result } = renderHook(() => useCrudApi(mockRefreshAuth));

    await act(async () => {
      await result.current.get('/api/users/1');
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(true);
  });

  it('deve executar operação CREATE com sucesso', async () => {
    const mockData = { id: 1, name: 'New User' };
    mockApiRequestWithAuth.mockResolvedValue({
      success: true,
      data: mockData
    });

    const { result } = renderHook(() => useCrudApi(mockRefreshAuth));

    await act(async () => {
      await result.current.create('/api/users', { name: 'New User' });
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(true);
  });

  it('deve executar operação UPDATE com sucesso', async () => {
    const mockData = { id: 1, name: 'Updated User' };
    mockApiRequestWithAuth.mockResolvedValue({
      success: true,
      data: mockData
    });

    const { result } = renderHook(() => useCrudApi(mockRefreshAuth));

    await act(async () => {
      await result.current.update('/api/users/1', { name: 'Updated User' });
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(true);
  });

  it('deve executar operação DELETE com sucesso', async () => {
    mockApiRequestWithAuth.mockResolvedValue({
      success: true
    });

    const { result } = renderHook(() => useCrudApi(mockRefreshAuth));

    await act(async () => {
      await result.current.remove('/api/users/1');
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(true);
  });
});

describe('Sistema de Refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar refreshAuth quando fornecido', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockApiRequestWithAuth.mockResolvedValue({
      success: true,
      data: mockData
    });

    const { result } = renderHook(() => useAuthApi(mockRefreshAuth));

    await act(async () => {
      await result.current.execute('/api/protected');
    });

    // Verificar se a requisição foi feita com a função de refresh
    expect(mockApiRequestWithAuth).toHaveBeenCalledWith(
      '/api/protected',
      undefined,
      mockRefreshAuth
    );
  });

  it('não deve chamar refreshAuth quando não fornecido', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockApiRequestWithAuth.mockResolvedValue({
      success: true,
      data: mockData
    });

    const { result } = renderHook(() => useAuthApi());

    await act(async () => {
      await result.current.execute('/api/protected');
    });

    // Verificar se a requisição foi feita sem função de refresh
    expect(mockApiRequestWithAuth).toHaveBeenCalledWith(
      '/api/protected',
      undefined,
      undefined
    );
  });
});
