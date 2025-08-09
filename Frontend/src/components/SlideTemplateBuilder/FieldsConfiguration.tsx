import React from 'react';
import { Plus } from 'lucide-react';
import FieldEditor from './FieldEditor';

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

interface FieldsConfigurationProps {
  fields: Field[];
  fieldTypes: Array<{ id: string; name: string; name: string; icon: any; description: string }>;
  onFieldsChange: (fields: Field[]) => void;
  onAddField: () => void;
}

export default function FieldsConfiguration({ 
  fields, 
  fieldTypes, 
  onFieldsChange, 
  onAddField 
}: FieldsConfigurationProps) {
  const updateField = (index: number, updates: Partial<Field>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    onFieldsChange(updatedFields);
  };

  const removeField = (index: number) => {
    onFieldsChange(fields.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Campos do Template</h3>
          <button
            onClick={onAddField}
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
              onClick={onAddField}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Adicionar primeiro campo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <FieldEditor
                key={index}
                field={field}
                index={index}
                fieldTypes={fieldTypes}
                onFieldUpdate={updateField}
                onFieldRemove={removeField}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 