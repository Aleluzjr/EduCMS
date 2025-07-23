import React, { useState } from 'react';
import { Upload, X, Plus, Trash2 } from 'lucide-react';

interface Field {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  defaultValue?: any;
  accept?: string;
  fields?: Field[];
}

interface SlideTemplate {
  id: string;
  name: string;
  icon: string;
  fields: Field[];
}

interface SlideEditorProps {
  slide: any;
  template?: SlideTemplate;
  onUpdate: (slideData: any) => void;
}

export default function SlideEditor({ slide, template, onUpdate }: SlideEditorProps) {
  const [uploading, setUploading] = useState(false);

  const API_BASE = 'http://localhost:3001/api';

  // O slide é sempre controlado pelo pai, não precisa de estado local duplicado

  const handleFieldChange = (fieldName: string, value: any) => {
    const newSlideData = {
      ...slide,
      [fieldName]: value
    };
    onUpdate(newSlideData);
  };

  const handleFileUpload = async (file: File, fieldName: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      handleFieldChange(fieldName, result);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload do arquivo');
    }
    setUploading(false);
  };

  const addRepeatableItem = (fieldName: string, template: Field[]) => {
    const currentItems = slide[fieldName] || [];
    const newItem: any = { id: Date.now() };
    template.forEach(field => {
      newItem[field.name] = field.defaultValue || '';
    });
    handleFieldChange(fieldName, [...currentItems, newItem]);
  };

  const updateRepeatableItem = (fieldName: string, index: number, itemFieldName: string, value: any) => {
    const items = [...(slide[fieldName] || [])];
    items[index] = {
      ...items[index],
      [itemFieldName]: value
    };
    handleFieldChange(fieldName, items);
  };

  const removeRepeatableItem = (fieldName: string, index: number) => {
    const items = slide[fieldName] || [];
    handleFieldChange(fieldName, items.filter((_: any, i: number) => i !== index));
  };

  const renderField = (field: Field) => {
    const value = slide[field.name] || '';

    switch (field.type) {
      case 'text':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={field.required}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={field.required}
            />
          </div>
        );

      case 'html':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="<p>Conteúdo HTML...</p>"
              required={field.required}
            />
            <div className="text-xs text-gray-500 mt-1">Suporte a HTML básico</div>
          </div>
        );

      case 'media':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {value?.url ? (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Arquivo enviado</span>
                  <button
                    onClick={() => handleFieldChange(field.name, null)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {value.mimetype?.startsWith('image/') ? (
                  <img
                    src={value.url}
                    alt="Preview"
                    className="max-w-full h-32 object-cover rounded"
                  />
                ) : (
                  <div className="bg-gray-100 p-4 rounded text-center">
                    <div className="text-sm text-gray-600">{value.originalName}</div>
                    <div className="text-xs text-gray-500">
                      {(value.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept={field.accept || "image/*, video/*, audio/*"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, field.name);
                  }}
                  className="hidden"
                  id={`file-${field.name}`}
                  disabled={uploading}
                />
                <label
                  htmlFor={`file-${field.name}`}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {uploading ? 'Enviando...' : 'Clique para enviar arquivo'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Imagens, vídeos ou áudios (max 10MB)
                  </span>
                </label>
              </div>
            )}
          </div>
        );

      case 'repeatable':
        const items = slide[field.name] || [];
        return (
          <div key={field.name} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <button
                onClick={() => addRepeatableItem(field.name, field.fields || [])}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Adicionar</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {items.map((item: any, index: number) => (
                <div key={item.id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                    <button
                      onClick={() => removeRepeatableItem(field.name, index)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {field.fields?.map((subField) => (
                    <div key={subField.name} className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {subField.label}
                        {subField.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type="text"
                        value={item[subField.name] || ''}
                        onChange={(e) => updateRepeatableItem(field.name, index, subField.name, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        required={subField.required}
                      />
                    </div>
                  ))}
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  Nenhum item adicionado. Clique em "Adicionar" para começar.
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!template) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="text-center text-gray-500">
          Template não encontrado para o componente: {slide.__component}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
        <p className="text-sm text-gray-500">{template.id}</p>
      </div>
      
      <div className="p-4 max-h-96 overflow-y-auto">
        {template.fields.map(renderField)}
      </div>
    </div>
  );
}