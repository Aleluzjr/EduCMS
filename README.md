# CMS - Sistema de Gerenciamento de Conteúdo

Sistema completo de CMS com backend em NestJS e frontend em React + TypeScript.

## 🚀 Tecnologias

**Backend:**
- NestJS (Node.js)
- TypeScript
- PostgreSQL
- JWT Authentication
- File Upload

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

## 📁 Estrutura

```
CMS/
├── backend/          # API NestJS
├── Frontend/         # Aplicação React
└── README.md         # Este arquivo
```

## 🛠️ Instalação

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## 🔑 Funcionalidades

- Autenticação JWT
- Gerenciamento de usuários
- Editor de documentos
- Biblioteca de mídia
- Templates de slides
- Sistema de campos customizáveis
- Upload de arquivos
- Auditoria de ações

## 📝 Variáveis de Ambiente

Copie os arquivos `.env.example` e configure suas variáveis:
- `backend/env.example` → `backend/.env`
- `Frontend/env.example` → `Frontend/.env`

## 🚀 Comandos

**Backend:**
- `npm run start:dev` - Desenvolvimento
- `npm run build` - Build de produção
- `npm run start:prod` - Executar produção

**Frontend:**
- `npm run dev` - Desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview da build 