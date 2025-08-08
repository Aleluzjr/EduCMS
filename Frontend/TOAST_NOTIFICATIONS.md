# Sistema de Notificações com Toastify

## Visão Geral

O projeto agora utiliza o **React-Toastify** para substituir os alerts nativos do navegador. Isso proporciona uma experiência de usuário muito melhor com notificações elegantes e personalizáveis.

## Configuração

### 1. Dependências Instaladas
```bash
npm install react-toastify
```

### 2. Estrutura de Arquivos
```
src/
├── hooks/
│   └── useToast.ts          # Hook personalizado para notificações
├── contexts/
│   └── ToastContext.tsx     # Contexto para gerenciar notificações
├── components/
│   └── ConfirmDialog.tsx    # Dialog de confirmação personalizado
└── App.tsx                  # Configuração do ToastProvider
```

## Como Usar

### 1. Em Componentes Funcionais

```tsx
import { useToastContext } from '../contexts/ToastContext';

function MeuComponente() {
  const { success, error, warning, info } = useToastContext();

  const handleSuccess = () => {
    success('Operação realizada com sucesso!');
  };

  const handleError = () => {
    error('Ocorreu um erro na operação');
  };

  const handleWarning = () => {
    warning('Atenção: Esta ação é irreversível');
  };

  const handleInfo = () => {
    info('Informação importante para o usuário');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Sucesso</button>
      <button onClick={handleError}>Erro</button>
      <button onClick={handleWarning}>Aviso</button>
      <button onClick={handleInfo}>Info</button>
    </div>
  );
}
```

### 2. Configuração Personalizada

```tsx
const { success } = useToastContext();

// Configuração personalizada
success('Mensagem personalizada', {
  autoClose: 5000,           // Fecha em 5 segundos
  position: 'bottom-center',  // Posição personalizada
  hideProgressBar: true,      // Esconde a barra de progresso
});
```

### 3. Dialog de Confirmação

```tsx
import ConfirmDialog from '../components/ConfirmDialog';

function MeuComponente() {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este item?',
      type: 'danger',
      onConfirm: () => {
        // Lógica de exclusão
        deleteItem();
      },
    });
  };

  return (
    <div>
      <button onClick={handleDelete}>Excluir</button>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  );
}
```

## Tipos de Notificação

### 1. Success (Sucesso)
```tsx
success('Operação realizada com sucesso!');
```

### 2. Error (Erro)
```tsx
error('Ocorreu um erro na operação');
```

### 3. Warning (Aviso)
```tsx
warning('Atenção: Esta ação é irreversível');
```

### 4. Info (Informação)
```tsx
info('Informação importante para o usuário');
```

## Configurações Disponíveis

### ToastOptions
```tsx
interface ToastOptions {
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  autoClose?: number | false;  // Tempo em ms ou false para não fechar
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  progress?: number;
}
```

### ConfirmDialog Props
```tsx
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
}
```

## Estilos Personalizados

Os estilos estão definidos em `src/index.css`:

```css
/* Estilos personalizados para o Toastify */
.Toastify__toast {
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
}

.Toastify__toast--success {
  background: #10b981;
  color: white;
}

.Toastify__toast--error {
  background: #ef4444;
  color: white;
}

.Toastify__toast--warning {
  background: #f59e0b;
  color: white;
}

.Toastify__toast--info {
  background: #3b82f6;
  color: white;
}
```

## Migração de Alerts

### Antes (Alert Nativo)
```tsx
// ❌ Não usar mais
alert('Operação realizada com sucesso!');
window.confirm('Tem certeza?');
```

### Depois (Toastify)
```tsx
// ✅ Usar notificações
success('Operação realizada com sucesso!');
error('Ocorreu um erro');
warning('Atenção');
info('Informação');

// ✅ Usar ConfirmDialog
setConfirmDialog({
  isOpen: true,
  title: 'Confirmar',
  message: 'Tem certeza?',
  onConfirm: () => { /* ação */ },
});
```

## Benefícios

1. **UX Melhorada**: Notificações elegantes e não intrusivas
2. **Personalização**: Cores, posições e comportamentos customizáveis
3. **Acessibilidade**: Melhor suporte para leitores de tela
4. **Responsividade**: Funciona bem em dispositivos móveis
5. **Consistência**: Interface uniforme em toda a aplicação
6. **Flexibilidade**: Diferentes tipos de notificação para diferentes situações

## Exemplos Práticos

### Upload de Arquivos
```tsx
const handleUpload = async (file: File) => {
  try {
    await uploadFile(file);
    success('Arquivo enviado com sucesso!');
  } catch (err) {
    error('Erro ao enviar arquivo');
  }
};
```

### Exclusão com Confirmação
```tsx
const handleDelete = (id: number) => {
  setConfirmDialog({
    isOpen: true,
    title: 'Excluir Item',
    message: 'Esta ação não pode ser desfeita.',
    type: 'danger',
    onConfirm: async () => {
      try {
        await deleteItem(id);
        success('Item excluído com sucesso');
      } catch (err) {
        error('Erro ao excluir item');
      }
    },
  });
};
```

### Validação de Formulário
```tsx
const handleSubmit = (data: FormData) => {
  if (!data.name) {
    error('Nome é obrigatório');
    return;
  }
  
  if (data.email && !isValidEmail(data.email)) {
    warning('Email inválido');
    return;
  }
  
  success('Formulário enviado com sucesso!');
};
``` 