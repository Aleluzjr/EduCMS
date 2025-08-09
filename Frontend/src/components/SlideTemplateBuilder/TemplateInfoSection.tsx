import React from 'react';
import { FileText } from 'lucide-react';

interface TemplateInfoSectionProps {
  templateName: string;
  templateIcon: string;
  onNameChange: (name: string) => void;
  onIconChange: (icon: string) => void;
  onIconSelectorOpen: () => void;
  hasUnsavedChanges: boolean;
  isNewTemplate: boolean;
}

// Mapeamento de ícones para componentes
const iconComponents = {
  FileText: FileText,
  Type: FileText,
  Image: FileText,
  Video: FileText,
  Mic: FileText,
  Target: FileText,
  HelpCircle: FileText,
  AlignLeft: FileText,
  List: FileText,
  Grid: FileText,
  Book: FileText,
  Users: FileText,
  Settings: FileText,
  Star: FileText
};

export default function TemplateInfoSection({
  templateName,
  templateIcon,
  onNameChange,
  onIconChange,
  onIconSelectorOpen,
  hasUnsavedChanges,
  isNewTemplate
}: TemplateInfoSectionProps) {
  const IconComponent = iconComponents[templateIcon as keyof typeof iconComponents] || FileText;

  return (
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
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Slide de Apresentação"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ícone
          </label>
          <div className="relative">
            <button
              onClick={onIconSelectorOpen}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <IconComponent className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">{templateIcon}</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isNewTemplate && hasUnsavedChanges && (
        <p className="text-sm text-blue-600 mt-4">
          💾 Rascunho salvo automaticamente
        </p>
      )}
    </div>
  );
} 