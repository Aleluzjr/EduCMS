import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import MediaTypeSelector from './MediaTypeSelector';

interface Field {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  defaultValue?: any;
  allowedMediaTypes?: string[];
  rows?: number;
}

interface SubFieldsEditorProps {
  fields: Field[];
  onFieldsChange: (fields: Field[]) => void;
  fieldTypes: Array<{ id: string; name: string }>;
}

export default function SubFieldsEditor({ fields, onFieldsChange, fieldTypes }: SubFieldsEditorProps) {
  const addSubField = () => {
    const newSubField: Field = {
      name: `subcampo_${fields.length + 1}`,
      type: 'text',
      label: `Subcampo ${fields.length + 1}`,
      required: false,
      defaultValue: '',
      rows: 3,
      allowedMediaTypes: undefined
    };
    
    onFieldsChange([...fields, newSubField]);
  };

  const removeSubField = (index: number) => {
    onFieldsChange(fields.filter((_, i) => i !== index));
  };

  const updateSubField = (index: number, updates: Partial<Field>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    onFieldsChange(updatedFields);
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Subcampos da Lista</h4>
        <button
          onClick={addSubField}
          className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
        >
          <Plus className="w-3 h-3" />
          <span>Adicionar Subcampo</span>
        </button>
      </div>
      
      <div className="space-y-3">
        {fields.map((subField, subIndex) => (
          <div key={subIndex} className="p-3 bg-white rounded border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-500">Subcampo {subIndex + 1}</span>
                <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  {fieldTypes.find(t => t.id === subField.type)?.name || subField.type}
                </div>
              </div>
              <button
                onClick={() => removeSubField(subIndex)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nome do Campo
                </label>
                <input
                  type="text"
                  value={subField.name}
                  onChange={(e) => updateSubField(subIndex, { name: e.target.value })}
                  placeholder="Nome do subcampo"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label do Campo
                </label>
                <input
                  type="text"
                  value={subField.label}
                  onChange={(e) => updateSubField(subIndex, { label: e.target.value })}
                  placeholder="Label do subcampo"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={subField.required || false}
                    onChange={(e) => updateSubField(subIndex, { required: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700">Obrigatório</span>
                </label>
                
                <div className="flex items-center space-x-2">
                  <label className="text-xs text-gray-700">Tipo:</label>
                  <select
                    value={subField.type}
                    onChange={(e) => updateSubField(subIndex, { type: e.target.value })}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {fieldTypes.filter(t => t.id !== 'repeatable').map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Configurações específicas por tipo para subcampos */}
            {subField.type === 'media' && (
              <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                <MediaTypeSelector
                  value={subField.allowedMediaTypes || []}
                  onChange={(value) => updateSubField(subIndex, { allowedMediaTypes: value })}
                  label="Tipos de mídia permitidos"
                />
              </div>
            )}

            {subField.type === 'text' && (
              <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Valor padrão
                </label>
                <input
                  type="text"
                  value={subField.defaultValue || ''}
                  onChange={(e) => updateSubField(subIndex, { defaultValue: e.target.value })}
                  placeholder="Valor padrão para o campo"
                  className="w-full px-2 py-1 border border-green-200 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}

            {subField.type === 'textarea' && (
              <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1">
                      Linhas
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={subField.rows || 3}
                      onChange={(e) => updateSubField(subIndex, { rows: parseInt(e.target.value) || 3 })}
                      className="w-full px-2 py-1 border border-green-200 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1">
                      Valor padrão
                    </label>
                    <input
                      type="text"
                      value={subField.defaultValue || ''}
                      onChange={(e) => updateSubField(subIndex, { defaultValue: e.target.value })}
                      placeholder="Texto padrão"
                      className="w-full px-2 py-1 border border-green-200 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 