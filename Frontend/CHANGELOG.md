# Changelog - EduCMS Frontend

## [1.2.0] - 2024-07-31

### ✨ **Novas Funcionalidades**

#### **Edição de Templates**
- **Funcionalidade**: Agora é possível editar templates existentes
- **Implementação**: Botão de edição em cada template da lista
- **Interface**: Formulário pré-preenchido com dados do template
- **Salvamento**: Atualização no banco de dados via PUT request

#### **Melhorias na Gestão de Templates**:
- ✅ **Edição completa**: Modificar nome, ícone e campos do template
- ✅ **Interface intuitiva**: Formulário pré-preenchido para edição
- ✅ **Botões de ação**: Editar, visualizar API e excluir templates
- ✅ **Feedback visual**: Títulos dinâmicos (Criar/Editar Template)
- ✅ **Exclusão de templates**: Remover templates do banco de dados

#### **Comportamento**:
1. **Clicar em "Editar"** → Abre formulário com dados do template
2. **Modificar campos** → Alterações ficam no formulário
3. **Clicar em "Atualizar Template"** → Salva mudanças no banco
4. **Feedback** → Mensagem de sucesso ao atualizar

#### **Arquivos Modificados**:
- `src/App.tsx` - Lógica de edição e exclusão de templates
- `src/components/SlideTemplateBuilder.tsx` - Suporte a edição de templates existentes

### 🎯 **Benefícios**:
- 🔧 **Flexibilidade**: Templates podem ser modificados após criação
- 🎨 **UX melhorada**: Interface consistente entre criar e editar
- 🗑️ **Gestão completa**: Criar, editar e excluir templates
- 📝 **Reutilização**: Templates existentes podem ser adaptados

## [1.1.0] - 2024-07-31

### 🔧 **Correções**

#### **Comportamento de Salvamento de Documentos**
- **Problema**: Ao clicar em "Novo Documento", o documento era salvo automaticamente no banco de dados
- **Solução**: Agora o documento é criado apenas localmente e só é salvo quando o usuário clica em "Salvar"

#### **Melhorias Implementadas**:
- ✅ **Criação local**: Documentos novos são criados apenas na memória
- ✅ **Indicador visual**: Documentos não salvos mostram "Não salvo" em amarelo
- ✅ **Salvamento manual**: Documento só é salvo no banco quando clicar em "Salvar"
- ✅ **Exclusão inteligente**: Documentos temporários são removidos apenas da lista local
- ✅ **Feedback visual**: Mensagem de sucesso ao salvar

#### **Comportamento Atual**:
1. **Clicar em "Novo Documento"** → Cria documento local (não salva no banco)
2. **Editar documento** → Mudanças ficam apenas na memória
3. **Clicar em "Salvar"** → Salva no banco de dados
4. **Indicador visual** → Documentos não salvos mostram "Não salvo" em amarelo

#### **Arquivos Modificados**:
- `src/App.tsx` - Lógica de criação e salvamento de documentos
- `src/components/DocumentEditor.tsx` - Remoção do salvamento automático

### 🎯 **Benefícios**:
- 🚫 **Sem salvamento automático**: Usuário tem controle total
- 👁️ **Visibilidade**: Sabe quais documentos não foram salvos
- 💾 **Economia de recursos**: Não cria registros desnecessários no banco
- 🎨 **UX melhorada**: Feedback claro sobre o estado do documento 