import React from 'react';
import { 
  FileText, Type, Image, Video, Mic, Target, HelpCircle, 
  AlignLeft, List, Grid, Book, Users, Settings, Star 
} from 'lucide-react';

interface IconSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onIconSelect: (icon: string) => void;
  currentIcon: string;
}

// Mapeamento de ícones para componentes
const iconComponents = {
  FileText: FileText,
  Type: Type,
  Image: Image,
  Video: Video,
  Mic: Mic,
  Target: Target,
  HelpCircle: HelpCircle,
  AlignLeft: AlignLeft,
  List: List,
  Grid: Grid,
  Book: Book,
  Users: Users,
  Settings: Settings,
  Star: Star
};

const icons = [
  'FileText', 'Type', 'Image', 'Video', 'Mic', 'Target', 'HelpCircle', 
  'AlignLeft', 'List', 'Grid', 'Book', 'Users', 'Settings', 'Star'
];

export default function IconSelector({ isOpen, onClose, onIconSelect, currentIcon }: IconSelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Escolher Ícone</h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {icons.map((iconName) => {
              const IconComponent = iconComponents[iconName as keyof typeof iconComponents];
              return (
                <button
                  key={iconName}
                  onClick={() => {
                    onIconSelect(iconName);
                    onClose();
                  }}
                  className={`p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center ${
                    currentIcon === iconName ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <IconComponent className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <div className="text-xs text-gray-600">{iconName}</div>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
} 