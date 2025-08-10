import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Plus, Save, Eye, Trash2, GripVertical, Edit3 } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useVirtualizer } from '@tanstack/react-virtual';
import SlideEditor from './SlideEditor';
import SlidePreview from './SlidePreview';
import ConfirmDialog from './ConfirmDialog';
import Button from './ui/Button';
import { ENDPOINTS, apiRequest } from '../config/api';
import { useToastContext } from '../contexts/ToastContext';
import { Document, SlideTemplate } from '../types';

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { success, error } = useToastContext();
  
  // Refs para virtualização
  const slidesListRef = useRef<HTMLDivElement>(null);
  const slidesContainerRef = useRef<HTMLDivElement>(null);

  // Virtualização da lista de slides
  const slidesVirtualizer = useVirtualizer({
    count: editingDocument.slides.length,
    getScrollElement: () => slidesContainerRef.current,
    estimateSize: () => 80, // Altura estimada de cada slide
    overscan: 5,
  });

  // Verificar mudanças não salvas
  useEffect(() => {
    const hasChanges = JSON.stringify(editingDocument) !== JSON.stringify(document);
    setHasUnsavedChanges(hasChanges);
  }, [editingDocument, document]);

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

  const saveDocument = async () => {
    try {
      // Atualiza o updatedAt antes de salvar
      const docToSave = {
        ...editingDocument,
        updatedAt: new Date().toISOString()
      };
      
      // Chama a função onSave do App.tsx
      await onSave(docToSave);
      
      // Mostra o toast de sucesso diretamente no DocumentEditor
      success('Documento salvo com sucesso!');
      
      // Atualiza o documento original para resetar as mudanças não salvas
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Erro ao salvar documento:', err);
      error('Erro ao salvar documento');
    }
  };

  const addSlide = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newSlide: any = {
      templateId: template.id,
      templateKey: template.templateKey,
      order: editingDocument.slides.length,
      fields: template.fields.map(field => ({
        fieldId: field.id,
        fieldName: field.name,
        fieldType: field.type,
        value: field.defaultValue || ''
      })),
      isPublished: false
    };

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
    setSlideToDelete(index);
    setShowDeleteDialog(true);
  };

  const confirmDeleteSlide = () => {
    if (slideToDelete === null) return;

    const updatedSlides = editingDocument.slides.filter((_, i) => i !== slideToDelete);
    setEditingDocument({
      ...editingDocument,
      slides: updatedSlides
    });
    
    // Seleciona o slide anterior, ou o próximo, ou nenhum se não houver slides
    if (updatedSlides.length === 0) {
      setSelectedSlide(null);
    } else if (selectedSlide !== null) {
      if (selectedSlide > slideToDelete) {
        setSelectedSlide(selectedSlide - 1);
      } else if (selectedSlide === slideToDelete) {
        setSelectedSlide(Math.max(0, slideToDelete - 1));
      }
    }
    
    setSlideToDelete(null);
    setShowDeleteDialog(false);
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
                  {editingDocument.slides.length} slides • ID: {editingDocument.id}
                  {hasUnsavedChanges && (
                    <span className="ml-2 text-orange-600 font-medium">• Mudanças não salvas</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="md"
                leftIcon={<Eye className="w-4 h-4" />}
                onClick={() => setShowPreview(true)}
              >
                Visualizar
              </Button>
              
              {!editingDocument.publishedAt && (
                <Button
                  variant="success"
                  size="md"
                  onClick={publishDocument}
                >
                  Publicar
                </Button>
              )}
              
              <Button
                variant={hasUnsavedChanges ? 'warning' : 'primary'}
                size="md"
                leftIcon={<Save className="w-4 h-4" />}
                onClick={saveDocument}
              >
                {hasUnsavedChanges ? 'Salvar Mudanças' : 'Salvar'}
              </Button>
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
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowTemplateSelector(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div 
                ref={slidesContainerRef}
                className="max-h-96 overflow-y-auto"
                style={{ height: '384px' }}
              >
                {editingDocument.slides.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="text-gray-500 mb-3">Nenhum slide adicionado</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTemplateSelector(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Adicionar primeiro slide
                    </Button>
                  </div>
                ) : (
                  <div
                    ref={slidesListRef}
                    style={{
                      height: `${slidesVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                                         {slidesVirtualizer.getVirtualItems().map((virtualItem) => {
                       const index = virtualItem.index;
                       const slide = editingDocument.slides[index];
                       const template = templates.find(t => t.templateKey === slide.templateKey);
                       
                       return (
                         <div
                           key={index}
                           style={{
                             position: 'absolute',
                             top: 0,
                             left: 0,
                             width: '100%',
                             height: `${virtualItem.size}px`,
                             transform: `translateY(${virtualItem.start}px)`,
                           }}
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
                                   {template?.name || slide.templateKey}
                                 </div>
                                 <div className="text-xs text-gray-500">
                                   Slide {index + 1}
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
                  template={templates.find(t => t.templateKey === editingDocument.slides[selectedSlide]?.templateKey)}
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
                    <div className="font-medium text-gray-900 mb-1 ">{template.name}</div>
                    <div className="text-sm text-gray-500">{template.id}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowTemplateSelector(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSlideToDelete(null);
        }}
        onConfirm={confirmDeleteSlide}
        title="Excluir Slide"
        message="Tem certeza que deseja excluir este slide? Esta ação não pode ser desfeita."
        type="danger"
        confirmText="Excluir"
        cancelText="Cancelar"
      />

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 99999 }}
        toastStyle={{ zIndex: 99999 }}
      />
    </div>
  );
}