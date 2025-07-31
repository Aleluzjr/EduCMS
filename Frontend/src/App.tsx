import React, { useState, useEffect } from 'react';
import { Plus, FileText, Settings, Upload, Eye, Trash2, Edit3 } from 'lucide-react';
import DocumentEditor from './components/DocumentEditor';
import SlideTemplateBuilder from './components/SlideTemplateBuilder';
import MediaLibrary from './components/MediaLibrary';
import { ENDPOINTS, apiRequest } from './config/api';

interface Document {
  id: number;
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  slides: any[];
}

interface SlideTemplate {
  id: string;
  name: string;
  icon: string;
  fields: any[];
}

function App() {
  const [activeTab, setActiveTab] = useState<'documents' | 'templates' | 'media'>('documents');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<SlideTemplate[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SlideTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchTemplates();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await apiRequest(ENDPOINTS.DOCUMENTS);
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await apiRequest(ENDPOINTS.SLIDE_TEMPLATES);
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const createDocument = () => {
    // Cria um documento local temporário (não salva no banco ainda)
    const tempDoc: Document = {
      id: Date.now(), // ID temporário negativo para identificar que não foi salvo
      documentId: `temp-${Date.now()}`, // Document ID temporário
      name: 'Novo Documento',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: null,
      slides: []
    };
    
    setDocuments([...documents, tempDoc]);
    setSelectedDocument(tempDoc);
  };

  const deleteDocument = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) return;
    
    // Se é um documento temporário, apenas remove da lista local
    if (id > 1000000) {
      setDocuments(documents.filter(doc => doc.id !== id));
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
      return;
    }
    
    // Se é um documento salvo, deleta do banco
    try {
      await apiRequest(`${ENDPOINTS.DOCUMENTS}/${id}`, { method: 'DELETE' });
      setDocuments(documents.filter(doc => doc.id !== id));
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este template?')) return;
    
    try {
      await apiRequest(`${ENDPOINTS.SLIDE_TEMPLATES}/${id}`, { method: 'DELETE' });
      setTemplates(templates.filter(template => template.id !== id));
    } catch (error) {
      console.error('Erro ao excluir template:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (selectedDocument) {
    return (
      <DocumentEditor
        document={selectedDocument}
        templates={templates}
        onBack={() => setSelectedDocument(null)}
        onSave={async (updatedDoc) => {
          try {
            let savedDoc = updatedDoc;
            
            // Se é um documento temporário (ID muito grande), salva no banco
            if (updatedDoc.id > 1000000) {
              const response = await apiRequest(ENDPOINTS.DOCUMENTS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: updatedDoc.name,
                  slides: updatedDoc.slides
                })
              });
              savedDoc = await response.json();
            } else {
              // Se já existe, atualiza
              const response = await apiRequest(`${ENDPOINTS.DOCUMENTS}/${updatedDoc.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedDoc)
              });
              savedDoc = await response.json();
            }
            
            // Atualiza a lista de documentos
            setDocuments(documents.map(doc => 
              doc.id === updatedDoc.id ? savedDoc : doc
            ));
            setSelectedDocument(savedDoc);
            
            // Mostra mensagem de sucesso
            alert('Documento salvo com sucesso!');
          } catch (error) {
            console.error('Erro ao salvar documento:', error);
            alert('Erro ao salvar documento');
          }
        }}
      />
    );
  }

  if (showTemplateBuilder || editingTemplate) {
    return (
      <SlideTemplateBuilder
        template={editingTemplate}
        onBack={() => {
          setShowTemplateBuilder(false);
          setEditingTemplate(null);
        }}
        onSave={async (template) => {
          try {
            if (editingTemplate) {
              // Atualizar template existente
              const response = await apiRequest(`${ENDPOINTS.SLIDE_TEMPLATES}/${editingTemplate.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template)
              });
              const updatedTemplate = await response.json();
              setTemplates(templates.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
              alert('Template atualizado com sucesso!');
            } else {
              // Criar novo template
              const response = await apiRequest(ENDPOINTS.SLIDE_TEMPLATES, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template)
              });
              const newTemplate = await response.json();
              setTemplates([...templates, newTemplate]);
              alert('Template criado com sucesso!');
            }
            setShowTemplateBuilder(false);
            setEditingTemplate(null);
          } catch (error) {
            console.error('Erro ao salvar template:', error);
            alert('Erro ao salvar template');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">EduCMS</h1>
              </div>
              <div className="text-sm text-gray-500">Sistema de Gestão de Conteúdo Educacional</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'documents'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Documentos
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'templates'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Templates
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'media'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Mídia
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'documents' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Documentos</h2>
                <p className="text-gray-600 mt-2">Gerencie seus materiais educacionais</p>
              </div>
              <button
                onClick={createDocument}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                <span>Novo Documento</span>
              </button>
            </div>

            {documents.length === 0 ? (
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
                {documents.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
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
                                  <div className={`w-2 h-2 rounded-full ${doc.publishedAt ? 'bg-green-400' : 'bg-gray-300'}`} />
                                  <span>{doc.publishedAt ? 'Publicado' : 'Rascunho'}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedDocument(doc)}
                            className="text-blue-600 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.open(`${ENDPOINTS.DOCUMENTS}/${doc.id}`, '_blank')}
                            className="text-green-600 hover:text-green-700 p-2 rounded-md hover:bg-green-50 transition-colors"
                            title="Visualizar API"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Templates de Slides</h2>
                <p className="text-gray-600 mt-2">Gerencie os modelos de slides disponíveis</p>
              </div>
              <button
                onClick={() => setShowTemplateBuilder(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Novo Template</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-500">{template.id}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      {template.fields.length} campos configurados
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingTemplate(template)}
                          className="text-blue-600 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-colors"
                          title="Editar Template"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`${ENDPOINTS.SLIDE_TEMPLATES}/${template.id}`, '_blank')}
                          className="text-green-600 hover:text-green-700 p-2 rounded-md hover:bg-green-50 transition-colors"
                          title="Visualizar API"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                        title="Excluir Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <MediaLibrary />
        )}
      </div>
    </div>
  );
}

export default App;