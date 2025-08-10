import React from 'react';
import { Plus } from 'lucide-react';
import FieldEditor from './FieldEditor';
import Button from '../ui/Button';
import { Field, FieldType } from '../../types';

interface FieldsConfigurationProps {
  fields: Field[];
  fieldTypes: Array<{ id: FieldType; name: string; icon: any; description: string }>;
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Campos do Template</h3>
          <Button
            onClick={onAddField}
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Adicionar Campo
          </Button>
        </div>
      </div>

      <div className="p-6">
        {fields.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-3">Nenhum campo configurado</div>
            <Button
              onClick={onAddField}
              variant="ghost"
              size="md"
              className="text-blue-600 hover:text-blue-700"
            >
              Adicionar primeiro campo
            </Button>
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