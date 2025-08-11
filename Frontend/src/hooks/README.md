# Hooks de API - Guia de Uso

Este documento explica como usar corretamente os hooks de API para evitar erros de refresh e garantir o funcionamento correto da autenticação.

## Hooks Disponíveis

### 1. `useApi<T>()` - Requisições sem autenticação
Use para endpoints públicos que não requerem token de acesso.

```tsx
const { execute, data, error, isLoading } = useApi();

useEffect(() => {
  execute('/api/public-data');
}, [execute]);
```

### 2. `useAuthApi<T>(refreshAuthFn)` - Requisições com autenticação
**IMPORTANTE**: Sempre passe a função `refreshAuth` do AuthContext como parâmetro.

```tsx
const { refreshAuth } = useAuth(); // ✅ OBRIGATÓRIO
const { execute, data, error, isLoading } = useAuthApi(refreshAuth); // ✅ Passar refreshAuth

useEffect(() => {
  execute('/api/protected-data');
}, [execute]);
```

### 3. `useCrudApi<T>(refreshAuthFn)` - Operações CRUD com autenticação
**IMPORTANTE**: Sempre passe a função `refreshAuth` do AuthContext como parâmetro.

```tsx
const { refreshAuth } = useAuth(); // ✅ OBRIGATÓRIO
const { 
  create, 
  update, 
  get, 
  remove, 
  data, 
  error, 
  isLoading 
} = useCrudApi(refreshAuth); // ✅ Passar refreshAuth

useEffect(() => {
  get('/api/users');
}, [get]);
```

## ❌ Erros Comuns

### 1. Não passar refreshAuth
```tsx
// ❌ ERRADO - Causa erro de refresh
const { execute } = useAuthApi();

// ✅ CORRETO
const { refreshAuth } = useAuth();
const { execute } = useAuthApi(refreshAuth);
```

### 2. Passar função incorreta
```tsx
// ❌ ERRADO - Função incorreta
const { execute } = useAuthApi(() => console.log('refresh'));

// ✅ CORRETO - Função do AuthContext
const { refreshAuth } = useAuth();
const { execute } = useAuthApi(refreshAuth);
```

### 3. Usar hook autenticado para endpoint público
```tsx
// ❌ ERRADO - Hook desnecessário para endpoint público
const { execute } = useAuthApi(refreshAuth);
execute('/api/public-data');

// ✅ CORRETO - Hook simples para endpoint público
const { execute } = useApi();
execute('/api/public-data');
```

## 🔄 Como o Refresh Funciona

1. **Requisição falha com 401** (token expirado)
2. **Sistema detecta erro 401** automaticamente
3. **Chama refreshAuth** do AuthContext (se fornecido)
4. **Renova o token** de acesso
5. **Reexecuta a requisição** com o novo token
6. **Retorna o resultado** da requisição original

## 🛡️ Sistema de Mutex

O AuthContext implementa um sistema de mutex para evitar múltiplas tentativas de refresh simultâneas:

- Se uma requisição já está fazendo refresh, outras aguardam
- Evita loops infinitos e múltiplas chamadas ao servidor
- Garante que apenas uma renovação de token aconteça por vez

## 📝 Exemplos Completos

### Lista de Usuários
```tsx
const UserList: React.FC = () => {
  const { refreshAuth } = useAuth();
  const { get, data: users, error, isLoading } = useCrudApi(refreshAuth);

  useEffect(() => {
    get('/api/users');
  }, [get]);

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  
  return (
    <div>
      {users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
};
```

### Formulário de Usuário
```tsx
const UserForm: React.FC = () => {
  const { refreshAuth } = useAuth();
  const { create, update, error, isLoading } = useCrudApi(refreshAuth);

  const handleSubmit = (data: any) => {
    if (data.id) {
      update(`/api/users/${data.id}`, data);
    } else {
      create('/api/users', data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* campos do formulário */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Salvando...' : 'Salvar'}
      </button>
      {error && <div>{error.message}</div>}
    </form>
  );
};
```

## 🔧 Solução de Problemas

### Erro: "Token expirado ou inválido"
- Verifique se está passando `refreshAuth` do AuthContext
- Confirme se o usuário está logado
- Verifique se o refreshToken está válido

### Erro: "Falha na renovação da sessão"
- O refreshToken pode ter expirado
- Usuário será redirecionado para login automaticamente
- Verifique logs do console para mais detalhes

### Múltiplas requisições simultâneas
- O sistema de mutex evita isso automaticamente
- Se persistir, verifique se não há múltiplas instâncias do hook

## 📚 Arquivos Relacionados

- `useApi.ts` - Implementação dos hooks
- `useApi.example.tsx` - Exemplos de uso
- `AuthContext.tsx` - Contexto de autenticação
- `api.ts` - Configuração da API

## 🚀 Próximos Passos

1. **Implemente os hooks** seguindo os exemplos
2. **Teste com endpoints reais** da sua API
3. **Monitore os logs** do console para debug
4. **Reporte problemas** se persistirem
