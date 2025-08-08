# Backend CMS

Backend da aplicação CMS desenvolvido com NestJS.

## 🚀 Instalação

```bash
npm install
```

## ⚙️ Configuração

1. Copie o arquivo de exemplo de ambiente:
```bash
cp env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`:
   - `DB_HOST`: Host do banco de dados MySQL
   - `DB_PORT`: Porta do banco de dados (padrão: 3306)
   - `DB_USER`: Usuário do banco de dados
   - `DB_PASS`: Senha do banco de dados
   - `DB_NAME`: Nome do banco de dados
   - `PORT`: Porta da aplicação (padrão: 3000)
   - `NODE_ENV`: Ambiente de execução (development/production)

## 🏃‍♂️ Executando a aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run start:prod

# Debug
npm run start:debug
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## 📁 Estrutura do Projeto

```
src/
├── config/                 # Configurações
├── common/                 # Utilitários e pipes globais
│   ├── interceptors/      # Interceptors globais
│   └── pipes/            # Pipes de validação
├── documents/             # Módulo de documentos
│   ├── dto/              # Data Transfer Objects
│   ├── documents.controller.ts
│   ├── documents.service.ts
│   └── documents.module.ts
├── fields/               # Módulo de campos
├── media/                # Módulo de mídia
│   ├── dto/              # Data Transfer Objects
│   ├── media.controller.ts
│   ├── media.service.ts
│   └── media.module.ts
├── slide-templates/      # Módulo de templates de slides
├── upload/               # Módulo de upload de arquivos
├── entities/             # Entidades do TypeORM
└── main.ts              # Ponto de entrada da aplicação
```

## 🔧 Tecnologias Utilizadas

- **NestJS**: Framework para construção de aplicações escaláveis
- **TypeORM**: ORM para banco de dados
- **MySQL**: Banco de dados
- **class-validator**: Validação de dados
- **Multer**: Upload de arquivos

## 📚 API Endpoints

### Documentos
- `GET /api/documents` - Listar todos os documentos
- `GET /api/documents?withMedia=true` - Listar documentos com mídias
- `GET /api/documents/:id` - Buscar documento por ID
- `GET /api/documents/:id/with-media` - Buscar documento com mídias por ID
- `POST /api/documents` - Criar novo documento
- `PUT /api/documents/:id` - Atualizar documento
- `DELETE /api/documents/:id` - Remover documento

### Mídia
- `GET /api/media` - Listar todas as mídias
- `GET /api/media?documentId=1` - Listar mídias de um documento
- `GET /api/media/stats` - Estatísticas das mídias
- `GET /api/media/:id` - Buscar mídia por ID
- `POST /api/media` - Upload de arquivo (multipart/form-data)
- `PATCH /api/media/:id` - Atualizar mídia
- `DELETE /api/media/:id` - Remover mídia

### Upload
- `POST /api/upload` - Upload de arquivos

### Teste de Conexão
- `GET /api/db-test` - Testar conexão com banco de dados

## 🔒 Segurança

- Validação de entrada com DTOs
- Tratamento global de erros
- Configuração de CORS
- Validação de tipos de arquivo no upload
- Limite de tamanho de arquivo (10MB)

## 📝 Licença

Este projeto está sob a licença MIT.
