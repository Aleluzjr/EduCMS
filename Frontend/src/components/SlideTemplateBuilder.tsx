import React, { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { apiRequest, ENDPOINTS } from '../config/api';
import { SlideTemplate } from '../types';
import TemplateInfoSection from './SlideTemplateBuilder/TemplateInfoSection';
import FieldsConfiguration from './SlideTemplateBuilder/FieldsConfiguration';
import SubFieldsEditor from './SlideTemplateBuilder/SubFieldsEditor';
import RestoreDraftDialog from './SlideTemplateBuilder/RestoreDraftDialog';

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

  // Função para salvar rascunho no localStorage
  const saveDraft = (data: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...data,
        lastSaved: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Não foi possível salvar o rascunho:', error);
    }
  };

  // Função para carregar rascunho do localStorage
  const loadDraft = () => {
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        return JSON.parse(draft);
      }
    } catch (error) {
      console.warn('Não foi possível carregar o rascunho:', error);
    }
    return null;
  };

  // Função para limpar rascunho
  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Não foi possível limpar o rascunho:', error);
    }
  };

  // Verificar se há rascunho ao carregar o componente
  useEffect(() => {
    if (!template?.id) { // Apenas para novos templates
      const draft = loadDraft();
      if (draft && !templateName && fields.length === 0) {
        setShowRestoreDialog(true);
      }
    }
  }, []);

  // Salvar rascunho automaticamente quando houver mudanças
  useEffect(() => {
    if (!template?.id && (templateName || fields.length > 0)) {
      const draftData = {
        templateName,
        templateIcon,
        fields,
        isNewTemplate: true
      };
      
      // Debounce para não salvar a cada digitação
      const timeoutId = setTimeout(() => {
        saveDraft(draftData);
        setHasUnsavedChanges(true);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [templateName, templateIcon, fields, template?.id]);

  // Restaurar rascunho
  const restoreDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setTemplateName(draft.templateName || '');
      setTemplateIcon(draft.templateIcon || 'FileText');
      setFields(draft.fields || []);
      setHasUnsavedChanges(true);
    }
    setShowRestoreDialog(false);
  };

  // Ignorar rascunho
  const ignoreDraft = () => {
    clearDraft();
    setShowRestoreDialog(false);
  };

  const addField = (fieldType: string) => {
    const newField: Field = {
      name: `campo_${fields.length + 1}`,
      type: fieldType,
      label: `Campo ${fields.length + 1}`,
      required: false,
      allowedMediaTypes: fieldType === 'media' ? ['images'] : undefined
    };

    if (fieldType === 'repeatable') {
      newField.fields = [
        {
          name: 'title',
          type: 'text',
          label: 'Título',
          required: true,
          defaultValue: '',
          rows: 3,
          allowedMediaTypes: undefined
        }
      ];
    }

    setFields([...fields, newField]);
    setShowAddField(false);
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      alert('Por favor, informe o nome do template');
      return;
    }

    if (fields.length === 0) {
      alert('Por favor, adicione pelo menos um campo');
      return;
    }

    const templateData = {
      name: templateName,
      icon: templateIcon,
      fields: fields
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
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const savedTemplate = await response.json();
      
      // Limpar rascunho após salvar com sucesso
      if (!template?.id) {
        clearDraft();
        setHasUnsavedChanges(false);
      }
      
      onSave(savedTemplate);
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      // Não usar alert aqui, deixar o onSave tratar o erro
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {template ? 'Editar Template de Slide' : 'Criar Template de Slide'}
                </h1>
                <p className="text-gray-600">
                  {template ? 'Modifique os campos e propriedades do template' : 'Configure os campos e propriedades do novo template'}
                </p>
              </div>
            </div>
            
            <button
              onClick={saveTemplate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{template ? 'Atualizar Template' : 'Salvar Template'}</span>
            </button>
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