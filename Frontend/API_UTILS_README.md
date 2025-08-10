# Sistema de API com Tratamento de Erro Centralizado

Este documento descreve o sistema de API implementado com tratamento de erro centralizado, parse seguro de JSON e interceptor para logout global.

## 🚀 Funcionalidades Principais

### 1. Tratamento de Erro Centralizado
- **Parse seguro de JSON**: Evita crashes quando a resposta não é JSON válido
- **Mapeamento de mensagens legíveis**: Traduz códigos de erro em mensagens amigáveis
- **Estrutura de erro consistente**: Padrão uniforme para todos os erros da API

### 2. Interceptor para 401 (Unauthorized)
- **Logout global automático**: Quando um token expira, dispara logout em toda a aplicação
- **Integração com AuthContext**: Usa eventos customizados para comunicação entre módulos
- **Fallback de segurança**: Limpa tokens e redireciona para login

### 3. Hooks Personalizados
- **useApi**: Para requisições públicas
- **useAuthApi**: Para requisições autenticadas
- **useCrudApi**: Para operações CRUD completas

## 📁 Estrutura dos Arquivos

```
Frontend/src/
├── config/
│   └── api.ts                 # Configuração central da API
├── hooks/
│   ├── useApi.ts              # Hooks personalizados para API
│   └── index.ts               # Exportações dos hooks
├── contexts/
│   └── AuthContext.tsx        # Contexto de autenticação
└── components/
    └── ExampleApiUsage.tsx    # Exemplo de uso dos hooks
```

## 🔧 Configuração

### Variáveis de Ambiente
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
```

### Configuração da API
```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
};
```

## 📖 Como Usar

### 1. Requisições Básicas

#### Sem Autenticação
```typescript
import { useApi } from '../hooks';

function MyComponent() {
  const api = useApi<MyDataType>();
  
  const handleRequest = async () => {
    await api.execute('/api/public-endpoint');
    
    if (api.success) {
      console.log('Dados:', api.data);
    } else if (api.error) {
      console.error('Erro:', api.error.message);
    }
  };
  
  return (
    <button onClick={handleRequest} disabled={api.isLoading}>
      {api.isLoading ? 'Carregando...' : 'Fazer Requisição'}
    </button>
  );
}
```

#### Com Autenticação
```typescript
import { useAuthApi } from '../hooks';

function MyComponent() {
  const api = useAuthApi<MyDataType>();
  
  const handleRequest = async () => {
    await api.execute('/api/protected-endpoint');
    
    if (api.success) {
      console.log('Dados:', api.data);
    } else if (api.error) {
      console.error('Erro:', api.error.message);
    }
  };
  
  return (
    <button onClick={handleRequest} disabled={api.isLoading}>
      {api.isLoading ? 'Carregando...' : 'Fazer Requisição'}
    </button>
  );
}
```

### 2. Operações CRUD

```typescript
import { useCrudApi } from '../hooks';

