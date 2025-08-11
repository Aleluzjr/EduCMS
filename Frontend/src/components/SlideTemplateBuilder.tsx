import React, { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { apiRequest, ENDPOINTS } from '../config/api';
import { SlideTemplate } from '../types';
import TemplateInfoSection from './SlideTemplateBuilder/TemplateInfoSection';
import FieldsConfiguration from './SlideTemplateBuilder/FieldsConfiguration';
import SubFieldsEditor from './SlideTemplateBuilder/SubFieldsEditor';
import RestoreDraftDialog from './SlideTemplateBuilder/RestoreDraftDialog';
import Button from './ui/Button';
import { useToastContext } from '../contexts/ToastContext';

// Carregamento lazy do IconSelector
const IconSelector = React.lazy(() => import('./SlideTemplateBuilder/IconSelector'));

// Carregamento lazy do AddFieldModal
const AddFieldModal = React.lazy(() => import('./SlideTemplateBuilder/AddFieldModal'));

// Componente de fallback reutilizável para carregamento lazy
const LazyFallback = ({ message }: { message: string }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  </div>
);

interface Field {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  defaultValue?: any;
  allowedMediaTypes?: string[];
  fields?: Field[];
  rows?: number;
}

interface SlideTemplateBuilderProps {
  template?: SlideTemplate | null;
  onBack: () => void;
  onSave: (template: any) => void;
}

// Chave para localStorage
const STORAGE_KEY = 'slide_template_draft';
const STORAGE_VERSION = 1; // Versão atual do formato de dados

// Tipos de campos disponíveis
const fieldTypes = [
  { id: 'text', name: 'Texto Curto', icon: null, description: 'Campo de texto simples' },
  { id: 'textarea', name: 'Texto Longo', icon: null, description: 'Área de texto multilinha' },
  { id: 'html', name: 'HTML/WYSIWYG', icon: null, description: 'Editor de texto rico' },
  { id: 'media', name: 'Mídia', icon: null, description: 'Upload de imagem, vídeo ou áudio' },
  { id: 'repeatable', name: 'Lista Repetível', icon: null, description: 'Lista de itens com subcampos' }
];

export default function SlideTemplateBuilder({ template, onBack, onSave }: SlideTemplateBuilderProps) {
  const [templateName, setTemplateName] = useState(template?.name || '');
  const [templateIcon, setTemplateIcon] = useState(template?.icon || 'FileText');
  const [fields, setFields] = useState<Field[]>(template?.fields || []);
  const [showAddField, setShowAddField] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const { success, error } = useToastContext();

  // Função para salvar rascunho no localStorage
  const saveDraft = (data: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: STORAGE_VERSION,
        ...data,
        lastSaved: new Date().toISOString()
      }));
    } catch (error) {
      // Log silencioso em produção
      if (process.env.NODE_ENV === 'development') {
        console.warn('Não foi possível salvar o rascunho');
      }
    }
  };

  // Função para carregar rascunho do localStorage
  const loadDraft = () => {
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        
        // Verificar se a versão é compatível
        if (parsedDraft.version !== STORAGE_VERSION) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Versão do rascunho não é compatível, ignorando...');
          }
          clearDraft(); // Limpar rascunho antigo automaticamente
          return null;
        }
        
        return parsedDraft;
      }
    } catch (error) {
      // Log silencioso em produção
      if (process.env.NODE_ENV === 'development') {
        console.warn('Não foi possível carregar o rascunho');
      }
    }
    return null;
  };

  // Função para limpar rascunho
  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Log silencioso em produção
      if (process.env.NODE_ENV === 'development') {
        console.warn('Não foi possível limpar o rascunho');
      }
    }
  };

  // Verificar se há rascunho ao carregar o componente
  useEffect(() => {
    if (!template?.id) { // Apenas para novos templates
      const draft = loadDraft();
      if (draft && draft.templateName) {
        setShowRestoreDialog(true);
      }
    }
  }, [template?.id]);

  // Salvar rascunho sempre que houver mudanças
  useEffect(() => {
    if (!template?.id && (templateName || fields.length > 0)) {
      const draftData = {
        templateName,
        templateIcon,
        fields
      };
      saveDraft(draftData);
      setHasUnsavedChanges(true);
    }
  }, [templateName, templateIcon, fields, template?.id]);

  // Evento beforeunload para mudanças não salvas
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Você tem mudanças não salvas. Tem certeza que deseja sair?';
        return 'Você tem mudanças não salvas. Tem certeza que deseja sair?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const restoreDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setTemplateName(draft.templateName || '');
      setTemplateIcon(draft.templateIcon || 'FileText');
      setFields(draft.fields || []);
      setShowRestoreDialog(false);
      success('Rascunho restaurado com sucesso!');
    }
  };

  const ignoreDraft = () => {
    clearDraft();
    setShowRestoreDialog(false);
    success('Rascunho ignorado e removido.');
  };

  const addField = (fieldType: string) => {
    const newField: Field = {
      name: `campo_${fields.length + 1}`,
      type: fieldType,
      label: `Campo ${fields.length + 1}`,
      required: false,
      defaultValue: '',
      rows: 4,
      allowedMediaTypes: undefined
    };

    if (fieldType === 'repeatable') {
      newField.fields = [];
    }

    setFields([...fields, newField]);
    setShowAddField(false);
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      error('Por favor, insira um nome para o template');
      return;
    }

    if (fields.length === 0) {
      error('Por favor, adicione pelo menos um campo ao template');
      return;
    }

    const templateData = {
      name: templateName.trim(),
      icon: templateIcon,
      fields: fields.map(field => ({
        ...field,
        name: field.name.trim(),
        label: field.label.trim()
      }))
    };

    try {
      let response;
      
      if (template?.id) {
        // Atualizar template existente
        response = await apiRequest(`${ENDPOINTS.SLIDE_TEMPLATES}/${template.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateData)
        });
      } else {
        // Criar novo template
        response = await apiRequest(ENDPOINTS.SLIDE_TEMPLATES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro na requisição');
      }

      const savedTemplate = await response.json();
      
      // Limpar rascunho após salvar com sucesso
      if (!template?.id) {
        clearDraft();
        setHasUnsavedChanges(false);
      }
      
      success(template ? 'Template atualizado com sucesso!' : 'Template criado com sucesso!');
      onSave(savedTemplate);
    } catch (error) {
      // Log silencioso em produção
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao salvar template');
      }
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar template';
      error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {template ? 'Editar Template de Slide' : 'Criar Template de Slide'}
                </h1>
                <p className="text-gray-600">
                  {template ? 'Modifique os campos e propriedades do template' : 'Configure os campos e propriedades do novo template'}
                </p>
              </div>
            </div>
            
            <Button
              onClick={saveTemplate}
              variant="primary"
              size="lg"
              leftIcon={<Save className="w-4 h-4" />}
            >
              {template ? 'Atualizar Template' : 'Salvar Template'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Template Info Section */}
          <TemplateInfoSection
            templateName={templateName}
            templateIcon={templateIcon}
            onNameChange={setTemplateName}
            onIconChange={setTemplateIcon}
            onIconSelectorOpen={() => setShowIconSelector(true)}
            hasUnsavedChanges={hasUnsavedChanges}
            isNewTemplate={!template?.id}
          />

          {/* Fields Configuration */}
          <FieldsConfiguration
            fields={fields}
            fieldTypes={fieldTypes}
            onFieldsChange={setFields}
            onAddField={() => setShowAddField(true)}
          />
        </div>
      </div>

      {/* Modais e Dialogs */}
      <Suspense fallback={<LazyFallback message="Carregando seletor de ícones..." />}>
        <IconSelector
          isOpen={showIconSelector}
          onClose={() => setShowIconSelector(false)}
          onIconSelect={setTemplateIcon}
          currentIcon={templateIcon}
        />
      </Suspense>

      <Suspense fallback={<LazyFallback message="Carregando seletor de campos..." />}>
        <AddFieldModal
          isOpen={showAddField}
          onClose={() => setShowAddField(false)}
          onFieldAdd={addField}
        />
      </Suspense>

      <RestoreDraftDialog
        isOpen={showRestoreDialog}
        onRestore={restoreDraft}
        onIgnore={ignoreDraft}
      />
    </div>
  );
}