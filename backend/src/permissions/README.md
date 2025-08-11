# Sistema de Autorização por Capabilities

Este módulo implementa um sistema de autorização baseado em capabilities (permissões granulares) para o CMS.

## Estrutura

### Entidades

- **Permission**: Define uma permissão específica (ação + recurso)
- **User**: Usuário com relacionamento many-to-many com permissões

### Enums

#### PermissionAction
- `read`: Permissão de leitura
- `write`: Permissão de escrita (criar/editar)
- `delete`: Permissão de exclusão
- `manage`: Permissão de administração completa

#### PermissionResource
- `users`: Gerenciamento de usuários
- `documents`: Gerenciamento de documentos
- `templates`: Gerenciamento de templates de slides
- `media`: Gerenciamento de arquivos de mídia
- `system`: Configurações do sistema

## Uso

### 1. Decorator @RequirePermissions

```typescript
@Controller('users')
export class UsersController {
  @Get()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @RequirePermissions('users:read')
  async findAll() {
    // Endpoint protegido que requer permissão 'users:read'
  }

  @Post()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @RequirePermissions('users:write')
  async create() {
    // Endpoint protegido que requer permissão 'users:write'
  }
}
```

### 2. Verificação de Permissões no Serviço

```typescript
@Injectable()
export class SomeService {
  constructor(private permissionsService: PermissionsService) {}

  async someMethod(userId: number) {
    // Verificar se o usuário tem uma permissão específica
    const canRead = await this.permissionsService.hasPermission(userId, 'users:read');
    
    // Verificar se o usuário tem todas as permissões necessárias
    const canManage = await this.permissionsService.hasAllPermissions(userId, [
      'users:read',
      'users:write',
      'users:delete'
    ]);
    
    // Verificar se o usuário tem pelo menos uma das permissões
    const canAccess = await this.permissionsService.hasAnyPermission(userId, [
      'users:read',
      'documents:read'
    ]);
  }
}
```

### 3. Permissões Padrão por Role

#### ADMIN
- Todas as permissões para todos os recursos

#### EDITOR
- `documents:read`, `documents:write`
- `templates:read`, `templates:write`
- `media:read`, `media:write`

## Configuração

### 1. Executar Migração SQL

Execute o arquivo `src/database/migrations/create-permissions-tables.sql` no seu banco de dados.

### 2. Configurar Permissões para Usuários Existentes

```bash
npm run setup-permissions
```

Este comando irá:
- Gerar permissões padrão baseadas no role de cada usuário
- Associar as permissões aos usuários no banco de dados

### 3. Atualizar JWT Payload

O sistema agora inclui permissões no JWT:

```typescript
// Payload do JWT
{
  email: "user@example.com",
  sub: 1,
  role: "ADMIN",
  permissions: ["users:read", "users:write", "documents:read", ...]
}
```

### 4. Endpoint /auth/me

O endpoint `/auth/me` retorna as permissões do usuário:

```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "ADMIN",
  "permissions": ["users:read", "users:write", "documents:read", ...]
}
```

## Segurança

- **PoliciesGuard**: Valida permissões antes de permitir acesso aos endpoints
- **JWT Strategy**: Inclui permissões no objeto user do request
- **Auditoria**: Todas as ações são registradas no sistema de auditoria

## Exemplos de Uso

### Proteger Rota com Múltiplas Permissões

```typescript
@Get('admin-stats')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@RequirePermissions('users:read', 'system:read')
async getAdminStats() {
  // Usuário precisa ter AMBAS as permissões
}
```

### Verificar Permissões no Frontend

```typescript
// No frontend, as permissões vêm do JWT ou /auth/me
const user = await authService.getProfile();
const canManageUsers = user.permissions.includes('users:manage');
```

## Migração de Roles Existentes

O sistema mantém compatibilidade com o sistema de roles existente:

- **RolesGuard**: Ainda funciona para proteção baseada em roles
- **PoliciesGuard**: Nova proteção baseada em capabilities
- **Híbrido**: Pode usar ambos os guards se necessário

## Próximos Passos

1. Aplicar `@RequirePermissions` em outros controllers
2. Implementar permissões granulares para recursos específicos
3. Adicionar interface de administração de permissões
4. Implementar cache de permissões para melhor performance
