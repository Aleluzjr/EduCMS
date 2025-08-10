import React from 'react';
import { Type, FileText, Image, List, AlignLeft, X } from 'lucide-react';
import Button from '../ui/Button';

interface AddFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFieldAdd: (fieldType: string) => void;
}

const fieldTypes = [
  { id: 'text', name: 'Texto Curto', icon: Type, description: 'Campo de texto simples' },
  { id: 'textarea', name: 'Texto Longo', icon: FileText, description: 'Área de texto multilinha' },
  { id: 'html', name: 'HTML/WYSIWYG', icon: AlignLeft, description: 'Editor de texto rico' },
  { id: 'media', name: 'Mídia', icon: Image, description: 'Upload de imagem, vídeo ou áudio' },
  { id: 'repeatable', name: 'Lista Repetível', icon: List, description: 'Lista de itens com subcampos' }
];

export default function AddFieldModal({ isOpen, onClose, onFieldAdd }: AddFieldModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Escolher Tipo de Campo</h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 gap-3">
            {fieldTypes.map((fieldType) => (
              <button
                key={fieldType.id}
                onClick={() => onFieldAdd(fieldType.id)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <fieldType.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-900">{fieldType.name}</div>
                    <div className="text-sm text-gray-500">{fieldType.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button
            onClick={onClose}
            variant="outline"
            size="md"
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
} 