import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface RepeatableFieldProps {
  label: string;
  required?: boolean;
  items: any[];
  fields: any[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, fieldName: string, value: string) => void;
}

export default function RepeatableField({ label, required, items, fields, onAdd, onRemove, onChange }: RepeatableFieldProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1">
          <Plus className="w-3 h-3" />
          <span>Adicionar</span>
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
              <button onClick={() => onRemove(index)} className="text-red-600 hover:text-red-700 p-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            {fields.map((subField: any) => (
              <div key={subField.name} className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {subField.label}
                  {subField.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="text"
                  value={item[subField.name] || ''}
                  onChange={e => onChange(index, subField.name, e.target.value)}
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
}
