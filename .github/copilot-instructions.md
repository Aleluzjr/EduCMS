# Copilot Instructions for AI Coding Agents

## Visão Geral do Projeto
Este repositório é um CMS educacional com arquitetura separada para frontend e backend. O frontend está em `frontend/` (React + Vite + Tailwind + TypeScript). O backend será criado em `backend/` (Next.js).

## Estrutura de Pastas
- `frontend/`: Aplicação React, organizada em `src/` com componentes, campos customizados e estilos.
- `backend/`: Backend (Next.js) será criado aqui. Não há código backend ainda.
- Arquivos de configuração (eslint, tailwind, tsconfig, vite) estão em `frontend/`.

## Fluxos de Desenvolvimento
- **Build/Dev Frontend:**
  - Use `npm run dev` dentro de `frontend/` para desenvolvimento local.
  - Use `npm run build` para build de produção.
- **Testes:**
  - Não há testes automatizados configurados até o momento.
- **Debug:**
  - Debug típico do React/Vite. Use ferramentas do navegador e logs.

## Convenções e Padrões
- Componentes React são organizados por funcionalidade em subpastas (`components`, `fields`).
- Comunicação com API backend é feita via `fetch` para endpoints REST (exemplo: `http://localhost:3001/api`).
- O frontend espera endpoints como `/api/documents`, `/api/slide-templates`, `/api/upload`.
- Uso extensivo de Tailwind para estilização.
- Tipos TypeScript para dados principais (`Document`, `SlideTemplate`, `Field`).

## Integrações e Dependências
- **Frontend:**
  - React, Vite, Tailwind, Lucide Icons, React Quill.
  - API backend REST (a ser implementada em Next.js).
- **Backend:**
  - Next.js (a ser criado em `backend/`).

## Exemplos de Padrões
- Componentes de campos customizados em `frontend/src/components/fields/` (ex: `HtmlField.tsx`, `MediaField.tsx`).
- Organização de slides e templates em componentes (`SlideEditor`, `SlideTemplateBuilder`).
- Fetch de dados e manipulação de estado centralizado em `App.tsx`.

## Recomendações para Agentes
- Sempre respeite a separação entre frontend (`frontend/`) e backend (`backend/`).
- Siga os tipos TypeScript definidos para dados e componentes.
- Ao criar endpoints backend, siga os padrões REST esperados pelo frontend.
- Atualize este arquivo conforme novas convenções surgirem.

---

Seções incompletas ou dúvidas? Solicite feedback ao usuário para ajustar instruções conforme necessário.
