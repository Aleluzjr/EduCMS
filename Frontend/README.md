# EduCMS Frontend

## Configuração de Variáveis de Ambiente

### 1. Copie o arquivo de exemplo
```bash
cp env.example .env
```

### 2. Configure as variáveis no arquivo .env
```env
# Configurações da API
VITE_API_BASE_URL=http://localhost:3000
VITE_API_PATH=/api
VITE_API_TIMEOUT=10000

# Configurações do Frontend
VITE_APP_NAME=EduCMS
VITE_APP_VERSION=1.0.0
```

### 3. Variáveis disponíveis

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_BASE_URL` | URL base do backend | `http://localhost:3000` |
| `VITE_API_PATH` | Caminho da API | `/api` |
| `VITE_API_TIMEOUT` | Timeout das requisições (ms) | `10000` |
| `VITE_APP_NAME` | Nome da aplicação | `EduCMS` |
| `VITE_APP_VERSION` | Versão da aplicação | `1.0.0` |

### 4. Desenvolvimento
```bash
npm install
npm run dev
```

### 5. Build para produção
```bash
npm run build
```

## Estrutura de Configuração

O projeto usa uma configuração centralizada em `src/config/api.ts` que:

- ✅ Carrega variáveis de ambiente automaticamente
- ✅ Fornece fallbacks para valores padrão
- ✅ Centraliza todos os endpoints da API
- ✅ Inclui função helper com timeout
- ✅ Evita inconsistências de configuração

## Benefícios

- 🔧 **Fácil manutenção**: Mude a URL da API em um só lugar
- 🚀 **Flexibilidade**: Diferentes configurações para dev/prod
- 🛡️ **Segurança**: Variáveis sensíveis fora do código
- 📱 **Portabilidade**: Funciona em diferentes ambientes 