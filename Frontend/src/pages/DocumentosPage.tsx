import React, { useState, useEffect, Suspense, useMemo, useCallback, useRef } from 'react';
import { Plus, FileText, Eye, Trash2, Edit3 } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ENDPOINTS, apiRequest } from '../config/api';
import { Document, SlideTemplate, CreateDocumentData } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';

// Carregamento lazy do DocumentEditor
const DocumentEditor = React.lazy(() => import('../components/DocumentEditor'));

// Componente de fallback para carregamento lazy
const LazyFallback = ({ message }: { message: string }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  </div>
);

// Componente de card de documento otimizado com React.memo
const DocumentCard = React.memo(({ 
  doc, 
  onEdit, 
  onView, 
  onDelete, 
  formatDate 
}: { 
  doc: Document; 
  onEdit: (doc: Document) => void; 
  onView: (id: number) => void; 
  onDelete: (id: number) => void; 
  formatDate: (date: string | Date) => string; 
}) => (
  <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.name}</h3>
          <div className="text-sm text-gray-500 space-y-1">
            <div>Criado: {formatDate(doc.createdAt)}</div>
            <div>Slides: {doc.slides?.length || 0}</div>
            <div className="flex items-center space-x-2">
              {doc.id > 1000000 ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="text-yellow-600 font-medium">Não salvo</span>
                </>
              ) : (
                <>
                  <div className={`w-2 h-2 rounded-full ${doc.status === 'PUBLICADO' ? 'bg-green-400' : 'bg-gray-300'}`} />
                  <span>{doc.status === 'PUBLICADO' ? 'Publicado' : 'Rascunho'}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(doc)}
            className="text-blue-600 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-colors"
            title="Editar"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onView(doc.id)}
            className="text-green-600 hover:text-green-700 p-2 rounded-md hover:bg-green-50 transition-colors"
            title="Visualizar API"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => onDelete(doc.id)}
          className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
          title="Excluir"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
));

DocumentCard.displayName = 'DocumentCard';

