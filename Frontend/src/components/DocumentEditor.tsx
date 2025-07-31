import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Save, Eye, Trash2, GripVertical, Edit3 } from 'lucide-react';
import SlideEditor from './SlideEditor';
import SlidePreview from './SlidePreview';
import { ENDPOINTS, apiRequest } from '../config/api';

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

interface DocumentEditorProps {
  document: Document;
  templates: SlideTemplate[];
  onBack: () => void;
  onSave: (document: Document) => void;
}

export default function DocumentEditor({ document, templates, onBack, onSave }: DocumentEditorProps) {
  const [editingDocument, setEditingDocument] = useState<Document>(document);
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedSlide, setDraggedSlide] = useState<number | null>(null);

  const saveDocument = () => {
    // Atualiza o updatedAt antes de salvar
    const docToSave = {
      ...editingDocument,
      updatedAt: new Date().toISOString()
    };
    onSave(docToSave);
  };

  const addSlide = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newSlide: any = {
      __component: templateId
    };

    // Initialize fields with default values
    template.fields.forEach(field => {
      if (field.type === 'repeatable') {
        newSlide[field.name] = [];
      } else if (field.defaultValue) {
        newSlide[field.name] = field.defaultValue;
      } else {
        newSlide[field.name] = '';
      }
    });

    const updatedSlides = [...editingDocument.slides, newSlide];
    setEditingDocument({
      ...editingDocument,
      slides: updatedSlides
    });
    setShowTemplateSelector(false);
    setSelectedSlide(updatedSlides.length - 1);
  };

  const updateSlide = (index: number, slideData: any) => {
    const updatedSlides = [...editingDocument.slides];
    updatedSlides[index] = slideData;
    setEditingDocument({
      ...editingDocument,
      slides: updatedSlides
    });
  };

  const deleteSlide = (index: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este slide?')) return;

    const updatedSlides = editingDocument.slides.filter((_, i) => i !== index);
    setEditingDocument({
      ...editingDocument,
      slides: updatedSlides
    });
    // Seleciona o slide anterior, ou o próximo, ou nenhum se não houver slides
    if (updatedSlides.length === 0) {
      setSelectedSlide(null);
    } else if (selectedSlide !== null) {
      if (selectedSlide > index) {
        setSelectedSlide(selectedSlide - 1);
      } else if (selectedSlide === index) {
        setSelectedSlide(Math.max(0, index - 1));
      }
    }
  };

  const moveSlide = (fromIndex: number, toIndex: number) => {
    const updatedSlides = [...editingDocument.slides];
    const [movedSlide] = updatedSlides.splice(fromIndex, 1);
    updatedSlides.splice(toIndex, 0, movedSlide);
    
    setEditingDocument({
      ...editingDocument,
      slides: updatedSlides
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSlide(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedSlide !== null && draggedSlide !== dropIndex) {
      moveSlide(draggedSlide, dropIndex);
    }
    setDraggedSlide(null);
  };

  const publishDocument = () => {
    const updatedDocument = {
      ...editingDocument,
      publishedAt: new Date().toISOString()
    };
    setEditingDocument(updatedDocument);
  };

  if (showPreview) {
    return (
      <SlidePreview
        document={editingDocument}
        templates={templates}
        onBack={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <input
                  type="text"
                  value={editingDocument.name}
                  onChange={(e) => setEditingDocument({ ...editingDocument, name: e.target.value })}
                  className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                />
                <div className="text-sm text-gray-500">
                  {editingDocument.slides.length} slides • ID: {editingDocument.documentId}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(true)}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Visualizar</span>
              </button>
              
              {!editingDocument.publishedAt && (
                <button
                  onClick={publishDocument}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Publicar
                </button>
              )}
              
              <button
                onClick={saveDocument}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Slides List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Slides</h3>
                  <button
                    onClick={() => setShowTemplateSelector(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {editingDocument.slides.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="text-gray-500 mb-3">Nenhum slide adicionado</div>
                    <button
                      onClick={() => setShowTemplateSelector(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Adicionar primeiro slide
                    </button>
                  </div>
                ) : (
                  <div className="p-2">
                    {editingDocument.slides.map((slide, index) => {
                      const template = templates.find(t => t.id === slide.__component);
                      return (
                        <div
                          key={index}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          className={`p-3 mb-2 border rounded-lg cursor-pointer transition-all ${
                            selectedSlide === index
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          } ${draggedSlide === index ? 'opacity-50' : ''}`}
                          onClick={() => {
                            setSelectedSlide(index);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {template?.name || slide.__component}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {slide.title || slide.name || `Slide ${index + 1}`}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSlide(index);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSlide(index);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Slide Editor */}
          <div className="lg:col-span-2">
            {selectedSlide !== null && editingDocument.slides[selectedSlide] ? (
              <div className="bg-white rounded-xl shadow-sm border min-h-[28rem] flex flex-col">
                <SlideEditor
                  slide={editingDocument.slides[selectedSlide]}
                  template={templates.find(t => t.id === editingDocument.slides[selectedSlide]?.__component)}
                  onUpdate={(slideData) => updateSlide(selectedSlide, slideData)}
                />
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border flex items-center justify-center min-h-[28rem]">
                <div className="text-center">
                  <div className="text-gray-500 mb-3">Selecione um slide para editar</div>
                  <div className="text-sm text-gray-400">
                    Clique em um slide na lista ao lado ou adicione um novo slide
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Escolher Template de Slide</h3>
            </div>
            
            <div className="p-4 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => addSlide(template.id)}
                    className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900 mb-1">{template.name}</div>
                    <div className="text-sm text-gray-500">{template.id}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowTemplateSelector(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}