function MyComponent() {
  const crud = useCrudApi<MyDataType>();
  
  const handleCreate = async () => {
    const newData = { name: 'Exemplo', description: 'Descrição' };
    await crud.create('/api/resources', newData);
    
    if (crud.success) {
      console.log('Criado:', crud.data);
    } else if (crud.error) {
      console.error('Erro:', crud.error.message);
    }
  };
  
  const handleUpdate = async () => {
    const updateData = { name: 'Atualizado' };
    await crud.update('/api/resources/1', updateData);
    
    if (crud.success) {
      console.log('Atualizado:', crud.data);
    } else if (crud.error) {
      console.error('Erro:', crud.error.message);
    }
  };
  
  const handleDelete = async () => {
    await crud.remove('/api/resources/1');
    
    if (crud.success) {
      console.log('Removido com sucesso');
    } else if (crud.error) {
      console.error('Erro:', crud.error.message);
    }
  };
  
  return (
    <div>
      <button onClick={handleCreate} disabled={crud.isLoading}>Criar</button>
      <button onClick={handleUpdate} disabled={crud.isLoading}>Atualizar</button>
      <button onClick={handleDelete} disabled={crud.isLoading}>Remover</button>
    </div>
  );
}
```

### 3. Tratamento de Erros

```typescript
function MyComponent() {
  const api = useApi<MyDataType>();
  
  // Limpar erro
  const handleClearError = () => {
    api.clearError();
  };
  
  // Resetar estado
  const handleReset = () => {
    api.reset();
  };
  
  return (
    <div>
      {api.error && (
        <div className="error-message">
          <p>Erro: {api.error.message}</p>
          <p>Status: {api.error.status}</p>
          <p>Código: {api.error.code}</p>
          <button onClick={handleClearError}>Limpar Erro</button>
        </div>
      )}
      
      <button onClick={handleReset}>Resetar</button>
    </div>
  );
}
```

## 🎯 Estados dos Hooks

Cada hook retorna um objeto com os seguintes estados:

```typescript
interface UseApiState<T> {
  data: T | null;           // Dados da resposta
  error: ApiError | null;    // Erro, se houver
  isLoading: boolean;        // Se está carregando
  success: boolean;          // Se foi bem-sucedido
}
```

## 🚨 Tratamento de Erros

### Estrutura do Erro
```typescript
interface ApiError {
  message: string;    // Mensagem legível para o usuário
  status: number;     // Código de status HTTP
  code?: string;      // Código de erro personalizado
  details?: any;      // Detalhes adicionais do erro
}
```

### Códigos de Erro Mapeados
- **Autenticação**: `UNAUTHORIZED`, `INVALID_CREDENTIALS`, `TOKEN_EXPIRED`
- **Validação**: `VALIDATION_ERROR`, `REQUIRED_FIELD`, `INVALID_EMAIL`
- **Permissão**: `FORBIDDEN`, `INSUFFICIENT_PERMISSIONS`
- **Recurso**: `NOT_FOUND`, `ALREADY_EXISTS`, `CONFLICT`
- **Servidor**: `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`, `TIMEOUT`
- **Rede**: `NETWORK_ERROR`, `CORS_ERROR`
- **Upload**: `FILE_TOO_LARGE`, `INVALID_FILE_TYPE`, `UPLOAD_FAILED`

### Mensagens por Status HTTP
- **400**: Requisição inválida
- **401**: Não autorizado
- **403**: Acesso negado
- **404**: Recurso não encontrado
- **409**: Conflito com recurso existente
- **422**: Dados inválidos
- **429**: Muitas requisições
- **500**: Erro interno do servidor
- **502**: Servidor temporariamente indisponível
- **503**: Serviço indisponível
- **504**: Tempo limite excedido

## 🔐 Sistema de Autenticação

### Interceptor 401
Quando uma requisição retorna 401 (Unauthorized):

1. **Tenta refresh do token** automaticamente
2. **Se falhar**: Dispara evento `api:unauthorized`
3. **AuthContext escuta** o evento e faz logout global
4. **Fallback**: Limpa tokens e redireciona para login

### Evento Customizado
```typescript
// Disparado pela API
const logoutEvent = new CustomEvent('api:unauthorized', {
  detail: { reason: 'Token expirado ou inválido' }
});
window.dispatchEvent(logoutEvent);

// Escutado pelo AuthContext
window.addEventListener('api:unauthorized', (event) => {
  console.log('Logout global:', event.detail);
  clearAuth();
});
```

## 🧪 Testando

### Componente de Exemplo
Use o componente `ExampleApiUsage.tsx` para testar todas as funcionalidades:

```typescript
import ExampleApiUsage from './components/ExampleApiUsage';

function App() {
  return (
    <div>
      <ExampleApiUsage />
    </div>
  );
}
```

### Simulando Erros
- **401**: Use um endpoint protegido sem token
- **404**: Use uma URL inexistente
- **500**: Use um endpoint que retorna erro do servidor
- **Timeout**: Aumente o timeout para testar

## 🔄 Migração

### De Código Antigo
```typescript
// Antes
try {
  const response = await apiRequest('/api/endpoint');
  const data = await response.json();
  // processar dados
} catch (error) {
  console.error('Erro:', error);
}

// Depois
const api = useApi<MyDataType>();
await api.execute('/api/endpoint');

if (api.success) {
  // processar api.data
} else if (api.error) {
  // tratar api.error.message
}
```

### Benefícios da Migração
- ✅ **Menos código boilerplate**
- ✅ **Tratamento de erro consistente**
- ✅ **Estados de loading automáticos**
- ✅ **Mensagens de erro legíveis**
- ✅ **Logout global automático**

## 🚀 Próximos Passos

1. **Migrar componentes existentes** para usar os novos hooks
2. **Adicionar mais códigos de erro** específicos do seu domínio
3. **Implementar retry automático** para erros de rede
4. **Adicionar métricas** de erro para monitoramento
5. **Implementar cache** para respostas bem-sucedidas

## 📝 Notas Importantes

- **Sempre use os hooks** em vez das funções diretas da API
- **Trate os estados** `isLoading`, `success` e `error` nos componentes
- **Use `clearError()`** para limpar erros quando necessário
- **Use `reset()`** para resetar o estado completo
- **O logout global é automático** - não precisa implementar manualmente