const DocumentosPage: React.FC = () => {
  const { accessToken, user } = useAuth();
  const { success, error } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<SlideTemplate[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });



  // Memoizar funções para evitar re-criações desnecessárias
  const fetchDocuments = useCallback(async () => {
    try {
      console.log('Iniciando fetchDocuments...');
      setLoading(true);
      
      const response = await apiRequest(ENDPOINTS.DOCUMENTS, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      console.log('Resposta recebida:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          error('Sessão expirada. Faça login novamente.');
          return;
        }
        if (response.status === 403) {
          error('Acesso negado. Você não tem permissão para acessar esta área.');
          return;
        }
        throw new Error('Erro na requisição');
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      // Garantir que documents seja sempre um array
      if (Array.isArray(data)) {
        setDocuments(data);
      } else if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
        // Se a resposta estiver em formato { data: [...] }
        setDocuments(data.data);
      } else if (data && typeof data === 'object' && data.documents && Array.isArray(data.documents)) {
        // Se a resposta estiver em formato { documents: [...] }
        setDocuments(data.documents);
      } else {
        setDocuments([]);
        error('Formato de resposta inesperado da API');
      }
    } catch (err) {
      console.error('Erro em fetchDocuments:', err);
      error('Erro ao carregar documentos');
      setDocuments([]); // Garantir que seja um array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  }, [accessToken, error]);

  const fetchTemplates = useCallback(async () => {
    try {
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
        setTemplates(data.data);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      setTemplates([]); // Garantir que seja um array vazio em caso de erro
    }
  }, [accessToken, error]);

  const createDocument = useCallback(() => {
    const tempDoc: Document = {
      id: Date.now(),
      documentId: `temp-${Date.now()}`,
      name: 'Novo Documento',
      createdAt: new Date(),
      updatedAt: new Date(),
      slides: [],
      publishedAt: null,
      ownerId: user?.id || 0,
      status: 'RASCUNHO'
    };
    
    setDocuments(prev => [...prev, tempDoc]);
    setSelectedDocument(tempDoc);
  }, [user?.id]);

  const deleteDocument = useCallback(async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Documento',
      message: 'Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        if (id > 1000000) {
          setDocuments(prev => prev.filter(doc => doc.id !== id));
          if (selectedDocument?.id === id) {
            setSelectedDocument(null);
          }
          success('Documento temporário removido');
          return;
        }
        
        try {
          const response = await apiRequest(`${ENDPOINTS.DOCUMENTS}/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Erro na requisição');
          }
          
          setDocuments(prev => prev.filter(doc => doc.id !== id));
          if (selectedDocument?.id === id) {
            setSelectedDocument(null);
          }
          success('Documento excluído com sucesso');
        } catch (err) {
          error('Erro ao excluir documento');
        }
      }
    });
  }, [accessToken, success, error, selectedDocument]);

  // Memoizar handlers para evitar re-criações
  const handleEditDocument = useCallback((doc: Document) => {
    setSelectedDocument(doc);
  }, []);

  const handleViewDocument = useCallback((id: number) => {
    window.open(`${ENDPOINTS.DOCUMENTS}/${id}`, '_blank');
  }, []);

  // Memoizar função de formatação de data
  const formatDate = useCallback((dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Memoizar lista de documentos para evitar re-renders desnecessários
  const documentsList = useMemo(() => documents, [documents]);

  // Adicionar ref para controlar se já foi feita a primeira chamada
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Evitar múltiplas chamadas simultâneas
    if (!hasInitialized.current && accessToken) {
      hasInitialized.current = true;
      fetchDocuments();
      fetchTemplates();
    }
  }, [accessToken]); // Remover fetchDocuments e fetchTemplates das dependências

  if (selectedDocument) {
    return (
      <Suspense fallback={<LazyFallback message="Carregando documento..." />}>
        <DocumentEditor
          document={selectedDocument}
          templates={templates}
          onBack={() => setSelectedDocument(null)}
          onSave={async (updatedDoc) => {
            try {
              let savedDoc = updatedDoc;
              
              if (updatedDoc.id > 1000000) {
                // Documento temporário - salvar na API
                // Preparar dados conforme esperado pelo backend
                const createData: CreateDocumentData = {
                  name: updatedDoc.name,
                  documentId: updatedDoc.documentId,
                  slides: updatedDoc.slides || [],
                  metadata: {
                    status: updatedDoc.status
                  }
                };
                
                const response = await apiRequest(ENDPOINTS.DOCUMENTS, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                  },
                  body: JSON.stringify(createData)
                });
                
                if (!response.ok) {
                  throw new Error('Erro na requisição');
                }
                
                savedDoc = await response.json();
              } else {
                // Documento existente - atualizar na API
                const { id, createdAt, updatedAt, ...updateData } = updatedDoc;
                
                const response = await apiRequest(`${ENDPOINTS.DOCUMENTS}/${updatedDoc.id}`, {
                  method: 'PUT',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                  },
                  body: JSON.stringify(updateData)
                });
                
                if (!response.ok) {
                  throw new Error('Erro na requisição');
                }
                
                savedDoc = await response.json();
              }
              
              setDocuments(prev => prev.map(doc => 
                doc.id === updatedDoc.id ? savedDoc : doc
              ));
              setSelectedDocument(savedDoc);
              success('Documento salvo com sucesso!');
              
            } catch (err) {
              console.error('Erro ao salvar documento:', err);
              error('Erro ao salvar documento');
            }
          }}
        />
      </Suspense>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie todos os documentos do sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={createDocument}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Documento
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando documentos...</p>
        </div>
      ) : !Array.isArray(documentsList) || documentsList.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum documento encontrado</h3>
          <p className="text-gray-600 mb-6">Comece criando seu primeiro documento educacional</p>
          <button
            onClick={createDocument}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Criar Primeiro Documento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentsList.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onEdit={handleEditDocument}
              onView={handleViewDocument}
              onDelete={deleteDocument}
              formatDate={formatDate}
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

export default DocumentosPage; 