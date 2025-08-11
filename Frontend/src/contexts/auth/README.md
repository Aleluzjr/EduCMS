# Módulo de Autenticação

Este módulo foi refatorado para separar responsabilidades e melhorar a manutenibilidade do código de autenticação.

## Estrutura

### `types.ts`
- Interfaces e tipos relacionados à autenticação
- `User`, `AuthState`, `AuthContextType`, etc.

### `storage.ts`
- Gerenciamento de tokens no localStorage
- Funções para get/set/clear de tokens

### `jwt.ts`
- Utilitários para manipulação de JWT
- Decodificação, verificação de expiração, etc.

### `scheduler.ts`
- Agendamento de refresh automático de tokens
- Classe `RefreshScheduler` com timer único

### `refreshManager.ts`
- Singleton para gerenciar refresh de tokens
- Sistema de mutex para evitar refresh paralelo
- Fila de promises aguardando refresh

### `broadcast.ts`
- Comunicação entre abas via BroadcastChannel
- Sincronização de estado de autenticação

## Uso

```typescript
import { 
  useAuth, 
  User, 
  AuthState,
  authStorage,
  jwtUtils 
} from '../contexts/auth';

// No componente
const { user, login, logout } = useAuth();
```

## Benefícios da Refatoração

1. **Separação de Responsabilidades**: Cada arquivo tem uma função específica
2. **Reutilização**: Módulos podem ser usados independentemente
3. **Testabilidade**: Cada módulo pode ser testado isoladamente
4. **Manutenibilidade**: Código mais organizado e fácil de entender
5. **Escalabilidade**: Novos recursos podem ser adicionados sem afetar outros módulos

## Configuração

O `AuthProvider` aceita a prop `persistAccessToken` para controlar se o accessToken deve ser persistido no localStorage:

```typescript
<AuthProvider persistAccessToken={true}>
  {children}
</AuthProvider>
```

Por padrão, apenas o refreshToken é persistido por segurança.
