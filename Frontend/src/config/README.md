# Configuração da API

Este diretório contém a configuração centralizada para todas as requisições da API.

## Arquivos

### 1. Lista AUTH_EXCEPTIONS

```typescript
export const AUTH_EXCEPTIONS = [
  '/auth/login', 
  '/auth/register', 
  '/auth/refresh', 
  '/auth/validate'
];
```

Esta lista define os endpoints de autenticação que **NÃO** devem disparar o logout global quando retornam erro 401.

### 2. Funções Principais

- `apiRequest`: Requisição básica com timeout e interceptor de auth
- `apiRequestWithAuth`: Requisição com auth e lógica de refresh automático
- `apiRequestWithErrorHandling`: Requisição com tratamento de erro centralizado
- `apiRequestWithAuthAndErrorHandling`: Requisição com auth e tratamento de erro

### 3. Lógica de Tratamento de Erros 401

#### Para Endpoints de Autenticação (`/auth/*`)
- **NUNCA** dispara evento `api:unauthorized`
- Remove tokens do localStorage silenciosamente
- Lança erro "Credenciais inválidas"

#### Para Endpoints Protegidos (qualquer outro)
- **SEMPRE** dispara evento `api:unauthorized` com `reason: 'Sessão expirada'`
- Remove tokens do localStorage
- Permite que o `AuthContext` trate o logout

### 4. Sistema de Refresh Automático

1. **Primeira tentativa**: Requisição com token atual
2. **Se 401**: Tenta refresh automático (se `refreshAuthFn` fornecida)
3. **Segunda tentativa**: Reexecuta com novo token
4. **Se ainda 401**: Dispara logout global

### 5. Headers de Autorização

- O `Authorization: Bearer {token}` é **sempre** anexado automaticamente
- Usa o token mais recente disponível no localStorage
- Não sobrescreve headers já definidos manualmente

## Uso

```typescript
import { useAuthApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { refreshAuth } = useAuth();
  const { execute, data, error, isLoading } = useAuthApi(refreshAuth);
  
  // A função refreshAuth será usada automaticamente para renovar tokens
  // e reexecutar requisições que falharam com 401
};
```

## Benefícios

- ✅ Tratamento centralizado de erros de autenticação
- ✅ Refresh automático de tokens
- ✅ Prevenção de logout desnecessário em endpoints de auth
- ✅ Headers de autorização automáticos
- ✅ Timeout configurável
- ✅ Tratamento robusto de erros de rede
- ✅ Adicionada lista `AUTH_EXCEPTIONS`
