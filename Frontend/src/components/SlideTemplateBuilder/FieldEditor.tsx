import React from 'react';
import { Trash2 } from 'lucide-react';
import { Field, FieldType } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import MediaTypeSelector from './MediaTypeSelector';
import SubFieldsEditor from './SubFieldsEditor';

interface FieldEditorProps {
  field: Field;
  index: number;
  fieldTypes: Array<{ id: FieldType; name: string }>;
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

  const getFieldTypeName = (type: FieldType): string => {
    return fieldTypes.find(t => t.id === type)?.name || type;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium text-gray-500">Campo {index + 1}</div>
          <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
            {getFieldTypeName(field.type)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFieldRemove(index)}
          className="text-red-600 hover:text-red-700"
          aria-label={`Remover campo ${field.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          label="Nome do Campo"
          value={field.name}
          onChange={(e) => updateField({ name: e.target.value })}
          placeholder="Ex: titulo, descricao"
          helperText="Nome único para identificar o campo"
        />
        
        <Input
          label="Label do Campo"
          value={field.label}
          onChange={(e) => updateField({ label: e.target.value })}
          placeholder="Ex: Título, Descrição"
          helperText="Texto exibido para o usuário"
        />
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
          <h4 className="text-sm font-medium text-blue-900 mb-3">Configurações de Mídia</h4>
          <MediaTypeSelector
            value={field.allowedMediaTypes || []}
            onChange={(value) => updateField({ allowedMediaTypes: value })}
          />
        </div>
      )}

      {field.type === 'textarea' && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-green-900 mb-3">Configurações de Texto</h4>
          <Input
            label="Número de Linhas"
            type="number"
            value={field.rows?.toString() || '4'}
            onChange={(e) => updateField({ rows: parseInt(e.target.value) || 4 })}
            min={1}
            max={20}
            helperText="Número de linhas visíveis no textarea"
            fullWidth={false}
          />
        </div>
      )}

      {field.type === 'repeatable' && field.fields && (
        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="text-sm font-medium text-purple-900 mb-3">Campos Repetíveis</h4>
          <SubFieldsEditor
            fields={field.fields}
            onFieldsChange={updateSubFields}
            fieldTypes={fieldTypes}
          />
        </div>
      )}

      {/* Validações */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Validações</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Comprimento Mínimo"
            type="number"
            value={field.validation?.minLength?.toString() || ''}
            onChange={(e) => updateField({ 
              validation: { 
                ...field.validation, 
                minLength: e.target.value ? parseInt(e.target.value) : undefined 
              } 
            })}
            min={0}
            fullWidth={false}
          />
          <Input
            label="Comprimento Máximo"
            type="number"
            value={field.validation?.maxLength?.toString() || ''}
            onChange={(e) => updateField({ 
              validation: { 
                ...field.validation, 
                maxLength: e.target.value ? parseInt(e.target.value) : undefined 
              } 
            })}
            min={1}
            fullWidth={false}
          />
        </div>
      </div>
    </div>
  );
} 