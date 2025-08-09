import React from 'react';
import { Trash2 } from 'lucide-react';
import MediaTypeSelector from './MediaTypeSelector';
import SubFieldsEditor from './SubFieldsEditor';

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

interface FieldEditorProps {
  field: Field;
  index: number;
  fieldTypes: Array<{ id: string; name: string }>;
  onFieldUpdate: (index: number, updates: Partial<Field>) => void;
  onFieldRemove: (index: number) => void;
}

export default function FieldEditor({ 
  field, 
  index, 
  fieldTypes, 
  onFieldUpdate, 
  onFieldRemove 
}: FieldEditorProps) {
  const updateField = (updates: Partial<Field>) => {
    onFieldUpdate(index, updates);
  };

  const updateSubFields = (subFields: Field[]) => {
    onFieldUpdate(index, { fields: subFields });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium text-gray-500">Campo {index + 1}</div>
          <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
            {fieldTypes.find(t => t.id === field.type)?.name || field.type}
          </div>
        </div>
        <button
          onClick={() => onFieldRemove(index)}
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
            onChange={(e) => updateField({ name: e.target.value })}
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
            onChange={(e) => updateField({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={field.required || false}
            onChange={(e) => updateField({ required: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Campo obrigatório</span>
        </label>
      </div>

      {/* Configurações específicas por tipo */}
      {field.type === 'media' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <MediaTypeSelector
            value={field.allowedMediaTypes || []}
            onChange={(value) => updateField({ allowedMediaTypes: value })}
            label="Tipos de mídia permitidos"
          />
        </div>
      )}

      {field.type === 'text' && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor padrão
          </label>
          <input
            type="text"
            value={field.defaultValue || ''}
            onChange={(e) => updateField({ defaultValue: e.target.value })}
            placeholder="Valor padrão para o campo"
            className="w-full px-3 py-2 border border-green-200 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      )}

      {field.type === 'textarea' && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de linhas
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={field.rows || 3}
                onChange={(e) => updateField({ rows: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 border border-green-200 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor padrão
              </label>
              <input
                type="text"
                value={field.defaultValue || ''}
                onChange={(e) => updateField({ defaultValue: e.target.value })}
                placeholder="Texto padrão"
                className="w-full px-3 py-2 border border-green-200 rounded text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sub-fields for repeatable type */}
      {field.type === 'repeatable' && (
        <SubFieldsEditor
          fields={field.fields || []}
          onFieldsChange={updateSubFields}
          fieldTypes={fieldTypes}
        />
      )}
    </div>
  );
} 