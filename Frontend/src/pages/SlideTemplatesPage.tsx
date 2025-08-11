import React, { useState, useEffect, Suspense, useMemo, useCallback, useRef } from 'react';
import { Plus, Settings, Eye, Trash2, Edit3 } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ENDPOINTS, apiRequest } from '../config/api';
import { SlideTemplate } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';

// Carregamento lazy do SlideTemplateBuilder
const SlideTemplateBuilder = React.lazy(() => import('../components/SlideTemplateBuilder'));

// Componente de fallback para carregamento lazy
const LazyFallback = ({ message }: { message: string }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  </div>
);

// Componente de card de template otimizado com React.memo
const TemplateCard = React.memo(({ 
  template, 
  onEdit, 
  onView, 
  onDelete 
}: { 
  template: SlideTemplate; 
  onEdit: (template: SlideTemplate) => void; 
  onView: (id: number) => void; 
  onDelete: (id: number) => void; 
}) => (
  <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
          <p className="text-sm text-gray-500">ID: {template.id}</p>
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-4">
        {template.fields?.length || 0} campos configurados
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(template)}
            className="text-blue-600 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-colors"
            title="Editar Template"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onView(template.id)}
            className="text-green-600 hover:text-green-700 p-2 rounded-md hover:bg-green-50 transition-colors"
            title="Visualizar API"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => onDelete(template.id)}
          className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
          title="Excluir Template"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
));

TemplateCard.displayName = 'TemplateCard';

const SlideTemplatesPage: React.FC = () => {
  const { accessToken } = useAuth();
  const { success, error } = useToast();
  const [templates, setTemplates] = useState<SlideTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SlideTemplate | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Memoizar funções para evitar re-criações desnecessárias
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest(ENDPOINTS.SLIDE_TEMPLATES, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          error('Sessão expirada. Faça login novamente.');
          return;
        }
        throw new Error('Erro na requisição');
      }
      
      const data = await response.json();
      
      // Garantir que templates seja sempre um array
      if (Array.isArray(data)) {
        setTemplates(data);
      } else if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
        setTemplates(data.data);
      } else if (data && typeof data === 'object' && data.templates && Array.isArray(data.templates)) {
        setTemplates(data.templates);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      error('Erro ao carregar templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, error]);

  const deleteTemplate = useCallback(async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Template',
      message: 'Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        try {
          const response = await apiRequest(`${ENDPOINTS.SLIDE_TEMPLATES}/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Erro na requisição');
          }
          
          setTemplates(prev => prev.filter(template => template.id !== id));
          success('Template excluído com sucesso!');
        } catch (err) {
          error('Erro ao excluir template');
        }
      }
    });
  }, [accessToken, success, error]);

  // Memoizar handlers para evitar re-criações
  const handleEditTemplate = useCallback((template: SlideTemplate) => {
    setEditingTemplate(template);
    setShowTemplateBuilder(true);
  }, []);

  const handleViewTemplate = useCallback((id: number) => {
    window.open(`${ENDPOINTS.SLIDE_TEMPLATES}/${id}`, '_blank');
  }, []);

  const handleShowTemplateBuilder = useCallback(() => {
    setShowTemplateBuilder(true);
  }, []);

  // Memoizar lista de templates para evitar re-renders desnecessários
  const templatesList = useMemo(() => templates, [templates]);

  // Adicionar ref para controlar se já foi feita a primeira chamada
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Evitar múltiplas chamadas simultâneas
    if (!hasInitialized.current && accessToken) {
      hasInitialized.current = true;
      fetchTemplates();
    }
  }, [accessToken]); // Remover fetchTemplates das dependências

  if (editingTemplate) {
    return (
      <Suspense fallback={<LazyFallback message="Carregando editor de template..." />}>
        <SlideTemplateBuilder
          template={editingTemplate}
          onBack={() => {
            setEditingTemplate(null);
            setShowTemplateBuilder(false);
          }}
          onSave={async (template) => {
            try {
              const response = await apiRequest(`${ENDPOINTS.SLIDE_TEMPLATES}/${template.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template)
              });
              
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro na requisição');
              }
              
              const updatedTemplate = await response.json();
              setTemplates(prev => prev.map(t => t.id === template.id ? updatedTemplate : t));
              setEditingTemplate(null);
              setShowTemplateBuilder(false);
              success('Template atualizado com sucesso!');
            } catch (err) {
              error(err instanceof Error ? err.message : 'Erro ao atualizar template');
            }
          }}
        />
      </Suspense>
    );
  }

  if (showTemplateBuilder) {
    return (
      <Suspense fallback={<LazyFallback message="Carregando criador de template..." />}>
        <SlideTemplateBuilder
          template={null}
          onBack={() => {
            setShowTemplateBuilder(false);
            setEditingTemplate(null);
          }}
          onSave={async (template) => {
            try {
              const response = await apiRequest(ENDPOINTS.SLIDE_TEMPLATES, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template)
              });
              
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
              }
              
              const newTemplate = await response.json();
              setTemplates(prev => [...prev, newTemplate]);
              setShowTemplateBuilder(false);
              setEditingTemplate(null);
              success('Template criado com sucesso!');
            } catch (err) {
              setShowTemplateBuilder(false);
              setEditingTemplate(null);
              error(err instanceof Error ? err.message : 'Erro ao salvar template');
            }
          }}
        />
      </Suspense>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Slide Templates</h1>
          <p className="text-gray-600 mt-2">Gerencie os modelos de slides disponíveis</p>
        </div>
        <button
          onClick={handleShowTemplateBuilder}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Template</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando templates...</p>
        </div>
      ) : templatesList.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum template encontrado</h3>
          <p className="text-gray-600 mb-6">Comece criando seu primeiro template de slide</p>
          <button
            onClick={handleShowTemplateBuilder}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Criar Primeiro Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templatesList.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEditTemplate}
              onView={handleViewTemplate}
              onDelete={deleteTemplate}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="danger"
      />
    </div>
  );
};

export default SlideTemplatesPage; 