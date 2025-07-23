import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Type, FileText, Image, List, MoreHorizontal } from 'lucide-react';

interface Field {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  defaultValue?: any;
  accept?: string;
  fields?: Field[];
}

interface SlideTemplateBuilderProps {
  onBack: () => void;
  onSave: (template: any) => void;
}

export default function SlideTemplateBuilder({ onBack, onSave }: SlideTemplateBuilderProps) {
  const [templateName, setTemplateName] = useState('');
  const [templateIcon, setTemplateIcon] = useState('FileText');
  const [fields, setFields] = useState<Field[]>([]);
  const [showAddField, setShowAddField] = useState(false);

  const API_BASE = 'http://localhost:3001/api';

  const fieldTypes = [
    { id: 'text', name: 'Texto Curto', icon: Type, description: 'Campo de texto simples' },
    { id: 'textarea', name: 'Texto Longo', icon: FileText, description: 'Área de texto multilinha' },
    { id: 'html', name: 'HTML/WYSIWYG', icon: FileText, description: 'Editor de texto rico' },
    { id: 'media', name: 'Mídia', icon: Image, description: 'Upload de imagem, vídeo ou áudio' },
    { id: 'repeatable', name: 'Lista Repetível', icon: List, description: 'Lista de itens com subcampos' }
  ];

  const icons = [
    'FileText', 'Type', 'Image', 'Video', 'Mic', 'Target', 'HelpCircle', 
    'AlignLeft', 'List', 'Grid', 'Book', 'Users', 'Settings', 'Star'
  ];

  const addField = (fieldType: string) => {
    const newField: Field = {
      name: `campo_${fields.length + 1}`,
      type: fieldType,
      label: `Campo ${fields.length + 1}`,
      required: false
    };

    if (fieldType === 'repeatable') {
      newField.fields = [
        {
          name: 'title',
          type: 'text',
          label: 'Título',
          required: true
        }
      ];
    }

    setFields([...fields, newField]);
    setShowAddField(false);
  };

  const updateField = (index: number, updates: Partial<Field>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const addSubField = (fieldIndex: number) => {
    const updatedFields = [...fields];
    const field = updatedFields[fieldIndex];
    
    if (field.type === 'repeatable') {
      field.fields = [
        ...(field.fields || []),
        {
          name: `subcampo_${(field.fields?.length || 0) + 1}`,
          type: 'text',
          label: `Subcampo ${(field.fields?.length || 0) + 1}`,
          required: false
        }
      ];
    }
    
    setFields(updatedFields);
  };

  const removeSubField = (fieldIndex: number, subFieldIndex: number) => {
    const updatedFields = [...fields];
    const field = updatedFields[fieldIndex];
    
    if (field.fields) {
      field.fields = field.fields.filter((_, i) => i !== subFieldIndex);
    }
    
    setFields(updatedFields);
  };

  const updateSubField = (fieldIndex: number, subFieldIndex: number, updates: Partial<Field>) => {
    const updatedFields = [...fields];
    const field = updatedFields[fieldIndex];
    
    if (field.fields) {
      field.fields[subFieldIndex] = { ...field.fields[subFieldIndex], ...updates };
    }
    
    setFields(updatedFields);
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

    const template = {
      name: templateName,
      icon: templateIcon,
      fields: fields
    };

    try {
      const response = await fetch(`${API_BASE}/slide-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });

      if (!response.ok) throw new Error('Erro ao salvar template');

      const savedTemplate = await response.json();
      onSave(savedTemplate);
      alert('Template salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      alert('Erro ao salvar template');
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
                <h1 className="text-2xl font-bold text-gray-900">Criar Template de Slide</h1>
                <p className="text-gray-600">Configure os campos e propriedades do novo template</p>
              </div>
            </div>
            
            <button
              onClick={saveTemplate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Template</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Template Info */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Template</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Template *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Slide de Apresentação"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ícone
                </label>
                <select
                  value={templateIcon}
                  onChange={(e) => setTemplateIcon(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {icons.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Fields Configuration */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Campos do Template</h3>
                <button
                  onClick={() => setShowAddField(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Campo</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {fields.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-3">Nenhum campo configurado</div>
                  <button
                    onClick={() => setShowAddField(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Adicionar primeiro campo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium text-gray-500">Campo {index + 1}</div>
                          <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {fieldTypes.find(t => t.id === field.type)?.name || field.type}
                          </div>
                        </div>
                        <button
                          onClick={() => removeField(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do Campo
                          </label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateField(index, { name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Label do Campo
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(index, { label: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mb-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.required || false}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Campo obrigatório</span>
                        </label>
                      </div>

                      {/* Sub-fields for repeatable type */}
                      {field.type === 'repeatable' && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">Subcampos da Lista</h4>
                            <button
                              onClick={() => addSubField(index)}
                              className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Adicionar Subcampo</span>
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {field.fields?.map((subField, subIndex) => (
                              <div key={subIndex} className="flex items-center space-x-3 p-3 bg-white rounded border">
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    value={subField.name}
                                    onChange={(e) => updateSubField(index, subIndex, { name: e.target.value })}
                                    placeholder="Nome do subcampo"
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                  <input
                                    type="text"
                                    value={subField.label}
                                    onChange={(e) => updateSubField(index, subIndex, { label: e.target.value })}
                                    placeholder="Label do subcampo"
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <button
                                  onClick={() => removeSubField(index, subIndex)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Field Modal */}
      {showAddField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Escolher Tipo de Campo</h3>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 gap-3">
                {fieldTypes.map((fieldType) => (
                  <button
                    key={fieldType.id}
                    onClick={() => addField(fieldType.id)}
                    className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <fieldType.icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{fieldType.name}</div>
                        <div className="text-sm text-gray-500">{fieldType.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowAddField(false)}
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