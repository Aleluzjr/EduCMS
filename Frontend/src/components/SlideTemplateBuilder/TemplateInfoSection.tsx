import React from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Template</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome do Template"
          value={templateName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ex: Slide de Apresentação"
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ícone
          </label>
          <Button
            onClick={onIconSelectorOpen}
            variant="outline"
            size="md"
            rightIcon={<ChevronDown className="w-4 h-4" />}
            className="w-full justify-between"
          >
            <div className="flex items-center space-x-3">
              <IconComponent className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">{templateIcon}</span>
            </div>
          </Button>
        </div>
      </div>

      {isNewTemplate && hasUnsavedChanges && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 flex items-center">
            <span className="mr-2">💾</span>
            Rascunho salvo automaticamente
          </p>
        </div>
      )}
    </div>
  );
} 