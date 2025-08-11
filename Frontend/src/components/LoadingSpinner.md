# LoadingSpinner

Componente reutilizável para exibir indicadores de carregamento em toda a aplicação.

## Características

- ✅ **Múltiplos tamanhos**: `sm`, `md`, `lg`, `xl`
- ✅ **Variantes de cor**: `default`, `primary`, `secondary`, `success`, `warning`, `error`
- ✅ **Texto opcional**: Suporte para mensagens de carregamento
- ✅ **Modo fullScreen**: Para carregamentos de página inteira
- ✅ **Acessibilidade**: `role="status"` e `aria-label`
- ✅ **Customizável**: Classes CSS adicionais via `className`
- ✅ **Responsivo**: Funciona em todos os tamanhos de tela

## Uso Básico

```tsx
import { LoadingSpinner } from '../components';

// Spinner simples
<LoadingSpinner />

// Com tamanho específico
<LoadingSpinner size="lg" />

// Com variante de cor
<LoadingSpinner variant="primary" />

// Com texto
<LoadingSpinner text="Carregando dados..." />

// Full screen
<LoadingSpinner fullScreen text="Carregando aplicação..." />
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Tamanho do spinner |
| `variant` | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error'` | `'default'` | Variante de cor |
| `text` | `string` | `undefined` | Texto exibido abaixo do spinner |
| `fullScreen` | `boolean` | `false` | Se deve ocupar tela inteira |
| `className` | `string` | `''` | Classes CSS adicionais |

## Tamanhos

- **`sm`**: 16x16px - Ideal para botões e elementos pequenos
- **`md`**: 32x32px - Tamanho padrão, bom para a maioria dos casos
- **`lg`**: 48x48px - Para carregamentos de seções importantes
- **`xl`**: 64x64px - Para carregamentos de página ou modal

## Variantes de Cor

- **`default`**: Cinza neutro - Uso geral
- **`primary`**: Azul - Ações principais
- **`secondary`**: Cinza - Ações secundárias
- **`success`**: Verde - Operações bem-sucedidas
- **`warning`**: Amarelo - Avisos e operações em andamento
- **`error`**: Vermelho - Erros e operações falhadas

## Casos de Uso

### 1. Carregamento de Página (ProtectedRoute)
```tsx
if (!authReady) {
  return <LoadingSpinner fullScreen text="Carregando..." />;
}
```

### 2. Botões com Estado de Carregamento
```tsx
<button disabled={isLoading}>
  {isLoading ? (
    <>
      <LoadingSpinner size="sm" variant="primary" />
      <span>Salvando...</span>
    </>
  ) : (
    <span>Salvar</span>
  )}
</button>
```

### 3. Carregamento de Dados
```tsx
{isLoading ? (
  <LoadingSpinner text="Carregando documentos..." />
) : (
  <DocumentList documents={documents} />
)}
```

### 4. Carregamento Inline
```tsx
<p className="flex items-center">
  <span>Verificando permissões</span>
  <LoadingSpinner size="sm" className="ml-2" />
</p>
```

### 5. Carregamento de Formulário
```tsx
<form onSubmit={handleSubmit}>
  {/* campos do formulário */}
  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? (
      <LoadingSpinner size="sm" variant="success" text="Salvando..." />
    ) : (
      "Salvar"
    )}
  </button>
</form>
```

## Acessibilidade

O componente inclui:
- `role="status"` para leitores de tela
- `aria-label="Carregando..."` para contexto
- Suporte a navegação por teclado
- Contraste adequado em todas as variantes

## Performance

- Componente leve e otimizado
- Animações CSS nativas (sem JavaScript)
- Re-renderização mínima
- Suporte a React.memo se necessário

## Exemplos Completos

Veja `LoadingSpinner.example.tsx` para exemplos detalhados de todas as funcionalidades.
